export const MENU_LIST = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '에스프레소에 찬 물을 더해 깔끔하게 마시는 커피.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
    options: [
      { id: 'shot', name: '샷 추가', extraPrice: 500 },
      { id: 'syrup', name: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '에스프레소에 뜨거운 물을 더해 따뜻하게 마시는 커피.',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    options: [
      { id: 'shot', name: '샷 추가', extraPrice: 500 },
      { id: 'syrup', name: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '풍부한 에스프레소와 스팀 밀크의 조화.',
    imageUrl: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop',
    options: [
      { id: 'shot', name: '샷 추가', extraPrice: 500 },
      { id: 'syrup', name: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 4,
    name: '바닐라라떼',
    price: 5500,
    description: '바닐라 시럽이 더해진 부드러운 라떼.',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    options: [
      { id: 'shot', name: '샷 추가', extraPrice: 500 },
      { id: 'syrup', name: '시럽 추가', extraPrice: 0 },
    ],
  },
  {
    id: 5,
    name: '카페모카',
    price: 5500,
    description: '초콜릿과 에스프레소가 어우러진 달콤한 커피.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
    options: [
      { id: 'shot', name: '샷 추가', extraPrice: 500 },
      { id: 'syrup', name: '시럽 추가', extraPrice: 0 },
    ],
  },
]

export function formatPrice(price) {
  return `${Number(price).toLocaleString()}원`
}
