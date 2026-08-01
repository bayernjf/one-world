import Phaser from 'phaser';
import { WORK_TASKS, TaskDef } from '../data/tasks';
import { EconomySystem } from './EconomySystem';

export interface ActiveTask {
  task: TaskDef;
  startTime: number;
  progress: number; // 0-1
  completed: boolean;
}

class TaskSystemClass {
  private availableTasks: TaskDef[] = [];
  private activeTask: ActiveTask | null = null;
  private completedToday: number = 0;
  private events: Phaser.Events.EventEmitter;
  private maxTasksPerDay = 10;

  constructor() {
    this.events = new Phaser.Events.EventEmitter();
    this.refreshTasks();
  }

  // 刷新可用任务（随机抽取3个）
  refreshTasks(): void {
    const shuffled = [...WORK_TASKS].sort(() => Math.random() - 0.5);
    this.availableTasks = shuffled.slice(0, 3);
    this.events.emit('tasks-refreshed', this.availableTasks);
  }

  getAvailableTasks(): TaskDef[] {
    return [...this.availableTasks];
  }

  getActiveTask(): ActiveTask | null {
    return this.activeTask;
  }

  getCompletedToday(): number {
    return this.completedToday;
  }

  // 接受任务
  acceptTask(taskId: string): boolean {
    if (this.activeTask && !this.activeTask.completed) return false;
    if (this.completedToday >= this.maxTasksPerDay) return false;

    const task = this.availableTasks.find(t => t.id === taskId);
    if (!task) return false;

    this.activeTask = {
      task,
      startTime: Date.now(),
      progress: 0,
      completed: false,
    };

    this.events.emit('task-accepted', this.activeTask);
    return true;
  }

  // 更新任务进度
  updateProgress(): void {
    if (!this.activeTask || this.activeTask.completed) return;

    const elapsed = (Date.now() - this.activeTask.startTime) / 1000;
    const efficiency = EconomySystem.getStats().efficiency;
    this.activeTask.progress = Math.min(1, (elapsed * efficiency) / this.activeTask.task.duration);

    if (this.activeTask.progress >= 1) {
      this.completeTask();
    }

    this.events.emit('task-progress', this.activeTask.progress);
  }

  // 完成任务
  private completeTask(): void {
    if (!this.activeTask) return;

    this.activeTask.completed = true;
    this.completedToday++;

    const { reward, exp } = this.activeTask.task;
    const luck = EconomySystem.getStats().luck;
    const bonusCoins = Math.floor(reward * (luck - 1) * Math.random());

    EconomySystem.addCoins(reward + bonusCoins);
    EconomySystem.addExp(exp);

    this.events.emit('task-completed', {
      task: this.activeTask.task,
      coins: reward + bonusCoins,
      exp,
    });

    // 从可用列表移除，补充新任务
    this.availableTasks = this.availableTasks.filter(t => t.id !== this.activeTask!.task.id);
    const remaining = WORK_TASKS.filter(t => !this.availableTasks.find(a => a.id === t.id));
    if (remaining.length > 0) {
      const newTask = remaining[Math.floor(Math.random() * remaining.length)];
      this.availableTasks.push(newTask);
    }

    this.activeTask = null;
    this.events.emit('tasks-refreshed', this.availableTasks);
  }

  on(event: string, fn: Function, context?: any): void {
    this.events.on(event, fn, context);
  }

  off(event: string, fn: Function, context?: any): void {
    this.events.off(event, fn, context);
  }
}

export const TaskSystem = new TaskSystemClass();
