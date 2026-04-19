import {SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} from "@langchain/core/prompts";

// 构建系统提示词
const systemTemplate = SystemMessagePromptTemplate.fromTemplate("你是一位前端专家,请用JavaScript来回答用户的问题");

// 构建用户提示词
const humanTemplate = HumanMessagePromptTemplate.fromTemplate("我想问{question}");

// 构建提示词
const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate, humanTemplate]);

// 使用提示词
const result = await chatPrompt.formatMessages({
    question: "什么是JavaScript?",
});

console.log(result);