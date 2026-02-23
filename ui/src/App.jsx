import { useState, useCallback, useRef, useEffect } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import Cart from './components/Cart'
import Admin from './components/Admin'
import { api } from './api/client'
import './App.css'

let nextCartItemId = 1

function App() {
  const [currentTab, setCurrentTab] = useState('order')
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [menuList, setMenuList] = useState([])
  const [menusLoading, setMenusLoading] = useState(true)
  const [menusError, setMenusError] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const stock = Object.fromEntries(menuList.map((m) => [m.id, m.stock ?? 0]))

  const toastTimerRef = useRef(null)
  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 2000)
  }, [])

  const fetchMenus = useCallback(async () => {
    setMenusLoading(true)
    setMenusError(null)
    try {
      const data = await api.getMenus()
      setMenuList(Array.isArray(data) ? data : [])
    } catch (err) {
      setMenusError(err.message)
      showToast('메뉴를 불러오지 못했습니다.')
    } finally {
      setMenusLoading(false)
    }
  }, [showToast])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast('주문 목록을 불러오지 못했습니다.')
    } finally {
      setOrdersLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  useEffect(() => {
    if (currentTab === 'admin') fetchOrders()
  }, [currentTab, fetchOrders])

  const addToCart = useCallback(
    (payload) => {
      const available = stock[payload.menuId] ?? 0
      const totalInCart = cart
        .filter((i) => i.menuId === payload.menuId)
        .reduce((s, i) => s + i.quantity, 0)
      if (totalInCart + payload.quantity > available) {
        showToast('재고가 부족합니다.')
        return
      }
      const getComboKey = (item) =>
        [item.menuId, [...(item.selectedOptionIds || [])].sort().join(',')].join('|')
      const payloadKey = getComboKey(payload)
      setCart((prev) => {
        const existing = prev.find((item) => getComboKey(item) === payloadKey)
        if (existing) {
          return prev.map((item) =>
            item.cartItemId === existing.cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        return [
          ...prev,
          {
            cartItemId: nextCartItemId++,
            menuId: payload.menuId,
            menuName: payload.menuName,
            selectedOptionIds: payload.selectedOptionIds,
            optionNames: payload.optionNames || [],
            quantity: payload.quantity,
            unitPrice: payload.unitPrice,
          },
        ]
      })
      showToast(`${payload.menuName}${payload.optionNames?.length ? ` (${payload.optionNames.join(', ')})` : ''}가 장바구니에 담겼습니다.`)
    },
    [showToast, cart, stock]
  )

  const updateQuantity = useCallback(
    (cartItemId, delta) => {
      setCart((prev) => {
        const item = prev.find((i) => i.cartItemId === cartItemId)
        if (!item) return prev
        const totalOthersSameMenu = prev
          .filter((i) => i.menuId === item.menuId && i.cartItemId !== cartItemId)
          .reduce((s, i) => s + i.quantity, 0)
        const maxForThis = Math.max(0, (stock[item.menuId] ?? 0) - totalOthersSameMenu)
        let q = item.quantity + delta
        if (q <= 0) {
          return prev.filter((i) => i.cartItemId !== cartItemId)
        }
        q = Math.min(q, maxForThis)
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: q } : i
        )
      })
    },
    [stock]
  )

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }, [])

  const handleOrderSubmit = useCallback(async () => {
    if (cart.length === 0) return

    const hasSoldOutItem = cart.some((item) => (stock[item.menuId] ?? 0) === 0)
    if (hasSoldOutItem) {
      showToast('품절된 메뉴가 포함되어 있어 주문할 수 없습니다.')
      return
    }

    const totalByMenu = {}
    cart.forEach((item) => {
      totalByMenu[item.menuId] = (totalByMenu[item.menuId] ?? 0) + item.quantity
    })
    const overStock = Object.keys(totalByMenu).some(
      (menuId) => totalByMenu[menuId] > (stock[menuId] ?? 0)
    )
    if (overStock) {
      showToast('재고가 부족한 메뉴가 있어 주문할 수 없습니다.')
      return
    }

    const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const body = {
      items: cart.map((i) => ({
        menuId: i.menuId,
        menuName: i.menuName,
        optionNames: i.optionNames || [],
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      total,
    }

    try {
      await api.createOrder(body)
      setCart([])
      await fetchMenus()
      if (currentTab === 'admin') await fetchOrders()
      showToast(`주문이 접수되었습니다. 총 금액 ${total.toLocaleString()}원`)
    } catch (err) {
      showToast(err.message || '주문 처리에 실패했습니다.')
    }
  }, [cart, showToast, stock, fetchMenus, fetchOrders, currentTab])

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        await api.patchOrderStatus(orderId, newStatus)
        await fetchOrders()
      } catch (err) {
        showToast(err.message || '상태 변경에 실패했습니다.')
      }
    },
    [fetchOrders, showToast]
  )

  const updateStock = useCallback(
    async (menuId, delta) => {
      try {
        await api.patchMenuStock(menuId, delta)
        await fetchMenus()
      } catch (err) {
        showToast(err.message || '재고 수정에 실패했습니다.')
      }
    },
    [fetchMenus, showToast]
  )

  return (
    <div className="app">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />
      {currentTab === 'order' && (
        <div className="app__content">
          <main className="order-page">
            <section className="menu-section">
              <h2 className="sr-only">메뉴</h2>
              {menusLoading ? (
                <p className="menu-loading">메뉴를 불러오는 중...</p>
              ) : menusError ? (
                <p className="menu-error">{menusError}</p>
              ) : (
                <div className="menu-grid">
                  {menuList.map((menu) => {
                    const stockQty = stock[menu.id] ?? 0
                    return (
                      <MenuCard
                        key={menu.id}
                        menu={menu}
                        stockQty={stockQty}
                        onAddToCart={addToCart}
                      />
                    )
                  })}
                </div>
              )}
            </section>
            <aside className="cart-section">
              <Cart
                items={cart}
                stock={stock}
                onQuantityChange={updateQuantity}
                onRemove={removeFromCart}
                onSubmit={handleOrderSubmit}
              />
            </aside>
          </main>
          {toast && (
            <div className="toast" role="status" aria-live="polite">
              {toast}
            </div>
          )}
        </div>
      )}
      {currentTab === 'admin' && (
        <div className="app__content">
          <Admin
            orders={orders}
            ordersLoading={ordersLoading}
            stock={stock}
            menuList={menuList}
            onOrderStatusChange={updateOrderStatus}
            onStockChange={updateStock}
          />
        </div>
      )}
    </div>
  )
}

export default App
