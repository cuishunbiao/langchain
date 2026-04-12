import { ChatOllama } from "@langchain/ollama"
import { SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts"

const model = new ChatOllama({
    model: "qwen3:14b",
    temperature: 0.7,
    // think: false,
    streaming: true,
})

// 创建系统提示词
const sysPrompt = SystemMessagePromptTemplate.fromTemplate(
    "你是一个翻译助理，请将用户输入的内容由{input_language}翻译成{output_language}"
)

// 创建用户提示词
const userPrompt = HumanMessagePromptTemplate.fromTemplate(
    "{input}"
)

// 创建提示词模板
const prompt = ChatPromptTemplate.fromMessages([
    sysPrompt,
    userPrompt,
])

// 执行链式
const res = await prompt.formatMessages({
    input_language: "中文",
    output_language: "英文",
    input: "你好，今天天气怎么样？"
})

const stream = await model.stream(res);

for await (const chunk of stream) {
    // console.log(chunk)
    process.stdout.write(chunk.content)
}
