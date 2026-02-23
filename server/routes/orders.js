import { Router } from 'express'
import { query, getClient } from '../db.js'

const router = Router()

// GET /api/orders - 주문 목록 (관리자)
router.get('/', async (req, res) => {
  try {
    const orderRows = await query(
      `SELECT id, created_at, status, total FROM orders ORDER BY created_at DESC`
    )
    const orders = orderRows.rows
    const itemRows = await query(
      `SELECT order_id, menu_id, menu_name, option_names, quantity, unit_price
       FROM order_items ORDER BY order_id, id`
    )
    const itemsByOrder = {}
    itemRows.rows.forEach((r) => {
      if (!itemsByOrder[r.order_id]) itemsByOrder[r.order_id] = []
      itemsByOrder[r.order_id].push({
        menuId: r.menu_id,
        menuName: r.menu_name,
        optionNames: r.option_names || [],
        quantity: r.quantity,
        unitPrice: r.unit_price,
      })
    })
    const list = orders.map((o) => ({
      id: o.id,
      createdAt: o.created_at,
      status: o.status,
      total: o.total,
      items: itemsByOrder[o.id] || [],
    }))
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders/:id - 주문 단건
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'Invalid order id' })
  try {
    const orderRow = await query(
      `SELECT id, created_at, status, total FROM orders WHERE id = $1`,
      [id]
    )
    if (orderRow.rows.length === 0) return res.status(404).json({ error: 'Order not found' })
    const order = orderRow.rows[0]
    const itemRows = await query(
      `SELECT menu_id, menu_name, option_names, quantity, unit_price
       FROM order_items WHERE order_id = $1 ORDER BY id`,
      [id]
    )
    res.json({
      id: order.id,
      createdAt: order.created_at,
      status: order.status,
      total: order.total,
      items: itemRows.rows.map((r) => ({
        menuId: r.menu_id,
        menuName: r.menu_name,
        optionNames: r.option_names || [],
        quantity: r.quantity,
        unitPrice: r.unit_price,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/orders - 주문 생성 (재고 차감 트랜잭션)
router.post('/', async (req, res) => {
  const { items, total } = req.body
  if (!Array.isArray(items) || items.length === 0 || typeof total !== 'number') {
    return res.status(400).json({ error: 'Invalid body: items (array), total (number)' })
  }
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const orderResult = await client.query(
      `INSERT INTO orders (total) VALUES ($1) RETURNING id, created_at, status, total`,
      [total]
    )
    const order = orderResult.rows[0]
    for (const it of items) {
      const optionNames = Array.isArray(it.optionNames) ? it.optionNames : []
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, option_names, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, it.menuId, it.menuName || '', JSON.stringify(optionNames), it.quantity, it.unitPrice]
      )
      await client.query(
        `UPDATE menus SET stock = GREATEST(0, stock - $1) WHERE id = $2`,
        [it.quantity, it.menuId]
      )
    }
    await client.query('COMMIT')
    res.status(201).json({
      id: order.id,
      createdAt: order.created_at,
      status: order.status,
      total: order.total,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PATCH /api/orders/:id/status - 주문 상태 변경 (관리자)
router.patch('/:id/status', async (req, res) => {
  const id = Number(req.params.id)
  const { status } = req.body
  const allowed = ['accepted', 'in_progress', 'completed']
  if (!id || !allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid id or status' })
  }
  try {
    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' })
    res.json({ id: result.rows[0].id, status: result.rows[0].status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
