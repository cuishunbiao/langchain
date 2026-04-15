import { PromptTemplate } from "@langchain/core/prompts";

const pt = PromptTemplate.fromTemplate("你是一位精通{subject}的专家，请用{language}来回答用户的问题");


const pt2 = await pt.partial({
    subject: "数学",
});

const result = await pt2.format({
    language: "中文1",
});

console.log(result);