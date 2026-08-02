export function createOpticalDecodeWorker(): Worker {
  return new Worker(new URL('./optical-decode.worker.ts', import.meta.url), { type: 'module' });
}
