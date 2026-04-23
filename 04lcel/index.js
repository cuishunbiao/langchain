import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from '@langchain/core/output_parsers'

// 提示词
const prompt = PromptTemplate.fromTemplate("简述什么是:{prompt}!");

// 创建一个模型
const model = new ChatOpenAI({
    model: "qwen3_5_27b",
    apiKey: "Y70tIllI4N",
    configuration: {
        baseURL: "http://192.168.20.11:8000/v1",
    },
    streaming: true,
});

// 创建一个输出解析器
const parser = new StringOutputParser();

// 创建一个链
const chain = prompt.pipe(model).pipe(parser);

// 执行链
// const result = await chain.invoke({ prompt: "大语言模型「语义缓存」" });
// console.log(result);

// 执行链
// const result = await chain.stream({ prompt: "大语言模型「语义缓存」" });
// for await (const chunk of result) {
//     process.stdout.write(chunk);
// }


const inputs = [{ prompt: "大语言模型「语义缓存」" }, { prompt: "大语言模型「KV缓存」" }, { prompt: "大语言模型「前缀缓存」" }];
for (const [index, input] of inputs.entries()) {
    const stream = await chain.stream(input);
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
}