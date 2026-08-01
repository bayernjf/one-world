import Phaser from 'phaser';
import { SHOP_ITEMS, ItemDef } from '../data/shops';
import { EconomySystem } from './EconomySystem';

export interface OwnedItem {
  item: ItemDef;
  count: number;
}

class ShopSystemClass {
  private inventory: Map<string, OwnedItem> = new Map();
  private events: Phaser.Events.EventEmitter;

  constructor() {
    this.events = new Phaser.Events.EventEmitter();
    this.loadInventory();
  }

  private loadInventory(): void {
    const saved = localStorage.getItem('oneworld_inventory');
    if (saved) {
      const items: OwnedItem[] = JSON.parse(saved);
      for (const owned of items) {
        this.inventory.set(owned.item.id, owned);
      }
    }
  }

  private saveInventory(): void {
    const items = Array.from(this.inventory.values());
    localStorage.setItem('oneworld_inventory', JSON.stringify(items));
  }

  getShopItems(): ItemDef[] {
    return [...SHOP_ITEMS];
  }

  getInventory(): OwnedItem[] {
    return Array.from(this.inventory.values());
  }

  // 购买商品
  buyItem(itemId: string): { success: boolean; message: string } {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: '商品不存在' };
    }

    if (!EconomySystem.spendCoins(item.price)) {
      return { success: false, message: '金币不足！' };
    }

    // 应用效果
    switch (item.effect.type) {
      case 'efficiency':
        EconomySystem.addEfficiency(item.effect.value);
        break;
      case 'luck':
        EconomySystem.addLuck(item.effect.value);
        break;
      case 'coins':
        EconomySystem.addCoins(item.effect.value);
        break;
    }

    // 更新背包
    const existing = this.inventory.get(itemId);
    if (existing) {
      existing.count++;
    } else {
      this.inventory.set(itemId, { item, count: 1 });
    }
    this.saveInventory();

    this.events.emit('item-purchased', { item, inventory: this.getInventory() });
    return { success: true, message: `购买成功：${item.name}` };
  }

  on(event: string, fn: Function, context?: any): void {
    this.events.on(event, fn, context);
  }

  off(event: string, fn: Function, context?: any): void {
    this.events.off(event, fn, context);
  }
}

export const ShopSystem = new ShopSystemClass();
