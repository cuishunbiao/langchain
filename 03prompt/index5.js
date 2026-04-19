import {SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} from "@langchain/core/prompts";

import { ChatOllama } from "@langchain/ollama";
const model = new ChatOllama({
    model: "qwen3.5:9b",
    streaming: true,
    think: false
})

// 构建系统提示词
const systemTemplate = SystemMessagePromptTemplate.fromTemplate("你是一位前端专家,请用JavaScript来回答用户的问题");

// 构建用户提示词
const humanTemplate = HumanMessagePromptTemplate.fromTemplate("我想问：{question}");

// 构建提示词
const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate, humanTemplate]);

const messages = await chatPrompt.formatMessages({
    question: "什么是 Vue?",
});

const result = await model.stream(messages);

for await(const chunk of result) {
    process.stdout.write(chunk.content);
}
