/**
 * 文档加载 + 文本分块
 *
 * 职责：根据文件类型选择合适的 Loader 读取内容，再用 TextSplitter 切成小块。
 *
 * 支持的文件类型（查表法，LOADER_MAP）：
 *  - .pdf → PDFLoader（内部使用 pdf-parse 提取文本）
 *  - .txt → TextLoader（纯文本读取）
 *  - .md  → TextLoader（Markdown 按纯文本读取）
 *
 * 分块策略：RecursiveCharacterTextSplitter
 *  - chunkSize: 500  — 每块最多 500 字符
 *  - chunkOverlap: 50 — 相邻块重叠 50 字符，避免语义被切断
 *  - 递归切割顺序：先按 \n\n → \n → 空格 → 单字符，尽量保持段落完整
 *
 * "server-only" 确保此模块不会被打包到客户端 bundle 中。
 */
import "server-only";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";

/** 文件扩展名 → Loader 类的映射表，新增文件类型只需加一行 */
const LOADER_MAP: Record<string, new (path: string) => { load(): Promise<Document[]> }> = {
  ".pdf": PDFLoader,
  ".txt": TextLoader,
  ".md": TextLoader,
};

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

/**
 * 加载并分割文档
 * @param filePath 磁盘上的文件绝对路径
 * @returns 分块后的 Document 数组，每个 Document 包含 pageContent 和 metadata
 */
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
