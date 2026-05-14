import "server-only";
import { ChatOllama } from "@langchain/ollama";

export const chatOllama = new ChatOllama({
  model: "qwen3:14b",
  baseUrl: "http://localhost:11434",
  temperature: 0.7,
  think: false,
});
