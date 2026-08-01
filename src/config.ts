// 游戏配置常量
export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 32,
  PLAYER_SPEED: 160,
  MAP_COLS: 25,
  MAP_ROWS: 19,
} as const;

// 颜色配置
export const COLORS = {
  ROAD: 0x808080,
  GRASS: 0x4a8c3f,
  BUILDING_OFFICE: 0x4a6fa5,
  BUILDING_SHOP: 0xc9a84c,
  BUILDING_PLAYER_SHOP: 0x7b4fa5,
  WALL: 0x3a3a5a,
  PLAYER: 0xff6b6b,
  PLAYER_OUTLINE: 0xcc4444,
  WATER: 0x4a90d9,
  TREE: 0x2d6b2d,
} as const;

// 建筑类型
export enum BuildingType {
  OFFICE = 'office',
  SHOP = 'shop',
  PLAYER_SHOP = 'player_shop',
}

// 建筑交互区域定义
export interface BuildingZone {
  type: BuildingType;
  x: number; // tile坐标
  y: number;
  width: number; // tile单位
  height: number;
  name: string;
}

export const BUILDING_ZONES: BuildingZone[] = [
  { type: BuildingType.OFFICE, x: 3, y: 2, width: 5, height: 4, name: '科技办公楼' },
  { type: BuildingType.SHOP, x: 17, y: 2, width: 5, height: 4, name: '万象商场' },
  { type: BuildingType.PLAYER_SHOP, x: 10, y: 13, width: 5, height: 4, name: '我的店铺' },
];
