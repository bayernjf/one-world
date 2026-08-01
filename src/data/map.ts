import { GAME_CONFIG } from '../config';

// Tile 类型定义
export enum TileType {
  GRASS = 0,
  ROAD = 1,
  WALL = 2,
  OFFICE = 3,
  SHOP = 4,
  PLAYER_SHOP = 5,
  WATER = 6,
  TREE = 7,
  DOOR = 8,
}

// 可通行的 Tile
export const WALKABLE_TILES = [TileType.GRASS, TileType.ROAD, TileType.DOOR];

// 生成城市地图 (25x19 tiles)
function generateMap(): number[][] {
  const { MAP_COLS, MAP_ROWS } = GAME_CONFIG;
  const map: number[][] = [];

  // 初始化全部为草地
  for (let y = 0; y < MAP_ROWS; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_COLS; x++) {
      map[y][x] = TileType.GRASS;
    }
  }

  // 绘制主干道 (横向)
  for (let x = 0; x < MAP_COLS; x++) {
    map[7][x] = TileType.ROAD;
    map[8][x] = TileType.ROAD;
    map[11][x] = TileType.ROAD;
    map[12][x] = TileType.ROAD;
  }

  // 绘制主干道 (纵向)
  for (let y = 0; y < MAP_ROWS; y++) {
    map[y][1] = TileType.ROAD;
    map[y][2] = TileType.ROAD;
    map[y][12] = TileType.ROAD;
    map[y][13] = TileType.ROAD;
    map[y][23] = TileType.ROAD;
    map[y][24] = TileType.ROAD;
  }

  // 办公楼区域 (3,2) 5x4
  for (let y = 2; y < 6; y++) {
    for (let x = 3; x < 8; x++) {
      map[y][x] = TileType.OFFICE;
    }
  }
  map[6][5] = TileType.DOOR; // 办公楼门

  // 商场区域 (17,2) 5x4
  for (let y = 2; y < 6; y++) {
    for (let x = 17; x < 22; x++) {
      map[y][x] = TileType.SHOP;
    }
  }
  map[6][19] = TileType.DOOR; // 商场门

  // 玩家店铺区域 (10,13) 5x4
  for (let y = 13; y < 17; y++) {
    for (let x = 10; x < 15; x++) {
      map[y][x] = TileType.PLAYER_SHOP;
    }
  }
  map[13][12] = TileType.DOOR; // 店铺门

  // 装饰: 水池
  for (let y = 14; y < 17; y++) {
    for (let x = 20; x < 23; x++) {
      map[y][x] = TileType.WATER;
    }
  }

  // 装饰: 树木
  const trees = [
    [0, 0], [0, 5], [0, 10], [0, 15], [0, 20],
    [18, 0], [18, 5], [18, 10], [18, 20],
    [9, 0], [9, 3], [9, 20],
    [5, 9], [5, 10], [14, 9], [14, 10],
  ];
  for (const [ty, tx] of trees) {
    if (ty < MAP_ROWS && tx < MAP_COLS && map[ty][tx] === TileType.GRASS) {
      map[ty][tx] = TileType.TREE;
    }
  }

  return map;
}

export const CITY_MAP = generateMap();
