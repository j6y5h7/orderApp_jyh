import { Router } from 'express'
import { query, getClient } from '../db.js'

const router = Router()

// GET /api/menus - 메뉴 목록 + 옵션 + 재고
router.get('/', async (req, res) => {
  try {
    const menuRows = await query(
      `SELECT m.id, m.name, m.description, m.price, m.image_url, m.stock
       FROM menus m
       ORDER BY m.id`
    )
    const optionRows = await query(
      `SELECT mo.menu_id, o.id AS option_id, o.name AS option_name, o.extra_price
       FROM menu_options mo
       JOIN options o ON o.id = mo.option_id
       ORDER BY mo.menu_id, o.id`
    )
    const optionsByMenu = {}
    optionRows.rows.forEach((r) => {
      if (!optionsByMenu[r.menu_id]) optionsByMenu[r.menu_id] = []
      optionsByMenu[r.menu_id].push({
        id: r.option_id,
        name: r.option_name,
        extraPrice: r.extra_price,
      })
    })
    const menus = menuRows.rows.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description || '',
      price: m.price,
      imageUrl: m.image_url || '',
      stock: m.stock,
      options: optionsByMenu[m.id] || [],
    }))
    res.json(menus)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/menus/:id/stock - 재고 증감 (관리자)
router.patch('/:id/stock', async (req, res) => {
  const menuId = Number(req.params.id)
  const { delta } = req.body
  if (menuId <= 0 || delta == null || typeof delta !== 'number') {
    return res.status(400).json({ error: 'Invalid menu id or delta' })
  }
  try {
    const result = await query(
      `UPDATE menus SET stock = GREATEST(0, stock + $1) WHERE id = $2 RETURNING id, stock`,
      [delta, menuId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menu not found' })
    res.json({ id: result.rows[0].id, stock: result.rows[0].stock })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
