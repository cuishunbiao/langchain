import "server-only";
import { vectorStoreMap } from "./vectorstore";

const TOP_K = 4;
const SCORE_THRESHOLD = 0.3;

export interface SearchResult {
  pageContent: string;
  score: number;
  source?: string;
}

export async function searchRelevantDocs(question: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  for (const [filename, store] of vectorStoreMap.entries()) {
    const hits = await store.similaritySearchWithScore(question, TOP_K);
    for (const [doc, score] of hits) {
      if (score >= SCORE_THRESHOLD) {
        results.push({ pageContent: doc.pageContent, score, source: filename });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
