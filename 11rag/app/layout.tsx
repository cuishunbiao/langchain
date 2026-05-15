/**
 * 根布局 — 所有页面共享的 HTML 外壳
 *
 * 职责：
 *  - 定义 <html> 和 <body> 标签
 *  - 加载 Geist 字体（Sans + Mono），通过 CSS 变量注入
 *  - 导入全局样式 globals.css（Tailwind v4 + 暗色模式）
 *  - 设置页面元数据（title / description）
 *
 * 这是 Next.js App Router 的服务端组件（默认），不带 "use client"。
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RAG 智能问答",
  description: "基于 LangChain + Ollama 的本地 RAG 问答系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
