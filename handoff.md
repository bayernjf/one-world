# One World - 项目交接文档

## 项目概述

One World 是一个 2D 上帝视角（俯视角）网页游戏，将现实生活任务（上班、网购、经商）游戏化。玩家控制角色在虚拟城市中移动，进入不同建筑触发对应玩法。

## 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| Phaser | ^3.90.0 | 2D 游戏引擎（渲染、物理、场景管理） |
| Vite | ^8.2.0 | 构建工具 / 开发服务器 |
| TypeScript | ^7.0.2 | 类型安全 |
| DOM Overlay | - | UI 面板（HTML/CSS 覆盖在 Canvas 上） |

## 快速启动

```bash
npm install
npm run dev        # 开发服务器 http://localhost:3000
npm run build      # 生产构建 -> dist/
npm run preview    # 预览构建产物
```

## 项目结构

```
one-world/
├── index.html                  # 入口 HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
├── styles/
│   └── ui.css                  # 所有 UI 面板样式（像素风）
├── src/
│   ├── main.ts                 # Phaser Game 初始化入口
│   ├── config.ts               # 全局常量（画布尺寸、颜色、建筑区域定义）
│   ├── scenes/
│   │   ├── BootScene.ts        # 程序化生成所有纹理（Tile、角色）
│   │   ├── CityScene.ts        # 主场景：地图渲染、碰撞、玩家、建筑标签
│   │   └── UIScene.ts          # UI 场景：管理 DOM 面板的显示/隐藏
│   ├── entities/
│   │   └── Player.ts           # 玩家角色：WASD移动、建筑交互检测
│   ├── systems/
│   │   ├── EconomySystem.ts    # 金币/经验/等级/属性（单例+事件）
│   │   ├── TaskSystem.ts       # 工作任务：接受→进度→完成→奖励
│   │   └── ShopSystem.ts       # 商店：购买道具、背包管理
│   ├── ui/
│   │   ├── HUD.ts              # 顶部状态栏 + showToast 全局提示
│   │   ├── TaskPanel.ts        # 办公楼任务面板
│   │   └── ShopPanel.ts        # 商场购物面板
│   ├── data/
│   │   ├── map.ts              # 25x19 Tile 地图数据（二维数组）
│   │   ├── tasks.ts            # 8 种工作任务定义
│   │   └── shops.ts            # 8 种商品定义
│   └── utils/
│       └── helpers.ts          # 工具函数 + 8-bit 音效生成器
```

## 架构设计

### 场景流转
```
BootScene (生成纹理) → CityScene (主游戏) + UIScene (DOM面板)
```

### 系统通信
- 各 System 为单例，内部使用 `Phaser.Events.EventEmitter` 发布事件
- UI 组件订阅 System 事件进行刷新
- 建筑交互通过 `game.events.emit('open-panel', type)` 跨场景通信

### 数据持久化
- `localStorage` 键：`oneworld_stats`（金币/等级/属性）、`oneworld_inventory`（背包）、`oneworld_tutorial_seen`

## 核心玩法循环

```
玩家在城市中移动 (WASD/方向键)
  ├── 靠近建筑按 E 交互
  ├── 进入办公楼 → 接受工作任务 → 等待进度条 → 获得金币+经验
  ├── 进入商场 → 浏览商品 → 花金币购买 → 获得效率/运气加成
  └── 进入我的店铺 → 查看经营收益（占位，待实装）
```

## 当前完成状态

### 已完成
- [x] 项目脚手架（Vite + TS + Phaser 3）
- [x] 程序化像素风地图渲染（草地/道路/建筑/水/树）
- [x] 角色 8 方向移动 + 碰撞检测
- [x] 建筑交互系统（靠近提示 + E 键触发）
- [x] 工作任务系统（随机任务、难度分级、进度条、奖励）
- [x] 商店系统（8种商品、属性加成、背包记录）
- [x] 经济系统（金币、经验、等级、效率/运气属性）
- [x] DOM UI 面板（HUD、任务面板、商店面板）
- [x] 新手引导提示
- [x] localStorage 存档

### 待推进
- [ ] **音效接入**：`playSound()` 已实现但未绑定到交互事件
- [ ] **经商系统实装**：我的店铺目前是静态占位，需要进货/定价/收益计算逻辑
- [ ] **背包 UI**：ShopSystem 有 inventory 数据但无可视化界面
- [ ] **视觉反馈**：金币飘字动画、完成任务粒子特效、角色行走动画
- [ ] **时间系统**："今日已完成"计数缺少真实日期重置机制
- [ ] **响应式适配**：固定 800x600，无移动端触屏支持
- [ ] **成就系统**：缺少长期目标/里程碑驱动
- [ ] **NPC/随机事件**：地图上无其他角色或突发事件

## 关键设计决策

1. **零外部资源**：所有图形用 Phaser Graphics API 程序化绘制色块，无需美术资源即可运行
2. **DOM UI 而非 Phaser UI**：面板/按钮用 HTML/CSS 实现，开发效率高、样式灵活
3. **数据驱动**：任务、商品、地图均为纯数据配置文件，扩展只需加数据
4. **单例 System + EventEmitter**：轻量状态管理，无需引入额外状态库

## 注意事项

- Phaser 版本为 3.x，`this.make.graphics({ add: false })` 在 TS 严格模式下有类型问题，已改用 `this.add.graphics()` + `destroy()`
- 所有 innerHTML 仅使用静态游戏数据，无用户输入注入风险
- 音效使用 Web Audio API 实时合成，无需音频文件
