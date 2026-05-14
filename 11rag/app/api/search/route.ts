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
