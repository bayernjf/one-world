// P1-2 回归：损坏存档不再让模块求值期崩溃，一律回退默认存档。
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('phaser', () => ({
  default: {
    Events: {
      EventEmitter: class {
        on() {}
        off() {}
        emit() {
          return true;
        }
      },
    },
  },
}));

function seedStorage(stats: string | null): void {
  const store: Record<string, string> = {};
  if (stats !== null) store['oneworld_stats'] = stats;
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
}

async function importSystem() {
  vi.resetModules();
  return await import('./EconomySystem');
}

describe('EconomySystem 存档容错（P1-2）', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('损坏 JSON → 不崩溃，回退默认存档', async () => {
    seedStorage('{broken json!!!');
    const { EconomySystem } = await importSystem();
    expect(EconomySystem.getStats()).toEqual({ coins: 100, exp: 0, level: 1, efficiency: 1.0, luck: 1.0 });
  });

  it('结构不符（数组/标量）→ 回退默认存档', async () => {
    seedStorage('[1,2,3]');
    const { EconomySystem } = await importSystem();
    expect(EconomySystem.getStats().coins).toBe(100);
  });

  it('数值越界（负金币、level 0）→ 越界字段回退默认，合法字段保留', async () => {
    seedStorage(JSON.stringify({ coins: -50, exp: 42, level: 0, efficiency: 2, luck: 1.5 }));
    const { EconomySystem } = await importSystem();
    const stats = EconomySystem.getStats();
    expect(stats.coins).toBe(100);       // 越界回退
    expect(stats.level).toBe(1);         // 越界回退
    expect(stats.exp).toBe(42);          // 合法保留
    expect(stats.efficiency).toBe(2);    // 合法保留
    expect(stats.luck).toBe(1.5);        // 合法保留
  });

  it('完好存档 → 原样加载', async () => {
    seedStorage(JSON.stringify({ coins: 999, exp: 10, level: 3, efficiency: 1.2, luck: 1.1 }));
    const { EconomySystem } = await importSystem();
    expect(EconomySystem.getStats()).toEqual({ coins: 999, exp: 10, level: 3, efficiency: 1.2, luck: 1.1 });
  });
});
