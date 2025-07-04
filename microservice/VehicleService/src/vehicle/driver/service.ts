import {pool as db} from '../../db'
import {Vehicle} from './schema'

export class DriverService {
	public async RegisterVehicle(
    owner: string|undefined, 
    plate: string, 
    make: string, 
    model: string,
    year: number,
    color: string,
    state: string,
  ): 
  Promise<Vehicle> {
    try {
      const query = {
        text: `
        INSERT INTO vehicle(owner, data)
        SELECT $1, jsonb_build_object(
          'plate', $2::text,
          'make', $3::text,
          'model', $4::text,
          'year', $5::int,
          'color', $6::text,
          'state', $7::text,
          'deleted', FALSE)
        ON CONFLICT ((data->>'plate'), (data->>'state')) DO UPDATE
        SET 
          owner = $1,
          data = jsonb_build_object(
            'plate', $2::text,
            'make', $3::text,
            'model', $4::text,
            'year', $5::int,
            'color', $6::text,
            'state', $7::text,
            'deleted', FALSE)
        WHERE vehicle.data->>'deleted' = 'true' 
        RETURNING
            id,
            DATA->>'plate' as plate,
            DATA->>'make' as make,
            DATA->>'model' as model,
            DATA->>'year' as year,
            DATA->>'color' as color,
            DATA->>'state' as state
            ;`,
        values: [owner, plate, make, model, year, color, state],
      };
      
      const { rows: [vehicle] } = await db.query(query);
      if (vehicle) { 
        return new Vehicle(
          vehicle.id,
          vehicle.plate, 
          vehicle.make, 
          vehicle.model, 
          vehicle.year, 
          vehicle.color, 
          vehicle.state)
      } else {
        throw new Error('Invalid Vehicle')
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  public async GetMyVehicles(owner: string|undefined): Promise<Vehicle[]> {
    try {
      const query = {
        text: `
        SELECT
          id,
          plate,
          make,
          model,
          year,
          color,
          state
        FROM active_vehicles
        WHERE 
          owner = $1;`,
        values: [owner],
      };
      const { rows } = await db.query(query);
      if (rows.length) {
        const vehicles = await Promise.all(
          rows.map((vehicle: {
            id: string,
            plate: string,
            make: string,
            model: string,
            year: number,
            color: string,
            state: string,
          }) =>
              new Vehicle(
                vehicle.id,
                vehicle.plate, 
                vehicle.make, 
                vehicle.model, 
                vehicle.year, 
                vehicle.color, 
                vehicle.state)
                  )
                );
        return vehicles
      } else {
        throw new Error('User has no registered vehicles')
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
	}
  
  public async DeleteMyVehicle(owner: string|undefined, plate: string, state: string): Promise<Vehicle> {
		try {
      const query = {
        text: `
        UPDATE vehicle
        SET data = jsonb_set(data, '{deleted}', 'true', true)
        WHERE
          owner = $1 
          AND DATA->>'plate' = $2
          AND (data->>'state') = $3
          AND (data->>'deleted')::boolean = false
        RETURNING 
          id,
          DATA->>'plate' as plate,
          DATA->>'make' as make,
          DATA->>'model' as model,
          DATA->>'year' as year,
          DATA->>'color' as color,
          DATA->>'state' as state;
`,
        values: [owner, plate, state],
      };
      
      const { rows: [vehicle] } = await db.query(query);
      if (vehicle) {
        return new Vehicle(
          vehicle.id,
          vehicle.plate, 
          vehicle.make, 
          vehicle.model, 
          vehicle.year, 
          vehicle.color, 
          vehicle.state)
      } else {
        throw new Error("Vehicle not found or already deleted");
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
	}

  public async ConfirmMyVehicle(owner: string|undefined, plate: string, state: string): Promise<Vehicle> {
    try {
      const query = {
        text: `
        SELECT
          id,
          plate,
          make,
          model,
          year,
          color,
          state
        FROM active_vehicles
        WHERE 
          owner = $1
          AND plate = $2
          AND state = $3
          ;`,
        values: [owner, plate, state],
      };
      const { rows: [vehicle] } = await db.query(query);
      if (vehicle) {
        return new Vehicle(
                vehicle.id,
                vehicle.plate, 
                vehicle.make, 
                vehicle.model, 
                vehicle.year, 
                vehicle.color, 
                vehicle.state)
      } else {
        throw new Error('No Vehicle Found')
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
	}
}
