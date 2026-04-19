import {
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const pt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate("你是一个乐于助人的AI助手"),
    new MessagesPlaceholder("history"), // 加入了一个占位符
    HumanMessagePromptTemplate.fromTemplate("用户的问题:{input}"),
]);

const res = await pt.formatMessages({
    input: "你好",
    history: [
        new HumanMessage("今天天气怎么样"),
        new AIMessage("今天天气非常晴朗"),
    ],
});

console.log(res);