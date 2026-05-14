import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { loadAndSplitDocument } from "@/lib/rag/splitter";
import { embeddings } from "@/lib/rag/embeddings";
import { vectorStoreMap, MemoryVectorStore } from "@/lib/rag/vectorstore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未找到上传文件" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, Buffer.from(bytes));

    const chunks = await loadAndSplitDocument(filePath);
    const store = await MemoryVectorStore.fromDocuments(chunks, embeddings);
    vectorStoreMap.set(file.name, store);

    return NextResponse.json({ filename: file.name, chunkCount: chunks.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
