import Phaser from 'phaser';
import { GAME_CONFIG, BUILDING_ZONES, BuildingType } from '../config';
import { CITY_MAP, TileType, WALKABLE_TILES } from '../data/map';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private currentZone: BuildingType | null = null;
  private nearZone: BuildingType | null = null;
  private promptText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);

    // 输入
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.interactKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // 交互提示文字
    this.promptText = scene.add.text(x, y - 30, '', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(20);

    // 交互事件
    this.interactKey.on('down', () => {
      if (this.nearZone) {
        this.scene.events.emit('enter-building', this.nearZone);
      }
    });
  }

  update(): void {
    const speed = GAME_CONFIG.PLAYER_SPEED;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

    // 对角移动归一化
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    // 检测附近建筑
    this.checkBuildingProximity();
  }

  private checkBuildingProximity(): void {
    const tileX = Math.floor(this.x / GAME_CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / GAME_CONFIG.TILE_SIZE);

    this.nearZone = null;

    for (const zone of BUILDING_ZONES) {
      // 检测玩家是否在建筑门的附近 (建筑下方一格)
      const doorX = zone.x + Math.floor(zone.width / 2);
      const doorY = zone.y + zone.height;

      const dist = Math.abs(tileX - doorX) + Math.abs(tileY - doorY);
      if (dist <= 1) {
        this.nearZone = zone.type;
        this.promptText.setText(`按 E 进入${zone.name}`);
        this.promptText.setPosition(this.x, this.y - 30);
        this.promptText.setVisible(true);
        return;
      }
    }

    this.promptText.setVisible(false);
  }

  // 检查目标 tile 是否可通行
  static isWalkable(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= CITY_MAP.length) return false;
    if (tileX < 0 || tileX >= CITY_MAP[0].length) return false;
    return WALKABLE_TILES.includes(CITY_MAP[tileY][tileX]);
  }
}
