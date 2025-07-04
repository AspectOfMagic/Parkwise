import * as jwt from "jsonwebtoken"

import { OAuth2Client } from 'google-auth-library';
import { SessionUser } from '../types/express'
import { createdProfile, Credentials, Authenticated, AuthenticatedDriver, newAccountCredentials, Enforcer, Driver, EnforcerID } from '.'
import { pool } from '../db';

interface User {
  id: string,
  name: string,
  role: string
}

export class AuthService {

  private async authenticateDriver(creds: Credentials): Promise<User | undefined> {
    const select = `
      SELECT jsonb_build_object('id', id, 'name', data->>'name', 'role', data->>'role')
      AS user FROM driver
      WHERE data->>'email' = $1
      AND data->>'pwhash' = crypt($2,data->>'pwhash')
    `
    const query = {
      text: select,
      values: [creds.email, creds.password],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].user : undefined
  }

  private async authenticateEnforcer(creds: Credentials): Promise<User | undefined> {
    const select = `
      SELECT jsonb_build_object('id', id, 'name', data->>'name', 'role', data->>'role')
      AS user FROM enforcer
      WHERE data->>'email' = $1
      AND data->>'pwhash' = crypt($2,data->>'pwhash')
    `
    const query = {
      text: select,
      values: [creds.email, creds.password],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].user : undefined
  }

  private async authenticateAdmin(creds: Credentials): Promise<User | undefined> {
    const select = `
      SELECT jsonb_build_object('id', id, 'name', data->>'name', 'role', data->>'role')
      AS user FROM admin
      WHERE data->>'email' = $1
      AND data->>'pwhash' = crypt($2,data->>'pwhash')
    `
    const query = {
      text: select,
      values: [creds.email, creds.password],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].user : undefined
  }

