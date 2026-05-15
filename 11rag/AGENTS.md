# RAG 智能问答系统 — 项目学习指南

## 一、项目概述

这是一个基于 **Next.js + LangChain + Ollama** 的本地 RAG（Retrieval-Augmented Generation，检索增强生成）问答系统。

核心能力：上传 PDF / TXT / MD 文档 → 自动分块 → 向量化存储 → 用户提问时检索相关文档片段 → 结合上下文让大模型生成回答。

**所有推理和 Embedding 都在本地 Ollama 完成，无需外部 API Key。**

---

## 二、技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Next.js (App Router) | 16.2.6 | 前后端一体 |
| UI | React + Tailwind CSS v4 | 19.2 / 4.x | 客户端渲染 |
| RAG 编排 | LangChain (core / classic / community / ollama / textsplitters) | 1.x | 文档加载、分块、向量化、检索、Prompt 组装 |
| Embedding 模型 | Ollama `all-minilm:33m` | — | 本地运行，把文本转为向量 |
| 聊天模型 | Ollama `qwen3:14b` | — | 本地运行，生成回答 |
| 文档解析 | pdf-parse | 2.4.5 | PDF 文本提取 |
| 包管理 | pnpm | — | — |
| 语言 | TypeScript 5 | — | 严格模式 |

---

## 三、目录结构

```
11rag/
├── app/                          # Next.js App Router 路由目录
│   ├── layout.tsx                # 根布局（HTML Shell、字体、全局样式）
│   ├── page.tsx                  # ★ 首页 — 聊天主界面（客户端组件）
│   ├── globals.css               # 全局样式（Tailwind v4 + CSS 变量 + 暗色模式）
│   └── api/                      # 后端 API 路由（均为 Node.js 运行时）
│       ├── chat/route.ts         # ★ POST /api/chat — RAG 问答（检索 + 流式生成）
│       ├── upload/route.ts       # ★ POST /api/upload — 文件上传 → 分块 → 向量化
│       └── search/route.ts       #   GET  /api/search?q= — 调试用：纯检索返回 JSON
│
├── components/                   # 前端 UI 组件（均为客户端组件）
│   ├── chat-window.tsx           # 聊天消息列表（气泡样式、来源标签、加载动画）
│   ├── chat-input.tsx            # 输入框（Enter 发送、Shift+Enter 换行）
│   └── file-upload.tsx           # 文件上传（进度条、已上传列表）
│
├── lib/rag/                      # ★ RAG 核心逻辑（均标记 server-only，仅服务端可用）
│   ├── embeddings.ts             # Embedding 模型实例（OllamaEmbeddings）
│   ├── model.ts                  # 聊天模型实例（ChatOllama）
│   ├── splitter.ts               # 文档加载器 + 文本分块器
│   ├── vectorstore.ts            # 向量存储注册表（进程级 Map，内存存储）
│   └── search.ts                 # 相似度检索（遍历所有向量库、打分、过滤、排序）
│
├── public/                       # 静态资源（SVG 图标等）
├── package.json                  # 依赖声明 + 脚本
├── pnpm-lock.yaml                # pnpm 锁文件
├── next.config.ts                # Next.js 配置（serverExternalPackages）
├── tsconfig.json                 # TypeScript 配置（@/* 路径别名）
├── eslint.config.mjs             # ESLint 配置
├── postcss.config.mjs            # PostCSS + Tailwind v4 插件
└── AGENTS.md                     # 本文件
```

---

## 四、核心数据流（RAG 全链路）

### 4.1 上传阶段

```
用户选择文件（.pdf / .txt / .md）
    │
    ▼
[components/file-upload.tsx]  XHR → POST /api/upload（FormData）
    │
    ▼
[app/api/upload/route.ts]
    ├─ 1. 保存文件到磁盘 uploads/ 目录
    ├─ 2. 调用 loadAndSplitDocument() 加载 + 分块
    │      └─ [lib/rag/splitter.ts]
    │           ├─ 根据扩展名选择 Loader（PDFLoader / TextLoader）
    │           └─ RecursiveCharacterTextSplitter(500字/块, 50字重叠)
    ├─ 3. MemoryVectorStore.fromDocuments(chunks, embeddings)
    │      └─ [lib/rag/embeddings.ts] Ollama all-minilm:33m 生成向量
    └─ 4. vectorStoreMap.set(filename, store) 存入内存 Map
```

### 4.2 问答阶段

```
用户输入问题 → Enter 发送
    │
    ▼
[app/page.tsx]  fetch → POST /api/chat（JSON: { messages, question }）
    │
    ▼
[app/api/chat/route.ts]
    ├─ 1. searchRelevantDocs(question)
    │      └─ [lib/rag/search.ts]
    │           ├─ 遍历 vectorStoreMap 中的每个向量库
    │           ├─ similaritySearchWithScore(question, TOP_K=4)
    │           ├─ 过滤 score >= 0.3 的结果
    │           └─ 按 score 降序排列返回
    │
    ├─ 2. 组装 Prompt
    │      ├─ 有检索结果 → PROMPT_WITH_CONTEXT（含参考文档 + 历史 + 问题）
    │      └─ 无检索结果 → PROMPT_WITHOUT_CONTEXT（仅历史 + 问题）
    │
    ├─ 3. LangChain 管道流式生成
    │      PromptTemplate.pipe(ChatOllama).pipe(StringOutputParser).stream()
    │      └─ [lib/rag/model.ts] Ollama qwen3:14b
    │
    └─ 4. 返回 ReadableStream + 响应头
           ├─ X-Has-Context: "true" / "false"（是否使用了文档上下文）
           └─ X-Sources: "a.pdf,b.txt"（来源文件名，逗号分隔）

    │
    ▼
[app/page.tsx]  reader.read() 逐块读取 → 实时更新 assistant 消息气泡
    │
    ▼
[components/chat-window.tsx]  渲染消息列表 + 来源标签
```

