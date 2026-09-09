# AGENTS.md — one-world

供 AI coding agents（Claude Code / Codex / Cursor / Copilot 等）在本仓库工作时自动读取。

## 项目概览
One World：2D 俯视角生活游戏化引擎（top-down life gamification engine）。
把现实中的习惯、任务与目标映射成游戏里的技能、任务与成就，浏览器即开即玩。
落地页仓库是 `one-world-landing`。

## 技术栈
| 层 | 方案 |
|---|---|
| 引擎 | Phaser 3.90 |
| 语言 / 构建 | TypeScript 7 + Vite 8 |
| 渲染 | Phaser 内置（Canvas / WebGL），800×600，tile 32px |

## 常用命令
```bash
npm install
npm run dev
npm run build     # tsc && vite build
npm run preview
```

## 目录结构
```
src/
  main.ts        # Phaser 游戏实例与场景注册
  config.ts      # 全局常量：分辨率、tile 尺寸、移动速度、颜色、建筑类型
  scenes/        # BootScene（资源加载）、CityScene（主城）、UIScene（HUD）
  systems/       # EconomySystem、ShopSystem、TaskSystem
  entities/      # 游戏实体
  data/          # map.ts、shops.ts、tasks.ts
  ui/  utils/
```

## 约定
- 数值与素材集中在 `src/config.ts` 与 `src/data/`；调平衡优先改这里，不要在场景里散落硬编码。
- 新增系统按 `systems/` 现有风格挂到场景生命周期上，保持与 `EconomySystem` / `TaskSystem` 一致。
- 技术栈细节见 `docs/TECH_STACK.md`。

## 不要做的事
- 不要在场景代码里硬编码平衡数值。
- 不要引入与 Phaser 无关的前端框架（游戏 UI 由 Phaser 场景绘制）。
- 不要提交构建产物与 `.env`。
- 不要跳过 `git pull --rebase` 直接 push。
