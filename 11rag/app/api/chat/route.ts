import { NextRequest, NextResponse } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatOllama } from "@/lib/rag/model";
import { searchRelevantDocs } from "@/lib/rag/search";

export const runtime = "nodejs";

const PROMPT_WITH_CONTEXT = PromptTemplate.fromTemplate(`
你是一个专业的问答助手。请根据以下参考文档内容，精准回答用户的问题。
如果文档中没有直接相关的信息，请如实说明并给出你的最佳推断。

参考文档：
{context}

对话历史：
{chatHistory}

用户问题：{question}

请给出详细、准确的回答：
`);

const PROMPT_WITHOUT_CONTEXT = PromptTemplate.fromTemplate(`
你是一个智能助手，请根据对话历史和用户问题给出精准、有帮助的回答。

对话历史：
{chatHistory}

用户问题：{question}

请给出详细、准确的回答：
`);

export async function POST(req: NextRequest) {
  try {
    const { messages, question } = await req.json() as {
      messages: { role: string; content: string }[];
      question: string;
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "问题不能为空" }, { status: 400 });
    }

    const docs = await searchRelevantDocs(question);
    const hasContext = docs.length > 0;

    const chatHistory = messages
      .map((m) => `${m.role === "user" ? "用户" : "助手"}：${m.content}`)
      .join("\n");

    const outputParser = new StringOutputParser();
    let stream: AsyncIterable<string>;

    if (hasContext) {
      const context = docs.map((d) => d.pageContent).join("\n\n---\n\n");
      stream = await PROMPT_WITH_CONTEXT.pipe(chatOllama).pipe(outputParser).stream({ context, chatHistory, question });
    } else {
      stream = await PROMPT_WITHOUT_CONTEXT.pipe(chatOllama).pipe(outputParser).stream({ chatHistory, question });
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Has-Context": hasContext ? "true" : "false",
        "X-Sources": hasContext
          ? [...new Set(docs.map((d) => d.source))].join(",")
          : "",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "请求失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
