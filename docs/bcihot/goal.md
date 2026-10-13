你是执行 agent。按本任务书把 D:/code/AIHOT 改成可在隔离环境审查的 BCIHOT；未决事项写 BLOCKED.md，继续独立部分。断点续跑先读 PROGRESS.md，每完成一项更新。目的：按脑机接口领域发现热点，区分科研证据与产品可用状态。优先级：不歪曲证据＞运行正确＞覆盖面＞速度。“只允许/不许”为硬约束，“建议”可调整并记录理由。

我替领导拍的板
- 本书采用 docs/bcihot/research-brief.md 的十类草案与21源名单；运营者发送本书前可改判，发送后按该版做本地实现。此举不授权生产部署或启用信源。
- 猜的：读者是科研、工程与产业从业者；重视可核验进展、复现条件和真实审批/应用。偏好猜错会影响精选口味，写入待决项。
- 猜的：论文主要按领域归1–7，形态标“论文/研究”；第8类重点收数据/基准/跨领域研究，第10类收工具/教程/观点。避免每篇论文被吸入第8类。
- 猜的：神经科学/类脑计算收与本站方向明确相关的内容；全神经科学扩展待运营者决定。首版阶段用现有tags和原文conditions，不新增数据库/API字段。
- 旧生产AI数据保留；21个BCI候选全暂停。法律主体、联系方式、数据用途和付费模型评测待本人决定。阈值60/65/76沿用但标“BCI未校准”，没有人工金标不做校准或付费评测。

