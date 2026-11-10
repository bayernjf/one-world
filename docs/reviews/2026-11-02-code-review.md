# One World 深度代码评审报告

- 评审日期：2026-11-02
- 评审方式：只读静态评审 + 验证门实际执行（未修改任何源码、未执行 git 写入操作）
- 仓库：`/Users/jiangfeng/000mycodes/one-world`

## 1. 仓库定位与规模概览

- 定位：2D 俯视角生活游戏化引擎（Phaser 3 + DOM Overlay UI），纯前端单页小游戏，无后端、无网络请求、无数据库。
- 技术栈：Phaser ^3.90.0、TypeScript ^7.0.2、Vite ^8.2.0（package.json:28-34）。
- 规模：TypeScript 源码 16 个文件、约 1480 行；全仓（含样式/工具/文档）约 2000 行（`wc -l` 实测 2045 行含文档）。小型 MVP 项目。
- 无测试框架、无测试文件、无 `.github/` CI 目录（`ls .github` → No such file or directory）。
- 无 `.env` 类文件、无任何密钥或外部服务接入；数据只写 `localStorage`。

## 2. 结论摘要

| 级别 | 数量 |
|---|---|
| P0 | 0 |
| P1 | 2 |
| P2 | 6 |
| P3 | 8 |

最关键 3 条：

1. **任务进度计时器随面板关闭被清除且重开面板不恢复，导致进行中的任务永不完成、新任务无法接受（玩家软锁）** — src/ui/TaskPanel.ts:59-65, 53-57；src/systems/TaskSystem.ts:45。
2. **localStorage 存档损坏时 `JSON.parse` 在模块加载期抛异常，游戏直接无法启动（白屏）** — src/systems/EconomySystem.ts:23-27（模块级单例 src/systems/EconomySystem.ts:111）、src/systems/ShopSystem.ts:19-27。
3. **商店「豪华午餐」售价 10 金币、效果立返 15 金币，可无成本无限刷钱，经济系统形同虚设** — src/data/shops.ts:61-69。

## 3. 逐条发现

### P1

#### P1-1 任务软锁：关闭任务面板后进度永远停滞且无法接受新任务

- 位置：
  - `src/ui/TaskPanel.ts:115-118` — 推进 `TaskSystem.updateProgress()` 的唯一驱动是 `startProgress()` 里的 `setInterval`。
  - `src/ui/TaskPanel.ts:59-65` — `hide()` 无条件 `clearInterval(this.progressTimer)`。
  - `src/ui/TaskPanel.ts:53-57` — `show()` 只调用 `renderTasks()` 和 `updateProgress()`（纯渲染），**不会重启计时器**。
  - `src/systems/TaskSystem.ts:45` — `acceptTask` 在有未完成任务时直接 `return false`。
  - `src/systems/TaskSystem.ts:63-75` — `updateProgress()` 无人调用则进度永不推进（虽基于 `Date.now()`，但完成判定只在该函数内发生）。
- 复现路径：接受任务 → 按 ESC 或点 ✕ 关闭面板（`UIScene.closeAllPanels` → `hide()`）→ 计时器被清除 → 任务永不完成 → 再开面板无法接受新任务（`acceptTask` 返回 false 且无提示）。
- 影响：核心玩法循环（接任务→等进度→领奖励）中断，玩家只能刷新页面，且 `completedToday` 不持久化导致计数丢失。
- 修复建议：① `show()` 中若存在未完成的 activeTask 则调用 `startProgress()` 恢复计时器；② 或把进度推进移入 `CityScene.update` / 独立 ticker，使进度与面板显隐解耦；③ `acceptTask` 失败时给用户可见反馈。

#### P1-2 存档损坏导致游戏启动即崩溃

- 位置：
  - `src/systems/EconomySystem.ts:23-27` — `loadStats()` 直接 `JSON.parse(saved)`，无 try/catch、无 schema 校验。
  - `src/systems/EconomySystem.ts:111` — `export const EconomySystem = new EconomySystemClass()`，模块 import 时即执行构造，解析失败异常在模块求值期抛出，整个 bundle 初始化失败。
  - 同样问题：`src/systems/ShopSystem.ts:19-27`（`loadInventory`）。
- 影响：任何原因造成的 `oneworld_stats` / `oneworld_inventory` 非法 JSON（手动改坏、浏览器写入中断、旧版本结构不兼容）都会让游戏白屏且无法自愈，玩家只能手动清站点数据。
- 修复建议：`JSON.parse` 包 try/catch，失败回退默认存档；解析后校验字段类型与取值范围（coins ≥ 0、level ≥ 1 等）。

### P2

#### P2-1 商店「豪华午餐」可无限制刷金币（经济系统失效）

