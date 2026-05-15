/**
 * 向量存储注册表
 *
 * 使用进程级 Map 管理所有已上传文件的向量库：
 *  - key: 文件名（如 "report.pdf"）
 *  - value: 该文件对应的 MemoryVectorStore 实例
 *
 * MemoryVectorStore 是 LangChain 提供的内存向量库实现：
 *  - 存储方式：纯内存数组，不持久化
 *  - 检索方式：暴力遍历计算余弦相似度（适合小规模数据）
 *  - 重要限制：服务重启后所有数据丢失，仅适合学习/演示场景
 *
 * 生产环境应替换为持久化方案（如 Chroma、Pinecone、pgvector 等）。
 *
 * "server-only" 确保此模块不会被打包到客户端 bundle 中。
 */
import "server-only";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

export const vectorStoreMap = new Map<string, MemoryVectorStore>();
export { MemoryVectorStore };
