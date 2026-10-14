# BCIHOT 执行进度

断点续跑先读本文件；任务约束与来源草案见 `docs/bcihot/goal.md`、`research-brief.md`。

## 基线（2026-10-13）

- Node.js 默认命令为 v22.14.0；桌面 Node v24.19.0 满足仓库要求。
- `node docs/bcihot/check-source-listings.ts`：21 个候选源配置通过，均暂停且全文/转载关闭。
- `npm run typecheck`：通过。
- 在临时 Linux runner（Node v24.18.1）内复跑 `npm run typecheck`：通过。
- `npm run build -w @aihot/web`：通过。
- 在临时 Linux runner 内复跑 `npm run build -w @aihot/web`：通过。
- `npm run test:standalone`：先用 Node v24.19.0 和有效 OpenSSL 配置确认原 161 项+BCI 证据/来源 15 项为 176 passed；补齐 BrainGate/CEBSIT 身份词典后，Linux 当前完整独立测试为 178 passed、0 failed、0 skipped、0 todo。
- 在临时 Linux runner 内复跑 `npm run test:standalone`：178 passed、0 failed、0 skipped、0 todo，输出见 `docs/bcihot/validation/standalone-linux-178.log`。
- 7 个 BCI 相关数据库测试文件曾定向复跑，45/45 通过。
- 事后在临时容器从干净 `HEAD=2f43630` 重建原始代码复跑基线：standalone 161/161、完整 npm test 674/674，均 0 failed/skipped/todo；这是补核对的基线，不冒充动工前运行。当前 178/700 相比增加 17/26 项，测试数量未降。
- `npm test`：Windows runner 因 `SIGTERM` 处理差异未能汇总；之后在一次性 Alpine Linux 副本中用 Node v24.18.1、PostgreSQL 17.11、GNU tar 和非 root 用户于 `bcihot_linux_test` 完整复跑，700 passed、0 failed、0 skipped、0 todo。首次 Linux 试跑用 BusyBox tar/root 得到 688/690；切换工具/用户后原 690 项全绿；新增 8 项真实出口/HTTP 检查及 2 项身份正反例后当前全量 700/700。最新完整输出见 `docs/bcihot/validation/npm-test-linux-700.log`。
- 通过 Alpine 包仓库在临时容器安装 Node 24.18.1、npm 11.12.1、git、OpenSSL 与 GNU tar；在只读挂载的当前工作树副本中运行锁定依赖安装（299 packages）。所有安装和生成文件留在临时容器，宿主 lockfile 未变。
- Linux runner 中单独复跑 `tests/backup.test.ts`：8/8 通过，包括空附件目录、不可读目录、转储/恢复和失败重试。
- `tests/bcihot-publication.test.ts`：9/9，保留原用例并新增六种科研阶段、FDA 批准正例的真实网页渲染和所有公开 HTTP 出口；另经实际管理员路由确认临时未知配置键返回 400。v1 API 保留其已有字段，阶段范围通过摘要表达；网站接口保留阶段标签。
- BrainGate 与 CEBSIT 的身份防串词典缺口已补齐；新增两项实际守卫测试先红后绿，记录在 `validation/bci-identity-red.log` / `bci-identity-green.log`，原文未具名时标题回退、摘要丢弃，原文具名时允许。
- `node --test apps/web/tests/*.test.ts`：Windows 缓存缺失时为 32/44；通过官方 Playwright 1.61.1 Ubuntu 镜像、Node v24.19.0、Chromium 1228 和 WebKit 2311 在当前代码副本完整复跑，44 passed、0 failed、0 skipped、0 todo。输出见 `docs/bcihot/validation/web-tests-linux-44.log`。没有改浏览器启动方式、测试匹配或断言。
- `node scripts/smoke.ts --base http://127.0.0.1:34100`：隔离 API/Web 与 `bcihot_test` 启动后 30/30 通过，包括网页、公开 API、RSS、Markdown、图标和 MCP 握手。
- 本机 Edge 154 人工查看首页、全部、主题、日报、周报、月报和关于页：7 页均为 HTTP 200，无横向溢出或控制台错误；隔离库无种子内容，列表与报告显示空状态。截图在 `docs/bcihot/screenshots/`。
- 新鲜 `bcihot_review_test` 中回放七种材料并写入三类明确标为“隔离审查示例”的报告；21 候选仍暂停，全部回放分数为 null。`http://127.0.0.1:34200` 有内容的九页 Edge 检查通过，无页面溢出、控制台错误或假模型分数；包含患者结果与注册获批主题。截图为 `*-filled.png`；该站 smoke 30/30，日志已保存。
- 最初 Docker Hub Node 镜像拉取超时、Playwright CDN 返回 400；最终通过缓存 PostgreSQL 镜像+Alpine 工具包完成数据库验收，通过 MCR 官方 Playwright 镜像完成网页验收。Windows 默认 Node 22、缺少浏览器和 POSIX 工具均未绕过，所有验收使用满足前置的独立容器环境。
- `git status --short` 初始只有任务草案目录 `docs/bcihot/` 未跟踪。
- 最终相对 `HEAD` 复核暂存与未暂存全部内容均在白名单；42 个既有修改测试文件的测试声明和断言调用数无减少、无新增 skip/todo。逐项恢复了较长英文词/中文相邻名称、大小写、唯一主体、缺标签但类别匹配、仅改主体标签、产品别名和英中别名检查；当前完整 700/700 再次通过。apps/packages 实现、database、CI、lockfile、Compose、scripts 和信源核验脚本均未改，完整 diff 空白检查通过。保留外部暂存状态，没有替使用者提交。

