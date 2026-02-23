import 'dotenv/config'
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
})

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8')
  await pool.query(sql)
}

async function main() {
  try {
    await runSqlFile(path.join(__dirname, '../db/schema.sql'))
    console.log('Schema created')
    await runSqlFile(path.join(__dirname, '../db/seed.sql'))
    console.log('Seed done')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
