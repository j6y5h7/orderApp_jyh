-- Options (공통)
INSERT INTO options (id, name, extra_price) VALUES
  ('shot', '샷 추가', 500),
  ('syrup', '시럽 추가', 0)
ON CONFLICT (id) DO NOTHING;

-- Menus
INSERT INTO menus (id, name, description, price, image_url, stock) VALUES
  (1, '아메리카노(ICE)', '에스프레소에 찬 물을 더해 깔끔하게 마시는 커피.', 4000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop', 10),
  (2, '아메리카노(HOT)', '에스프레소에 뜨거운 물을 더해 따뜻하게 마시는 커피.', 4000, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', 10),
  (3, '카페라떼', '풍부한 에스프레소와 스팀 밀크의 조화.', 5000, 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop', 10),
  (4, '바닐라라떼', '바닐라 시럽이 더해진 부드러운 라떼.', 5500, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 10),
  (5, '카페모카', '초콜릿과 에스프레소가 어우러진 달콤한 커피.', 5500, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', 10)
ON CONFLICT (id) DO NOTHING;

-- menu_options (각 메뉴에 shot, syrup 연결) - 메뉴 id 1~5가 이미 있어야 함
INSERT INTO menu_options (menu_id, option_id) VALUES
  (1, 'shot'), (1, 'syrup'),
  (2, 'shot'), (2, 'syrup'),
  (3, 'shot'), (3, 'syrup'),
  (4, 'shot'), (4, 'syrup'),
  (5, 'shot'), (5, 'syrup')
ON CONFLICT DO NOTHING;

-- 시퀀스 보정 (명시적 id 사용 후)
SELECT setval(pg_get_serial_sequence('menus', 'id'), (SELECT COALESCE(MAX(id), 1) FROM menus));
