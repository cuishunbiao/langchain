# LangChain 直连 vLLM

## 核心值

- `baseURL`: `http://192.168.20.11:8000/v1`
- `token`: `Authorization: Bearer Y70tIllI4N`
- `model`: `qwen3_5_27b`
- 接口: `POST /chat/completions`
- 流式输出: 支持 `stream=true`

## 代理层可选值

- `baseURL`: `http://192.168.20.11:18000/v1`
- `token`: 同上
- `model`: `qwen`

## LangChain 示例

```js
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "qwen3_5_27b",
  apiKey: "Y70tIllI4N",
  configuration: {
    baseURL: "http://192.168.20.11:8000/v1",
  },
  streaming: true,
});

const systemTemplate = SystemMessagePromptTemplate.fromTemplate(
  "你是一位前端专家,请用JavaScript来回答用户的问题"
);

const humanTemplate = HumanMessagePromptTemplate.fromTemplate("我想问：{question}");

const chatPrompt = ChatPromptTemplate.fromMessages([systemTemplate, humanTemplate]);

const messages = await chatPrompt.formatMessages({
  question: "什么是 Vue?",
});

const result = await model.stream(messages);

for await (const chunk of result) {
  if (typeof chunk.text === "function") {
    process.stdout.write(chunk.text());
    continue;
  }

  if (typeof chunk.content === "string") {
    process.stdout.write(chunk.content);
  }
}
```

## 最小 curl

```bash
curl -N http://192.168.20.11:8000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer Y70tIllI4N' \
  -d '{
    "model": "qwen3_5_27b",
    "messages": [
      {"role": "system", "content": "你是一个助手"},
      {"role": "user", "content": "你好"}
    ],
    "stream": true
  }'
```

## 接入要点

- 这是 OpenAI 兼容接口，LangChain 用 `@langchain/openai` 即可，不需要 `ollama`
- `8000` 直连端点当前暴露模型名是 `qwen3_5_27b`
- `18000` 代理层如果做了别名映射，再按代理要求填写 `qwen`
- 最小必需参数通常只有 `model` 和 `messages`
