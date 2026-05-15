/**
 * 聊天大模型实例
 *
 * 使用 Ollama 本地运行的 qwen3:14b 模型进行对话生成。
 * - temperature: 0.7 — 控制生成随机性（0=确定性，1=最随机）
 * - think: false — 关闭 qwen3 的思维链输出，只返回最终回答
 *
 * 在 chat API 中通过 LangChain .pipe() 管道调用：
 *   PromptTemplate → chatOllama → StringOutputParser
 *
 * "server-only" 确保此模块不会被打包到客户端 bundle 中。
 */
import "server-only";
import { ChatOllama } from "@langchain/ollama";

export const chatOllama = new ChatOllama({
  model: "qwen3:14b",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
  think: false,
});