---

## 五、关键文件详解

### 5.1 `app/page.tsx` — 首页（聊天主控）

- **"use client"** 客户端组件，管理全局聊天状态
- **状态**：`messages`（消息数组）、`isLoading`（加载中）、`assistantIndexRef`（流式更新时定位助手消息位置）
- **handleSend 流程**：追加用户消息 → 创建空助手占位 → fetch 流式请求 → 逐块拼接内容 → 流结束后写入 hasContext/sources

### 5.2 `app/api/chat/route.ts` — RAG 问答 API

- 两套 PromptTemplate：有上下文版 / 无上下文版
- LangChain `.pipe()` 链：`PromptTemplate → ChatOllama → StringOutputParser`
- 流式输出：将 AsyncIterable 转为 Web ReadableStream 返回

### 5.3 `app/api/upload/route.ts` — 文件上传 API

- FormData 接收文件 → 写入 `uploads/` → 加载分块 → Embedding → 存入 vectorStoreMap
- **注意**：内存存储，服务重启后数据丢失

### 5.4 `lib/rag/splitter.ts` — 文档分块

- 查表法选择 Loader（`LOADER_MAP`：`.pdf` → PDFLoader，`.txt/.md` → TextLoader）
- `RecursiveCharacterTextSplitter`：每块 500 字符，相邻块重叠 50 字符

### 5.5 `lib/rag/search.ts` — 向量检索

- 遍历所有文件的向量库，每个库取 TOP_K=4 个最相似结果
- 过滤 score >= 0.3（余弦相似度阈值）
- 合并后按分数降序排列

### 5.6 `lib/rag/vectorstore.ts` — 向量存储注册表

- 进程级 `Map<string, MemoryVectorStore>`，key 为文件名
- 纯内存实现，适合学习演示

### 5.7 `lib/rag/embeddings.ts` / `lib/rag/model.ts`

- 分别创建 Ollama Embedding 实例和 Chat 实例
- 均标记 `import "server-only"` 防止被打包到客户端

---

## 六、前置条件（运行项目前）

1. **安装 Ollama**：https://ollama.ai
2. **拉取模型**：
   ```bash
   ollama pull all-minilm:33m    # Embedding 模型
   ollama pull qwen3:14b          # 聊天模型
   ```
3. **确保 Ollama 运行**：默认监听 `http://localhost:11434`
4. **安装依赖 + 启动**：
   ```bash
   pnpm install
   pnpm dev
   ```

---

## 七、核心概念速查

| 概念 | 解释 |
|------|------|
| **RAG** | 检索增强生成。先从文档库检索相关片段，再把片段作为上下文喂给大模型回答，解决大模型知识截止 / 幻觉问题 |
| **Embedding** | 把文本转为高维向量（如 384 维），语义相近的文本向量距离更近 |
| **Vector Store** | 存储文档向量的数据库，支持按相似度检索。本项目用 `MemoryVectorStore`（内存版） |
| **Text Splitter** | 把长文档切成小块（chunk），每块独立 Embedding。`RecursiveCharacterTextSplitter` 按字符数递归切割 |
| **Chunk Overlap** | 相邻块之间重叠的字符数（50），避免关键信息被切断 |
| **Similarity Search** | 把用户问题也转为向量，在向量库中找最相似的 K 个文档块 |
| **PromptTemplate** | LangChain 的模板引擎，用 `{variable}` 占位，运行时填充 |
| **`.pipe()` 链** | LangChain 的管道组合：`Prompt → LLM → OutputParser`，像流水线一样串联处理步骤 |
| **Streaming** | 大模型生成是逐 token 的，流式传输让前端能实时显示，不用等全部生成完 |
| **server-only** | Next.js 约定，标记的模块只能在服务端 import，防止敏感逻辑/大依赖泄露到客户端 |

---

## 八、学习路线建议

1. **先跑起来**：按第六节步骤启动，上传一个 PDF，问几个问题，感受 RAG 效果
2. **看前端交互**：`page.tsx` → `chat-input.tsx` → `chat-window.tsx` → `file-upload.tsx`
3. **看后端 API**：`api/upload/route.ts`（上传链路） → `api/chat/route.ts`（问答链路）
4. **深入 RAG 核心**：`lib/rag/splitter.ts` → `embeddings.ts` → `vectorstore.ts` → `search.ts` → `model.ts`
5. **动手改参数**：调整 `chunkSize`、`chunkOverlap`、`TOP_K`、`SCORE_THRESHOLD`，对比效果差异
