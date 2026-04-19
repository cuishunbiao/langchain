import { ChatOllama } from "@langchain/ollama";
import { HumanMessage } from "@langchain/core/messages";

const chatModel = new ChatOllama({
    model: "qwen3.5:9b",
    streaming: true,
    think: false
});

const stream = await chatModel.stream([
    new HumanMessage("用中文给我讲一个笑话!"),
]);

for await (const chunk of stream) {
    process.stdout.write(chunk.content);
}