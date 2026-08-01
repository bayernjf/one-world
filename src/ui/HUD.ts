import { EconomySystem } from '../systems/EconomySystem';

// HUD 顶部状态栏
export class HUD {
  private container: HTMLDivElement;
  private coinsEl: HTMLSpanElement;
  private levelEl: HTMLSpanElement;
  private expFillEl: HTMLDivElement;
  private statsEl: HTMLSpanElement;

  constructor(parentEl: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'game-hud';
    this.container.innerHTML = `
      <div class="hud-left">
        <span class="hud-coins">💰 <span id="hud-coins">0</span></span>
        &nbsp;|&nbsp;
        <span class="hud-level">Lv.<span id="hud-level">1</span></span>
        <div class="hud-exp-bar"><div class="hud-exp-fill" id="hud-exp-fill"></div></div>
      </div>
      <div class="hud-right">
        <span id="hud-stats">效率:1.0 运气:1.0</span>
      </div>
    `;
    parentEl.appendChild(this.container);

    this.coinsEl = this.container.querySelector('#hud-coins') as HTMLSpanElement;
    this.levelEl = this.container.querySelector('#hud-level') as HTMLSpanElement;
    this.expFillEl = this.container.querySelector('#hud-exp-fill') as HTMLDivElement;
    this.statsEl = this.container.querySelector('#hud-stats') as HTMLSpanElement;

    this.bindEvents();
    this.refresh();
  }

  private bindEvents(): void {
    EconomySystem.on('coins-changed', this.refresh, this);
    EconomySystem.on('exp-changed', this.refresh, this);
    EconomySystem.on('level-up', this.onLevelUp, this);
    EconomySystem.on('stats-changed', this.refresh, this);
  }

  private refresh(): void {
    const stats = EconomySystem.getStats();
    this.coinsEl.textContent = String(stats.coins);
    this.levelEl.textContent = String(stats.level);
    this.expFillEl.style.width = `${EconomySystem.getExpProgress() * 100}%`;
    this.statsEl.textContent = `效率:${stats.efficiency.toFixed(1)} 运气:${stats.luck.toFixed(1)}`;
  }

  private onLevelUp(level: number): void {
    this.refresh();
    showToast(`🎉 升级！当前等级 Lv.${level}`);
  }

  destroy(): void {
    this.container.remove();
  }
}

// 全局 toast 提示
export function showToast(message: string, duration = 2000): void {
  let toast = document.querySelector('.toast-message') as HTMLDivElement;
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-message';
    document.getElementById('game-container')?.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
