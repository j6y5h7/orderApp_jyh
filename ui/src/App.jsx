import { useState, useCallback, useRef } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import Cart from './components/Cart'
import Admin from './components/Admin'
import { MENU_LIST } from './data/menuData'
import './App.css'

let nextCartItemId = 1
let nextOrderId = 1

const initialStock = Object.fromEntries(MENU_LIST.map((m) => [m.id, 10]))

function App() {
  const [currentTab, setCurrentTab] = useState('order')
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [orders, setOrders] = useState([])
  const [stock, setStock] = useState(initialStock)

  const toastTimerRef = useRef(null)
  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 2000)
  }, [])

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

  const handleOrderSubmit = useCallback(() => {
    if (cart.length === 0) return

    // 품절 메뉴가 포함된 경우 주문 불가
    const hasSoldOutItem = cart.some((item) => (stock[item.menuId] ?? 0) === 0)
    if (hasSoldOutItem) {
      showToast('품절된 메뉴가 포함되어 있어 주문할 수 없습니다.')
      return
    }

    // 메뉴별 장바구니 수량이 재고를 초과하는 경우 주문 불가 (다른 탭에서 재고가 줄었을 수 있음)
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
    const order = {
      id: nextOrderId++,
      createdAt: new Date(),
      items: cart.map((i) => ({
        menuId: i.menuId,
        menuName: i.menuName,
        optionNames: i.optionNames || [],
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      total,
      status: 'accepted',
    }

    // 주문 수량만큼 재고 차감
    setStock((prev) => {
      const next = { ...prev }
      cart.forEach((item) => {
        const current = next[item.menuId] ?? 0
        next[item.menuId] = Math.max(0, current - item.quantity)
      })
      return next
    })

    setOrders((prev) => [order, ...prev])
    setCart([])
    showToast(`주문이 접수되었습니다. 총 금액 ${total.toLocaleString()}원`)
  }, [cart, showToast, stock])

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }, [])

  const updateStock = useCallback((menuId, delta) => {
    setStock((prev) => {
      const next = (prev[menuId] ?? 0) + delta
      return { ...prev, [menuId]: Math.max(0, next) }
    })
  }, [])

  return (
    <div className="app">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />
      {currentTab === 'order' && (
        <div className="app__content">
          <main className="order-page">
            <section className="menu-section">
              <h2 className="sr-only">메뉴</h2>
              <div className="menu-grid">
                {MENU_LIST.map((menu) => {
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
            stock={stock}
            menuList={MENU_LIST}
            onOrderStatusChange={updateOrderStatus}
            onStockChange={updateStock}
          />
        </div>
      )}
    </div>
  )
}

export default App
