# 隔离审查与验收证据

2026-10-13 的当前实现只能用于隔离审查。阈值 60/65/76 仍未用 BCI 人工金标校准，未调用付费模型作语义评测。生产目录、生产数据库和旧 18 源未操作。

## 已取得的实际结果

| 命令 / 行为 | 运行环境 | 结果 |
| --- | --- | --- |
| `npm run typecheck` | Windows Node 24.19.0、Linux Node 24.18.1 | 通过 |
| `npm run test:standalone` | 同上 | 178 passed，0 failed/skipped/todo |
| `npm test` | Linux Node 24.18.1，PostgreSQL 17.11，GNU tar 1.35，非 root | 700 passed，0 failed/skipped/todo |
| `npm run build -w @aihot/web` | Windows、Linux | 通过 |
| `node --test apps/web/tests/*.test.ts` | Ubuntu 官方 Playwright 1.61.1 镜像，Node 24.19.0，Chromium 1228 / WebKit 2311 | 44 passed，0 failed/skipped/todo |
| `node scripts/smoke.ts --base http://127.0.0.1:34100` | 隔离 API/Web，`bcihot_test` | 30/30 |
| `node docs/bcihot/check-source-listings.ts` | Node 24.19.0 | 21 paused sources |

完整数据库输出保存在 [npm-test-linux-700.log](validation/npm-test-linux-700.log)。末尾原始汇总：

```text
ℹ tests 700
ℹ suites 0
ℹ pass 700
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 123358.442545
```

原网页测试在 Windows 没有浏览器缓存时 32/44；下载官方 Playwright 镜像后，以相同 lockfile 安装并构建当前代码副本，原命令 44/44。完整输出见 [web-tests-linux-44.log](validation/web-tests-linux-44.log)。镜像为 `mcr.microsoft.com/playwright@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48`；默认 Node 24.17.0 已满足仓库版本要求，本轮额外用已下载的 `node-linux-x64@24.19.0` 运行。未以 Edge 替代测试浏览器，也未改任何原浏览器测试步骤。

首次 Linux 运行的 688/690 失败项均为 BusyBox tar 的 `tar: empty archive`；换 GNU tar 并以非 root 执行后备份测试 8/8、完整套件 690/690。之后保留原公开出口用例，增加七种材料的真实网页/API/RSS/Markdown/MCP 检查及管理员 HTTP 400 检查，完整套件增至 698/698。原有修改测试文件的 `test()` 声明数没有减少。

再补齐 BrainGate、CEBSIT 已有实体的身份词典并加两项实际守卫正反例，当前全量 700/700、独立 178/178。`bci-identity-red.log` 保留词典缺失时两项 `pass != fallback` 的失败，`bci-identity-green.log` 保留补齐后的通过；没有修改框架守卫或放宽断言。

最终对测试强度的逐项审查恢复了英文长词边界、中文相邻名称、大小写、唯一主体、缺标签但类别匹配、仅更正主体标签、产品别名和机构英中别名条件；当前副本再次完整 700/700。42 个既有修改测试文件的测试声明与断言调用数均未减少。

事后从干净 `HEAD=2f43630` 重建改造前代码，使用独立 `bcihot_baseline_test` 复跑：原 standalone 161/161、npm test 674/674，均无失败/跳过/todo。此结果是恢复环境后补核对的基线，不是动工前已跑出的数字。输出见 `baseline-standalone-161.log` 和 `baseline-head-674.log`；当前独立 178、完整 700 相比增加 17、26 项。

日志仅清理了行尾空格和多余的末尾空行，错误、断言、退出汇总和测试输出内容保留。保存日志未发现连接串凭据或 API 密钥。

## 科研证据与公开出口的验证范围

`evidence-examples.json` 中的六类研究材料和 FDA PMA P100026 正例保留了来源、原文摘录、条件与人工审核的安全摘要。`bcihot-publication.test.ts` 现在启动真实 Web SSR 与本地 API，用七种材料逐一核对实际 HTTP 网页、网站详情、v1、RSS、条目 Markdown、Agent Markdown 和 MCP 工具调用。网页/网站 API 标签保留阶段；v1 不新增 tags/researchStage 字段，机器出口通过相同摘要表达范围。

安全摘要和阶段标签是人工夹具，不是模型回答。测试证明原文连续引文的核验、条件传递及公开展示一致；不证明真实模型的阶段判断、医学准确性或误写拒绝率。删除审批/结果证据的测试同时给出待核实或人体标签，所以不能说框架会自动将已有错误标签降级。模型语义评测仍未验收。

反向验证包含：临时信源配置副本加入 `unsupportedBcihotParserKey` 后，预览校验器抛出 400，实际 `/api/admin/sources/preview` HTTP 路由也返回 400；种子文件未改变。FDA 批准原文被删除后，原审批引文和条件被归一化层丢弃；临床试验结果段落被删除后，仅保留仍在原文中的方案条件。恢复完整材料后，FDA 批准正例和六种阶段正例均通过。

