// P2-6 回归：每日任务计数持久化 + 跨日重置。
import { describe, expect, it, vi } from 'vitest';

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

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seedStorage(daily: string | null): void {
  const store: Record<string, string> = {};
  if (daily !== null) store['oneworld_task_daily'] = daily;
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
  return await import('./TaskSystem');
}

describe('TaskSystem 每日计数（P2-6）', () => {
  it('存档为昨天 → 计数重置为 0', async () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    seedStorage(JSON.stringify({ date: localDateKey(yesterday), count: 7 }));
    const { TaskSystem } = await importSystem();
    expect(TaskSystem.getCompletedToday()).toBe(0);
  });

  it('存档为今天 → 计数保留', async () => {
    seedStorage(JSON.stringify({ date: localDateKey(new Date()), count: 3 }));
    const { TaskSystem } = await importSystem();
    expect(TaskSystem.getCompletedToday()).toBe(3);
  });

  it('存档损坏 → 回退 0，不崩溃', async () => {
    seedStorage('###not json###');
    const { TaskSystem } = await importSystem();
    expect(TaskSystem.getCompletedToday()).toBe(0);
  });

  it('无存档 → 从 0 开始', async () => {
    seedStorage(null);
    const { TaskSystem } = await importSystem();
    expect(TaskSystem.getCompletedToday()).toBe(0);
  });
});
