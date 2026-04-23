import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda } from "@langchain/core/runnables";

const model = new ChatOpenAI({
    model: "qwen3_5_27b",
    apiKey: "Y70tIllI4N",
    configuration: {
        baseURL: "http://192.168.20.11:8000/v1",
    },
    streaming: true,
});

const prompt = PromptTemplate.fromTemplate("请简述，大语言模型{prompt}?");

const outputParser = new StringOutputParser();

let chain = prompt.pipe(model).pipe(outputParser);

const fn = (text) => text.replace(/缓存/g, "「缓存」");
const runnableFn = RunnableLambda.from(fn);

chain = chain.pipe(runnableFn);

const result = await chain.invoke({ prompt: "语义缓存" });

console.log(result);

