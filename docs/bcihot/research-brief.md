# BCIHOT：分类、科研证据与首批信源草案

草案核验日期：2026-10-12（Asia/Shanghai）；本地适配记录：2026-10-13。任务书采用了本草案的十类和 21 个候选，已写入本地 `site/` 与 `industry/`。服务器目录和生产数据库仍只读；21 个候选全部 `enabled=false`，采集许可、正文提取和服务器连通性仍需逐源确认。

## 1. 建议的分类规则

保留你提出的十个方向，同时把“主题领域”“内容形态”“科研/可用阶段”分开描述。首页给一篇报道一个主类别；论文、开源、教程等用内容形态标签；阶段用独立标签与摘要中的证据限制说明。这里的 category key 只是建议，首次采用后应固定。

| 序号 | 类别及建议 key | 收录重点与边界 |
|---|---|---|
| 1 | 硬件与采集 `hardware-acquisition` | 电极、EEG、ECoG、侵入式记录、fNIRS、放大器、采集芯片、无线和多模态同步；芯片用于采集归这里，用于脉冲计算归 6。 |
| 2 | 解码与信号处理 `decoding-signal` | 伪迹处理、特征、跨被试/跨天解码、实时校准、言语与运动解码；新解码论文仍归本类，并标“论文/研究”。 |
| 3 | 神经调控与闭环 `neuromodulation-closed-loop` | 电/磁/光/超声刺激、DBS、BCI-FES、状态感知与响应控制；主要结论是患者临床结局则归 4。 |
| 4 | 临床与医疗 `clinical-medical` | 患者研究、注册临床试验结果、安全性、随访、康复和适应证；受试者参与不自动意味着临床疗效获证。 |
| 5 | 交互与消费 `interaction-consumer` | 辅助沟通、VR/AR、游戏、可穿戴交互、工作负荷；纯肌电控制须明确标 EMG，不能直接称为读取脑信号。 |
| 6 | 类脑计算与芯片 `neuromorphic-computing` | 神经形态芯片、脉冲计算、忆阻器、事件驱动硬件及其能耗/性能证据；普通 GPU/大模型更新不因“智能”而收录。 |
| 7 | 脑启发与神经科学 `brain-inspired-neuroscience` | 与神经信息处理/脑机接口有明确关系的回路机制、脑启发学习和可计算模型；是否扩展到所有基础神经科学需要你决定。 |
| 8 | 数据集与基准 `datasets-benchmarks` | 以公开数据、协议、复现、基准和评测资源为核心；主信息无法落入 1–7 的跨领域研究也可在这里。建议页面短名为“论文与基准”，避免每篇论文都被吸进本类。 |
| 9 | 产业与政策 `industry` | 公司、融资、合作、政策、标准、监管审批事件；审批以监管原件为优先证据，品牌自述保留“公司称”。 |
| 10 | 工具、教程与观点 `tools-practice-opinion` | 可复用教程、工具发行、开源项目、方法综述与观点；只有公布新算法实验时归 2/8，不因附代码自动变成教程。 |

内容形态候选：设备/系统发布、算法/方法、论文/研究、数据集/基准、工具/开源、教程/实践、观点/综述、行业动态、政策/监管。信号模态候选：EEG、ECoG、spikes、fNIRS、混合BCI；应用标签候选：运动、言语、视觉、感觉反馈、康复、辅助沟通。EMG/眼动是辅助或相邻模态，不偷换为脑信号。

## 2. 科研证据与产品状态应当分别标

以下是编辑方案，不是医疗器械通用等级。每个阶段必须能指回原文证据；不能从来源级别、DOI、公司名或评分推出阶段。论文发表方式另标“预印本/期刊论文/未说明”，没有证据不声称经过同行评审。

