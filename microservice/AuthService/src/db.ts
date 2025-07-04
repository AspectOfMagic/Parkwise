import {Pool} from 'pg'

const pool = new Pool({
  host: (process.env.POSTGRES_HOST || 'localhost'),
  port: + (process.env.POSTGRES_PORT || 5437),
  database: 'driver',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

export { pool }
