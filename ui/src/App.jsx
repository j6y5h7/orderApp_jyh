import { useState, useCallback } from 'react'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import Cart from './components/Cart'
import { MENU_LIST } from './data/menuData'
import './App.css'

let nextCartItemId = 1

function App() {
  const [currentTab, setCurrentTab] = useState('order')
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message) => {
    setToast(message)
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [])

  const addToCart = useCallback(
    (payload) => {
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
    [showToast]
  )

  const updateQuantity = useCallback((cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId !== cartItemId) return item
          const q = item.quantity + delta
          if (q <= 0) return null
          return { ...item, quantity: q }
        })
        .filter(Boolean)
    )
  }, [])

  const removeFromCart = useCallback((cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }, [])

  const handleOrderSubmit = useCallback(() => {
    if (cart.length === 0) return
    const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    alert(`주문이 접수되었습니다.\n총 금액: ${total.toLocaleString()}원`)
    setCart([])
  }, [cart])

  return (
    <div className="app">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />
      {currentTab === 'order' && (
        <div className="app__content">
          <main className="order-page">
            <section className="menu-section">
              <h2 className="sr-only">메뉴</h2>
              <div className="menu-grid">
                {MENU_LIST.map((menu) => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            </section>
            <aside className="cart-section">
              <Cart
                items={cart}
                onQuantityChange={updateQuantity}
                onRemove={removeFromCart}
                onSubmit={handleOrderSubmit}
              />
            </aside>
          </main>
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      )}
      {currentTab === 'admin' && (
        <div className="app__content">
          <main className="admin-placeholder">
            <p>관리자 화면은 준비 중입니다.</p>
          </main>
        </div>
      )}
    </div>
  )
}

export default App
