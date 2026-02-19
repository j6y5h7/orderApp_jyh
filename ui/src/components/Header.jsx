function Header({ currentTab, onTabChange }) {
  return (
    <header className="header">
      <div className="header__brand">AI Coffee</div>
      <nav className="header__nav">
        <button
          type="button"
          className={`header__tab ${currentTab === 'order' ? 'header__tab--active' : ''}`}
          onClick={() => onTabChange('order')}
        >
          주문하기
        </button>
        <button
          type="button"
          className={`header__tab ${currentTab === 'admin' ? 'header__tab--active' : ''}`}
          onClick={() => onTabChange('admin')}
        >
          관리자
        </button>
      </nav>
    </header>
  )
}

export default Header
