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
   * 内部方法，用于调用嵌入模型做嵌入操作
   * @param {*} text 要做嵌入的文本内容
   * @returns
   */
  async #fetchEmbedding(text) {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });
    if (!res.ok) throw new Error(`嵌入操作失败☹️: ${res.status}`);
    const data = await res.json();
    return data.embedding;
  }

  /**
   * 单个文本做嵌入操作
   * @param {*} text
   * @returns
   */
  async embedQuery(text) {
    return await this.#fetchEmbedding(text);
  }

  /**
   * 多个文本做嵌入操作
   * @param {*} texts
   * @returns
   */
  async embedDocuments(texts) {
    const results = Array.from({ length: texts.length });

    await runWithConcurrency(
      texts,
      async (text, idx) => {
        try {
          results[idx] = await this.#fetchEmbedding(text);
        } catch (e) {
          results[idx] = e;
        }
      },
      this.concurrency
    );

    return results;
  }
}
