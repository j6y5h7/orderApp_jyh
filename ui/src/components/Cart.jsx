import { formatPrice } from '../data/menuData'

function Cart({ items, stock = {}, onQuantityChange, onRemove, onSubmit }) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const isEmpty = items.length === 0

  const getMaxQuantity = (item) => {
    const available = stock[item.menuId] ?? 0
    const othersQty = items
      .filter((i) => i.menuId === item.menuId && i.cartItemId !== item.cartItemId)
      .reduce((s, i) => s + i.quantity, 0)
    return Math.max(0, available - othersQty)
  }

  return (
    <section className="cart">
      <h2 className="cart__title">장바구니</h2>
      <div className="cart__list-wrap">
        <ul className="cart__list">
          {items.map((item) => {
            const optionLabel =
              item.optionNames && item.optionNames.length > 0
                ? ` (${item.optionNames.join(', ')})`
                : ''
            const lineTotal = item.unitPrice * item.quantity
            const maxQty = getMaxQuantity(item)
            const canIncrease = item.quantity < maxQty
            return (
              <li key={item.cartItemId} className="cart__item">
                <div className="cart__item-info">
                  <span className="cart__item-name">
                    {item.menuName}
                    {optionLabel} × {item.quantity}
                  </span>
                  <span className="cart__item-price">{formatPrice(lineTotal)}</span>
                </div>
                <div className="cart__item-actions">
                  <button
                    type="button"
                    className="cart__qty-btn"
                    onClick={() => onQuantityChange(item.cartItemId, -1)}
                    aria-label="수량 줄이기"
                  >
                    -
                  </button>
                  <span className="cart__qty">{item.quantity}</span>
                  <button
                    type="button"
                    className="cart__qty-btn"
                    disabled={!canIncrease}
                    onClick={() => onQuantityChange(item.cartItemId, 1)}
                    aria-label="수량 늘리기"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="cart__remove-btn"
                    onClick={() => onRemove(item.cartItemId)}
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        {isEmpty && (
          <p className="cart__empty">장바구니가 비어 있습니다.</p>
        )}
      </div>
      <div className="cart__summary">
        <div className="cart__footer">
          <span className="cart__total-label">총 금액</span>
          <strong className="cart__total-value">{formatPrice(total)}</strong>
        </div>
        <button
          type="button"
          className="cart__submit-btn"
          disabled={isEmpty}
          onClick={onSubmit}
        >
          주문하기
        </button>
      </div>
    </section>
  )
}

export default Cart
