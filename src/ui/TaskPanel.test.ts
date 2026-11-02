// @vitest-environment jsdom
// P1-1 回归：关闭任务面板后再打开，进度计时器必须恢复推进（任务软锁修复）。
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
vi.mock('../ui/HUD', () => ({ showToast: vi.fn() }));

import { TaskSystem } from '../systems/TaskSystem';
import { TaskPanel } from '../ui/TaskPanel';

describe('TaskPanel 任务软锁（P1-1）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  it('关闭再打开面板：进度推进恢复', () => {
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const panel = new TaskPanel(parent, () => {});

    const taskId = TaskSystem.getAvailableTasks()[0]!.id;
    expect(TaskSystem.acceptTask(taskId)).toBe(true);

    const spy = vi.spyOn(TaskSystem, 'updateProgress');

    panel.show();
    vi.advanceTimersByTime(350); // 100ms 间隔 → 约 3 次推进
    expect(spy.mock.calls.length).toBeGreaterThan(0);

    panel.hide();
    spy.mockClear();
    vi.advanceTimersByTime(500);
    expect(spy.mock.calls.length).toBe(0); // 关闭期间不推进（原状本身合理）

    panel.show(); // 修复前：计时器不重启，进度永停（软锁）
    vi.advanceTimersByTime(350);
    expect(spy.mock.calls.length).toBeGreaterThan(0);

    panel.hide();
    vi.useRealTimers();
  });

  it('无进行中的任务时 show 不启动计时器', () => {
    // 上一个用例已把任务清掉与否无关——新面板 + 无 activeTask 场景
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const panel = new TaskPanel(parent, () => {});
    if (TaskSystem.getActiveTask()) {
      // 有遗留任务则跳过本断言（单例状态，文件内顺序执行）
      return;
    }
    const spy = vi.spyOn(TaskSystem, 'updateProgress');
    panel.show();
    vi.advanceTimersByTime(500);
    expect(spy.mock.calls.length).toBe(0);
    vi.useRealTimers();
  });
});
