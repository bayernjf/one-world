import Phaser from 'phaser';
import { GAME_CONFIG, COLORS } from '../config';
import { TileType } from '../data/map';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generateTileTextures();
    this.generatePlayerTexture();
    this.generateDoorTexture();
    this.scene.start('CityScene');
  }

  private generateTileTextures(): void {
    const size = GAME_CONFIG.TILE_SIZE;

    // 草地
    this.createTileTexture('tile_grass', (g) => {
      g.fillStyle(COLORS.GRASS);
      g.fillRect(0, 0, size, size);
      // 草地纹理点缀
      g.fillStyle(0x5a9c4f);
      for (let i = 0; i < 5; i++) {
        const px = Math.floor(Math.random() * (size - 4)) + 2;
        const py = Math.floor(Math.random() * (size - 4)) + 2;
        g.fillRect(px, py, 2, 2);
      }
    });

    // 道路
    this.createTileTexture('tile_road', (g) => {
      g.fillStyle(COLORS.ROAD);
      g.fillRect(0, 0, size, size);
      // 道路纹理
      g.fillStyle(0x909090);
      g.fillRect(size / 2 - 1, 0, 2, size);
      g.fillRect(0, size / 2 - 1, size, 2);
    });

    // 墙壁
    this.createTileTexture('tile_wall', (g) => {
      g.fillStyle(COLORS.WALL);
      g.fillRect(0, 0, size, size);
      g.lineStyle(1, 0x2a2a4a);
      g.strokeRect(1, 1, size - 2, size - 2);
    });

    // 办公楼
    this.createTileTexture('tile_office', (g) => {
      g.fillStyle(COLORS.BUILDING_OFFICE);
      g.fillRect(0, 0, size, size);
      // 窗户
      g.fillStyle(0x8ab4e8);
      g.fillRect(6, 6, 8, 8);
      g.fillRect(18, 6, 8, 8);
      g.fillRect(6, 18, 8, 8);
      g.fillRect(18, 18, 8, 8);
    });

    // 商场
    this.createTileTexture('tile_shop', (g) => {
      g.fillStyle(COLORS.BUILDING_SHOP);
      g.fillRect(0, 0, size, size);
      // 橱窗
      g.fillStyle(0xf0d878);
      g.fillRect(4, 8, 24, 16);
      g.lineStyle(2, 0xa08030);
      g.strokeRect(4, 8, 24, 16);
    });

    // 玩家店铺
    this.createTileTexture('tile_player_shop', (g) => {
      g.fillStyle(COLORS.BUILDING_PLAYER_SHOP);
      g.fillRect(0, 0, size, size);
      // 招牌
      g.fillStyle(0xb080e0);
      g.fillRect(8, 4, 16, 10);
      g.fillStyle(0xe0c0ff);
      g.fillRect(10, 18, 12, 10);
    });

    // 水池
    this.createTileTexture('tile_water', (g) => {
      g.fillStyle(COLORS.WATER);
      g.fillRect(0, 0, size, size);
      g.fillStyle(0x6ab0f0);
      g.fillRect(4, 12, 12, 3);
      g.fillRect(16, 20, 10, 3);
    });

    // 树木
    this.createTileTexture('tile_tree', (g) => {
      g.fillStyle(COLORS.GRASS);
      g.fillRect(0, 0, size, size);
      // 树干
      g.fillStyle(0x8b5a2b);
      g.fillRect(13, 20, 6, 12);
      // 树冠
      g.fillStyle(COLORS.TREE);
      g.fillCircle(16, 14, 10);
      g.fillStyle(0x3d8b3d);
      g.fillCircle(14, 12, 6);
    });
  }

  private generateDoorTexture(): void {
    const size = GAME_CONFIG.TILE_SIZE;
    this.createTileTexture('tile_door', (g) => {
      g.fillStyle(0x606060);
      g.fillRect(0, 0, size, size);
      // 门
      g.fillStyle(0xd4a574);
      g.fillRect(8, 4, 16, 28);
      g.fillStyle(0xffd700);
      g.fillCircle(20, 18, 2);
    });
  }

  private generatePlayerTexture(): void {
    const g = this.add.graphics();
    const size = 24;

    // 身体
    g.fillStyle(COLORS.PLAYER);
    g.fillCircle(size / 2, size / 2, 10);

    // 轮廓
    g.lineStyle(2, COLORS.PLAYER_OUTLINE);
    g.strokeCircle(size / 2, size / 2, 10);

    // 眼睛
    g.fillStyle(0xffffff);
    g.fillCircle(size / 2 - 3, size / 2 - 2, 3);
    g.fillCircle(size / 2 + 3, size / 2 - 2, 3);
    g.fillStyle(0x333333);
    g.fillCircle(size / 2 - 3, size / 2 - 2, 1.5);
    g.fillCircle(size / 2 + 3, size / 2 - 2, 1.5);

    g.generateTexture('player', size, size);
    g.destroy();
  }

  private createTileTexture(key: string, drawFn: (g: Phaser.GameObjects.Graphics) => void): void {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    g.destroy();
  }
}
