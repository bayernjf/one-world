// 商品数据定义
export interface ItemDef {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // emoji 图标
  effect: {
    type: 'efficiency' | 'luck' | 'coins';
    value: number;
  };
  category: 'tool' | 'food' | 'luxury';
}

export const SHOP_ITEMS: ItemDef[] = [
  {
    id: 'item_coffee',
    name: '浓缩咖啡',
    description: '提升工作效率 +0.1',
    price: 20,
    icon: '☕',
    effect: { type: 'efficiency', value: 0.1 },
    category: 'food',
  },
  {
    id: 'item_keyboard',
    name: '机械键盘',
    description: '提升工作效率 +0.2',
    price: 80,
    icon: '⌨️',
    effect: { type: 'efficiency', value: 0.2 },
    category: 'tool',
  },
  {
    id: 'item_monitor',
    name: '4K显示器',
    description: '提升工作效率 +0.3',
    price: 150,
    icon: '🖥️',
    effect: { type: 'efficiency', value: 0.3 },
    category: 'tool',
  },
  {
    id: 'item_clover',
    name: '四叶草',
    description: '提升运气 +0.1',
    price: 30,
    icon: '🍀',
    effect: { type: 'luck', value: 0.1 },
    category: 'luxury',
  },
  {
    id: 'item_cat',
    name: '招财猫',
    description: '提升运气 +0.2',
    price: 100,
    icon: '🐱',
    effect: { type: 'luck', value: 0.2 },
    category: 'luxury',
  },
  {
    id: 'item_lunch',
    name: '豪华午餐',
    description: '立即获得 15 金币',
    price: 10,
    icon: '🍱',
    effect: { type: 'coins', value: 15 },
    category: 'food',
  },
  {
    id: 'item_book',
    name: '技术书籍',
    description: '提升工作效率 +0.15',
    price: 50,
    icon: '📚',
    effect: { type: 'efficiency', value: 0.15 },
    category: 'tool',
  },
  {
    id: 'item_crystal',
    name: '水晶球',
    description: '提升运气 +0.3',
    price: 200,
    icon: '🔮',
    effect: { type: 'luck', value: 0.3 },
    category: 'luxury',
  },
];
