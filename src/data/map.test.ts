import { describe, expect, it } from 'vitest';
import { BUILDING_ZONES } from '../config';
import { CITY_MAP, TileType, WALKABLE_TILES } from './map';

// P2-2 回归：建筑门贴图必须落在交互判定使用的那一格（建筑底边中点外一格）。
function doorTile(zone: (typeof BUILDING_ZONES)[number]): { x: number; y: number } {
  return { x: zone.x + Math.floor(zone.width / 2), y: zone.y + zone.height };
}

describe('建筑门贴图与交互坐标（P2-2）', () => {
  it.each(BUILDING_ZONES)('$name 的门贴在底边中点外一格', (zone) => {
    const door = doorTile(zone);
    expect(CITY_MAP[door.y][door.x]).toBe(TileType.DOOR);
    expect(WALKABLE_TILES).toContain(CITY_MAP[door.y][door.x]);
    expect(WALKABLE_TILES).toContain(CITY_MAP[door.y + 1][door.x]);
    expect(CITY_MAP[zone.y][door.x]).not.toBe(TileType.DOOR);
  });

  it('玩家店铺不再把门画在建筑内部顶边', () => {
    expect(CITY_MAP[13][12]).toBe(TileType.PLAYER_SHOP);
    expect(CITY_MAP[17][12]).toBe(TileType.DOOR);
    expect(WALKABLE_TILES).toContain(CITY_MAP[18][12]);
  });
});
