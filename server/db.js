import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function query(text, params) {
  return pool.query(text, params)
}

export async function checkConnection() {
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
    return true
  } finally {
    client.release()
  }
}

export function getClient() {
  return pool.connect()
}

export default pool
