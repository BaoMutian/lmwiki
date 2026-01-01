# LMWiki - 大模型百科全书

探索、比较和评价各种大语言模型。LMWiki 提供全面的模型百科、跑分对比和社区评价。

## 项目结构

```
lmwiki/
├── llm-database/           # 模型数据管理
│   ├── llm_database.jsonl  # 模型数据 (JSONL 格式)
│   └── docs/               # 数据字段文档
└── web/                    # Next.js 前端项目
    ├── src/
    │   ├── app/            # 页面和 API
    │   ├── components/     # React 组件
    │   └── lib/            # 工具函数和数据库
    ├── prisma/             # 数据库 Schema
    └── data/               # SQLite 数据库
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + Shadcn/ui
- **图表**: Recharts
- **数据库**: PostgreSQL (Vercel Postgres) + Prisma ORM
- **动效**: Framer Motion
- **状态**: TanStack Query
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 配置 Vercel Postgres 数据库

```bash
# 安装 Vercel CLI (如果未安装)
npm i -g vercel

# 登录 Vercel
vercel login

# 链接项目
vercel link

# 创建 Postgres 数据库 (在 Vercel Dashboard > Storage)
# 然后拉取环境变量
vercel env pull .env.local
```

### 3. 初始化数据库

```bash
# 运行数据库迁移
npm run db:migrate

# 导入模型数据
npm run db:import
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 功能特性

### Phase 1: 模型百科 ✅

- [x] **全局搜索**: 模糊匹配名称、厂商、标签
- [x] **多维过滤**: 按模型类型、能力、家族、开发者筛选
- [x] **排序控制**: 发布日期、参数量、Arena Elo 等
- [x] **视图切换**: 网格/列表视图
- [x] **模型详情页**: 
  - 技术规格卡片
  - Benchmark 雷达图
  - 能力特性展示
  - 资源链接
  - 家族时间轴
- [x] **深色/浅色模式**
- [x] **响应式设计**
- [x] **骨架屏加载**

### Phase 2: 跑分实验室 (计划中)

- [ ] Benchmark 排行榜
- [ ] 多模型横向对比
- [ ] 历史趋势图表

### Phase 3: 社区评价 (计划中)

- [ ] 用户登录系统
- [ ] 1-5 星评分
- [ ] 短评/长评
- [ ] 标签系统

## 视觉设计

采用 Modern iOS/macOS Aesthetics 风格:

- Glassmorphism 毛玻璃效果
- 大圆角卡片设计
- 细腻的阴影和动效
- 深色模式优先

## 数据更新

模型数据存储在 `llm-database/llm_database.jsonl`，更新数据后重新运行导入：

```bash
npm run db:import
```

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run start      # 启动生产服务器
npm run lint       # 运行 ESLint
npm run db:import  # 导入 JSONL 数据
npm run db:migrate # 运行数据库迁移
npm run db:studio  # 打开 Prisma Studio
```

## License

MIT

