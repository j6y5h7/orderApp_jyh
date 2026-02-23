import 'dotenv/config'
import express from 'express'
import { checkConnection } from './db.js'
import menusRouter from './routes/menus.js'
import ordersRouter from './routes/orders.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

// CORS: 프론트엔드(다른 포트)에서 API 호출 허용
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

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

app.use('/api/menus', menusRouter)
app.use('/api/orders', ordersRouter)

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
