# one-world

2D 俯视角生活游戏化引擎（top-down life gamification engine）：把现实中的习惯、任务与目标
映射成游戏里的技能、任务与成就，浏览器即开即玩。

- 落地页 / 官网：仓库 `one-world-landing`

## 技术栈

| 层 | 方案 |
|---|---|
| 引擎 | Phaser 3.90 |
| 语言 / 构建 | TypeScript 7 + Vite 8 |
| 渲染 | Phaser 内置（Canvas / WebGL），800×600，tile 32px |

## 快速开始

```bash
npm install
npm run dev       # 开发服务器
npm run build     # tsc && vite build
npm run preview   # 预览构建产物
```

## 目录结构

```
src/
├── main.ts        # Phaser 游戏实例与场景注册
├── config.ts      # 全局常量：分辨率、tile 尺寸、移动速度、颜色、建筑类型
├── scenes/
│   ├── BootScene.ts   # 资源加载
│   ├── CityScene.ts   # 主城地图
│   └── UIScene.ts     # HUD / 界面层
├── systems/
│   ├── EconomySystem.ts
│   ├── ShopSystem.ts
│   └── TaskSystem.ts
├── entities/      # 游戏实体
├── data/          # map.ts、shops.ts、tasks.ts
├── ui/
└── utils/
```

## 注意

- 数值与素材集中在 `src/config.ts` 与 `src/data/`：调平衡优先改这里，不要在场景里散落硬编码。
- 新增系统按 `systems/` 现有风格挂到场景生命周期上。
- 技术栈细节见 `docs/TECH_STACK.md`，项目约定见 `AGENTS.md` 与 `handoff.md`。
