import {pool as db} from '../db'
import {PermitType} from './schema'

export class PermitTypeService {
  public async adminlist(): Promise<PermitType[]> {
    try {
      const query = {
        text: `
        SELECT
            id,
            data->>'class' AS classname,
            data->>'type' AS type,
            data->>'price' AS price
        FROM permit_type
        WHERE data->>'deleted' = 'false'
        ORDER BY data->>'class', (data->>'price')::numeric DESC;
        `
      }
      const { rows } = await db.query(query)
      if (rows.length) {
        const permits = await Promise.all(
          rows.map((permit: {id: string, classname: string, type:string, price:string}) => 
            new PermitType(permit.id, permit.classname, permit.type, permit.price)
          )
        );        
        return permits
      } else {
        throw new Error('No valid permit type')
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async list(): Promise<PermitType[]> {
    try {
      const query = {
        text: `
        SELECT
            id,
            data->>'class' AS classname,
            data->>'type' AS type,
            data->>'price' AS price
        FROM permit_type
        WHERE data->>'deleted' = 'false'
        ORDER BY data->>'class', (data->>'price')::numeric DESC;
        `
      }
      const { rows } = await db.query(query)
      if (rows.length) {
        const permits = await Promise.all(
          rows.map((permit: {id: string, classname: string, type:string, price:string}) => 
            new PermitType(permit.id, permit.classname, permit.type, permit.price)
          )
        );        
        return permits
      } else {
        throw new Error('No valid Permit Type')
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async new(classname: string, type:string, price:number): Promise<PermitType> {
    try {
      const query = {
        text: `
        INSERT INTO permit_type (data)
        VALUES (
          jsonb_build_object(
            'class', $1::text,
            'type', $2::text,
            'price', $3::numeric,
            'deleted', false
          )
        )
        ON CONFLICT ((data->>'class'), (data->>'type'))
        DO UPDATE SET
          data = jsonb_set(
            jsonb_set(EXCLUDED.data, '{price}', to_jsonb($3::numeric)),
            '{deleted}', 'false'::jsonb
          )
        WHERE permit_type.data->>'deleted' = 'true'
        RETURNING
          id,
          data->>'class' AS classname,
          data->>'type' AS type,
          data->>'price' AS price;

        `,
        values: [classname, type, price],
      };
      const { rows: [permit] } = await db.query(query);
      if (permit) { 
        return new PermitType(permit.id, permit.classname, permit.type, permit.price)
      } else {
        throw new Error('Invalid Permit Type')
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async delete(id: string): Promise<PermitType> {
    try {
      const query = {
        text: `
        UPDATE permit_type
        SET data = jsonb_set(data, '{deleted}', 'true', true)
        WHERE id = $1
        AND (data->>'deleted')::boolean = false
        RETURNING
          id,
          data->>'class' AS classname,
          data->>'type' AS type,
          data->>'price' AS price;
        `,
        values: [id],
      };
      const { rows: [permit] } = await db.query(query);
      if (permit) { 
        return new PermitType(permit.id, permit.classname, permit.type, permit.price)
      } else {
        throw new Error('Invalid Permit Type')
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async updatePrice(id: string, price:number): Promise<PermitType> {
    try {
      const query = {
        text: `
        UPDATE permit_type
        SET data = jsonb_set(data, '{price}', to_jsonb($2::numeric), true)
        WHERE id = $1
        AND (data->>'deleted')::boolean = false
        RETURNING
          id,
          data->>'class' AS classname,
          data->>'type' AS type,
          data->>'price' AS price;
        `,
        values: [id, price],
      };
      const { rows: [permit] } = await db.query(query);
      if (permit) { 
        return new PermitType(permit.id, permit.classname, permit.type, permit.price)
      } else {
        throw new Error('DB Error')
      }
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }

  public async byID(id:string): Promise<PermitType> {
    try {
      const query = {
        text: `
        SELECT
            id,
            data->>'class' AS classname,
            data->>'type' AS type,
            data->>'price' AS price
        FROM permit_type
        WHERE data->>'deleted' = 'false'
        AND id = $1
        `,
        values: [id]
      }
      const { rows: [permit] } = await db.query(query)
      return new PermitType(permit.id, permit.classname, permit.type, permit.price)
    } catch (error) {
      throw new Error(`Error: ${String(error)}`);
    }
  }
}
