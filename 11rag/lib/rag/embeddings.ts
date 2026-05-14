import "server-only";
import { OllamaEmbeddings } from "@langchain/ollama";

export const embeddings = new OllamaEmbeddings({
  model: "all-minilm:33m",
  baseUrl: "http://localhost:11434",
});
