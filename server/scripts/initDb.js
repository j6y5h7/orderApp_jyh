import dotenv from 'dotenv'
import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 로컬 개발 환경에서 `.env`를 명시적으로 로드합니다.
// - 이 파일은 `server/.env` 에 위치합니다.
// - Render 같은 배포 환경에서는 대시보드에서 주입된 환경변수를 그대로 사용하고,
//   `.env` 파일이 없어도 문제 없이 동작합니다.
dotenv.config({
  path: path.join(__dirname, '../.env')
})

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8')
  await pool.query(sql)
}

async function main() {
  try {
    console.log('Connecting to DB:', {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER
    })

    await runSqlFile(path.join(__dirname, '../db/schema.sql'))
    console.log('Schema created')
    await runSqlFile(path.join(__dirname, '../db/seed.sql'))
    console.log('Seed done')
  } catch (err) {
    console.error('Error while initializing database:')
    console.error(err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
