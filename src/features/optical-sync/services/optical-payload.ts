const MAGIC = new Uint8Array([0x55, 0x4f, 0x53, 0x32]); // UOS2
const FLAG_GZIP = 1;
const HEADER_BYTES = 9;
const MAX_DECODED_BYTES = 16 * 1024 * 1024;

export interface EncodedOpticalPayload {
  bytes: Uint8Array;
  compressed: boolean;
  originalBytes: number;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') return bytes;
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Thiết bị này không hỗ trợ giải nén dữ liệu đồng bộ.');
  }
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream('gzip'));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DECODED_BYTES) {
      await reader.cancel();
      throw new Error('Dữ liệu nhận vượt quá giới hạn an toàn.');
    }
    chunks.push(value);
  }
  const output = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

export async function encodeOpticalText(text: string): Promise<EncodedOpticalPayload> {
  const original = new TextEncoder().encode(text);
  if (original.length === 0) throw new Error('Không có dữ liệu để truyền.');
  if (original.length > MAX_DECODED_BYTES) throw new Error('Gói đồng bộ vượt quá giới hạn 16 MB.');

  const compressedCandidate = await gzip(original);
  const compressed = compressedCandidate.length + 64 < original.length;
  const payload = compressed ? compressedCandidate : original;
  const output = new Uint8Array(HEADER_BYTES + payload.length);
  output.set(MAGIC, 0);
  output[4] = compressed ? FLAG_GZIP : 0;
  new DataView(output.buffer).setUint32(5, original.length, true);
  output.set(payload, HEADER_BYTES);

  return {
    bytes: output,
    compressed,
    originalBytes: original.length,
  };
}

export async function decodeOpticalText(container: Uint8Array): Promise<string> {
  if (container.length <= HEADER_BYTES) throw new Error('Gói đồng bộ không đầy đủ.');
  if (!MAGIC.every((value, index) => container[index] === value)) {
    throw new Error('Đây không phải gói đồng bộ quang học của UStudy.');
  }

  const originalLength = new DataView(
    container.buffer,
    container.byteOffset,
    container.byteLength,
  ).getUint32(5, true);
  if (originalLength === 0 || originalLength > MAX_DECODED_BYTES) {
    throw new Error('Kích thước dữ liệu đồng bộ không hợp lệ.');
  }

  const payload = container.slice(HEADER_BYTES);
  const decoded = (container[4] & FLAG_GZIP) !== 0 ? await gunzip(payload) : payload;
  if (decoded.length !== originalLength) {
    throw new Error('Kích thước dữ liệu nhận không khớp với gói đồng bộ.');
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(decoded);
}