| 你关心的区分 | 应保留的信息 | 允许的描述及不能跨越的推断 |
|---|---|---|
| 论文提出方法 | 提出/仿真/离线评测、数据来源、指标与比较方案 | “提出一种方法、在该数据集上得到结果”；不是实际患者获益。 |
| 小样本实验结果 | 人或动物、健康人与患者、n、在线/离线、训练/校准、评测和随访 | “在 n 名受试者中观察到……”；没有人数时写未说明，不设人为数字界限代替研究设计。 |
| 临床验证 | 注册号、研究设计、对照、样本、适应证、预设终点、安全性与随访 | 标“临床试验结果”并限于该研究；招募中/登记完成/有患者演示不等于验证疗效。 |
| 产品已上市 | 销售或供货证据、对象、地区、版本与用途 | 上市/供货单独核实；科研设备可售不意味着获准治疗疾病。 |
| 注册审批或真实部署 | 审批机构/编号/日期/适应证，或部署场景/人数/时长 | “获准开展试验”“注册获批”“已部署”分别标；获批适应证不能任意扩大。 |
| 概念演示或实验室原型 | 仿真、台架/动物/受控实验、演示与可重复条件 | 明示“概念演示/实验室原型”；不写成家庭可用、规模化交付或临床有效。 |

建议首版用已有 tags 与 fact.evidence/fact.conditions（原文证据与条件）表达。暂不新建数据库枚举或私有 API 字段。两轴可以并存：一篇新论文可能研究已上市硬件；不能把整个产品统一降成“实验室原型”。原型/动物/人体小样本/临床试验结果/阶段待核实是证据标签；试验招募、试验许可、注册获批、商业供货、真实部署是可用状态标签。

标题、摘要、推荐理由、翻译、事件综述、日报导读、周月报都要保留范围。具体要求：输出优先交代主体、动作和阶段，然后尽量保留样本数、信号模态、在线/离线、适应证和局限；只摘原文存在的数据。多篇文章归组时，不能把旧的许可、别的型号或别的适应证移给新结果。

原始依据：

