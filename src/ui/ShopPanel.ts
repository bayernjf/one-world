import { ShopSystem } from '../systems/ShopSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { showToast } from './HUD';

// 商店面板 - 商场交互
export class ShopPanel {
  private container: HTMLDivElement;
  private gridEl: HTMLDivElement;
  private onClose: () => void;

  constructor(parentEl: HTMLElement, onClose: () => void) {
    this.onClose = onClose;

    this.container = document.createElement('div');
    this.container.className = 'game-panel';
    this.container.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🛒 万象商场</span>
        <button class="panel-close">✕</button>
      </div>
      <div class="shop-grid" id="shop-grid"></div>
      <div class="shop-stats">
        <p>当前金币: <span id="shop-coins">0</span></p>
        <p>效率加成: <span id="shop-efficiency">1.0</span> | 运气加成: <span id="shop-luck">1.0</span></p>
      </div>
    `;
    parentEl.appendChild(this.container);

    this.gridEl = this.container.querySelector('#shop-grid') as HTMLDivElement;

    this.container.querySelector('.panel-close')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    ShopSystem.on('item-purchased', this.onPurchase, this);
  }

  show(): void {
    this.container.classList.add('active');
    this.renderItems();
    this.updateStats();
  }

  hide(): void {
    this.container.classList.remove('active');
  }

  private renderItems(): void {
    const items = ShopSystem.getShopItems();
    const coins = EconomySystem.getCoins();

    this.gridEl.innerHTML = '';
    for (const item of items) {
      const div = document.createElement('div');
      div.className = 'shop-item';
      const canAfford = coins >= item.price;

      div.innerHTML = `
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.description}</div>
        <div class="shop-item-price">💰 ${item.price}</div>
        <button class="buy-btn" data-item-id="${item.id}" ${canAfford ? '' : 'disabled'}>
          ${canAfford ? '购买' : '金币不足'}
        </button>
      `;
      this.gridEl.appendChild(div);
    }

    // 绑定购买按钮
    this.gridEl.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = (e.target as HTMLElement).dataset.itemId;
        if (itemId) {
          const result = ShopSystem.buyItem(itemId);
          if (result.success) {
            showToast(result.message);
          } else {
            showToast(`❌ ${result.message}`);
          }
          this.renderItems();
          this.updateStats();
        }
      });
    });
  }

  private updateStats(): void {
    const stats = EconomySystem.getStats();
    const coinsEl = this.container.querySelector('#shop-coins');
    const effEl = this.container.querySelector('#shop-efficiency');
    const luckEl = this.container.querySelector('#shop-luck');
    if (coinsEl) coinsEl.textContent = String(stats.coins);
    if (effEl) effEl.textContent = stats.efficiency.toFixed(1);
    if (luckEl) luckEl.textContent = stats.luck.toFixed(1);
  }

  private onPurchase(): void {
    this.renderItems();
    this.updateStats();
  }

  destroy(): void {
    this.container.remove();
  }
}
