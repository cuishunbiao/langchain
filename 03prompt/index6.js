import {
    PromptTemplate,
    PipelinePromptTemplate,
} from "@langchain/core/prompts";

// 获取当前日期字符串
const getDate = () => new Date().toLocaleDateString();

// 1. 创建一个主模板
const mainPt = PromptTemplate.fromTemplate(
    `你是一个智能助理，今天是 {date}，主人的信息是 {userInfo}，
    请根据上下文完成以下任务：
    {todo}`
);

// 2. 创建子模板
const timePl = PromptTemplate.fromTemplate("{date}，现在是 {time}");
const filledTimePl = await timePl.partial({
    date: getDate,
});

const userTpl = PromptTemplate.fromTemplate("姓名：{name}，性别：{gender}");
const taskTpl = PromptTemplate.fromTemplate(`
      我想吃 {time} 的 {dish}。
      请再次确认我的信息：{userInfo} 
      `);

// 3. 可以将子模板填充到主模板里面
const finalPt = new PipelinePromptTemplate({
    pipelinePrompts: [
        {
            name: "date",
            prompt: filledTimePl,
        },
        {
            name: "userInfo",
            prompt: userTpl,
        },
        {
            name: "todo",
            prompt: taskTpl,
        },
    ],
    finalPrompt: mainPt,
});
const result = await finalPt.format({
    time: "12:01",
    name: "张三",
    gender: "男",
    dish: "煎蛋",
});
console.log(result);