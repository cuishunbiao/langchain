/**
 * POST /api/chat — RAG 问答 API
 *
 * 完整流程：
 *  1. 接收前端传来的 { messages(历史), question(当前问题) }
 *  2. 调用 searchRelevantDocs 在所有向量库中检索相关文档片段
 *  3. 根据是否检索到文档，选择不同的 PromptTemplate：
 *     - 有文档 → PROMPT_WITH_CONTEXT（注入检索到的文档作为参考）
 *     - 无文档 → PROMPT_WITHOUT_CONTEXT（仅凭对话历史回答）
 *  4. 通过 LangChain .pipe() 管道流式生成回答：
 *     PromptTemplate → ChatOllama(qwen3:14b) → StringOutputParser
 *  5. 将 AsyncIterable 转为 Web ReadableStream 返回给前端
 *  6. 在响应头中附带检索元数据：
 *     - X-Has-Context: 是否使用了文档上下文
 *     - X-Sources: 来源文件名（逗号分隔）
 */
import { NextRequest, NextResponse } from "next/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatOllama } from "@/lib/rag/model";
import { searchRelevantDocs } from "@/lib/rag/search";

// 强制使用 Node.js 运行时（非 Edge），因为 LangChain 依赖 Node API
export const runtime = "nodejs";

// 有检索上下文时的提示词模板：包含参考文档 + 对话历史 + 用户问题
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

// 无检索上下文时的提示词模板：仅对话历史 + 用户问题
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

    // Step 1: 在所有向量库中检索与问题相关的文档片段
    const docs = await searchRelevantDocs(question);
    const hasContext = docs.length > 0;

    // Step 2: 将历史消息格式化为"用户：xxx\n助手：xxx"的纯文本
    const chatHistory = messages
      .map((m) => `${m.role === "user" ? "用户" : "助手"}：${m.content}`)
      .join("\n");

    // Step 3: 构建 LangChain 管道并流式执行
    const outputParser = new StringOutputParser();
    let stream: AsyncIterable<string>;

    if (hasContext) {
      // 将检索到的文档片段用分隔线拼接，注入到 prompt 的 {context} 位置
      const context = docs.map((d) => d.pageContent).join("\n\n---\n\n");
      stream = await PROMPT_WITH_CONTEXT.pipe(chatOllama).pipe(outputParser).stream({ context, chatHistory, question });
    } else {
      stream = await PROMPT_WITHOUT_CONTEXT.pipe(chatOllama).pipe(outputParser).stream({ chatHistory, question });
    }

    // Step 4: 将 LangChain 的 AsyncIterable<string> 转为 Web ReadableStream
    // 前端通过 reader.read() 逐块读取，实现打字机效果
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

    // Step 5: 返回流式响应，附带检索元数据到自定义响应头
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