- 位置：`src/data/shops.ts:61-69` — `item_lunch`：price 10，`effect: { type: 'coins', value: 15 }`；购买路径 `src/systems/ShopSystem.ts:49-64` 先扣 10 再加 15。
- 影响：每次购买净赚 5 金币，无冷却无限购，几分钟内可刷出无限金币，效率/运气商品定价体系全部失效。属于数值设计 bug（数据集中文件恰是规范要求重点审查的位置）。
- 修复建议：使 `effect.value < price`（如价值 8 金币卖 10），或改为一次性/每日限购，或移除直接返钱类商品。

#### P2-2 玩家店铺「门」贴图位置与交互判定位置不一致

- 位置：
  - `src/data/map.ts:72` — `map[13][12] = TileType.DOOR`，即 (x=12, y=13)，位于店铺建筑区域 (x10-14, y13-17) 的**顶行内部**，覆盖了一块建筑 tile。
  - `src/entities/Player.ts:73-74` — 交互判定点 `doorX = 10 + floor(5/2) = 12`，`doorY = 13 + 4 = 17`，即建筑**下方**的 (12, 17)。
- 对比：办公楼 `map[6][5]`（map.ts:56）、商场 `map[6][19]`（map.ts:64）均在建筑正下方一格，与判定一致；只有店铺画错了行（13 应为 17）。
- 影响：店铺建筑顶行中间出现一个悬空「门」贴图，而真正提示「按 E 进入」的位置下方没有门图形，视觉与交互错位。
- 修复建议：`map[13][12]` 改为 `map[17][12]`。

#### P2-3 check-migrations.sh 的「非阻塞 warning」实际会阻塞

- 位置：`tools/check-migrations.sh:123-124` 把 verb-first warning 计入 `issues` 数组；`tools/check-migrations.sh:129-135` 只要 `issues` 非空即 `FAIL++` 并最终 `exit 1`（143-144），与脚本头注释「verb-first warning (non-blocking)」（119 行注释）矛盾。
- 影响：脚本一旦被接入 CI，warning 级问题会误判为失败。另注：本仓无任何数据库与 migration 目录（实测运行输出 `x No migration directory found`，exit 1），该规范与脚本当前属于无对象资产。
- 修复建议：warning 单独计数不影响退出码；或在仓库确实引入数据库前移除/归档该约定。

#### P2-4 无任何自动化测试与 CI

- 证据：`package.json:5-9` 仅有 dev/build/preview 三个 script；全仓无 `*.test.*` / `*.spec.*` 文件；`.github/` 目录不存在。
- 影响：核心规则（经济结算、任务进度、购买扣款）全靠手测，回归无保障；本次评审发现的 P1-1、P2-1 这类逻辑 bug 本可用少量单测覆盖。
- 修复建议：至少为 `systems/`（纯逻辑、不依赖 Phaser 渲染的部分）补 Vitest 单测：`acceptTask/completeTask` 状态机、`buyItem` 扣款与效果、存档解析容错。

#### P2-5 产物单 chunk 1.22 MB，触发构建告警

- 证据（实测 `npx vite build` 输出）：
  ```
  assets/index-NfKOfMel.js   1,221.41 kB │ gzip: 326.93 kB
  (!) Some chunks are larger than 500 kB after minification.
  ```
- 影响：Phaser 整库打进主 bundle，首屏需下载约 327 kB gzip JS；小游戏场景下可接受但无代码分割空间预留。
- 修复建议：可接受现状（Phaser 难以拆分），或用 `build.chunkSizeWarningLimit` 显式声明阈值消除告警噪音；不建议为此做复杂拆分。

#### P2-6 「今日已完成」计数无日期重置机制

- 位置：`src/systems/TaskSystem.ts:15,17,46` — `completedToday` 仅内存计数，不持久化、无跨日重置；页面刷新即归零，跨天不归零。
- 影响：每日 10 次上限既挡不住刷新绕过，也无法在自然日边界重置。handoff.md:104 已自知此缺口（标注为待办），此处确认为实现与文档一致地缺失。
- 修复建议：持久化 `{ date, count }`，比较当前日期决定是否清零。

### P3

