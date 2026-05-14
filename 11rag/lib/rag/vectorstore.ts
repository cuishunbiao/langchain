import "server-only";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

// 进程级单例 Map，key 为文件名，value 为对应向量库
// 注意：服务重启后数据丢失，适合演示场景
export const vectorStoreMap = new Map<string, MemoryVectorStore>();
export { MemoryVectorStore };
