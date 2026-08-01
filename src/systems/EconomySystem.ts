import Phaser from 'phaser';

// 经济系统 - 管理金币、经验、等级
export interface PlayerStats {
  coins: number;
  exp: number;
  level: number;
  efficiency: number; // 效率加成
  luck: number; // 运气加成
}

const EXP_PER_LEVEL = 100;

class EconomySystemClass {
  private stats: PlayerStats;
  private events: Phaser.Events.EventEmitter;

  constructor() {
    this.events = new Phaser.Events.EventEmitter();
    this.stats = this.loadStats();
  }

  private loadStats(): PlayerStats {
    const saved = localStorage.getItem('oneworld_stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      coins: 100,
      exp: 0,
      level: 1,
      efficiency: 1.0,
      luck: 1.0,
    };
  }

  save(): void {
    localStorage.setItem('oneworld_stats', JSON.stringify(this.stats));
  }

  getStats(): PlayerStats {
    return { ...this.stats };
  }

  getCoins(): number {
    return this.stats.coins;
  }

  getLevel(): number {
    return this.stats.level;
  }

  getExp(): number {
    return this.stats.exp;
  }

  getExpProgress(): number {
    return this.stats.exp / EXP_PER_LEVEL;
  }

  addCoins(amount: number): void {
    this.stats.coins += amount;
    this.events.emit('coins-changed', this.stats.coins);
    this.save();
  }

  spendCoins(amount: number): boolean {
    if (this.stats.coins >= amount) {
      this.stats.coins -= amount;
      this.events.emit('coins-changed', this.stats.coins);
      this.save();
      return true;
    }
    return false;
  }

  addExp(amount: number): void {
    this.stats.exp += amount;
    // 升级检测
    while (this.stats.exp >= EXP_PER_LEVEL) {
      this.stats.exp -= EXP_PER_LEVEL;
      this.stats.level++;
      this.events.emit('level-up', this.stats.level);
    }
    this.events.emit('exp-changed', this.stats.exp, this.stats.level);
    this.save();
  }

  addEfficiency(amount: number): void {
    this.stats.efficiency += amount;
    this.events.emit('stats-changed', this.stats);
    this.save();
  }

  addLuck(amount: number): void {
    this.stats.luck += amount;
    this.events.emit('stats-changed', this.stats);
    this.save();
  }

  on(event: string, fn: Function, context?: any): void {
    this.events.on(event, fn, context);
  }

  off(event: string, fn: Function, context?: any): void {
    this.events.off(event, fn, context);
  }
}

// 单例
export const EconomySystem = new EconomySystemClass();
