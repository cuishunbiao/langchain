/**
 * 向量相似度检索
 *
 * 核心逻辑：
 *  1. 遍历 vectorStoreMap 中的所有向量库（每个文件一个库）
 *  2. 对每个库执行 similaritySearchWithScore，取 TOP_K 个最相似结果
 *  3. 过滤掉相似度分数低于 SCORE_THRESHOLD 的结果
 *  4. 合并所有库的结果，按分数降序排列返回
 *
 * 关键参数：
 *  - TOP_K = 4：每个向量库最多返回 4 个匹配结果
 *  - SCORE_THRESHOLD = 0.3：余弦相似度阈值，低于此值视为不相关
 *    （调大 → 更严格/结果更少，调小 → 更宽松/结果更多）
 *
 * "server-only" 确保此模块不会被打包到客户端 bundle 中。
 */
import "server-only";
import { vectorStoreMap } from "./vectorstore";

const TOP_K = 4;
const SCORE_THRESHOLD = 0.3;

export interface SearchResult {
  pageContent: string;
  score: number;
  /** 来源文件名 */
  source?: string;
}

/**
 * 在所有已上传文档中检索与问题最相关的文本片段
 * @param question 用户问题（会被自动转为向量进行相似度比较）
 */
export async function searchRelevantDocs(question: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  for (const [filename, store] of vectorStoreMap.entries()) {
    // similaritySearchWithScore 返回 [Document, score][] 数组
    const hits = await store.similaritySearchWithScore(question, TOP_K);
    for (const [doc, score] of hits) {
      if (score >= SCORE_THRESHOLD) {
        results.push({ pageContent: doc.pageContent, score, source: filename });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
