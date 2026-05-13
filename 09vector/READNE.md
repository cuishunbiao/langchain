# 内存向量数据库

## 创建内存

```
const store = new MemoryVectorStore()
```
会输出
```
cuishunbiao ~/study/langchain/09vector % node index.js
MemoryVectorStore {
  lc_serializable: false,
  lc_kwargs: {},
  lc_namespace: [ 'langchain', 'vectorstores', 'memory' ],
  embeddings: undefined,
  memoryVectors: [],
  similarity: [Function: cosine]
}
```
在添加文档的时候，会自动触发一个「嵌入」，需要我们指定一个嵌入工具。

- embeddings: 嵌入工具；
- memoryVectors：存储的内存向量；

## 指定嵌入类
我们来指定一个嵌入类：NomicEmbeddings，会得到实例对象。
```
cuishunbiao ~/study/langchain/09vector % node index.js
MemoryVectorStore {
  lc_serializable: false,
  lc_kwargs: {},
  lc_namespace: [ 'langchain', 'vectorstores', 'memory' ],
  embeddings: NomicEmbeddings {
    caller: AsyncCaller {
      maxConcurrency: Infinity,
      maxRetries: 6,
      onFailedAttempt: [Function: defaultFailedAttemptHandler],
      queue: [PQueue]
    },
    model: 'nomic-embed-text',
    apiUrl: 'http://localhost:11434/api/embeddings',
    concurrency: 4
  },
  memoryVectors: [],
  similarity: [Function: cosine]
}
```

## 存储
```
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 0,
});
const splittedDocs = await splitter.splitDocuments(docs);


await store.addDocuments(splittedDocs);

console.log(store.memoryVectors);
```
现在内存仓库已经有值了。

## 检索（返回最相似的内容）

```
const retriever = vectorstore.asRetriever({
  k: 4,
  searchType: "mmr",
  searchKwargs: { fetchK: 20, lambda: 0.5 },
  filter: (doc) => doc.metadata?.source?.endsWith("data/kong.txt"),
  tags: ["demo", "kong"],
  metadata: { lesson: "RAG-intro" },
  verbose: true,
});
```
- k：每次查询返回的文档条数；不填默认 4。asRetriever(2) 的数字简写等价于 { k: 2 }。

- searchType：检索策略：

    - "similarity"（默认）：按向量相似度排序返回前 k 条；
    - "mmr"：最大边际相关性（Maximal Marginal Relevance），在相关性与多样性之间折中。
    - searchKwargs：MMR 的细化参数，仅当 searchType: "mmr" 时生效

- fetchK：先抓取的候选集合规模（越大，MMR 可选空间越大）
- lambda：0～1 的权衡系数；0 更偏向多样性、1 更偏向相关性
- filter：用于预筛候选文档，返回 true 的文档才参与检索。
- callbacks：检索过程中的回调钩子（开始/结束/错误等），与 LangChain 的可观测性机制对接。
- tags：给该检索器打标签，便于在日志/跟踪里区分。
- metadata：附加的上下文信息，会随运行一起记录，便于审计与调试。
- verbose：是否开启详细日志，默认 false。
另外配置项也支持数字简写，方法签名如下：
```
asRetriever(kOrFields?, filter?, callbacks?, tags?, metadata?, verbose?)
```