## 任务状态

- [x] 任务 0：读取说明、草案并记录隔离基线。
- [x] 任务 1：站点身份、十类、主题、词典与品牌；`npm run typecheck` 通过，配置引用校验通过。
- [x] 任务 2：科研证据/可用状态提示词、六类证据正反例和 FDA PMA 正例；证据/删除证据用例 9/9、身份正反例 2/2、公开出口与管理员 HTTP 用例 9/9 均包含在当前全量 700/700 中。实模语义评测未做，不把人工夹具称作模型质量。
- [x] 任务 3：21 个候选种子均暂停、全文关闭并补齐 owner；`check-source-listings.ts --live` 为 21/21，配置拒绝/种子/本地 RSS/JSON/HTML 测试 6/6 通过。
- [x] 任务 4：typecheck、standalone 178/178、npm test 700/700、Web 构建、锁定 Chromium/WebKit 网页测试 44/44、空/有内容隔离站 smoke 各 30/30 均通过；空状态七页、有内容九页已查看并截图。完整日志、反向红→绿证据、配置引用验证和复跑说明见 `docs/bcihot/validation.md`。

## 本地证据

- 2026-10-13：六类阶段示例来自 Europe PMC 收录的公开摘要；FDA PMA P100026 页面为可读取的真实批准正例。NMPA 2026-03-13 URL 返回 412，未绕过。
- `docs/bcihot/evidence-examples.json` 保存来源 URL、原文摘录、条件、正确摘要和误写反例；测试断言引文仍能在源摘录中逐字找到。
- `npm run test:standalone` 中六类科研阶段正反例、FDA PMA 批准正例、删除审批/临床结果证据后的未验证结果、未知配置键 400 拒绝和保存响应解析均通过。
- 这些用例中的安全摘要和阶段标签来自人工审核夹具。连续引文核验及公开传输通过，不能据此宣称真实模型阶段识别或医疗语义准确；删除证据用例也不证明框架会自动重标已有阶段标签。实模评测仍未验收，解释见 `docs/bcihot/research-brief.md`。
- `docs/bcihot/fixtures/` 保存三个经核验信源的最小列表响应，测试只访问本机 fixture server。
- 最新 `seed-review.ts` 已在另一个全新 `bcihot_review_seed_ci` 库执行并校验 21 暂停候选、7 条目、3 报告、0 启用源、0 非空分数、0 回执；再次运行已有数据的库会拒绝覆盖。结果和拒绝输出都已保存。
- 隔离运行：空站 `http://127.0.0.1:34100` / `bcihot_test`，有内容站 `http://127.0.0.1:34200` / `bcihot_review_test`；两站 API 端口分别 34101、34201，数据在系统临时目录。模型、采集、飞书和 IndexNow 均关闭，未启动 worker。全部验收 runner（数据库、浏览器和最终基线复跑）已停止并移除；预览服务和临时 PostgreSQL 保留供使用者审查。
