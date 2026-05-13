import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const loader = new TextLoader("data/kong.txt");
const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 0,
});
const chunks = await textSplitter.splitDocuments(docs);

async function getEmbedding(text) {
    const res = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text,
      }),
    });
    const result = await res.json();
    return result.embedding;
}

const results = []
for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.pageContent);
    results.push({
        ...docs,
        embedding
    });
}
console.log(results);
