-- Menus: 메뉴 (재고 수량 포함)
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  image_url VARCHAR(512),
  stock INT NOT NULL DEFAULT 0
);

-- Options: 옵션 (공통)
CREATE TABLE IF NOT EXISTS options (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  extra_price INT NOT NULL DEFAULT 0
);

-- 메뉴-옵션 연결 (N:M)
CREATE TABLE IF NOT EXISTS menu_options (
  menu_id INT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  option_id VARCHAR(64) NOT NULL REFERENCES options(id),
  PRIMARY KEY (menu_id, option_id)
);

-- Orders: 주문
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(32) NOT NULL DEFAULT 'accepted',
  total INT NOT NULL
);

-- Order items: 주문 항목 (스냅샷)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INT NOT NULL,
  menu_name VARCHAR(255) NOT NULL,
  option_names JSONB NOT NULL DEFAULT '[]',
  quantity INT NOT NULL,
  unit_price INT NOT NULL
);
