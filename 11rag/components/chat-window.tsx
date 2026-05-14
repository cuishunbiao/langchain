"use client";

import { useEffect, useRef } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  hasContext?: boolean;
  sources?: string[];
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
          上传文档后，向我提问吧~
        </div>
      )}

      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-500 text-white rounded-br-sm"
                : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm rounded-bl-sm"
            }`}
          >
            {msg.content}
            {/* 有无相关文档标识 */}
            {msg.role === "assistant" && msg.hasContext !== undefined && (
              <span
                className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${
                  msg.hasContext
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {msg.hasContext ? "【有相关文档】" : "【无相关文档】"}
              </span>
            )}
            {/* 来源文件 */}
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
              <div className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                来源：{msg.sources.join("、")}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 思考中动画 */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white dark:bg-zinc-800 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
