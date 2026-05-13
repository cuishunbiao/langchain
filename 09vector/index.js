import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { NomicEmbeddings} from "./utils/embed.js";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const loader = new TextLoader("data/kong.txt");
const docs = await loader.load();

// 创建文本分割器
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 50,
    chunkOverlap: 0,
});
// 分割文本
const splittedDocs = await splitter.splitDocuments(docs);

// 创建嵌入工具
const embeddings = new NomicEmbeddings(4);

// 创建内存向量数据库
const store = new MemoryVectorStore(embeddings);

// 存储到内存中
await store.addDocuments(splittedDocs);

// 创建检索器
const retriever = store.asRetriever(2);

const result = await retriever.invoke("文章里有出现「酒」么？");
console.log(result);