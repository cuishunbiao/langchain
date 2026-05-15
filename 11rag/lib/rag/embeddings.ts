/**
 * Embedding 模型实例
 *
 * 使用 Ollama 本地运行的 all-minilm:33m 模型，将文本转为 384 维向量。
 * 应用场景：
 *  - 上传文档时：对每个文本块生成 Embedding 向量，存入 MemoryVectorStore
 *  - 检索时：将用户问题转为向量，与库中向量计算余弦相似度
 *
 * "server-only" 确保此模块不会被打包到客户端 bundle 中。
 */
import "server-only";
import { OllamaEmbeddings } from "@langchain/ollama";

export const embeddings = new OllamaEmbeddings({
  model: "all-minilm:33m",
  baseUrl: "http://localhost:11434",
});
