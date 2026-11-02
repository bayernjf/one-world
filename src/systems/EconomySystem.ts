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

  private static readonly DEFAULT_STATS: PlayerStats = {
    coins: 100,
    exp: 0,
    level: 1,
    efficiency: 1.0,
    luck: 1.0,
  };

  private loadStats(): PlayerStats {
    const saved = localStorage.getItem('oneworld_stats');
    if (!saved) {
      return { ...EconomySystemClass.DEFAULT_STATS };
    }
    // P1-2 修复：损坏 JSON / 结构不符 / 数值越界的存档一律回退默认，
    // 模块求值期绝不抛异常（否则整个 bundle 启动即白屏且无法自愈）。
    try {
      const parsed: unknown = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object') {
        return { ...EconomySystemClass.DEFAULT_STATS };
      }
      const p = parsed as Partial<PlayerStats>;
      const d = EconomySystemClass.DEFAULT_STATS;
      return {
        coins: typeof p.coins === 'number' && Number.isFinite(p.coins) && p.coins >= 0 ? p.coins : d.coins,
        exp: typeof p.exp === 'number' && Number.isFinite(p.exp) && p.exp >= 0 ? p.exp : d.exp,
        level: typeof p.level === 'number' && Number.isInteger(p.level) && p.level >= 1 ? p.level : d.level,
        efficiency: typeof p.efficiency === 'number' && Number.isFinite(p.efficiency) && p.efficiency > 0 ? p.efficiency : d.efficiency,
        luck: typeof p.luck === 'number' && Number.isFinite(p.luck) && p.luck > 0 ? p.luck : d.luck,
      };
    } catch {
      return { ...EconomySystemClass.DEFAULT_STATS };
    }
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
