import { Pool } from 'pg'
import * as fs from 'fs'
import dotenv from 'dotenv'

if (process.env.POSTGRES_CI_MODE) {
  dotenv.config({ path: '.env.ci' })
} else {
  dotenv.config({ path: '.env.test' })
}

const pool = new Pool({
  host: (process.env.POSTGRES_HOST || 'localhost'),
  port: process.env.POSTGRES_CI_MODE ? 5432 : +(process.env.POSTGRES_PORT || 5436),
  database: 'vehicle',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})

const run = async (file: string) => {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split(/\r?\n/)
  let statement = ''
  for (let line of lines) {
    line = line.trim()
    if (!line.startsWith('--')) {
      statement += ' ' + line + '\n'
      if (line.endsWith(';')) {
        await pool.query(statement)
        statement = ''
      }
    }
  }
}

const reset = async () => {
  await run('sql/test.sql')
}

const shutdown = () => {
  pool.end()
}

export { reset, shutdown }
