import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@langchain/core",
    "@langchain/community",
    "@langchain/ollama",
    "@langchain/classic",
    "@langchain/textsplitters",
    "pdf-parse",
  ],
};

export default nextConfig;
