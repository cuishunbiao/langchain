import { RunnableLambda } from "@langchain/core/runnables";

const fn = (input) => {
  return input.toUpperCase();
};

const runnableFn = RunnableLambda.from(fn);

const result = await runnableFn.invoke("hello");

console.log(result);
