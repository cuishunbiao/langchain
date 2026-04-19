
## 结构化提示词
通过blockchain提供的工具类，可以快速地构建结构化的提示词。

```
import {SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate} from "@langchain/core/prompts";

// 构建系统提示词
const systemTemplate = SystemMessagePromptTemplate.fromTemplate("你是一位前端专家,请用JavaScript来回答用户的问题");

// 构建用户提示词
const humanTemplate = HumanMessagePromptTemplate.fromTemplate("我想问{question}");

// 构建提示词
const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate, humanTemplate]);

// 使用提示词
const result = await chatPrompt.formatMessages({
    question: "什么是JavaScript?",
});

console.log(result);
```
会输出
```
[
  SystemMessage {
    "content": "你是一位前端专家,请用JavaScript来回答用户的问题",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  HumanMessage {
    "content": "我想问什么是JavaScript?",
    "additional_kwargs": {},
    "response_metadata": {}
  }
]
```

## 组合模板
把多个小的模板，通过流水线的形式组成一个大模板。
