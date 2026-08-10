import { Pause, Play, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { encodeOpticalText } from '../services/optical-payload';
import { blockLength } from '../vendor/decimen/frame-capacity';
import { LTEncoder } from '../vendor/decimen/fountain';
import { fnv1a, packFile, packFrame, type FrameHeader } from '../vendor/decimen/protocol';
import { rasterizeQr } from '../vendor/decimen/qr-raster';

interface PreparedTransfer {
  payload: Uint8Array;
  originalBytes: number;
  transmittedBytes: number;
}

interface OpticalSenderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payloadText: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function OpticalSenderDialog({ open, onOpenChange, payloadText }: OpticalSenderDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prepared, setPrepared] = useState<PreparedTransfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [fps, setFps] = useState(20);
  const [frameBytes, setFrameBytes] = useState(1465);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    if (!open || !payloadText) return;
    let cancelled = false;
    setPrepared(null);
    setError(null);
    setPaused(false);
    setFrameCount(0);
    void (async () => {
      try {
        const encoded = await encodeOpticalText(payloadText);
        const packed = await packFile(
          'ustudy-sync.uos',
          'application/vnd.ustudy.optical-sync',
          encoded.bytes,
        );
        if (cancelled) return;
        setPrepared({
          payload: packed.container,
          originalBytes: encoded.originalBytes,
          transmittedBytes: packed.container.length,
        });
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : String(caught));
      }
    })();
    return () => { cancelled = true; };
  }, [open, payloadText]);

  useEffect(() => {
    if (!open || !prepared || paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let stopped = false;
    let animationFrame = 0;
    let nextAt = performance.now();
    let sequence = 0;
    let qrVersion: number | undefined;
    const randomSession = crypto.getRandomValues(new Uint16Array(1))[0];
    const sessionId = randomSession === 0 ? 1 : randomSession;
    const encoder = new LTEncoder(prepared.payload, blockLength(frameBytes), sessionId);
    const header: FrameHeader = {
      sessionId,
      seq: 0,
      k: encoder.k,
      blockLen: encoder.blockLen,
      totalLen: prepared.payload.length,
      payloadFnv: fnv1a(prepared.payload),
    };

    const renderFrame = () => {
      const frame = packFrame({ ...header, seq: sequence }, encoder.encode(sequence));
      sequence += 1;
      const qr = QRCode.create(
        [{ data: frame, mode: 'byte' } as unknown as QRCode.QRCodeSegment],
        { errorCorrectionLevel: 'L', version: qrVersion, maskPattern: 4 },
      );
      qrVersion ??= qr.version;
      const raster = rasterizeQr(qr.modules.size, qr.modules.data, 4);
      canvas.width = raster.size;
      canvas.height = raster.size;
      const image = new ImageData(new Uint8ClampedArray(raster.pixels.buffer), raster.size, raster.size);
      canvas.getContext('2d')?.putImageData(image, 0, 0);
      if (sequence % 10 === 0) setFrameCount(sequence);
    };

    const interval = 1000 / fps;
    const tick = (now: number) => {
      if (stopped) return;
      animationFrame = requestAnimationFrame(tick);
      if (now < nextAt) return;
      try {
        renderFrame();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
        stopped = true;
        return;
      }
      nextAt += interval;
      if (now - nextAt > interval * 3) nextAt = now + interval;
    };
    animationFrame = requestAnimationFrame(tick);
    let wakeLock: WakeLockSentinel | null = null;
    void navigator.wakeLock?.request('screen')
      .then((sentinel) => {
        if (stopped) void sentinel.release();
        else wakeLock = sentinel;
      })
      .catch(() => undefined);

    return () => {
      stopped = true;
      cancelAnimationFrame(animationFrame);
      void wakeLock?.release();
    };
  }, [fps, frameBytes, open, paused, prepared]);

  const sourceBlocks = prepared ? Math.ceil(prepared.payload.length / blockLength(frameBytes)) : 0;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Gửi sang điện thoại"
      description="Giữ màn hình này mở và dùng UStudy trên điện thoại để quét luồng QR."
      icon={Smartphone}
      size="xl"
      contentClassName="space-y-4"
      footer={(
        <>
          <button type="button" onClick={() => setPaused((value) => !value)} disabled={!prepared || Boolean(error)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-40">
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>
          <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-lg bg-[#004A98] px-5 text-sm font-semibold text-white hover:bg-[#003A78]">Đóng</button>
        </>
      )}
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : !prepared ? (
        <div className="flex min-h-72 items-center justify-center text-sm font-medium text-slate-500">Đang nén và chuẩn bị dữ liệu...</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex min-h-0 items-center justify-center bg-white p-2">
            <canvas ref={canvasRef} className="aspect-square w-full max-w-[min(68vh,680px)] bg-white [image-rendering:pixelated]" aria-label="Luồng QR đồng bộ UStudy" />
          </div>

          <aside className="divide-y divide-slate-200 border-y border-slate-200 lg:border lg:border-slate-200">
            <section className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-xs">
              <div><p className="text-slate-500">Dữ liệu gốc</p><p className="mt-1 font-semibold text-slate-800">{formatBytes(prepared.originalBytes)}</p></div>
              <div><p className="text-slate-500">Qua QR</p><p className="mt-1 font-semibold text-slate-800">{formatBytes(prepared.transmittedBytes)}</p></div>
              <div><p className="text-slate-500">Khối nguồn</p><p className="mt-1 font-semibold tabular-nums text-slate-800">{sourceBlocks}</p></div>
              <div><p className="text-slate-500">Frame đã phát</p><p className="mt-1 font-semibold tabular-nums text-slate-800">{frameCount}</p></div>
            </section>

            <section className="space-y-3 p-4">
              <label className="block text-xs font-medium text-slate-600">Tốc độ phát
                <select value={fps} onChange={(event) => setFps(Number(event.target.value))} className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800">
                  <option value={12}>12 FPS · ổn định</option>
                  <option value={20}>20 FPS · mặc định</option>
                  <option value={24}>24 FPS · nhanh</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-slate-600">Mật độ QR
                <select value={frameBytes} onChange={(event) => setFrameBytes(Number(event.target.value))} className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800">
                  <option value={965}>Thưa · dễ quét</option>
                  <option value={1465}>Cân bằng · mặc định</option>
                  <option value={1953}>Dày · nhanh hơn</option>
                </select>
              </label>
              <p className="text-xs leading-5 text-slate-500">Nếu điện thoại chưa nhận được frame, giảm mật độ trước rồi giảm FPS.</p>
            </section>
          </aside>
        </div>
      )}
    </AppDialog>
  );
}
