import { UUID, Ticket, Vehicle } from '.';

async function fetchGraphQL(baseUrl: string, query: string, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query
    })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

export const vehicleService = {
  getVehicles: async (token: string): Promise<Vehicle[]> => {
    const query = `
      query GetMyVehicles {
        GetMyVehicles {
          id
          plate
          make
          model
          state
        }
      }
    `;

    const data = await fetchGraphQL('http://localhost:4000', query, token);
    return data.GetMyVehicles;
  },

  registerVehicle: async (make: string, model: string, plate: string, year: string, color: string, state:string, token?: string): Promise<Vehicle> => {
    const mutation = `
        mutation {
         RegisterVehicle(
          plate: "${plate}"
          make: "${make}"
          model: "${model}"
          year: ${year}
          color: "${color}"
          state: ${state}
        )
        {
          id
          plate
          make
          model
          year
          color
          state
        }
    }
    `;
    console.log('mutation', mutation)
    const data = await fetchGraphQL('http://localhost:4000', mutation, token);
    console.log(data)
    return data.RegisterVehicle;
  },

  deleteVehicle: async (plate: string, state: string, token?: string): Promise<Vehicle> => {
    const mutation = `mutation {
      DeleteMyVehicle(plate: "${plate}" state: ${state}) {
        id
        plate
        make
        model
        year
        color
        state
      }
    }`;

    const data = await fetchGraphQL('http://localhost:4000', mutation, token);
    return data.DeleteMyVehicle;
  }
}

export const ticketService = {
  getTickets: async (vehicleId: UUID, token?: string): Promise<Ticket[]> => {
    const query = `
      query getTickets {
        getTickets(input: "${vehicleId}") {
          id
          cost
          issued
          deadline
          status
        }
      }
    `;

    const data = await fetchGraphQL('http://localhost:4001', query, token);
    console.log(data)
    return data.getTickets;
  },

  getTicketById: async (ticketId: UUID, token?: string): Promise<Ticket[]> => {
    const query = `
      query getTicketById {
        getTicketById(input: "${ticketId}") {
          id
          cost
          issued
          deadline
          status
        }
      }
    `;

    const data = await fetchGraphQL('http://localhost:4001', query, token);
    console.log('server action', data)
    return data.getTicketById;
  },

  payTicket: async (ticketId: UUID, token?: string): Promise<Ticket> => {
    const mutation = `
      mutation payTicket {
        payTicket (input: "${ticketId}") {
          id
          cost
          issued
          deadline
          status
        }
      }
    `;

    const data = await fetchGraphQL('http://localhost:4001', mutation, token);
    return data.payTicket;
  },
  
  challengeTicket: async (ticketId: UUID, desc: string, token?: string): Promise<Ticket> => {
    const mutation = `
      mutation challengeTicket {
        challengeTicket (input: "${ticketId}", desc: "${desc}") {
          id
          cost
          issued
          deadline
          status
        }
      }
    `;

    const data = await fetchGraphQL('http://localhost:4001', mutation, token);
    return data.challengeTicket;
  }
}
