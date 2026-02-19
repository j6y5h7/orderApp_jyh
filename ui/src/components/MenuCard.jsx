import { useState } from 'react'
import { formatPrice } from '../data/menuData'

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptionIds, setSelectedOptionIds] = useState([])
  const [imageError, setImageError] = useState(false)

  const toggleOption = (optionId) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    )
  }

  const unitPrice =
    menu.price +
    menu.options
      .filter((opt) => selectedOptionIds.includes(opt.id))
      .reduce((sum, opt) => sum + opt.extraPrice, 0)

  const handleAdd = () => {
    const selectedOptions = menu.options.filter((opt) =>
      selectedOptionIds.includes(opt.id)
    )
    onAddToCart({
      menuId: menu.id,
      menuName: menu.name,
      selectedOptionIds: [...selectedOptionIds],
      optionNames: selectedOptions.map((o) => o.name),
      quantity: 1,
      unitPrice,
    })
  }

  return (
    <article className="menu-card">
      <div className="menu-card__image">
        {menu.imageUrl && !imageError ? (
          <img
            src={menu.imageUrl}
            alt=""
            className="menu-card__img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="menu-card__image-placeholder">이미지</span>
        )}
      </div>
      <h3 className="menu-card__name">{menu.name}</h3>
      <p className="menu-card__price">{formatPrice(menu.price)}</p>
      <p className="menu-card__description">{menu.description}</p>
      <div className="menu-card__options">
        {menu.options.map((opt) => (
          <label key={opt.id} className="menu-card__option">
            <input
              type="checkbox"
              checked={selectedOptionIds.includes(opt.id)}
              onChange={() => toggleOption(opt.id)}
            />
            <span>
              {opt.name} ({opt.extraPrice > 0 ? `+${formatPrice(opt.extraPrice)}` : '+0원'})
            </span>
          </label>
        ))}
      </div>
      <button type="button" className="menu-card__add-btn" onClick={handleAdd}>
        담기
      </button>
    </article>
  )
}

export default MenuCard
