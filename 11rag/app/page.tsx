"use client";

import { useState, useRef } from "react";
import { ChatWindow, type Message } from "@/components/chat-window";
import { ChatInput } from "@/components/chat-input";
import { FileUpload } from "@/components/file-upload";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // 用 ref 持有流式构建中的助手消息索引，避免闭包过期
  const assistantIndexRef = useRef<number>(-1);

  const handleSend = async (question: string) => {
    if (isLoading) return;

    // 追加用户消息
    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 占位助手消息（流式填充）
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => {
      assistantIndexRef.current = prev.length;
      return [...prev, assistantMsg];
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 传入除当前用户消息外的历史
          messages: messages,
          question,
        }),
      });

      if (!res.ok) {
        throw new Error(`请求失败：${res.status}`);
      }

      const hasContext = res.headers.get("X-Has-Context") === "true";
      const sourcesHeader = res.headers.get("X-Sources") ?? "";
      const sources = sourcesHeader ? sourcesHeader.split(",").filter(Boolean) : [];

      // 流式读取响应体
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        // 实时更新助手消息内容
        setMessages((prev) => {
          const next = [...prev];
          next[assistantIndexRef.current] = {
            ...next[assistantIndexRef.current],
            content: accumulated,
          };
          return next;
        });
      }

      // 流结束后写入 hasContext 和 sources
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndexRef.current] = {
          ...next[assistantIndexRef.current],
          hasContext,
          sources,
        };
        return next;
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "发生错误";
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIndexRef.current] = {
          role: "assistant",
          content: `抱歉，${errorMsg}`,
          hasContext: false,
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.7 5.25 1.855V4.533zM12.75 20.605A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.072z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">RAG 智能问答</h1>
        </div>

        {/* 文件上传区 */}
        <FileUpload />
      </header>

      {/* 聊天消息区 */}
      <ChatWindow messages={messages} isLoading={isLoading} />

      {/* 输入区 */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
