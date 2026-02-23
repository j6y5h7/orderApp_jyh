import 'dotenv/config'
import express from 'express'
import { checkConnection } from './db.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'order-app-server' })
})

app.get('/api/db-check', async (req, res) => {
  try {
    await checkConnection()
    res.json({ ok: true, message: 'PostgreSQL connected' })
  } catch (err) {
    res.status(503).json({ ok: false, message: err.message })
  }
})

async function start() {
  try {
    await checkConnection()
    console.log('PostgreSQL connected')
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message)
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

start()
