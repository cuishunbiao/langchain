/**
 * ChatInput — 聊天输入框组件
 *
 * 功能：
 *  - 受控 textarea，支持多行输入
 *  - Enter 键发送消息，Shift+Enter 换行
 *  - 发送按钮在输入为空或 disabled 时禁用
 *  - 发送后自动清空输入框
 */
"use client";

import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  /** 发送消息的回调，参数为去除首尾空格后的文本 */
  onSend: (message: string) => void;
  /** 禁用状态（如正在等待 AI 回复时） */
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[160px] leading-relaxed"
          placeholder="输入你的问题，Enter 发送，Shift+Enter 换行..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="发送"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-white"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
