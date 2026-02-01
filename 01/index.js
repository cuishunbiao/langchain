import { Ollama } from "@langchain/ollama"

const model = new Ollama({
    model: "qwen3:14b"
})

const res = await model.invoke("你是谁？");

console.log(res)
