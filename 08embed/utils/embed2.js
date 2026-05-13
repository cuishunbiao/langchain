import { Embeddings } from "@langchain/core/embeddings";
import pLimit from "p-limit";

export class NomicEmbeddings extends Embeddings {
  constructor(concurrency = 3) {
    super();
    this.model = "nomic-embed-text";
    this.apiUrl = "http://localhost:11434/api/embeddings";
    this.concurrency = concurrency;
    this.limit = pLimit(concurrency);
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
    return await Promise.all(
      documents.map((text) => this.limit(() => this.#fetchEmbedding(text)))
    );
  }
}