1. **docs/TECH_STACK.md 与现状矛盾**：`docs/TECH_STACK.md:49` 称「仓库尚无 README / AGENTS.md」，但两者均存在（git log 显示后补）；`docs/TECH_STACK.md:15` 称「游戏内 UI 由 Phaser 场景绘制」，实际 UI 为 DOM Overlay（handoff.md:14、src/ui/*、styles/ui.css）。
2. **`src/utils/helpers.ts` 全文件死代码**：`randomInt/randomPick/clamp/formatNumber/playSound` 在 src 内无任何引用（grep 仅命中自身），handoff.md:100 承认音效未接入。
3. **showToast 多条提示互相截断**：`src/ui/HUD.ts:62-72` 单例 toast 元素 + 独立 `setTimeout`，前一条的定时器会提前隐藏后一条（如 UIScene.ts:109-114 的两条新手引导间隔 4.5s 而第一条 duration 4000ms，叠加时序易互相覆盖）。
4. **事件订阅无对称解绑**：`src/ui/HUD.ts:36-41`、`TaskPanel.ts:49-50`、`ShopPanel.ts:36` 对单例 System `on()` 后，`destroy()` 未 `off()`；当前场景不销毁所以无实害，属隐患（场景重启会产生重复回调）。
5. **存档数据无取值校验**：篡改 localStorage 可注入 NaN/负数 coins（EconomySystem.loadStats 直接信任）；单人游戏不算安全问题，但 NaN 会传染所有显示。
6. **地图高度 608px 超出画布 600px**：`src/config.ts:4,8`（HEIGHT 600、MAP_ROWS 19×32=608），最底行 tile 被裁掉 8px，且 world bounds 按 600 计算，最下行实际不可达。
7. **`src/scenes/CityScene.ts:24-27` 事件重复转发**：`this.events.emit('open-panel')` 场景级发射无人订阅，只有 `game.events` 级生效，属冗余。
8. **`TaskSystem.refreshTasks` 使用 `sort(() => Math.random() - 0.5)`**（src/systems/TaskSystem.ts:26）：分布有偏的洗牌，3/8 抽选场景影响极小，仅为规范性建议（Fisher-Yates）。

## 4. 分维度结论

1. **整体架构与模块边界**：分层清晰（scenes/entities/systems/data/ui），数值集中于 `config.ts` 与 `data/`，符合 AGENTS.md 约定；单例 System + EventEmitter 轻量可用。问题：进度推进逻辑绑死在 UI 面板生命周期上（P1-1），是架构层面唯一的实质缺陷。
2. **正确性与潜在 bug**：见 P1-1（软锁）、P2-2（门错位）、P2-6（日重置缺失）。
3. **安全**：无后端、无用户输入、无密钥、无网络请求；innerHTML 全部使用静态数据（handoff.md:119 声明与代码核实一致）。localStorage 篡改仅影响本地单人进度，不定级。无安全面 P0/P1。
4. **数据模型与迁移一致性**：本仓无数据库；`MIGRATION_CONVENTION.md` 与 `tools/check-migrations.sh` 为无对象资产（P2-3 附注），脚本自身有 warning 阻塞 bug。
5. **错误处理与失败模式**：存档解析无容错（P1-2）；`acceptTask` 失败无用户反馈；`localStorage.setItem` 在隐私模式下可能抛异常未处理（P3 级，EconomySystem.ts:38 等）。
6. **测试覆盖与验证门真实性**：零测试、零 CI（P2-4）；本次实跑验证门结果见第 5 节。
7. **依赖与构建健康**：依赖极简（phaser + vite + typescript），`npm run build` 链路实测通过；有 500 kB chunk 告警（P2-5）；package.json 缺 author 字段、license ISC 与项目性质匹配性未确认。
8. **性能热点**：475 个 tile image + 每帧 3 区域遍历，量级无问题；无明显热点。唯一值得注意的是构建体积（P2-5）。
9. **文档与实现一致性**：handoff.md 与实现高度一致（含已知缺口如实标注）；docs/TECH_STACK.md 有两处过时/矛盾（P3-1）；README.md 目录结构描述准确。

## 5. 验证门实际执行结果

| 命令 | 结果 | 说明 |
|---|---|---|
| `npx tsc --noEmit` | ✅ exit 0，无错误输出 | 等价于 `npm run build` 中的 `tsc` 步骤（noEmit 已由 tsconfig 指定） |
| `npx vite build --outDir /tmp/...` | ✅ exit 0，4.19s 构建成功 | 为遵守只读约束将产物重定向到 /tmp（已清理）；21 modules，JS 1,221.41 kB（gzip 326.93 kB），有 >500 kB chunk 告警 |
| `npm test` / lint | ⚠️ 不存在 | package.json 无 test/lint script，仓内无任何测试文件 |
| `./tools/check-migrations.sh` | ⚠️ exit 1 | 输出 `x No migration directory found (supabase/migrations or db/migrations).`——本仓无数据库，脚本无检查对象 |

说明：`npm run dev` / `preview` 需常驻端口，按约束未启动。

## 6. 修复优先级建议

1. 先修 **P1-1（任务软锁）** 与 **P1-2（存档容错）**：直接影响可玩性与启动可用性，改动均在一个文件内。
2. 随手修 **P2-1（刷钱数值）** 与 **P2-2（门贴图行号）**：均为单行数据修正。
3. 补 **P2-4（systems 层单测）**，顺带覆盖 P2-3 修过的脚本行为。
4. P3 项在下次功能迭代时顺带清理（死代码删除、TECH_STACK.md 更新、toast 队列化）。
