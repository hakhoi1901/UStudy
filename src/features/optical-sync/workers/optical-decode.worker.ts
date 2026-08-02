import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';

prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => path.endsWith('.wasm') ? wasmUrl : prefix + path,
  },
});

self.onmessage = async (event: MessageEvent) => {
  const { id, buffer, width, height } = event.data as {
    id: number;
    buffer: ArrayBuffer;
    width: number;
    height: number;
  };
  try {
    const image = new ImageData(new Uint8ClampedArray(buffer), width, height);
    const results = await readBarcodes(image, { formats: ['QRCode'], maxNumberOfSymbols: 1 });
    const result = results.find((item) => item.isValid && item.bytes.length > 0);
    self.postMessage({ id, bytes: result?.bytes ?? null });
  } catch {
    self.postMessage({ id, bytes: null });
  }
};

void readBarcodes(new ImageData(8, 8), { formats: ['QRCode'] })
  .catch(() => undefined)
  .then(() => self.postMessage({ id: -1, bytes: null }));
