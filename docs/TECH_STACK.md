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

## 地图与区块约定

### 门格：建筑底边中点外一格

门（建筑的可交互入口）的位置统一由 `buildingDoorTile(zone)` 计算（`src/config.ts:50-52`）：

```ts
{ x: zone.x + Math.floor(zone.width / 2), y: zone.y + zone.height }
```

即建筑 tile 区域底边中点正下方、建筑外第一格。该规则对办公楼、商场、玩家店铺三类建筑一视同仁——它们都在 `BUILDING_ZONES` 里（`src/config.ts:36-40`），不按 `BuildingType` 分支。

同一个函数被两处消费：

- **地图贴门**：`src/data/map.ts:73-76` 遍历 `BUILDING_ZONES`，把该格写成 `TileType.DOOR`，画面据此绘制门贴图；
- **交互判定**：`src/entities/Player.ts:72-78` 用同一门格做曼哈顿距离 ≤ 1 的临近判定。

**为什么必须共用这一个函数**：贴图坐标与判定坐标一旦各算一套就会漂移，出现「看得到门却进不去」或「能进但门画在墙里」。玩家店铺曾把门画在建筑内部顶边，由 `23c9368` 修复；`src/data/map.test.ts` 用同一公式做回归守卫（`67f6c66`）。新增建筑或调整建筑尺寸时只改 `BUILDING_ZONES`，不要在场景绘制或交互判定里手算门坐标。

## 注意点
- 数值与素材集中在 `src/config.ts` 与 `src/data/`，调平衡优先改这里，不要在场景里散落硬编码。
- 新增系统时按 `systems/` 现有风格挂到场景生命周期上，保持与 `EconomySystem` / `TaskSystem` 一致。
- 仓库尚无 README / AGENTS.md，项目约定见根目录 `handoff.md`。
