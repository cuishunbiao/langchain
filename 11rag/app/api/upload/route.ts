/**
 * POST /api/upload — 文件上传 + 向量化 API
 *
 * 完整流程：
 *  1. 从 FormData 中获取上传文件
 *  2. 将文件写入磁盘 uploads/ 目录（用于后续 Loader 读取）
 *  3. loadAndSplitDocument：根据文件类型选择 Loader 加载内容，再用 TextSplitter 切块
 *  4. MemoryVectorStore.fromDocuments：对每个文档块调用 Embedding 模型生成向量，存入内存向量库
 *  5. vectorStoreMap.set：以文件名为 key 注册到全局 Map，后续检索时会遍历此 Map
 *
 * 注意事项：
 *  - vectorStoreMap 是进程级内存存储，服务重启后所有已上传文档数据丢失
 *  - 同名文件重复上传会覆盖旧的向量库
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { loadAndSplitDocument } from "@/lib/rag/splitter";
import { embeddings } from "@/lib/rag/embeddings";
import { vectorStoreMap, MemoryVectorStore } from "@/lib/rag/vectorstore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Step 1: 从 multipart/form-data 中提取文件
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未找到上传文件" }, { status: 400 });
    }

    // Step 2: 保存到磁盘（recursive: true 确保 uploads/ 目录存在）
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, Buffer.from(bytes));

    // Step 3: 加载文件内容 + 按 500 字符分块（重叠 50 字符）
    const chunks = await loadAndSplitDocument(filePath);

    // Step 4: 对所有文档块批量生成 Embedding 向量，创建内存向量库
    const store = await MemoryVectorStore.fromDocuments(chunks, embeddings);

    // Step 5: 注册到全局 Map，检索时通过此 Map 遍历所有文件的向量库
    vectorStoreMap.set(file.name, store);

    return NextResponse.json({ filename: file.name, chunkCount: chunks.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
