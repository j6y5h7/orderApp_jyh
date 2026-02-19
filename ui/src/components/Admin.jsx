import { formatPrice } from '../data/menuData'

function Admin({ orders, stock, menuList, onOrderStatusChange, onStockChange }) {
  const acceptedCount = orders.filter((o) => o.status === 'accepted').length
  const inProgressCount = orders.filter((o) => o.status === 'in_progress').length
  const completedCount = orders.filter((o) => o.status === 'completed').length

  const getStockLabel = (qty) => {
    if (qty === 0) return { text: '품절', className: 'admin-stock--out' }
    if (qty < 5) return { text: '주의', className: 'admin-stock--low' }
    return { text: '정상', className: 'admin-stock--ok' }
  }

  const formatOrderDate = (date) => {
    const d = typeof date === 'object' && date instanceof Date ? date : new Date(date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  return (
    <main className="admin-page">
      <section className="admin-section admin-dashboard">
        <h2 className="admin-section__title">관리자 대시보드</h2>
        <div className="admin-dashboard__stats">
          <span className="admin-dashboard__stat">총 주문 {orders.length}</span>
          <span className="admin-dashboard__stat">주문 접수 {acceptedCount}</span>
          <span className="admin-dashboard__stat">제조 중 {inProgressCount}</span>
          <span className="admin-dashboard__stat">제조 완료 {completedCount}</span>
        </div>
      </section>

      <section className="admin-section admin-stock-section">
        <h2 className="admin-section__title">재고 현황</h2>
        <div className="admin-stock-grid">
          {menuList.map((menu) => {
            const qty = stock[menu.id] ?? 0
            const { text: statusText, className: statusClass } = getStockLabel(qty)
            return (
              <div key={menu.id} className="admin-stock-card">
                <div className="admin-stock-card__name">{menu.name}</div>
                <div className="admin-stock-card__row">
                  <span className="admin-stock-card__qty">{qty}개</span>
                  <span className={`admin-stock-card__status ${statusClass}`}>
                    {statusText}
                  </span>
                </div>
                <div className="admin-stock-card__actions">
                  <button
                    type="button"
                    className="admin-stock-card__btn"
                    onClick={() => onStockChange(menu.id, -1)}
                    disabled={qty <= 0}
                    aria-label="재고 줄이기"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="admin-stock-card__btn"
                    onClick={() => onStockChange(menu.id, 1)}
                    aria-label="재고 늘리기"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="admin-section admin-orders-section">
        <h2 className="admin-section__title">주문 현황</h2>
        <div className="admin-orders-list">
          {orders.length === 0 ? (
            <p className="admin-orders-empty">주문이 없습니다.</p>
          ) : (
            orders.map((order) => {
              const menuSummary = order.items
                .map(
                  (i) =>
                    `${i.menuName}${i.optionNames?.length ? ` (${i.optionNames.join(', ')})` : ''} x ${i.quantity}`
                )
                .join(', ')
              return (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-card__date">
                    {formatOrderDate(order.createdAt)}
                  </div>
                  <div className="admin-order-card__menu">{menuSummary}</div>
                  <div className="admin-order-card__total">
                    {formatPrice(order.total)}
                  </div>
                  <div className="admin-order-card__action">
                    {order.status === 'accepted' && (
                      <button
                        type="button"
                        className="admin-order-card__btn admin-order-card__btn--primary"
                        onClick={() => onOrderStatusChange(order.id, 'in_progress')}
                      >
                        제조시작
                      </button>
                    )}
                    {order.status === 'in_progress' && (
                      <button
                        type="button"
                        className="admin-order-card__btn admin-order-card__btn--primary"
                        onClick={() => onOrderStatusChange(order.id, 'completed')}
                      >
                        제조 완료
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <span className="admin-order-card__badge">제조 완료</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}

export default Admin