- FDA 植入式 BCI 指导文件（2021-05）分别讨论非临床试验和 IDE 可行性/关键性临床研究：[官方原文](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/implanted-brain-computer-interface-bci-devices-patients-paralysis-or-amputation-non-clinical-testing)。
- FDA Breakthrough Devices Program 是加快开发与评审的机制，designation 与 marketing authorization 分开统计，获得 designation 不自动成为获批上市：[官方说明](https://www.fda.gov/medical-devices/how-study-and-market-your-device/breakthrough-devices-program)。
- NMPA 2026-03-13 发布博睿康相关产品“获批上市”公告，可作为“注册获批”正例，但仍须保留原文列明的产品/用途范围：[监管原件](https://www.nmpa.gov.cn/directory/web/nmpa/zhuanti/zt2023/ypgzhlfzh/shypqxgg/ggjzcx/20260313134742156.html)。
- ClinicalTrials.gov 登记记录用于核对研究状态、设计和已提交的结果，不能以一个 NCT 编号替代结果证据：[API 入口](https://clinicaltrials.gov/data-api/api)。

## 3. 首批信源：16 个重点 + 5 个宽召回候选

这些数字是本轮名单数量，不是网站已经启用的源数。采集配置在 [sources-candidate.json](sources-candidate.json)，HTTP 取证在 [source-audit.json](source-audit.json)，列表解析结果在 [listing-results.json](listing-results.json)。2026-10-13 已用现有解析器在线只读检查全部 21 个配置：21/21 返回非空标题、原文链接和日期；这是列表解析通过，不等于正文补齐、许可确认或生产采集通过。自动测试使用 `fixtures/` 保存的 RSS/JSON/HTML 元数据响应片段，不访问外网。所有源默认摘要+原文链接，不代表得到全文转载许可。T1/T2 只表示原始发布/二手报道角色，不是科学证据强度；预印本不能因 T1 自动升级。

| 优先级 | 来源及采集入口 | 对应类别 | 首批用途/局限 |
|---|---|---|---|
| P0 | [Nature · BMI](https://www.nature.com/subjects/brain-machine-interface.rss) · RSS | 1/2/3/4/5/8 | 用主题流集中收论文和研究评论；区分文章类型。 |
| P0 | [Journal of Neural Engineering](https://iopscience.iop.org/journal/rss/1741-2552) · RSS | 1/2/3/4/8 | 神经工程原始研究；只读到元数据时不补实验细节。 |
| P0 | [Neuromorphic Computing and Engineering](https://iopscience.iop.org/journal/rss/2634-4386) · RSS | 6/7/8 | 类脑硬件、脉冲算法与器件；是否与 BCI 直接相关另判。 |
| P0 | [Europe PMC REST](https://www.ebi.ac.uk/europepmc/webservices/rest/search) · JSON | 1/2/3/4/5/7/8 | 按标题摘要中的 BCI/BMI 查询且限定 MED；配置使用 `pageSize=20`、按最新日期排序且无分页游标，单次响应最多 20 条，结果量超过窗口时会截断，不能视作完整增量窗口。索引收录不代表科研成熟度。 |
| P0 | [BrainGate](https://www.braingate.org/feed/) · RSS | 2/4/9 | 人体 BCI 研究项目消息；一手消息也要回溯论文/注册记录。 |
| P0 | [Neuralink Updates](https://neuralink.com/updates/) · 内嵌JSON | 1/2/4/5/9 | 原始 HTML 包含 blogPosts，可用现有 html_json_key；网页摘要不冒充全文。 |
| P0 | [脑虎科技新闻](https://www.neuroxess.com/news/) · HTML | 1/2/4/5/9 | 本轮已找到新闻卡片与日期节点；不要用根 /feed/，本轮里面只有“世界，您好！”。 |
| P0 | [中科院脑智卓越中心](https://cebsit.cas.cn/xwen/kyjz/2026/) · HTML | 2/3/7/8 | 国内研究进展；路径固定在 `/2026/`，跨年需更新年度 URL、重验选择器并确认是否回看上一年度。 |
| P0 | [Paradromics Company News](https://paradromics.com/news/) · HTML | 1/2/4/9 | 混合页只取本域名公司公告，媒体报道不能一律按公司一手计。 |
| P0 | [g.tec](https://www.gtec.at/feed/) · RSS | 1/3/4/5/9/10 | 采集、闭环、康复与应用；活动营销和一般招聘另滤。 |
| P0 | [Brain Products](https://pressrelease.brainproducts.com/feed/) · RSS | 1/2/10 | EEG 采集与分析软件；厂商宣传仍须限定证据。 |
| P0 | [Artinis](https://artinis.com/blogpost-all?format=rss) · RSS | 1/2/5/10 | fNIRS/可穿戴/同步研究；NIRS 成像或科研仪器不自动等于 BCI。 |
| P0 | [MNE-Python Releases](https://api.github.com/repos/mne-tools/mne-python/releases?per_page=5) · JSON | 2/10 | 信号处理发行日志。 |
| P0 | [MOABB Releases](https://api.github.com/repos/NeuroTechX/moabb/releases?per_page=5) · JSON | 2/8/10 | BCI 基准、复现与数据集变化。 |
| P0 | [Braindecode Releases](https://api.github.com/repos/braindecode/braindecode/releases?per_page=5) · JSON | 2/10 | 神经信号深度解码工具发行。 |
| P0 | [BrainFlow Releases](https://api.github.com/repos/brainflow-dev/brainflow/releases?per_page=5) · JSON | 1/2/10 | 设备接入、采集与处理工具发行。GitHub Atom 本轮失败，JSON 可读；不能因此称 Atom 永久失效。 |
| P1 | [arXiv q-bio.NC](https://rss.arxiv.org/rss/q-bio.NC) · RSS | 2/7/8 | 宽召回，包含很多非 BCI；必须预筛，标预印本/版本信息。 |
| P1 | [arXiv cs.NE](https://rss.arxiv.org/rss/cs.NE) · RSS | 6/7/8 | 神经计算也包括进化计算，不能全部放入精选。 |
| P1 | [bioRxiv Neuroscience](https://connect.biorxiv.org/biorxiv_xml.php?subject=neuroscience) · RSS | 2/3/7/8 | 生物/神经科学预印本，不默认临床证据。 |
| P1 | [medRxiv Neurology](https://connect.medrxiv.org/medrxiv_xml.php?subject=neurology) · RSS | 3/4/8 | 医学预印本，与正式验证分开标。 |
| P1 | [IEEE Spectrum Biomedical](https://spectrum.ieee.org/feeds/topic/biomedical.rss) · RSS | 1/3/4/5/6/9 | 独立媒体解释和产业报道，按 T2；广泛生物医学内容需预筛。 |

论文渠道会重复；上线时按 DOI、arXiv/bioRxiv 版本和原始链接核对，再沿用现有事件归组。不能把同一篇论文在多个索引的曝光算作多个独立实验证据。

## 4. 应重点关注但尚不适合直接放入自动采集的来源

| 候选 | 本轮实际发现 | 建议处理 |
|---|---|---|
| [ClinicalTrials.gov API v2](https://clinicaltrials.gov/api/v2/studies) | BCI 查询 HTTP 200，返回 protocolSection；样例有招募状态和 lastUpdatePostDate | 外部标准化适配后推入 existing external/ingest，保留 NCT、状态、studyFirstPosted、lastUpdatePosted、结果是否公布。lastUpdatePosted 是记录更新，不填作事件/实验发生日；同一 NCT 状态变化须形成修订。 |
| [FDA CDRH](https://www.fda.gov/medical-devices/medical-devices-news-and-events/cdrhnew-news-and-updates) | 官方原件已可核对；本轮尚未配置稳定列表抓取 | 先人工核对/外部推送，单独检查 IDE、Breakthrough、510(k)、De Novo、PMA 与各自用途。 |
| [NMPA 医疗器械公告](https://www.nmpa.gov.cn/ylqx/ylqxggtg/index.html) / CMDE | 搜索可定位监管原件；本机读取一则文件为 HTTP 412 | 高优先级监管参考。直接抓取受限就保持待适配，不绕过访问限制或伪造 RSS；与博睿康、脑虎等厂商声明交叉核对。 |
| [工信部科技司](https://www.miit.gov.cn/jgsj/kjs/index.html) | 找到 2025-07-23 成文的脑机接口产业实施意见 | 高优先级政策源，区分政策发布时间/成文日/实施目标；不要把目标写成已发生。 |
| [Synchron](https://synchron.com/news) | 新闻页同时链接 BusinessWire 公告、WIRED、Bloomberg 等 | 分公告与媒体后分别计来源/热度，详情再核验；当前不把整页标一手。 |
| [Precision Company News](https://www.precisionneuro.io/articles/company-news) | 200；公司公告链接 Globenewswire；旧 /news 路径 404 | 适配分栏及详情后再入种子，避免混入 /articles 的媒体转述。 |
| [强脑 BrainCo](https://www.brainco.cn/zh-CN/news/press-center) | 新闻页面 200，但原始 HTML 未找到新闻正文列表 | 需确认真实公开接口或选官方账号/人工推送，不凭菜单生成文章。 |
| [博睿康 Neuracle](https://www.neuracle.cn/) | 首页 200、原始响应约 915 字符，动态页面 | 待核验新闻接口；监管原件比主页广告更适合核对获批事项。 |
| [OpenBCI Community](https://openbci.com/community/feed/) | 503，维护页面 | 重点关注但本轮不可用，恢复后重测。 |
| [NeuroPace](https://investors.neuropace.com/rss/news-releases.xml) | 投资者 RSS 429；主站 /feed/ 403 | 闭环神经调控的重要候选，暂停自动源；不要用“200 假设”填清单。 |
| [Medtronic](https://news.medtronic.com/press-releases?pagetemplate=rss) | RSS 200，可解析列表，但流很宽，仅近 5 条 | 作为第 3 类补充候选；宽流可能遗漏新神经调控内容，先找专项渠道。 |
| [Nature Neuroscience](https://www.nature.com/neuro.rss)、[Nature Biomedical Engineering](https://www.nature.com/natbiomedeng.rss)、[Nature Electronics](https://www.nature.com/natelectron.rss) | 各 RSS 200 | 第二批扩充；会与 Nature BMI 主题流重复，先评估新增价值与模型预算。 |

尚缺医院研究团队的一手发布、国内试验登记适配、神经形态芯片厂商专项流。首批不把付费 X/公众号采集当运行前提；你指定账号后再核验，费用走已有回执与预算。

## 5. 编辑标准：待你确认的建议

建议正常评价：可核验的新采集设备/电极与方法、可复现的解码和泛化改进、有设计和边界的患者研究、真实审批与部署、开放数据/基准/代码、关键资金和政策动作。建议压住：脑控万能论、没有样本/指标/比较的“重大突破”、拿 EEG 分类准确率冒充读心、纯市场规模预测、培训广告、重复转载和把投资金额当临床成熟度。

以上是候选口径。读者定位、重要/噪声样本、类别边界、首批源启用需由你确认；阈值保留 60/65/76 并明确“沿用 AI 模板、BCI 未校准”。没有人工金标时不做付费评分评测，不自造 gold 宣称已校准。法律/隐私运营主体和用途继续留待确认，不伪造正式法律文案。

## 6. 本地复核及实现边界

2026-10-12 的原仓库：6 个类别、38 个主题、18 个 AI 示例源。正式包没有专门的 researchStage 字段，结构化已支持白名单 tags 与 fact.evidence/conditions；本地适配通过现有摘要、类别和标签出口表达证据范围。信源文件只新增数据库里不存在的 id，不会停用既有 18 源，也不会迁走已收录的 AI 内容。生产数据库处理须单独决定并备份。

- 默认 Node v22.14.0 不符合 package.json >=24.11；已用桌面 bundled Node v24.19.0 核验。
- npm ci 安装完成；npm run typecheck 和 npm run build -w @aihot/web 成功。
- 任务书所记原工作树独立测试基线为 161 passed、0 failed、0 skipped、0 todo；本轮实际运行数和新增证据/解析测试见根目录 `PROGRESS.md`，没有删减原测试。
- 原数据库基线因本机没有 PostgreSQL 而返回 ECONNREFUSED。2026-10-13 已在临时 Linux/Node 24.18.1、PostgreSQL 17.11、GNU tar、非 root 环境的 `_test` 数据库完整验收 700/700；新增覆盖的最新总数和输出见根目录 `PROGRESS.md`。
- node --test apps/web/tests/*.test.ts：44 个案例在 Windows 缓存缺失时为 32/44；2026-10-13 已在官方 Playwright 1.61.1 镜像用 Node 24.19.0、锁定 Chromium 1228 和 WebKit 2311 完整复跑 44/44。既有测试只替换行业业务样例，测试声明数未减少；Edge 人工截图与真实跨浏览器测试分别记录。
- 采集配置/列表核验命令：node docs/bcihot/check-source-listings.ts；加 --live 会只读这些公开列表，写 listing-results.json。本轮 2026-10-13 复核为 21/21；这不证明正文补齐、许可确认或生产服务器可用。
- 服务器部署目录是 /root/bcihot。SITE_URL 是公开链接基础地址，宿主端口由 PORT 决定；配置和生产数据本轮只读，不启动 worker/模型或付费采集。

本地配置按任务书进入隔离审查；运营者口味、条款主体、信源启用和生产迁移仍见根目录 `BLOCKED.md`。

测试中的阶段标签和安全摘要是基于已读取原文的人工审核夹具：用于校验连续引文、条件范围、归一化和公开传输，不能当成模型会自动识别或拒绝临床/审批误写的证据。删除证据的用例证明不在原文中的引文会被丢弃；其中待核实/人体标签也由夹具明确给出。实际模型的阶段判断、过度主张拒绝和医学准确性尚未验收，当前提示词对此提出约束；框架不额外按标签执行医疗语义审核。
