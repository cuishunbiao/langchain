/**
 * GET /api/search?q=xxx — 纯检索调试接口
 *
 * 不调用大模型生成回答，仅执行向量检索并返回匹配的文档片段 JSON。
 * 适合开发调试时验证：
 *  - 文档是否正确入库
 *  - 检索阈值和 TOP_K 是否合理
 *  - 各文档片段的相似度分数
 *
 * 返回格式：{ docs: [{ pageContent, score, source }] }
 */
import { NextRequest, NextResponse } from "next/server";
import { searchRelevantDocs } from "@/lib/rag/search";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "缺少参数 q" }, { status: 400 });
  }

  const docs = await searchRelevantDocs(q);
  return NextResponse.json({ docs });
}
