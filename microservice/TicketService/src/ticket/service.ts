import { pool as db } from '../db'
import { Ticket, NewTicket } from './schema'
import { sendEmail } from '../util/mailgun'

export class TicketService {
  public async get(vehicleId: string): Promise<Ticket[]> {
    const query = {
      text: `
        SELECT
          id,
          data->>'cost' AS cost,
          data->>'issued' AS issued,
          data->>'deadline' AS deadline,
          data->>'status' AS status,
          data->>'desc' AS desc
        FROM ticket 
        WHERE vehicle = $1
        AND (data->>'status' = 'unpaid' OR data->>'status' = 'rejected')
      `,
      values: [vehicleId],
    };
    const { rows } = await db.query(query);
    if (rows.length === 0) {
      throw new Error(`No tickets found for this vehicle`);
    }
    return rows.map(row => {
      const ticket = new Ticket();
      ticket.id = row.id;
      ticket.vehicle = row.vehicle;
      ticket.cost = +row.cost;
      ticket.issued = row.issued;
      ticket.deadline = row.deadline;
      ticket.status = row.status;
      ticket.desc = row.desc;
      return ticket;
    });
  }

  public async getbyId(ticketId: string): Promise<Ticket> {
    const query = {
      text: `
        SELECT
          id,
          data->>'cost' AS cost,
          data->>'issued' AS issued,
          data->>'deadline' AS deadline,
          data->>'status' AS status,
          data->>'desc' AS desc
        FROM ticket 
        WHERE id = $1
      `,
      values: [ticketId],
    };
    const { rows: [ticket] } = await db.query(query);
    if (ticket) {
      return ticket
    } else {
      throw new Error(`Not a valid ticket`);
    }
  }

  public async make(input: NewTicket, token: string | undefined): Promise<Ticket> {
    const { vehicle, cost } = input

    const issued = new Date()
    const deadline = new Date()
    deadline.setDate(issued.getDate() + 21)

    const query = {
      text: `
        INSERT INTO ticket(vehicle, data)
        VALUES (
          $1,
          json_build_object(
            'cost', $2::float,
            'issued', $3::text,
            'deadline', $4::text,
            'status', 'unpaid',
            'desc', ''
          )
        )
        RETURNING id, vehicle, data
      `,
      values: [vehicle, cost, issued.toISOString(), deadline.toISOString()]
    }
    const { rows } = await db.query(query)
    const ticket = rows[0]

    const queryOwner = `
      query GetOwner($vehicleID: String!) {
        GetOwner(vehicleID: $vehicleID) {
          id
          name
          email
        }
      }
    `;
    const variables = {
      vehicleID: vehicle
    };

    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify({ query: queryOwner, variables }),
    });

    const result = await response.json();
    const owner = result.data?.GetOwner;

    try {
      await sendEmail(
        owner.email,
        'Parking Ticket Issued - Immediate Attention Required',
        `Dear ${owner.name},\n` +
        `This is an automated notification to inform you that a parking ticket has been issued for your vehicle.\n` +
        `Thank you,\nParkwise Team`
      );
    } catch (error) {
      console.warn('Failed to send email (suppressed):', error);
    }

    return {
      id: ticket.id,
      vehicle: ticket.vehicle,
      cost: ticket.data.cost,
      issued: ticket.data.issued,
      deadline: ticket.data.deadline,
      status: ticket.data.status,
      desc: ticket.data.desc
    }
  }

  async pay(userId: string | undefined, ticketId: string): Promise<Ticket> {
    const query = {
      text: `
        UPDATE ticket
        SET data = jsonb_set(data, '{status}', '"paid"', true)
        WHERE id = $1
        RETURNING id, vehicle, data
      `,
      values: [ticketId]
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error('Ticket not found')
    }

    try {
      const response = await fetch(`http://localhost:3010/api/v0/getDriver/${userId}`, {
        method: 'GET',
      })

      const data = await response.json();
      console.log(data)

      try {
        await sendEmail(
          data.email,
          'Parking Ticket Payed',
          `Dear ${data.name},\n` +
          `This is an automated notification to inform you that a parking ticket has been paid for your vehicle.\n` +
          `Thank you,\nParkwise Team`
        );
      } catch (error) {
        console.warn('Failed to send email (suppressed):', error);
      }
    } catch {
      throw new Error('Error fetching driver information');;
    }

    const ticket = rows[0]
    return {
      id: ticket.id,
      vehicle: ticket.vehicle,
      cost: ticket.data.cost,
      issued: ticket.data.issued,
      deadline: ticket.data.deadline,
      status: ticket.data.status,
      desc: ticket.data.desc
    }
  }

  public async challenge(ticketId: string, desc: string): Promise<Ticket> {
    // change ticket status to challenged
    const query = {
      text: `
        UPDATE ticket
        SET data = jsonb_set(
          jsonb_set(data, '{status}', '"challenged"', true),
          '{desc}', to_jsonb($2::text), true
        )
        WHERE id = $1
        RETURNING id, vehicle, data
      `,
      values: [ticketId, desc]
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error('Ticket not found')
    }
    const ticket = rows[0]
    return {
      id: ticket.id,
      vehicle: ticket.vehicle,
      cost: ticket.data.cost,
      issued: ticket.data.issued,
      deadline: ticket.data.deadline,
      status: ticket.data.status,
      desc: ticket.data.desc
    }
  }

  public async getChallenges(): Promise<Ticket[]> {
    // get all tickets with status challenged
    const query = {
      text: `
        SELECT
          id,
          vehicle,
          data->>'cost' AS cost,
          data->>'issued' AS issued,
          data->>'deadline' AS deadline,
          data->>'status' AS status,
          data->>'desc' AS desc
        FROM ticket 
        WHERE data->>'status' = 'challenged'
        ORDER BY (data->>'issued')::timestamp DESC
      `,
      values: [],
    };
    const { rows } = await db.query(query);
    if (rows.length === 0) {
      throw new Error(`No tickets currently being challenged.`);
    }
    return rows as Ticket[];
  }

  public async acceptChallenge(ticketId: string): Promise<Ticket> {
    // update status to be accepted (reverse ticket)
    // for future: add reductions instead of only full reversal
    const query = {
      text: `
        UPDATE ticket
        SET data = jsonb_set(data, '{status}', '"accepted"', true)
        WHERE id = $1
        RETURNING id, vehicle, data
      `,
      values: [ticketId]
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error('Ticket not found')
    }
    const ticket = rows[0]
    return {
      id: ticket.id,
      vehicle: ticket.vehicle,
      cost: ticket.data.cost,
      issued: ticket.data.issued,
      deadline: ticket.data.deadline,
      status: ticket.data.status,
      desc: ticket.data.desc
    }
  }

  public async rejectChallenge(ticketId: string): Promise<Ticket> {
    // update status to be unpaid (reject challenge)
    const query = {
      text: `
      UPDATE ticket
      SET data = jsonb_set(data, '{status}', '"rejected"', true)
      WHERE id = $1
      RETURNING id, vehicle, data
    `,
      values: [ticketId]
    }
    const { rows } = await db.query(query)
    if (rows.length === 0) {
      throw new Error('Ticket not found')
    }
    const ticket = rows[0]
    return {
      id: ticket.id,
      vehicle: ticket.vehicle,
      cost: ticket.data.cost,
      issued: ticket.data.issued,
      deadline: ticket.data.deadline,
      status: ticket.data.status,
      desc: ticket.data.desc
    }
  }
}
