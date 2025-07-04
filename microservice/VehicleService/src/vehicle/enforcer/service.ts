import {Vehicle} from '../driver/schema'
import { Owner } from './schema';
import {pool as db} from '../../db'

export class EnforcerService {
	public async GetByPlate(plate: string, state: string): Promise<Vehicle> {
    try {
      const query = {
        text: `
        SELECT 
          *
        FROM active_vehicles
        WHERE plate = $1
        AND state = $2;`,
        values: [plate, state],
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
        throw new Error('No Vehicle')
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  public async getOwner(id: string): Promise<Owner> {
    try {
      const query = {
        text: `
          SELECT 
            owner
          FROM vehicle
          WHERE id = $1
          AND (DATA->>'deleted')::BOOLEAN = false;`,
        values: [id],
      };
      const res = await db.query(query);
      if (res.rows.length !== 0 ) {
        const ownerId = res.rows[0].owner;
        try {
          const response = await fetch(`http://localhost:3010/api/v0/getDriver/${ownerId}`, {
            method: 'GET',
          })
          if (response.status !== 200) {
            throw new Error('Invalid returned code');
          }

          const data = await response.json();
          return new Owner(ownerId, data.name, data.email);

        } catch {
          throw new Error('Error fetching driver information');;
        }
      } else {
        throw new Error('Vehicle not found');
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }
}
