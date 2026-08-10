import { Camera, RefreshCw, ScanLine, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { decodeOpticalText } from '../services/optical-payload';
import { LTDecoder } from '../vendor/decimen/fountain';
import { expectedFountainOverhead } from '../vendor/decimen/progress';
import { fnv1a, MAX_FILE_BYTES, parseFrame, streamIdentity, unpackFile, verifyFile } from '../vendor/decimen/protocol';
import { DecodeWorkerPool } from '../vendor/decimen/worker-pool';
import { createOpticalDecodeWorker } from '../workers/create-optical-decode-worker';

interface OpticalReceiverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceivedText: (text: string) => boolean;
}

type ReceiverPhase = 'idle' | 'scanning' | 'processing' | 'done';
type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

export function OpticalReceiverDialog({ open, onOpenChange, onReceivedText }: OpticalReceiverDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poolRef = useRef<DecodeWorkerPool | null>(null);
  const decoderRef = useRef<LTDecoder | null>(null);
  const streamKeyRef = useRef('');
  const captureGenerationRef = useRef(0);
  const completedRef = useRef(false);
  const frameIdRef = useRef(0);
  const grabCanvasRef = useRef(document.createElement('canvas'));
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const noSignalTimerRef = useRef<number | null>(null);
  const handleDecodedRef = useRef<(bytes: Uint8Array) => void>(() => undefined);
  const [phase, setPhase] = useState<ReceiverPhase>('idle');
  const [status, setStatus] = useState('Sẵn sàng mở camera sau.');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState(0);

  const stopCapture = useCallback(() => {
    captureGenerationRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    poolRef.current?.resize(0);
    poolRef.current = null;
    void wakeLockRef.current?.release();
    wakeLockRef.current = null;
    if (noSignalTimerRef.current !== null) window.clearTimeout(noSignalTimerRef.current);
    noSignalTimerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stopCapture();
    decoderRef.current = null;
    streamKeyRef.current = '';
    completedRef.current = false;
    frameIdRef.current = 0;
    setPhase('idle');
    setStatus('Sẵn sàng mở camera sau.');
    setError(null);
    setProgress(0);
    setFrames(0);
  }, [stopCapture]);

  useEffect(() => {
    if (open) reset();
    return stopCapture;
  }, [open, reset, stopCapture]);

  const finishTransfer = useCallback(async (container: Uint8Array, checksumMatches: boolean) => {
    completedRef.current = true;
    stopCapture();
    setPhase('processing');
    setProgress(100);
    setStatus('Đang xác minh gói dữ liệu...');
    try {
      if (!checksumMatches) throw new Error('Checksum của luồng QR không khớp.');
      const file = await unpackFile(container);
      if (!(await verifyFile(file))) throw new Error('Kiểm tra SHA-256 không thành công.');
      if (file.type !== 'application/vnd.ustudy.optical-sync') {
        throw new Error('QR này không chứa dữ liệu đồng bộ UStudy.');
      }
      const text = await decodeOpticalText(file.bytes);
      if (!onReceivedText(text)) throw new Error('Gói nhận được không chứa dữ liệu UStudy hợp lệ.');
      setPhase('done');
      setStatus('Đã xác minh dữ liệu.');
      onOpenChange(false);
    } catch (caught) {
      setPhase('idle');
      setError(caught instanceof Error ? caught.message : String(caught));
      setStatus('Không thể sử dụng dữ liệu vừa nhận.');
    }
  }, [onOpenChange, onReceivedText, stopCapture]);

  const handleDecoded = useCallback((bytes: Uint8Array) => {
    if (completedRef.current) return;
    const parsed = parseFrame(bytes);
    if (!parsed) return;
    const { header, block } = parsed;
    if (
      header.totalLen > MAX_FILE_BYTES
      || header.k !== Math.ceil(header.totalLen / header.blockLen)
    ) return;
    const identity = streamIdentity(header);
    if (!decoderRef.current || streamKeyRef.current !== identity) {
      decoderRef.current = new LTDecoder(header.k, header.blockLen, header.sessionId, header.totalLen);
      streamKeyRef.current = identity;
      setStatus('Đã bắt được luồng QR, giữ điện thoại ổn định.');
      setError(null);
    }
    const decoder = decoderRef.current;
    decoder.addFrame(header.seq, block);
    const expectedFrames = decoder.k * expectedFountainOverhead(decoder.k);
    const fraction = Math.min(0.97, Math.max(decoder.framesNew / expectedFrames, decoder.solvedCount / decoder.k));
    setFrames(decoder.framesNew);
    setProgress(fraction * 100);
    if (decoder.isComplete) {
      const payload = decoder.assemble();
      if (payload) void finishTransfer(payload, fnv1a(payload) === header.payloadFnv);
    }
  }, [finishTransfer]);

  handleDecodedRef.current = handleDecoded;

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const pool = poolRef.current;
    if (!video || !pool || pool.busyCount >= pool.size || !video.videoWidth || !video.videoHeight) return;
    const canvas = grabCanvasRef.current;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.drawImage(video, 0, 0);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    pool.submit(
      { id: frameIdRef.current++, buffer: image.data.buffer, width: canvas.width, height: canvas.height },
      [image.data.buffer],
    );
  }, []);

  const scheduleFrame = useCallback((generation: number) => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    if (!video || completedRef.current || generation !== captureGenerationRef.current) return;
    const next = () => {
      if (completedRef.current || generation !== captureGenerationRef.current) return;
      captureFrame();
      scheduleFrame(generation);
    };
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(next);
    else requestAnimationFrame(next);
  }, [captureFrame]);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera chỉ hoạt động trong ứng dụng hoặc trên trang HTTPS.');
      return;
    }
    reset();
    setPhase('scanning');
    setStatus('Đang mở camera...');
    try {
      const constraints: MediaTrackConstraints = {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: constraints });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Không thể khởi tạo khung camera.');
      video.srcObject = stream;
      await video.play();
      poolRef.current = new DecodeWorkerPool(
        createOpticalDecodeWorker,
        (bytes) => handleDecodedRef.current(bytes),
      );
      poolRef.current.resize(2);
      const generation = ++captureGenerationRef.current;
      setStatus('Đưa QR trên laptop vào giữa khung camera.');
      scheduleFrame(generation);
      noSignalTimerRef.current = window.setTimeout(() => {
        if (!decoderRef.current) {
          setError('Chưa đọc được QR. Thử đưa điện thoại gần hơn hoặc giảm mật độ QR trên laptop.');
        }
      }, 8000);
      void navigator.wakeLock?.request('screen')
        .then((sentinel) => {
          if (generation !== captureGenerationRef.current || completedRef.current) {
            void sentinel.release();
          } else {
            wakeLockRef.current = sentinel;
          }
        })
        .catch(() => undefined);
    } catch (caught) {
      stopCapture();
      setPhase('idle');
      setError(caught instanceof Error && caught.name === 'NotAllowedError'
        ? 'Bạn chưa cấp quyền camera cho UStudy.'
        : caught instanceof Error ? caught.message : String(caught));
      setStatus('Không thể mở camera.');
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nhận từ laptop"
      description="Quét QR động trên laptop. Dữ liệu chỉ được ghi sau khi bạn xem trước và xác nhận."
      icon={ScanLine}
      size="lg"
      mobileFullScreen
      contentClassName="flex min-h-0 flex-col gap-4 space-y-0 max-md:m-0 max-md:p-4"
      footer={(
        <>
          {phase === 'scanning' && <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"><RefreshCw className="h-4 w-4" />Dừng quét</button>}
          <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-lg bg-[#004A98] px-5 text-sm font-semibold text-white hover:bg-[#003A78]">Đóng</button>
        </>
      )}
    >
      <div className="overflow-hidden rounded-lg bg-slate-950 max-md:min-h-0 max-md:flex-1">
        <div className="relative aspect-[4/3] w-full max-md:h-full max-md:aspect-auto">
          <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${phase === 'scanning' ? 'block' : 'hidden'}`} />
          {phase !== 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
              {phase === 'processing' || phase === 'done' ? <ShieldCheck className="h-12 w-12 text-emerald-400" /> : <Camera className="h-12 w-12 text-blue-300" />}
              <p className="text-sm font-semibold">{phase === 'processing' || phase === 'done' ? 'Đang hoàn tất dữ liệu' : 'Camera chưa bật'}</p>
            </div>
          )}
          {phase === 'scanning' && <div className="pointer-events-none absolute inset-[12%] border-2 border-white/80 shadow-[0_0_0_999px_rgba(2,6,23,0.28)]" />}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium text-slate-600">
          <span>{status}</span>
          <span className="shrink-0 tabular-nums">{frames > 0 ? `${frames} frame` : ''}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#004A98] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

      {phase === 'idle' && (
        <div className="border-t border-slate-200 pt-4">
          <button type="button" onClick={() => void startCamera()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#004A98] px-4 text-sm font-semibold text-white hover:bg-[#003A78]"><Camera className="h-4 w-4" />Bắt đầu quét</button>
        </div>
      )}
    </AppDialog>
  );
}
