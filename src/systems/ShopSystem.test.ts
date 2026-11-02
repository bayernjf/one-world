// P1-2 回归：损坏背包存档不崩溃，回退空背包；坏条目逐条跳过。
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

function seedStorage(inventory: string | null): void {
  const store: Record<string, string> = {};
  if (inventory !== null) store['oneworld_inventory'] = inventory;
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
  return await import('./ShopSystem');
}

describe('ShopSystem 背包存档容错（P1-2）', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('损坏 JSON → 不崩溃，回退空背包', async () => {
    seedStorage('###not json###');
    const { ShopSystem } = await importSystem();
    expect(ShopSystem.getInventory()).toEqual([]);
  });

  it('非数组结构 → 回退空背包', async () => {
    seedStorage('{"item":"x"}');
    const { ShopSystem } = await importSystem();
    expect(ShopSystem.getInventory()).toEqual([]);
  });

  it('坏条目跳过、好条目保留', async () => {
    seedStorage(JSON.stringify([
      { item: { id: 'good', name: '好', price: 1, effect: { type: 'coins', value: 1 } }, count: 2 },
      { item: null, count: 1 },
      { count: 3 },
      'garbage',
    ]));
    const { ShopSystem } = await importSystem();
    const inventory = ShopSystem.getInventory();
    expect(inventory).toHaveLength(1);
    expect(inventory[0]?.item.id).toBe('good');
    expect(inventory[0]?.count).toBe(2);
  });
});
