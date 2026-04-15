import { PromptTemplate } from "@langchain/core/prompts";

// 定义函数，获取日期
const getToday = () => new Date().toLocaleDateString();

const pt = PromptTemplate.fromTemplate("今天是{date}，今天的活动是：{event}");

const pt2 = await pt.partial({
    date: getToday,
})

const result = await pt2.format({
    event: "跑步",
});

console.log(result);