import { pool as db } from '../db'
import { Permit, VehiclePermitCheck, VID } from './schema';
import { sendEmail } from '../util/mailgun';

export class PermitService {
  public async CreatePermit(holder: string | undefined, vid: string | undefined, type: string, start: Date): Promise<Permit> {
    try {
      const query = {
        text: `
          WITH expiration AS (
            SELECT
              data->>'type' AS length,
              id AS type_id
            FROM permit_type
            WHERE id = $1
          ), computed_expiration AS (
            SELECT
              CASE
                WHEN length = 'day' THEN
                  date_trunc('day', $2::timestamptz) + interval '23 hours 59 minutes'
                ELSE
                  NULL
              END AS expiration_date
            FROM expiration
          ) INSERT INTO permit (holder, vehicle, info, data)
          VALUES(
            $3::uuid,
            $4::uuid,
            $1::uuid,
            jsonb_build_object(
              'active', $2::timestamptz,
              'expiration', (SELECT expiration_date FROM computed_expiration),
              'deleted', false
            )
          ) RETURNING
            id,
            holder,
            vehicle,
            (
              SELECT jsonb_build_object(
                'id', pt.id,
                'classname', pt.data->>'class',
                'type', pt.data->>'type',
                'price', pt.data->>'price'
              )
              FROM permit_type pt
              WHERE pt.id = $1
              AND pt.data->>'deleted' = 'false'
            ) AS info,
            (data->>'active')::timestamptz AS active,
            (data->>'expiration')::timestamptz AS expiration;
        `,
        values: [type, start, holder, vid],
      };

      const { rows: [permit] } = await db.query(query);

      try {
        const response = await fetch(`http://localhost:3010/api/v0/getDriver/${permit.holder}`, {
          method: 'GET',
        })
        if (response.status !== 200) {
          throw new Error('Invalid returned code');
        }
        
        const data = await response.json();
        try {
          await sendEmail(
            data.email,
            'Parking Permit Purchased',
            `Dear ${data.name},\n` +
            `This is an automated notification to inform you have recently purchased a parking permit for your vehicle.\n` +
            `Thank you,\nParkwise Team`
          );
        } catch (error) {
          console.warn('Failed to send email (suppressed):', error);
        }
        
        return new Permit(permit.id, permit.holder, permit.vehicle, permit.info, permit.active, permit.expiration)
      } catch {
        throw new Error('Error fetching driver information');
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async enforcerCheck(vid: string | undefined): Promise<VehiclePermitCheck> {
    try {
      const query = {
        text: `
            SELECT EXISTS (
              SELECT 1
              FROM permit
              WHERE vehicle = $1
                AND (data->>'active') IS NOT NULL
                AND (data->>'expiration') IS NOT NULL
                AND (data->>'deleted')::boolean = false
                AND (data->>'expiration')::timestamptz >= $2
                AND (data->>'active')::timestamptz <= $2
            ) AS valid;

        `,
        values: [vid, new Date()],
      };

      const { rows: [permit] } = await db.query(query);

      return new VehiclePermitCheck(vid || '', permit.valid);
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async PermittedVehicles(holder: string | undefined): Promise<VID[]> {
    const date = new Date()
    console.log(date)
    try {
      const query = {
        text: `
              SELECT vehicle
              FROM permit
              WHERE holder = $1
                AND (data->>'active') IS NOT NULL
                AND (data->>'expiration') IS NOT NULL
                AND (data->>'deleted')::boolean = false
                AND (data->>'expiration')::timestamptz >= $2
                AND (data->>'active')::timestamptz <= $2
        `,
        values: [holder, date],
      };

      const { rows } = await db.query(query);
      if (rows.length) {
        const vehicles = await Promise.all(
          rows.map((vehicle: { vehicle: string }) =>
            new VID(vehicle.vehicle,)));
        return vehicles
      } else {
        throw new Error('User has no registered vehicles')
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }
}
