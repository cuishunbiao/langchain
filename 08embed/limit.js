import pLimit from "p-limit";

const urls = [
  "https://jsonplaceholder.typicode.com/todos/1",
  "https://jsonplaceholder.typicode.com/todos/2",
  "https://jsonplaceholder.typicode.com/todos/3",
  "https://jsonplaceholder.typicode.com/todos/4",
  "https://jsonplaceholder.typicode.com/todos/5",
  "https://jsonplaceholder.typicode.com/todos/6",
];

// 基础请求函数：拿到 JSON，不是 2xx 则抛错
async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  // 同时最多跑 3 个请求
  const limit = pLimit(6);

  // 并发探针
  let active = 0;
  let maxActive = 0;
  const t0 = performance.now();

  const tasks = urls.map((url, idx) =>
    limit(async () => {
      // 任务开始，并发探针检测并发数量
      active++;
      if (active > limit.concurrency) {
        console.warn(`并发超限: active=${active} > limit=${limit.concurrency}`);
      }
      maxActive = Math.max(maxActive, active);
      console.log(
        `[start] #${idx} +${(performance.now() - t0).toFixed(
          3
        )}ms  active=${active}`
      );

      try {
        return await fetchJson(url);
      } finally {
        // 任务结束
        active--;
        console.log(
          `[end  ] #${idx} +${(performance.now() - t0).toFixed(
            3
          )}ms  active=${active}`
        );
      }
    })
  );

  try {
    const results = await Promise.all(tasks);
    console.log("结果：", results);
  } catch (err) {
    console.error("至少有一个请求失败：", err);
  } finally {
    console.log(
      `并发观测：maxActive=${maxActive}, limit=${limit.concurrency}, ` +
        `activeCount=${limit.activeCount}, pendingCount=${limit.pendingCount}`
    );
  }
}

main().catch((e) => console.error(e));