## 复跑 Linux 数据库套件

本轮复用了已在本机缓存的 PostgreSQL 镜像 `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`。数据库容器仅服务 `_test` 库；测试账号可以建库。临时 runner 安装的工具为 Node `24.18.1-r0`、npm `11.12.1-r0`、git `2.54.0-r0`、OpenSSL `3.5.9-r0`、GNU tar `1.35-r5`。业务依赖只按现有 lockfile 执行 `npm ci`。

数据库容器名是 `bcihot-test-db-20261013`；验收使用过的 `bcihot-node24-runner`、`bcihot-browser-runner` 和 `bcihot-final-runner` 已在日志保存后停止移除。Windows 工作树只读挂载在数据库 runner 的 `/repo`，真实执行发生在 `/work` 副本；没有将 `.env`、`.data` 或宿主 `node_modules` 复制到副本。副本保持 Windows 的 Git 行尾设定，测试文件哈希已与宿主核对。

在 runner 里应按以下顺序运行，`DATABASE_URL` 只指向本次临时数据库账号和 `bcihot_linux_test`。不要用生产连接串替换：

```sh
cd /work
npm run typecheck
npm run test:standalone
npm run build -w @aihot/web
npm test
```

启动 `npm test` 的容器执行用户为 `65534:65534`，PATH 为 `/usr/bin:/bin:/usr/local/bin`；GNU tar 处理空归档，非 root 用户能验证目录拒绝读取。新增的真实网页出口测试读取构建产物，所以独立新环境先构建再运行数据库套件。测试进程各自复制 `_test` 模板，结束时清理自己的数据库副本。

## 本地预览与截图

已运行的预览地址为 `http://127.0.0.1:34100`，API 地址为 `http://127.0.0.1:34101`；仅使用临时 `bcihot_test`。没有启动 worker。重启预览时在各自终端用进程级变量设置：API 的 `API_PORT=34101`、`SITE_URL=http://127.0.0.1:34100`、`AIHOT_DATA_DIR` 为独立临时目录、`AIHOT_CREDENTIALS_DIR` 为不存在的测试目录；Web 仅需 `WEB_PORT=34100`、同一 `SITE_URL` 和 `API_BASE_URL=http://127.0.0.1:34101`。无需读取或修改生产 `.env`。

采集、模型、飞书和 IndexNow 的开关全部为 `false`。API 用测试会话和图片签名值，数据库连接串只从本地测试容器取。Windows 显式调用桌面 bundled Node 24，并令 `OPENSSL_CONF` 指向 `D:\Program Files\Git\usr\ssl\openssl.cnf`：

```powershell
node apps/api/src/main.ts
node apps/web/server.ts
node scripts/smoke.ts --base http://127.0.0.1:34100
```

用本机 Edge 154 查看了首页、全部、主题、日报、周报、月报、关于页，7 页均 HTTP 200，无页面横向溢出或浏览器控制台错误。截图见 `screenshots/`。此时隔离库没有模拟内容，列表/报告为空；七种有内容的条目 SSR 已由新数据库集成测试逐一检查。这些人工页面截图不能替代 Chromium/WebKit 的原网页行为测试。

## 有内容的审查站

`http://127.0.0.1:34200` / API `34201` 使用独立 `bcihot_review_test`。`docs/bcihot/seed-review.ts` 只接受新的 `_test` / `_ci` 库；如果已有文章或报告就拒绝运行。脚本通过当前种子配置加入全部暂停候选，另建一个暂停的人工回放源，写入七种证据材料及日报/周报/月报回放。这是回放夹具，文章标题、摘要、源名和报告导语均标明“隔离审查示例”；列表日期只表示本次回放，条目分数为 null，不宣称来自真实模型或新审批。

在全新隔离库迁移后，安全阀均为 false 时运行：

```sh
node docs/bcihot/seed-review.ts
```

同上启动 API/Web，仅改进程级测试连接串和端口至 34201/34200；数据目录用系统临时目录。此站的 `smoke-filled-30.log` 为 30/30，`manual-filled-pages.log` 保存九页 Edge 154 的 HTTP 200、无横向溢出、无控制台错误、无假模型评分结果；九页为首页、全部、主题目录、患者结果主题、注册获批主题、三类报告和关于页。截图名为 `*-filled.png`。真实 FDA 正例和六种研究阶段都能在全部页/对应主题中看到，原文链接指向夹具保存的 DOI/官方记录。人工截图仍不替代锁定 Chromium/WebKit 的行为测试。

最新脚本另在全新 `bcihot_review_seed_ci` 复跑：`review-seed-ci.log` 保存正常写入输出，`review-seed-ci-state.log` 断言七项状态（0 启用源、21 暂停候选、7 条目、3 报告、0 非空分数、0 回执）。`review-reseed-refused.log` 保存已有文章/报告时的拒绝覆盖证据。
