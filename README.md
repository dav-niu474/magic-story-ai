# Magic Story AI

**AI 驱动的多 Agent 协作小说创作平台** — 基于 Next.js 16 + TypeScript + Prisma，6 个专业 AI Agent 协同工作，从世界观构建到章节生成、审校、去 AI 味，一站式完成网络小说创作。

---

## 在线体验

**Live Demo**: [https://my-project-five-eta-85.vercel.app](https://my-project-five-eta-85.vercel.app)

---

## 核心特性

### 🤖 6 大 AI Agent 分工协作

| Agent | 职责 |
|-------|------|
| 🎯 策划 Agent | 故事结构设计、主题提炼、冲突布局 |
| ✍️ 写手 Agent | 大纲→摘要→正文两阶段生成，单章 2000-4000 字 |
| 📝 编辑 Agent | 文本润色、去 AI 味处理、文学性提升 |
| 🔍 评审 Agent | 八维度评分（满分 80），输出结构化审稿意见 |
| 👤 角色 Agent | 角色设计、关系网络、成长弧线、OOC 检测 |
| 🌍 世界观 Agent | 物理法则、力量体系、社会结构、历史沿革、一致性校验 |

### 📖 12 种网文类型预设

玄幻系统修仙 / 都市重生 / 脑洞网文 / 都市修仙 / 都市高武 / 末日系统 / 霸总 / 后悔流 / 无敌文 / 历史架空 / 东方玄幻 / 策略经营

### 🖥️ 7 大功能视图

| 视图 | 功能 |
|------|------|
| 工作台 | 项目概览、字数统计、Agent 状态、最近活动 |
| 世界观设定 | 多维度世界观条目（背景/力量体系/势力/地理/历史/规则） |
| 角色管理 | 角色卡片、关系网络图、性格/外貌/背景/弧线 |
| 大纲规划 | 版本历史、情感规划指引、全局大纲编辑 |
| 章节创作 | 两阶段 AI 生成、情感弧线设定、钩子系统、实时预览 |
| 追踪面板 | 角色状态追踪、伏笔管理、时间线、关系变化 |
| 提示词工坊 | 变量替换系统、类型模板、提示词预览 |

### 🔥 特色功能

- **两阶段内容生成**：大纲 → AI 生成摘要 → AI 展开全文，精确控制情节走向
- **实时预览面板**：右侧同步渲染排版效果，对话高亮、段落缩进、心理描写斜体
- **去 AI 味分析**：6 维度雷达图（禁用词密度/并列句式/心理直白/节奏均匀/对话同质/结尾升华），一键 AI 修复
- **对抗评审**：4 视角并行审稿（结构/角色/叙事/一致性），S1-S4 严重度分级，冲突检测
- **项目向导**：3 步种子→扩展→验证，自动生成角色、大纲、世界观
- **流式 AI 响应**：全量 SSE 流式输出，支持中断控制
- **TXT 导出**：一键导出完整小说文本
- **深色主题**：琥珀金 + 青色调配色，沉浸式写作氛围

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| 语言 | TypeScript 5 |
| 数据库 | Prisma + SQLite（可迁移至 PostgreSQL/MySQL） |
| UI | shadcn/ui + Radix UI + Tailwind CSS 4 |
| 动画 | Framer Motion |
| 状态管理 | Zustand |
| 图表 | Recharts |
| AI 集成 | z-ai-web-dev-sdk（SSE 流式） |
| 图标 | Lucide React |

---

## 快速开始

### 环境要求

- Node.js 18+
- npm / pnpm / bun

### 安装

```bash
# 克隆仓库
git clone https://github.com/dav-niu474/magic-story-ai.git
cd magic-story-ai

# 安装依赖
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

### 环境变量

创建 `.env` 文件：

```env
# SQLite 数据库路径（本地开发）
DATABASE_URL=file:./dev.db
```

部署到 Vercel 时，在项目设置中添加 `DATABASE_URL` 环境变量。如需持久化存储，建议使用 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) 或 [Turso](https://turso.tech/)。

---

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 主页面（侧边栏 + 内容区 + Agent 面板）
│   ├── layout.tsx            # 根布局
│   ├── globals.css           # 全局样式 + 预览面板样式
│   └── api/
│       ├── ai/route.ts       # AI 流式接口 (SSE)
│       ├── projects/         # 项目 CRUD
│       ├── chapters/         # 章节 CRUD
│       ├── characters/       # 角色 CRUD
│       ├── relationships/    # 角色关系
│       ├── world-settings/   # 世界观条目
│       ├── outlines/         # 大纲管理
│       ├── prompts/          # 提示词模板
│       ├── foreshadowings/   # 伏笔追踪
│       ├── story-states/     # 故事状态快照
│       ├── agent-logs/       # Agent 日志
│       └── export/           # TXT 导出
├── components/
│   ├── dashboard.tsx         # 工作台视图
│   ├── world-setup.tsx       # 世界观设定视图
│   ├── character-manager.tsx # 角色管理视图
│   ├── outline-editor.tsx    # 大纲编辑视图
│   ├── chapter-editor.tsx    # 章节创作视图（两阶段生成）
│   ├── chapter-preview.tsx   # 实时预览面板
│   ├── tracking-panel.tsx    # 追踪面板
│   ├── prompt-lab.tsx        # 提示词工坊
│   ├── settings-panel.tsx    # 设置面板
│   ├── agent-chat.tsx        # Agent 对话面板
│   ├── anti-ai-panel.tsx     # 去 AI 味分析
│   ├── adversarial-review.tsx# 对抗评审
│   ├── project-wizard.tsx    # 项目创建向导
│   ├── sidebar.tsx           # 侧边栏导航
│   └── ui/                   # shadcn/ui 组件库
├── lib/
│   ├── store.ts              # Zustand 状态管理
│   ├── anti-ai-words.ts      # 去 AI 味词库 & 分析引擎
│   ├── genre-templates.ts    # 12 种类型预设模板
│   ├── variable-resolver.ts  # 提示词变量替换
│   └── context-window.ts     # 上下文窗口管理
└── prisma/
    └── schema.prisma         # 数据模型定义
```

---

## 数据模型

```
Project ─┬── WorldSetting        (世界观条目)
         ├── Character           (角色)
         │    └── CharacterRelationship (角色关系)
         ├── Outline             (大纲版本)
         ├── Chapter             (章节)
         │    ├── StoryState     (故事状态快照)
         │    └── Foreshadowing (伏笔)
         ├── PromptTemplate      (提示词模板)
         └── AgentLog            (Agent 日志)
```

---

## 部署

### Vercel（推荐）

1. Fork 或导入本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量 `DATABASE_URL`
4. 部署完成

### 自托管

```bash
# 构建
npm run build

# 启动生产服务器
npm run start
```

---

## 致谢

- 原始灵感来源：[wfcz10086/AI-automatically-generates-novels](https://github.com/wfcz10086/AI-automatically-generates-novels)
- UI 组件：[shadcn/ui](https://ui.shadcn.com/)
- AI SDK：[z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk)

---

## License

MIT