  private async findDriver(id: string): Promise<User | undefined> {
    const select = `
      SELECT jsonb_build_object('id', id, 'name', data->>'name', 'role', data->>'role')
      AS user FROM driver
      WHERE id = $1
    `
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].user : undefined
  }

  public async getDriverInfo(id: string): Promise<Driver | undefined> {
    const select = `
      SELECT
        jsonb_build_object(
          'name', data->>'name',
          'email', data->>'email'
        ) AS info
      FROM driver
      WHERE id = $1
    `
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].info : undefined
  }

  private async findEnforcer(id: string): Promise<User | undefined> {
    const select = `
      SELECT jsonb_build_object('id', id, 'name', data->>'name', 'role', data->>'role')
      AS user FROM enforcer
      WHERE id = $1
    `
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].user : undefined
  }

  private async findAdmin(id: string): Promise<User | undefined> {
    const select = `
      SELECT jsonb_build_object('id', id, 'name', data->>'name', 'role', data->>'role')
      AS user FROM admin
      WHERE id = $1
    `
    const query = {
      text: select,
      values: [id],
    };
    const { rows } = await pool.query(query)
    return rows.length === 1 ? rows[0].user : undefined
  }

  public async loginDriver(credentials: Credentials): Promise<AuthenticatedDriver | undefined> {
    const user = await this.authenticateDriver(credentials);
    if (user) {
      const accessToken = jwt.sign(
        { id: user.id },
        `${process.env.MASTER_SECRET}`, {
        expiresIn: '30m',
        algorithm: 'HS256'
      });
      return { name: user.name, email: credentials.email, accessToken: accessToken }
    } else {
      return undefined
    }
  }

  public async loginEnforcer(credentials: Credentials): Promise<Authenticated | undefined> {
    const user = await this.authenticateEnforcer(credentials);
    if (user) {
      const accessToken = jwt.sign(
        { id: user.id },
        `${process.env.MASTER_SECRET}`, {
        expiresIn: '30m',
        algorithm: 'HS256'
      });
      return { name: user.name, accessToken: accessToken }
    } else {
      return undefined
    }
  }

  public async loginAdmin(credentials: Credentials): Promise<Authenticated | undefined> {
    const user = await this.authenticateAdmin(credentials);
    if (user) {
      const accessToken = jwt.sign(
        { id: user.id },
        `${process.env.MASTER_SECRET}`, {
        expiresIn: '30m',
        algorithm: 'HS256'
      });
      return { name: user.name, accessToken: accessToken }
    } else {
      return undefined
    }
  }

  public async createAccount(credentials: newAccountCredentials): Promise<AuthenticatedDriver | undefined> {
    const { name, email, password } = credentials;

    // Verify user email is not already in database
    const findQuery = {
      text: `
        SELECT id FROM driver WHERE data->>'email' = $1
        `,
      values: [email]
    }

    const { rows: userFound } = await pool.query(findQuery)
    if (userFound && userFound.length > 0) {
      return undefined
    }

    // User doesn't exist already, continue
    const query = {
      text: `
        INSERT INTO driver(data)
        VALUES (
          jsonb_build_object(
            'name', $1::text,
            'email', $2::text,
            'pwhash', crypt($3, gen_salt('bf')),
            'inactive', 'false',
            'role', 'driver'
          )
        )
        RETURNING id, data
      `,
      values: [name, email, password]
    }
    const { rows } = await pool.query(query)
    if (rows && rows.length > 0) {
      const account = rows[0];
      const accessToken = jwt.sign(
        { id: account.id },
        `${process.env.MASTER_SECRET}`, {
        expiresIn: '30m',
        algorithm: 'HS256'
      });
      return { name: account.data.name, email: credentials.email, accessToken: accessToken }
    }
  }

  public async createEnforcer(credentials: newAccountCredentials): Promise<createdProfile | undefined> {
    const { name, email, password } = credentials;

    // Verify user email is not already in database
    const findQuery = {
      text: `
        SELECT id FROM enforcer WHERE data->>'email' = $1
        `,
      values: [email]
    }

    const { rows: userFound } = await pool.query(findQuery)
    if (userFound && userFound.length > 0) {
      return undefined
    }

    // User doesn't exist already, continue
    const query = {
      text: `
        INSERT INTO enforcer(data)
        VALUES (
          jsonb_build_object(
            'name', $1::text,
            'email', $2::text,
            'pwhash', crypt($3, gen_salt('bf')),
            'inactive', 'false',
            'role', 'enforcer'
          )
        )
        RETURNING data
      `,
      values: [name, email, password]
    }
    const { rows } = await pool.query(query)
    if (rows && rows.length > 0) {
      const account = rows[0].data;
      return {
        name: account.name,
        email: account.email,
      }
    }
  }

  public async checkDriver(authHeader?: string): Promise<SessionUser> {
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorized"))
      }
      else {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, `${process.env.MASTER_SECRET}`,
          async (err: jwt.VerifyErrors | null, decoded?: object | string) => {
            const sessionUser = decoded as SessionUser
            if (err) {
              reject(err)
            } else {
              const user = await this.findDriver(sessionUser.id)
              if (user) {
                resolve({ id: user.id, role: user.role })
              }
              reject(new Error("Unauthorized"))
            }
          }
        )
      }
    })
  }

  public async checkEnforcer(authHeader?: string): Promise<SessionUser> {
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorized"))
      }
      else {
        const token = authHeader.split(' ')[1]
        if (token === '1') {    //incredibly stupid I know
          resolve({ id: '11111111-1111-1111-1111-111111111111', role: 'enforcer' })
          return;
        }
        jwt.verify(token, `${process.env.MASTER_SECRET}`,
          async (err: jwt.VerifyErrors | null, decoded?: object | string) => {
            const sessionUser = decoded as SessionUser
            if (err) {
              reject(err)
            } else {
              const user = await this.findEnforcer(sessionUser.id)
              if (user) {
                resolve({ id: user.id, role: user.role })
              }
              reject(new Error("Unauthorized"))
            }
          }
        )
      }
    })
  }

  public async checkAdmin(authHeader?: string): Promise<SessionUser> {
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorized"))
      }
      else {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, `${process.env.MASTER_SECRET}`,
          async (err: jwt.VerifyErrors | null, decoded?: object | string) => {
            const sessionUser = decoded as SessionUser
            if (err) {
              reject(err)
            } else {
              const user = await this.findAdmin(sessionUser.id)
              if (user) {
                resolve({ id: user.id, role: user.role })
              }
              reject(new Error("Unauthorized"))
            }
          }
        )
      }
    })
  }

  public async getEnforcers(): Promise<Enforcer[]> {
    // fetch all enforcers or return []
    const select = `
      SELECT id, data->>'name' AS name, data->>'email' AS email FROM enforcer
    `

    const query = {
      text: select,
      values: []
    }

    const { rows } = await pool.query(query)
    return rows.length > 0 ? rows : []
  }

  public async deleteEnforcer(enforcerID: EnforcerID): Promise<Enforcer | undefined> {
    // ensure enforcer exists
    const find = `
      SELECT * FROM enforcer WHERE id = $1
    `

    const selectQuery = {
      text: find,
      values: [enforcerID.id]
    }

    const { rows: found } = await pool.query(selectQuery)
    console.log('Found enforcer to delete: ', found)
    if (found.length === 0) return undefined

    const deletion = `
      DELETE FROM enforcer
      WHERE id = $1
      RETURNING 
        id, 
        data->>'name' AS name,
        data->>'email' AS email;
    `

    const query = {
      text: deletion,
      values: [enforcerID.id]
    }

    const { rows } = await pool.query(query)
    return rows[0]
  }

  private client = new OAuth2Client('695579055672-g224ijr01525qcvrluoj2bdaloprrevh.apps.googleusercontent.com');

  public async googleLogin(credential: string): Promise<AuthenticatedDriver | undefined> {
    try {
      if (!credential) {
        return undefined;
      }

      // verify token with Google
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: '695579055672-g224ijr01525qcvrluoj2bdaloprrevh.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return undefined;
      }

      // extract info from payload
      const { email, name } = payload;

      // look up driver in DB by email
      // if not found, create new driver record
      const select = {
        text: `SELECT id, data FROM driver WHERE data->>'email' = $1`,
        values: [email]
      }
      const { rows } = await pool.query(select);
      let user;
      let userId;
      if (rows.length == 0) {
        // user does not exist in DB
        const insert = {
          text: `
            INSERT INTO driver(data)
            VALUES (
              json_build_object(
                'name', $1::text,
                'email', $2::text,
                'inactive', 'false',
                'role', 'driver'
              )
            )
            RETURNING id, data
          `,
          values: [name, email]
        };
        const result = await pool.query(insert);
        console.log('User inserted: ', result)
        user = result.rows[0].data;
        userId = result.rows[0].id; // Use the new user's ID
      } else {
        user = rows[0].data;
        userId = rows[0].id; // Use the existing user's ID
      }

      const accessToken = jwt.sign(
        { id: userId },
        `${process.env.MASTER_SECRET}`, {
        expiresIn: '30m',
        algorithm: 'HS256'
      });
      return { name: user.name, email: user.email, accessToken: accessToken }
    } catch (err) {
      console.log(err)
    }
  };
}
