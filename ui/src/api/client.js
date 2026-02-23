const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || res.statusText)
  return data
}

export const api = {
  getMenus: () => request('/api/menus'),
  patchMenuStock: (menuId, delta) =>
    request(`/api/menus/${menuId}/stock`, { method: 'PATCH', body: JSON.stringify({ delta }) }),
  getOrders: () => request('/api/orders'),
  getOrder: (id) => request(`/api/orders/${id}`),
  createOrder: (body) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  patchOrderStatus: (orderId, status) =>
    request(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
