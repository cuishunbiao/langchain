import "server-only";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";

const LOADER_MAP: Record<string, new (path: string) => { load(): Promise<Document[]> }> = {
  ".pdf": PDFLoader,
  ".txt": TextLoader,
  ".md": TextLoader,
};

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

export async function loadAndSplitDocument(filePath: string): Promise<Document[]> {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const LoaderClass = LOADER_MAP[ext];

  if (!LoaderClass) {
    throw new Error(`不支持的文件类型：${ext}，支持的类型：${Object.keys(LOADER_MAP).join(", ")}`);
  }

  const loader = new LoaderClass(filePath);
  const docs = await loader.load();
  return splitter.splitDocuments(docs);
}
