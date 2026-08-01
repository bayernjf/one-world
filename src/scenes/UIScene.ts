import Phaser from 'phaser';
import { BuildingType } from '../config';
import { HUD, showToast } from '../ui/HUD';
import { TaskPanel } from '../ui/TaskPanel';
import { ShopPanel } from '../ui/ShopPanel';

// UI 场景 - 管理所有 DOM 面板
export class UIScene extends Phaser.Scene {
  private hud!: HUD;
  private taskPanel!: TaskPanel;
  private shopPanel!: ShopPanel;
  private playerShopPanel!: HTMLDivElement;
  private activePanel: string | null = null;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    const parent = document.getElementById('game-container')!;

    // 创建 HUD
    this.hud = new HUD(parent);

    // 创建任务面板
    this.taskPanel = new TaskPanel(parent, () => {
      this.activePanel = null;
    });

    // 创建商店面板
    this.shopPanel = new ShopPanel(parent, () => {
      this.activePanel = null;
    });

    // 创建玩家店铺面板
    this.createPlayerShopPanel(parent);

    // 监听打开面板事件
    this.game.events.on('open-panel', (type: BuildingType) => {
      this.openPanel(type);
    });

    // ESC 关闭面板
    this.input.keyboard!.on('keydown-ESC', () => {
      this.closeAllPanels();
    });

    // 新手引导
    this.showTutorial();
  }

  private createPlayerShopPanel(parent: HTMLElement): void {
    this.playerShopPanel = document.createElement('div');
    this.playerShopPanel.className = 'game-panel';
    this.playerShopPanel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🏪 我的店铺</span>
        <button class="panel-close">✕</button>
      </div>
      <div style="text-align:center;padding:20px 0;">
        <div style="font-size:36px;margin-bottom:12px;">🏪</div>
        <p style="color:#b080e0;font-weight:bold;margin-bottom:8px;">小店经营中...</p>
        <p style="color:#aaa;font-size:11px;margin-bottom:12px;">
          你的店铺正在自动营业，每小时产生收益。<br/>
          升级店铺可获得更多收益！（后续版本开放）
        </p>
        <div style="background:rgba(40,40,70,0.8);border-radius:6px;padding:12px;margin-top:10px;">
          <p style="color:#ffd700;font-size:13px;">📊 今日收益: <span id="shop-income">+5</span> 金币</p>
          <p style="color:#888;font-size:11px;margin-top:6px;">店铺等级: Lv.1 | 下一级需要 200 金币</p>
        </div>
      </div>
    `;
    parent.appendChild(this.playerShopPanel);

    this.playerShopPanel.querySelector('.panel-close')?.addEventListener('click', () => {
      this.closeAllPanels();
    });
  }

  private openPanel(type: BuildingType): void {
    this.closeAllPanels();

    switch (type) {
      case BuildingType.OFFICE:
        this.taskPanel.show();
        this.activePanel = 'office';
        break;
      case BuildingType.SHOP:
        this.shopPanel.show();
        this.activePanel = 'shop';
        break;
      case BuildingType.PLAYER_SHOP:
        this.playerShopPanel.classList.add('active');
        this.activePanel = 'player_shop';
        break;
    }
  }

  private closeAllPanels(): void {
    this.taskPanel.hide();
    this.shopPanel.hide();
    this.playerShopPanel.classList.remove('active');
    this.activePanel = null;
  }

  private showTutorial(): void {
    const seen = localStorage.getItem('oneworld_tutorial_seen');
    if (!seen) {
      setTimeout(() => {
        showToast('🎮 欢迎！用 WASD/方向键 移动，靠近建筑按 E 交互', 4000);
      }, 500);
      setTimeout(() => {
        showToast('💡 去办公楼完成任务赚金币，去商场购买道具提升属性！', 4000);
      }, 5000);
      localStorage.setItem('oneworld_tutorial_seen', 'true');
    }
  }
}
