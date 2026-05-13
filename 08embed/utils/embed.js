import { Embeddings } from "@langchain/core/embeddings";
import { runWithConcurrency } from "./concurrency.js";

export class NomicEmbeddings extends Embeddings {
  constructor(concurrency = 3) {
    super();
    this.model = "nomic-embed-text";
    this.apiUrl = "http://localhost:11434/api/embeddings";
    this.concurrency = concurrency;
  }

  /**
   * 对单个文本做嵌入操作，这是一个内部方法
   * @param {*} text 单个文本
   */
  async #fetchEmbedding(text) {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    });
    const result = await res.json();
    return result.embedding;
  }

  /**
   * 对单个文本做嵌入操作
   * @param {*} text
   */
  async embedQuery(text) {
    return await this.#fetchEmbedding(text);
  }

  /**
   * 对一组文本做嵌入操作
   * @param {*} documents
   */
  async embedDocuments(documents) {
    const results = Array.from({ length: documents.length }); // 存放结果的数组

    // 添加一个并发的探针
    let active = 0; // 并发数
    let maxActive = 0; // 最大并发数
    const t0 = performance.now();

    await runWithConcurrency(
      documents,
      async (text, idx) => {
        // 开始了一个任务，需要对并发数做一个计数
        active++;
        maxActive = Math.max(maxActive, active);
        console.log(
          `[start] #${idx} +${(performance.now() - t0).toFixed(
            0
          )}ms  active=${active}`
        );

        try {
          results[idx] = await this.#fetchEmbedding(text);
        } catch (err) {
          results[idx] = err;
        } finally {
          // 任务结束
          active--;
          console.log(
            `[end  ] #${idx} +${(performance.now() - t0).toFixed(
              0
            )}ms  active=${active}`
          );
        }
      },
      this.concurrency
    );

    return results;
  }
}
