import { TaskSystem } from '../systems/TaskSystem';
import { TaskDef } from '../data/tasks';
import { showToast } from './HUD';

// 任务面板 - 办公楼交互
export class TaskPanel {
  private container: HTMLDivElement;
  private listEl: HTMLUListElement;
  private progressSection: HTMLDivElement;
  private progressFill: HTMLDivElement;
  private progressText: HTMLDivElement;
  private onClose: () => void;
  private progressTimer: number | null = null;

  constructor(parentEl: HTMLElement, onClose: () => void) {
    this.onClose = onClose;

    this.container = document.createElement('div');
    this.container.className = 'game-panel';
    this.container.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">📋 科技办公楼 - 工作任务</span>
        <button class="panel-close">✕</button>
      </div>
      <div class="task-progress" style="display:none">
        <div id="task-progress-name" style="color:#8f8;margin-bottom:6px;"></div>
        <div class="progress-bar"><div class="progress-fill" id="task-progress-fill"></div></div>
        <div id="task-progress-text" style="text-align:center;font-size:11px;color:#aaa;"></div>
      </div>
      <ul class="task-list" id="task-list"></ul>
      <div style="margin-top:10px;font-size:11px;color:#888;">
        今日已完成: <span id="task-completed-count">0</span> / 10
      </div>
    `;
    parentEl.appendChild(this.container);

    this.listEl = this.container.querySelector('#task-list') as HTMLUListElement;
    this.progressSection = this.container.querySelector('.task-progress') as HTMLDivElement;
    this.progressFill = this.container.querySelector('#task-progress-fill') as HTMLDivElement;
    this.progressText = this.container.querySelector('#task-progress-text') as HTMLDivElement;

    // 关闭按钮
    this.container.querySelector('.panel-close')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    // 监听任务事件
    TaskSystem.on('tasks-refreshed', this.renderTasks, this);
    TaskSystem.on('task-completed', this.onTaskCompleted, this);
  }

  show(): void {
    this.container.classList.add('active');
    this.renderTasks();
    this.updateProgress();
  }

  hide(): void {
    this.container.classList.remove('active');
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private renderTasks(): void {
    const tasks = TaskSystem.getAvailableTasks();
    const activeTask = TaskSystem.getActiveTask();

    this.listEl.innerHTML = '';
    for (const task of tasks) {
      const li = document.createElement('li');
      li.className = 'task-item';
      const diffClass = `diff-${task.difficulty}`;
      const diffLabel = task.difficulty === 'easy' ? '简单' : task.difficulty === 'medium' ? '中等' : '困难';
      const disabled = activeTask && !activeTask.completed ? 'disabled' : '';

      li.innerHTML = `
        <div class="task-name">${task.name}
          <span class="task-difficulty ${diffClass}">${diffLabel}</span>
        </div>
        <div class="task-desc">${task.description}</div>
        <div class="task-reward">💰 +${task.reward} | ✨ +${task.exp} EXP | ⏱️ ${task.duration}s</div>
        <button class="task-btn" data-task-id="${task.id}" ${disabled}>接受任务</button>
      `;
      this.listEl.appendChild(li);
    }

    // 绑定按钮
    this.listEl.querySelectorAll('.task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = (e.target as HTMLElement).dataset.taskId;
        if (taskId) {
          TaskSystem.acceptTask(taskId);
          this.startProgress();
        }
      });
    });

    // 更新完成计数
    const countEl = this.container.querySelector('#task-completed-count');
    if (countEl) countEl.textContent = String(TaskSystem.getCompletedToday());
  }

  private startProgress(): void {
    this.progressSection.style.display = 'block';
    const active = TaskSystem.getActiveTask();
    if (active) {
      const nameEl = this.container.querySelector('#task-progress-name');
      if (nameEl) nameEl.textContent = `正在完成: ${active.task.name}`;
    }

    if (this.progressTimer) clearInterval(this.progressTimer);
    this.progressTimer = window.setInterval(() => {
      TaskSystem.updateProgress();
      this.updateProgress();
    }, 100);
  }

  private updateProgress(): void {
    const active = TaskSystem.getActiveTask();
    if (active && !active.completed) {
      this.progressSection.style.display = 'block';
      this.progressFill.style.width = `${active.progress * 100}%`;
      this.progressText.textContent = `${Math.floor(active.progress * 100)}%`;
    } else {
      this.progressSection.style.display = 'none';
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    }
  }

  private onTaskCompleted(data: { task: TaskDef; coins: number; exp: number }): void {
    showToast(`✅ 完成「${data.task.name}」获得 💰${data.coins} ✨${data.exp}EXP`);
    this.renderTasks();
    this.updateProgress();
  }

  destroy(): void {
    if (this.progressTimer) clearInterval(this.progressTimer);
    this.container.remove();
  }
}
