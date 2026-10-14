// BCIHOT 的分类、形态与阶段标签，以及信源主体和身份核验词典。
// 分类 key 是网址和公开接口的一部分；首版采用后保持稳定。

/** 网页类别；section 用于日报分节，guide 约束相邻领域的归类边界。 */
export const CATEGORIES = [
  { key: "hardware-acquisition", label: "硬件与采集", section: "技术与系统", guide: "电极、EEG、ECoG、神经脉冲记录、fNIRS、放大器、采集芯片、无线采集和多模态同步。芯片用于采集归这里；用于脉冲计算归类脑计算。" },
  { key: "decoding-signal", label: "解码与信号处理", section: "技术与系统", guide: "伪迹处理、特征、信号处理、跨被试或跨天解码、实时校准、言语与运动解码。新方法论文仍归这里并标论文/研究；以公开数据集或基准为核心的资源归数据集与基准。" },
  { key: "neuromodulation-closed-loop", label: "神经调控与闭环", section: "技术与系统", guide: "电、磁、光、超声刺激、DBS、BCI-FES、状态感知与响应控制。主要结论是患者临床结局时归临床与医疗；只做神经信号记录或解码时分别归硬件采集或解码。" },
  { key: "clinical-medical", label: "临床与医疗", section: "临床与医疗", guide: "患者研究、临床试验及其结果、安全性、随访、康复和适应证。受试者参与、试验登记、招募或有患者演示都不自动意味着疗效获证。" },
  { key: "interaction-consumer", label: "交互与消费", section: "应用与计算", guide: "辅助沟通、VR/AR、游戏、可穿戴交互和工作负荷等应用。纯肌电控制须明确标 EMG，不能称为读取脑信号；以患者治疗结局为主的报道归临床与医疗。" },
  { key: "neuromorphic-computing", label: "类脑计算与芯片", section: "应用与计算", guide: "神经形态芯片、脉冲计算、忆阻器、事件驱动硬件及其能耗和性能证据。普通 GPU 或通用计算产品不因名称含神经网络而归这里。" },
  { key: "brain-inspired-neuroscience", label: "脑启发与神经科学", section: "应用与计算", guide: "与脑机接口、神经信息处理或可计算模型有明确联系的回路机制、脑启发学习和模型研究。一般神经科学仅在正文明确关联本站方向时收录。" },
  { key: "datasets-benchmarks", label: "数据集与基准", feedLabel: "数据与基准", section: "数据与基准", guide: "以公开数据、实验协议、复现、基准和评测资源为核心；领域横跨 1–7 且主贡献无法归入其中时可归这里。普通方法论文仍按 1–7 归类并用论文/研究标形态，不能仅因使用数据集就归本类。" },
  { key: "industry", label: "产业与政策", section: "产业与政策", guide: "公司经营、融资、合作、标准、政策和监管事件。监管原件优先；公司声明保留‘公司称’。IDE、FDA Breakthrough 指定、NCT 登记或试验完成不能改写为注册获批或疗效证据。" },
  { key: "tools-practice-opinion", label: "工具、教程与观点", section: "实践与观点", guide: "可复用教程、工具发行、开源项目、方法综述与观点。新算法实验按 2 或 8 归类并标论文/研究；附代码不自动变成教程。", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/** BCIHOT 没有可统一计数的单一发布类型；报头不统计新设备或新模型。 */
export const RELEASE: { category: string; tag: string; unit: string } | null = null;

/** 周报/月报无需逐条引证的通用缩写，仅限领域常用词。 */
export const PLAIN_TERMS: readonly string[] = ["bci", "eeg", "ecog", "fnirs", "emg", "dbs", "fda", "nmpa", "nct"];

/** 内容理解和评分共享的内容类型枚举；每类的五维权重见 selection-score.md。 */
export const ITEM_TYPES = [
  "device_or_system_release", "algorithm_or_method", "research_paper", "dataset_or_benchmark",
  "tool_or_open_source", "tutorial_or_practice", "opinion_or_review", "industry_event", "policy_or_regulatory",
] as const;

/** 每篇资料的首个标签是其主领域类别；内容形态与证据/可用状态另标。 */
export const CATEGORY_TAGS = [
  "硬件与采集", "解码与信号处理", "神经调控与闭环", "临床与医疗", "交互与消费",
  "类脑计算与芯片", "脑启发与神经科学", "数据集与基准", "产业与政策", "工具、教程与观点",
] as const;

/** 标签轴彼此独立；缺少原文依据时应使用待核实标签，不从论文类型或设备名称推断阶段。 */
export const TOPIC_TAGS = [
  "设备/系统发布", "算法/方法", "论文/研究", "数据集/基准", "工具/开源", "教程/实践", "观点/综述", "行业动态", "政策/监管",
  "EEG", "ECoG", "皮层电位", "神经脉冲", "fNIRS", "混合BCI", "EMG（辅助模态）", "眼动（辅助模态）",
  "运动控制", "运动想象", "言语解码", "视觉", "P300", "SSVEP", "感觉反馈", "康复", "辅助沟通", "VR/AR", "可穿戴交互",
  "神经调控", "闭环", "侵入式", "非侵入式", "跨被试泛化", "实时解码", "类脑计算",
  "方法/仿真或离线评测", "动物实验", "人体实验", "小样本患者结果", "临床试验结果", "原型演示", "证据阶段待核实",
  "预印本", "期刊论文", "发表状态待核实", "试验招募", "试验许可", "注册获批", "商业供货", "真实部署", "可用状态待核实",
] as const;

/** 主要厂商、研究机构与项目的展示标签。 */
export const ENTITY_TAGS = [
  "Neuralink", "脑虎科技", "Paradromics", "BrainGate", "Synchron", "Precision Neuroscience", "强脑科技", "博睿康",
  "NeuroPace", "Blackrock Neurotech", "g.tec", "Brain Products", "Artinis", "中科院脑智卓越中心",
] as const;

/** 仅归一化内容形态和类别近义词；证据及可用状态不能靠同义词规则推断。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "设备发布": "设备/系统发布", "系统发布": "设备/系统发布", "算法": "算法/方法", "方法": "算法/方法",
  论文: "论文/研究", 研究: "论文/研究", paper: "论文/研究", papers: "论文/研究",
  数据集: "数据集/基准", 基准: "数据集/基准", benchmark: "数据集/基准", benchmarks: "数据集/基准",
  工具: "工具/开源", 开源: "工具/开源", 仓库: "工具/开源", repo: "工具/开源",
  教程: "教程/实践", 实践: "教程/实践", 指南: "教程/实践", 综述: "观点/综述", 观点: "观点/综述",
  公司动态: "行业动态", 融资: "行业动态", 合作: "行业动态", 政策: "政策/监管", 监管: "政策/监管",
};

/** 信源主体及领域内常见公司、机构别名。 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; otherNames?: string[] }> = {
  nature: { name: "Nature", displayTag: null, aliases: ["Nature", "Nature Portfolio"] },
  jne: { name: "Journal of Neural Engineering", displayTag: null, aliases: ["Journal of Neural Engineering", "JNE"] },
  "neuromorphic-engineering": { name: "Neuromorphic Computing and Engineering", displayTag: null, aliases: ["Neuromorphic Computing and Engineering", "NCE"] },
  arxiv: { name: "arXiv", displayTag: null, aliases: ["arXiv", "arXiv q-bio.NC", "arXiv cs.NE"] },
  biorxiv: { name: "bioRxiv", displayTag: null, aliases: ["bioRxiv"] },
  medrxiv: { name: "medRxiv", displayTag: null, aliases: ["medRxiv"] },
  gtec: { name: "g.tec medical engineering", displayTag: "g.tec", aliases: ["g.tec", "gtec", "g.tec medical engineering"] },
  "brain-products": { name: "Brain Products", displayTag: "Brain Products", aliases: ["Brain Products", "BrainProducts"] },
  artinis: { name: "Artinis Medical Systems", displayTag: "Artinis", aliases: ["Artinis", "Artinis Medical Systems"] },
  braingate: { name: "BrainGate", displayTag: "BrainGate", aliases: ["BrainGate", "BrainGate2"] },
  "ieee-spectrum": { name: "IEEE Spectrum", displayTag: null, aliases: ["IEEE Spectrum"] },
  "europe-pmc": { name: "Europe PMC", displayTag: null, aliases: ["Europe PMC", "Europe PubMed Central"] },
  neuralink: { name: "Neuralink", displayTag: "Neuralink", aliases: ["Neuralink"] },
  neuroxess: { name: "脑虎科技", displayTag: "脑虎科技", aliases: ["脑虎科技", "NeuroXess", "NeuroXess Technology"] },
  "cas-cebsit": { name: "中科院脑智卓越中心", displayTag: "中科院脑智卓越中心", aliases: ["中科院脑智卓越中心", "CEBSIT", "中国科学院脑科学与智能技术卓越创新中心"] },
  paradromics: { name: "Paradromics", displayTag: "Paradromics", aliases: ["Paradromics"] },
  mne: { name: "MNE-Python", displayTag: null, aliases: ["MNE-Python", "MNE Python"] },
  moabb: { name: "MOABB", displayTag: null, aliases: ["MOABB", "Mother of All BCI Benchmarks"] },
  braindecode: { name: "Braindecode", displayTag: null, aliases: ["Braindecode", "braindecode"] },
  brainflow: { name: "BrainFlow", displayTag: null, aliases: ["BrainFlow"] },
  synchron: { name: "Synchron", displayTag: "Synchron", aliases: ["Synchron", "Stentrode"] },
  "precision-neuro": { name: "Precision Neuroscience", displayTag: "Precision Neuroscience", aliases: ["Precision Neuroscience", "Precision Neuro"] },
  brainco: { name: "强脑科技", displayTag: "强脑科技", aliases: ["强脑科技", "BrainCo"] },
  neuracle: { name: "博睿康", displayTag: "博睿康", aliases: ["博睿康", "Neuracle"] },
  neuropace: { name: "NeuroPace", displayTag: "NeuroPace", aliases: ["NeuroPace", "RNS System"] },
  "blackrock-neurotech": { name: "Blackrock Neurotech", displayTag: "Blackrock Neurotech", aliases: ["Blackrock Neurotech", "Blackrock Microsystems"] },
  fda: { name: "U.S. Food and Drug Administration", displayTag: null, aliases: ["FDA", "U.S. Food and Drug Administration"] },
  nmpa: { name: "国家药品监督管理局", displayTag: null, aliases: ["NMPA", "国家药品监督管理局"] },
  "clinicaltrials-gov": { name: "ClinicalTrials.gov", displayTag: null, aliases: ["ClinicalTrials.gov", "NCT"] },
  miit: { name: "工业和信息化部", displayTag: null, aliases: ["工信部", "工业和信息化部", "MIIT"] },
};

/** 标题/摘要出现的相关企业主体必须在原文中也出现，降低把别家审批和能力张冠李戴的风险。 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "neuralink", name: "Neuralink", patterns: [/neuralink/i] },
  { id: "neuroxess", name: "脑虎科技 / NeuroXess", patterns: [/neuroxess|脑虎科技/i] },
  { id: "paradromics", name: "Paradromics", patterns: [/paradromics/i] },
  { id: "braingate", name: "BrainGate", patterns: [/\bbrain\s?gate2?\b/i] },
  { id: "synchron", name: "Synchron", patterns: [/synchron|stentrode/i] },
  { id: "precision-neuro", name: "Precision Neuroscience", patterns: [/precision\s+neuroscience|precision\s+neuro/i] },
  { id: "brainco", name: "强脑科技 / BrainCo", patterns: [/brainco|强脑科技/i] },
  { id: "neuracle", name: "博睿康 / Neuracle", patterns: [/neuracle|博睿康/i] },
  { id: "neuropace", name: "NeuroPace", patterns: [/neuropace|rns\s+system/i] },
  { id: "blackrock-neurotech", name: "Blackrock Neurotech", patterns: [/blackrock\s+(?:neurotech|microsystems)/i] },
  { id: "gtec", name: "g.tec", patterns: [/g\.tec|gtec/i] },
  { id: "brain-products", name: "Brain Products", patterns: [/brain\s?products/i] },
  { id: "artinis", name: "Artinis", patterns: [/artinis/i] },
  { id: "cas-cebsit", name: "中科院脑智卓越中心", patterns: [/\bcebsit\b|中科院脑智卓越中心|中国科学院脑科学与智能技术卓越创新中心/i] },
];

/** 明确的官方域名可辅助判定发布者；索引、期刊和托管平台不被当成研究主体。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "neuralink", domains: ["neuralink.com"] },
  { entityId: "neuroxess", domains: ["neuroxess.com"] },
  { entityId: "paradromics", domains: ["paradromics.com"] },
  { entityId: "synchron", domains: ["synchron.com"] },
  { entityId: "precision-neuro", domains: ["precisionneuro.io"] },
  { entityId: "brainco", domains: ["brainco.cn"] },
  { entityId: "neuracle", domains: ["neuracle.cn"] },
  { entityId: "neuropace", domains: ["neuropace.com"] },
  { entityId: "blackrock-neurotech", domains: ["blackrockneurotech.com"] },
  { entityId: "gtec", domains: ["gtec.at"] },
  { entityId: "brain-products", domains: ["brainproducts.com"] },
  { entityId: "artinis", domains: ["artinis.com"] },
];

/** 原文中的这些官方中文写法也能确认对应主体。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "neuroxess", pattern: /脑虎科技/ },
  { entityId: "brainco", pattern: /强脑科技/ },
  { entityId: "neuracle", pattern: /博睿康/ },
];
