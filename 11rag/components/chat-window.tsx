/**
 * ChatWindow — 聊天消息列表组件
 *
 * 职责：
 *  - 渲染消息气泡（用户 → 右侧蓝色，助手 → 左侧白色）
 *  - 显示 RAG 检索标签（"有相关文档" / "无相关文档"）
 *  - 显示来源文件名
 *  - 空状态提示
 *  - 加载中的弹跳动画（三个圆点）
 *  - 新消息自动滚动到底部
 */
"use client";

import { useEffect, useRef } from "react";

/** 单条消息的数据结构 */
export interface Message {
  role: "user" | "assistant";
  content: string;
  /** 回答是否基于检索到的文档上下文 */
  hasContext?: boolean;
  /** 回答引用的来源文件名列表 */
  sources?: string[];
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  // 底部锚点 ref，用于自动滚动
  const bottomRef = useRef<HTMLDivElement>(null);

  // 每当消息列表或加载状态变化时，平滑滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {/* 空状态：没有任何消息时显示引导文案 */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
          上传文档后，向我提问吧~
        </div>
      )}

      {/* 消息气泡列表 */}
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
            {/* 检索状态标签：绿色 = 有相关文档，灰色 = 无相关文档 */}
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
            {/* 来源文件列表 */}
            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
              <div className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                来源：{msg.sources.join("、")}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 加载中动画：三个弹跳圆点，通过 animation-delay 错开节奏 */}
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

      {/* 底部锚点，scrollIntoView 的目标 */}
      <div ref={bottomRef} />
    </div>
  );
}
