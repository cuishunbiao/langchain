import { PromptTemplate } from "@langchain/core/prompts";

// 创建一个包含变量的提示模板
const prompt = new PromptTemplate({
    inputVariables: ["user"],
    template: "{{debug}}: Hi, {user}!",
});

// 一个对象
console.log(prompt)

// 使用 format 方法替换变量
// 需要提供变量的值
const output = await prompt.format({
    user: "John",
});

console.log(output);