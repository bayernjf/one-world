# 技术栈 — one-world

更新时间：2026-09-09

## 概览
2D 俯视角生活游戏化引擎（top-down life gamification engine）：城市地图 + 任务 + 经济 + 商店，
把现实生活行为映射进游戏循环。

## 技术选型
| 层 | 选型 |
|---|---|
| 引擎 | Phaser 3.90 |
| 语言 / 构建 | TypeScript 7 + Vite 8 |
| 渲染 | Phaser 内置（Canvas / WebGL），800×600，tile 32px |
| 样式 | 无 UI 框架，游戏内 UI 由 Phaser 场景绘制 |

## 常用命令
```bash
npm install     # 安装依赖
npm run dev     # 开发服务器
npm run build   # tsc + vite build
npm run preview # 预览构建产物
```

## 目录结构
```
src/
  main.ts        # Phaser 游戏实例与场景注册
  config.ts      # 全局常量：分辨率、tile 尺寸、移动速度、颜色、建筑类型
  scenes/
    BootScene.ts # 资源加载
    CityScene.ts # 主城地图场景
    UIScene.ts   # HUD / 界面层
  systems/
    EconomySystem.ts  # 经济系统
    ShopSystem.ts     # 商店系统
    TaskSystem.ts     # 任务系统
  entities/      # 游戏实体
  data/
    map.ts       # 地图数据
    shops.ts     # 店铺数据
    tasks.ts     # 任务数据
  ui/  utils/
```

## 注意点
- 数值与素材集中在 `src/config.ts` 与 `src/data/`，调平衡优先改这里，不要在场景里散落硬编码。
- 新增系统时按 `systems/` 现有风格挂到场景生命周期上，保持与 `EconomySystem` / `TaskSystem` 一致。
- 仓库尚无 README / AGENTS.md，项目约定见根目录 `handoff.md`。
