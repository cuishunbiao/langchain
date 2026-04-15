import { Ollama, OllamaEmbeddings } from "@langchain/ollama"
// 余弦比较
import cosineSimilarity from 'cosine-similarity';

// 用来回答问题
const model = new Ollama({
    model: "qwen3.5:9b",
    streaming: true,
    think: false
})

// 用来文本转换成向量
const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text"
})

/**
 * input: inputText //用户原始提示词
 * embedding: queryEmbedding //用户提示词的向量
 * response: response //模型响应
 */
const cache = [];

async function callLLM(inputText, threshold = 0.7) {
    // 计算输入文本的向量
    const queryEmbedding = await embeddings.embedQuery(inputText);

    // 计算输入文本的向量与缓存中每个向量的余弦相似度
    for (const item of cache) {
        const similarity = cosineSimilarity(queryEmbedding, item.embedding);
        if (similarity >= threshold) {
            console.log("缓存命中 ... 相似度：", similarity, "\n\n");
            // 缓存命中
            process.stdout.write(item.response + "\n");
            return;
        }
    }

    // 缓存未命中
    console.log("缓存没命中 ... \n\n");
    let fullRes = "";
    const stream = await model.stream(inputText);
    for await (const chunk of stream) {
        process.stdout.write(chunk);
        fullRes += chunk;
    }

    // 4. 存储到缓存里面
    cache.push({
        input: inputText, // 用户原始的提示词
        embedding: queryEmbedding, // 提示词对应的向量
        response: fullRes, // 模型给的回复
    });
}

const q1 = "请你介绍一下LLM?简述,100字以内。";
const q2 = "说一下LLM是什么?";

await callLLM(q1);
console.log("\n\n");
await callLLM(q2);