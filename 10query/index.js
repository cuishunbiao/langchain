import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOllama } from "@langchain/ollama";

const pt = PromptTemplate.fromTemplate(`
    You are an AI language model assistant. Your task is to generate {queryCount} 
    different versions of the given user question to retrieve relevant documents from a vector database. 
    By generating multiple perspectives on the user question, your goal is to help the user overcome some of 
    the limitations of the distance-based similarity search. 
    Provide these alternative questions separated by newlines.
    Original question: {question}
`);

const model = new ChatOllama({
    model: "qwen3:14b",
    temperature: 0.7,
    think: false,
    streaming: true,
});

const parser = new StringOutputParser();
const chain = pt.pipe(model).pipe(parser);

const result = await chain.invoke({
    queryCount: 3,
    question: "奥特曼的技能有哪些？",
});

console.log(result);