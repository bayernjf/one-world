import Phaser from 'phaser';
import { GAME_CONFIG, BUILDING_ZONES, BuildingType } from '../config';
import { CITY_MAP, TileType } from '../data/map';
import { Player } from '../entities/Player';

export class CityScene extends Phaser.Scene {
  private player!: Player;
  private wallGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'CityScene' });
  }

  create(): void {
    this.renderMap();
    this.createWalls();
    this.createPlayer();
    this.createBuildingLabels();

    // 启动 UI 场景
    this.scene.launch('UIScene');

    // 监听建筑进入事件
    this.events.on('enter-building', (type: BuildingType) => {
      this.events.emit('open-panel', type);
      this.game.events.emit('open-panel', type);
    });
  }

  update(): void {
    this.player.update();
  }

  private renderMap(): void {
    const tileSize = GAME_CONFIG.TILE_SIZE;

    for (let y = 0; y < CITY_MAP.length; y++) {
      for (let x = 0; x < CITY_MAP[y].length; x++) {
        const tile = CITY_MAP[y][x];
        const textureKey = this.getTileTexture(tile);
        this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, textureKey);
      }
    }
  }

  private getTileTexture(tile: TileType): string {
    switch (tile) {
      case TileType.GRASS: return 'tile_grass';
      case TileType.ROAD: return 'tile_road';
      case TileType.WALL: return 'tile_wall';
      case TileType.OFFICE: return 'tile_office';
      case TileType.SHOP: return 'tile_shop';
      case TileType.PLAYER_SHOP: return 'tile_player_shop';
      case TileType.WATER: return 'tile_water';
      case TileType.TREE: return 'tile_tree';
      case TileType.DOOR: return 'tile_door';
      default: return 'tile_grass';
    }
  }

  private createWalls(): void {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    this.wallGroup = this.physics.add.staticGroup();

    for (let y = 0; y < CITY_MAP.length; y++) {
      for (let x = 0; x < CITY_MAP[y].length; x++) {
        const tile = CITY_MAP[y][x];
        // 不可通行的 tile 添加碰撞体
        if (tile === TileType.WALL || tile === TileType.OFFICE ||
            tile === TileType.SHOP || tile === TileType.PLAYER_SHOP ||
            tile === TileType.WATER || tile === TileType.TREE) {
          const wall = this.wallGroup.create(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            'tile_wall'
          ) as Phaser.Physics.Arcade.Sprite;
          wall.setVisible(false);
          wall.setDisplaySize(tileSize, tileSize);
          wall.refreshBody();
        }
      }
    }
  }

  private createPlayer(): void {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    // 玩家出生在地图中央道路上
    const startX = 12 * tileSize + tileSize / 2;
    const startY = 8 * tileSize + tileSize / 2;

    this.player = new Player(this, startX, startY);
    this.physics.add.collider(this.player, this.wallGroup);
  }

  private createBuildingLabels(): void {
    const tileSize = GAME_CONFIG.TILE_SIZE;

    for (const zone of BUILDING_ZONES) {
      const centerX = (zone.x + zone.width / 2) * tileSize;
      const topY = zone.y * tileSize - 10;

      this.add.text(centerX, topY, zone.name, {
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(5);
    }
  }
}
