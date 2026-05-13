export async function runWithConcurrency(items, worker, maxConcurrency) {
    if (!items?.length) return;
  
    let i = 0;
  
    const workers = [];
  
    async function spawn() {
      while (i < items.length) {
        const idx = i++;
        await worker(items[idx], idx);
      }
    }
  
    const n = Math.max(1, Math.min(maxConcurrency, items.length));
  
    for (let k = 0; k < n; k++) workers.push(spawn());
  
    await Promise.allSettled(workers);
  }
  