界限
只允许改 site/**、industry/**、docs/bcihot/**、docs/deploy.md、受行业词表影响的tests/*.test.ts与apps/web/tests/*.test.ts中的业务例子，以及PROGRESS.md/BLOCKED.md。可新建BCI行业验证测试；旧测试只替换分类/实体/标签和对应文案，断言、测试数量、测试步骤不能减弱。apps/packages实现、database历史迁移、CI、验收脚本、lockfile与docker-compose.yml只读；不重构或重命名@aihot包/环境变量。研究核验脚本 docs/bcihot/check-source-listings.ts 不改。
/root/bcihot生产目录和数据库只读。不开采集、模型、飞书或IndexNow；不改生产密码/PORT/SITE_URL，不删除18旧源/数据。仅在*_test/*_ci数据库及隔离站点验证。

现状与任务0
2026-10-12：原仓库6类别、38主题、18 AI源；seed只补新id、不停旧源。六种采集、html_json_key、tags及fact.evidence/conditions已实现，无researchStage字段。21候选全部有标题/原文链接/日期，现有解析器21/21列表通过，但正文、许可和服务器采集未验收。
默认Node22.14不满足>=24.11；bundled Node24.19可用。本轮npm ci、npm run typecheck、npm run build -w @aihot/web成功；npm run test:standalone为161通过/0失败/0跳过/0todo。Windows需OPENSSL_CONF指向有效cnf。npm test因本机5432无PostgreSQL失败；node --test apps/web/tests/*.test.ts为32/44通过，12因无Chromium失败；不能称完整基线全绿。
先读AGENTS.md、README、docs/customize.md、docs/architecture.md、docs/sources.md及docs/bcihot/草案和核验记录；运行node --version、git status --short、node docs/bcihot/check-source-listings.ts确认环境和21个暂停源。先在隔离环境复跑下方验收取得完整基线；不匹配/前提缺失写BLOCKED最前，只继续不受影响部分。动工前把目标、顺序和最大风险写≤10行回执。

任务1：站点与行业身份
按customize顺序改site为BCIHOT、行业词脑机接口、mcpPrefix bcihot、Crawler/分享图/关于页/公开说明/manifest/报头和原创简洁图标；不冒用AIHOT品牌。技术包名和API已有aihot键保留。条款/隐私保留明确待确认的模板，不伪造运营者。当前日期可用于改造日志，不虚构已公开上线。
落实草案第一节十类及稳定key，写明交叉边界；更新topics/实体/别名/身份防串主体词典。AI模板的RELEASE不能继续数“新模型”，无确认的同类指标设null。分类参数语义变化、主题地址与MCP前缀变更写入部署说明；按SITE.interfaceVersion约定升主版本，不降低版本。
验收：npm run typecheck；所有配置标签、实体、主题引用有效且没有旧AI示例主题/站点图标。

任务2：科研证据和可用状态贯穿写作
改prefilter、structure、领域术语、selection-score及所有标题摘要、翻译、归组、综述、周月报提示词。保留五维、内容类型权重、噪声与输入安全结构，仅适配BCI对象/例子；ITEM_TYPES变动与权重/内容理解同步。
主题、形态、证据、产品状态不能互推。独立标：方法/仿真或离线评测、动物/人体实验、小样本患者结果、临床试验结果、原型演示；另标预印本/期刊状态、招募/试验许可、注册获批、商业供货、真实部署和未知。
人数、健康/患者、对照、在线/离线、随访、适应证、地区、审批编号只从原文取；缺失待核实。FDA Breakthrough、中国创新审查通道、IDE许可不等于上市；NCT登记/完成不是疗效证据；上市、验证、部署不是单一升级阶梯。标题/摘要/推荐理由/综述保留范围，归组不把旧审批或别的产品适应证移给新结果。不把EEG分类准确率写成读心，纯EMG不能冒称脑信号。
至少给六种用户指定阶段各一个正例和误写反例；放进本地可复跑测试，使用原文证据/条件校验和已有公共出口核对。至少包含真实监管获批正例，不能把所有材料一律降成“原型”。项目provider本地stub可测管线，不可把预写假响应当真实模型语义质量/医学准确率；未做的实模评测明确列未验收。

任务3：首批信源与既有数据交代
把sources-candidate.json作为首批种子，全部enabled=false、site_fulltext=false、syndicate_fulltext=false，owner指向新ENTITIES。16重点+5宽召回按research-brief.md第三节，不自行替换；宽流需BCI范围预筛。
第四节的临床/监管/政策/企业候选仍待适配，不能编RSS/选择器或绕访问限制。新闻页媒体转载不一律算公司一手，同一论文多索引不等于独立实验证据。年份目录跨年问题和JSON检索窗口截断风险写说明。
使用已核验配置做本地保存响应的解析测试，tests不得联网；人工免费只读核验可运行node docs/bcihot/check-source-listings.ts --live，失败保留原始输出，不删失败源凑全绿，不调用付费采集/模型。写清seed不会停旧18源，生产暂停旧源、历史内容归档/重评/清库均待本人决定并先备份。

任务4：隔离验收和交付
冻结原测试强度，只更新行业样例；验证BCI分类、词表、阶段证据条件与网页/RSS/API/Markdown/MCP一致显示。
运行：npm run typecheck；npm run test:standalone；npm test（DATABASE_URL仅*_test/*_ci，账号可建库）；npm run build -w @aihot/web；node --test apps/web/tests/*.test.ts；node scripts/smoke.ts --base <隔离站点地址>。这些命令已查实；数据库/Chromium前提不满足写实原因，不用生产站点冒充改后验收。人工看首页、全部、主题、日报/周月报和关于页，提供截图及隔离运行方式。
反向验证：临时配置副本加入未支持键，确认400拒绝；删除样例中的临床/审批证据，确认不会输出相应已验证状态；保留失败证据后还原通过，判据不能被放宽。

规矩
不加skip/todo、不删测试、不缩测试匹配范围、不放宽断言、不mock被测对象、不改阈值/验收脚本、不用||true。独立测试通过数至少161、跳过/todo为0；全量测试数以任务0基线为底线。缺人工金标不自造gold宣称校准成功。环境修复只装锁定依赖/测试工具，不新增业务依赖。
同一验收连败3次换独立项；变差回滚本人改动并如实报告，保留用户已有工作。待决事项集中≤5个，不越权部署、删库或启用服务。

完成条件
1. 本地BCIHOT有十类、主题与完整品牌/公开说明；六种科研/可用情况有证据范围和可复跑正反例，21种子全暂停；类型/独立/数据库/网页/构建/smoke通过，未校准和未做实模评测明确列出。
2. git diff仅白名单，旧测试不弱化/数量不降，生产零改动、真实付费调用零；贴实际命令输出及反向红→绿证据，只说完成不算。PROGRESS.md、BLOCKED.md随交付，空的写无。环境确实受阻且已复核3次时交可审查部分与原始错误，不声称全部验收完成。
