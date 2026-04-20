import {SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    model: "qwen3_5_27b",
    apiKey: "Y70tIllI4N",
    configuration: {
        baseURL: "http://192.168.20.11:8000/v1",
    },
    streaming: true,
});

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
    if (typeof chunk.text === "function") {
        process.stdout.write(chunk.text());
        continue;
    }

    if (typeof chunk.content === "string") {
        process.stdout.write(chunk.content);
    }
}
