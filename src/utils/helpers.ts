// 工具函数

// 随机整数 [min, max]
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 随机选取数组元素
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 限制数值范围
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// 格式化数字（千分位）
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// 简单音效生成器 (8-bit 风格)
export function playSound(type: 'click' | 'success' | 'error' | 'coin'): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.value = 0.1;

    switch (type) {
      case 'click':
        osc.frequency.value = 440;
        osc.type = 'square';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        break;
      case 'success':
        osc.frequency.value = 523;
        osc.type = 'square';
        osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'error':
        osc.frequency.value = 200;
        osc.type = 'sawtooth';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'coin':
        osc.frequency.value = 880;
        osc.type = 'square';
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        break;
    }
  } catch {
    // 音频不可用时静默失败
  }
}
