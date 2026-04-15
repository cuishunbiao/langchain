import { PromptTemplate } from "@langchain/core/prompts";

const pt = PromptTemplate.fromTemplate("你是一位精通{subject}的专家，请用{language}来回答用户的问题");


const output = await pt.format({
    subject: "数学",
    language: "中文",
});

console.log(output);