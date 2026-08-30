import { Camera, Copy, Laptop, QrCode, RefreshCw, Send, ShieldCheck, Smartphone, X } from 'lucide-react';
import QRCode from 'qrcode';
import { Fragment, useEffect, useRef, useState } from 'react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { useCrypto } from '../../../context/CryptoContext';
import { exportMasterKeyForDeviceSync, prepareReceivedMasterKey, replaceDeviceSyncData } from '../../../helpers/localStorage/save';
import { createOpticalDecodeWorker } from '../../optical-sync/workers/create-optical-decode-worker';
import { createEphemeralKeyPair, deriveSessionKey, deriveShortAuthenticationString } from '../services/sync-crypto';
import { DEVICE_SYNC_PROTOCOL, formatPairingCode, parsePairingInput, type PairingQrPayload } from '../services/sync-protocol';
import { buildDeviceSyncPackage, DEVICE_SYNC_STORAGE_KEYS, serializeDeviceSyncPackage } from '../services/sync-package';
import { createDeviceSyncSessionId, DeviceSyncSignalingClient, getDeviceSyncSignalingUrl, type DeviceSyncRole } from '../services/signaling';
import { readEncryptedSyncMessage, sendEncryptedSyncMessage, sendSyncPackage, SyncPackageReceiver } from '../services/transfer';
import { createWebRtcTransport } from '../services/webrtc';

type Mode = 'send' | 'receive';
type Phase = 'idle' | 'creating' | 'waiting' | 'connecting' | 'connected' | 'transferring' | 'received' | 'done' | 'error';

interface DeviceSyncDataTransferProps {
  availableModes?: readonly Mode[];
  hideHeader?: boolean;
}

function PairingQrScanner({ onScan }: { onScan: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const stop = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    setScanning(false);
  };

  useEffect(() => stop, []);

  const start = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      const worker = createOpticalDecodeWorker();
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<{ bytes: Uint8Array | null }>) => {
        if (!event.data.bytes) return;
        const text = new TextDecoder().decode(event.data.bytes);
        stop();
        onScan(text);
      };
      const video = videoRef.current;
      if (!video) throw new Error('CAMERA_UNAVAILABLE');
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      const draw = () => {
        if (!streamRef.current || !workerRef.current || !video.videoWidth) return;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
          context.drawImage(video, 0, 0);
          const image = context.getImageData(0, 0, canvas.width, canvas.height);
          workerRef.current.postMessage({ id: Date.now(), buffer: image.data.buffer, width: canvas.width, height: canvas.height }, [image.data.buffer]);
        }
        window.setTimeout(draw, 180);
      };
      draw();
    } catch (caught) {
      stop();
      setError(caught instanceof Error && caught.name === 'NotAllowedError' ? 'Bạn chưa cấp quyền camera.' : 'Không thể mở camera để quét QR.');
    }
  };

  return <div className="space-y-2">
    {scanning && <video ref={videoRef} muted playsInline className="aspect-[4/3] w-full rounded-lg bg-slate-900 object-cover" />}
    {!scanning && <button type="button" onClick={() => void start()} className="ustudy-button-outline h-10 w-full text-sm"><Camera className="h-4 w-4" />Quét mã QR</button>}
    {scanning && <button type="button" onClick={stop} className="ustudy-button-outline h-9 w-full text-xs"><X className="h-3.5 w-3.5" />Dừng quét</button>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>;
}

function PairingCodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const normalized = value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 6);
  const update = (index: number, next: string) => {
    const character = next.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(-1);
    const characters = normalized.padEnd(6, ' ').split('');
    characters[index] = character || ' ';
    onChange(characters.join('').replace(/\s+$/g, ''));
    if (character && index < 5) inputRefs.current[index + 1]?.focus();
  };

  return <div
    className="flex items-center justify-center gap-1.5"
    onPaste={(event) => {
      event.preventDefault();
      const pasted = event.clipboardData.getData('text').toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 6);
      onChange(pasted);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }}
  >
    {Array.from({ length: 6 }, (_, index) => <Fragment key={index}>
      {index === 3 && <span className="text-sm font-bold text-gray-300">-</span>}
      <input
        ref={(element) => { inputRefs.current[index] = element; }}
        value={normalized[index] ?? ''}
        onChange={(event) => update(index, event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Backspace' && !normalized[index] && index > 0) inputRefs.current[index - 1]?.focus();
        }}
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        aria-label={`Ký tự ${index + 1} của mã kết nối`}
        className="h-11 w-10 rounded-lg border border-gray-200 bg-white text-center font-mono text-lg font-semibold uppercase text-[#004A98] outline-none transition-colors focus:border-[#004A98] focus:ring-2 focus:ring-blue-100"
      />
    </Fragment>)}
  </div>;
}

export function DeviceSyncDataTransfer({ availableModes = ['send', 'receive'], hideHeader = false }: DeviceSyncDataTransferProps) {
  const { cryptoKey, hasData, unlock } = useCrypto();
  const canSend = availableModes.includes('send');
  const canReceive = availableModes.includes('receive');
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [pairingText, setPairingText] = useState('');
  const [pin, setPin] = useState('');
  const [sas, setSas] = useState('');
  const [progress, setProgress] = useState(0);
  const [received, setReceived] = useState<{ masterKey: Uint8Array; data: Record<string, string> } | null>(null);
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);
  const [sasConfirmed, setSasConfirmed] = useState(false);
  const [peerSasConfirmed, setPeerSasConfirmed] = useState(false);
  const signalingRef = useRef<DeviceSyncSignalingClient | null>(null);
  const transportRef = useRef<ReturnType<typeof createWebRtcTransport> | null>(null);
  const receiverRef = useRef<SyncPackageReceiver | null>(null);
  const sessionKeyRef = useRef<CryptoKey | null>(null);
  const sessionIdRef = useRef('');
  const nonceRef = useRef('');
  const sasRef = useRef('');
  const syncCompletedRef = useRef(false);
  const connectionTimeoutRef = useRef<number | null>(null);
  const senderPairingSentRef = useRef(false);
  const sasConfirmedRef = useRef(false);
  const peerSasConfirmedRef = useRef(false);

  const failTransport = (caught: unknown) => {
    const message = caught instanceof Error ? caught.message : 'Không thể thiết lập kết nối trực tiếp giữa hai thiết bị.';
    setError(message);
    setPhase('error');
  };

  const close = () => {
    syncCompletedRef.current = true;
    if (connectionTimeoutRef.current !== null) window.clearTimeout(connectionTimeoutRef.current);
    connectionTimeoutRef.current = null;
    signalingRef.current?.close();
    transportRef.current?.close();
    receiverRef.current?.release();
    received?.masterKey.fill(0);
    signalingRef.current = null;
    transportRef.current = null;
    receiverRef.current = null;
    sessionKeyRef.current = null;
    sessionIdRef.current = ''; nonceRef.current = ''; sasRef.current = '';
    senderPairingSentRef.current = false;
    sasConfirmedRef.current = false;
    peerSasConfirmedRef.current = false;
    setMode(null); setPhase('idle'); setError(''); setQrImage(''); setPairingCode(''); setShowQr(false); setPairingText(''); setPin(''); setSas(''); setProgress(0); setReceived(null); setReplaceConfirmed(false); setSasConfirmed(false); setPeerSasConfirmed(false);
  };

  useEffect(() => () => close(), []);

  const attachChannel = (role: DeviceSyncRole, channel: RTCDataChannel) => {
    channel.onopen = () => {
      if (connectionTimeoutRef.current !== null) window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
      setPhase('connected');
      const key = sessionKeyRef.current;
      if (!key) return;
      void sendEncryptedSyncMessage(channel, key, sessionIdRef.current, { type: 'hello', protocol: DEVICE_SYNC_PROTOCOL, sessionId: sessionIdRef.current, nonce: nonceRef.current, sas: sasRef.current });
    };
    channel.onmessage = (event) => void (async () => {
      try {
        const key = sessionKeyRef.current;
        if (!key) throw new Error('SESSION_KEY_UNAVAILABLE');
        const message = await readEncryptedSyncMessage(event.data, key, sessionIdRef.current);
        if (message.type === 'hello') {
          if (message.protocol !== DEVICE_SYNC_PROTOCOL || message.sessionId !== sessionIdRef.current || message.nonce !== nonceRef.current || message.sas !== sasRef.current) throw new Error('PAIRING_VERIFICATION_FAILED');
          return;
        }
        if (message.type === 'sas-confirmed') {
          peerSasConfirmedRef.current = true;
          setPeerSasConfirmed(true);
          return;
        }
        if (role !== 'receiver') return;
        if (!sasConfirmedRef.current || !peerSasConfirmedRef.current) {
          throw new Error('TRANSFER_BEFORE_SAS_CONFIRMATION');
        }
        const result = await receiverRef.current?.accept(message);
        setProgress(receiverRef.current?.progress ?? 0);
        if (result) {
          syncCompletedRef.current = true;
          setReceived({ masterKey: result.masterKey, data: result.syncPackage.data });
          setPhase('received');
          await sendEncryptedSyncMessage(channel, key, sessionIdRef.current, { type: 'ack' });
        }
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Không thể xác minh gói đồng bộ.');
        setPhase('error');
      }
    })();
  };

  const confirmSas = async () => {
    const channel = transportRef.current?.channel;
    const key = sessionKeyRef.current;
    if (!channel || !key || !sas) return;
    try {
      await sendEncryptedSyncMessage(channel, key, sessionIdRef.current, { type: 'sas-confirmed' });
      sasConfirmedRef.current = true;
      setSasConfirmed(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không thể xác nhận mã ghép đôi.');
      setPhase('error');
    }
  };

  const configureTransport = async (role: DeviceSyncRole, signaling: DeviceSyncSignalingClient, sessionKey: CryptoKey) => {
    sessionKeyRef.current = sessionKey;
    const transport = createWebRtcTransport(role, signaling, (channel) => attachChannel(role, channel), (state) => {
      if (state === 'connected' && connectionTimeoutRef.current !== null) {
        window.clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      if (state === 'failed' || state === 'disconnected') {
        if (connectionTimeoutRef.current !== null) window.clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
        setError('Kết nối trực tiếp giữa hai thiết bị bị ngắt.');
        setPhase('error');
      }
    });
    transportRef.current = transport;
    if (connectionTimeoutRef.current !== null) window.clearTimeout(connectionTimeoutRef.current);
    connectionTimeoutRef.current = window.setTimeout(() => {
      transport.close();
      setError('Không thể tạo kết nối trực tiếp trong 30 giây. Hãy thử để hai thiết bị cùng mạng Wi-Fi rồi kết nối lại.');
      setPhase('error');
    }, 30_000);
    if (role === 'sender') await transport.start();
  };

  const createSenderSession = async () => {
    const url = getDeviceSyncSignalingUrl();
    if (!url || !cryptoKey) { setError(!url ? 'Chưa cấu hình máy chủ thiết lập kết nối.' : 'Hãy mở khóa dữ liệu trước khi gửi.'); setPhase('error'); return; }
    syncCompletedRef.current = false;
    senderPairingSentRef.current = false;
    sasConfirmedRef.current = false;
    peerSasConfirmedRef.current = false;
    setSasConfirmed(false);
    setPeerSasConfirmed(false);
    setPhase('creating'); setError('');
    try {
      const pair = await createEphemeralKeyPair();
      const nonce = crypto.getRandomValues(new Uint32Array(4)).join('-');
      const sessionId = createDeviceSyncSessionId();
      sessionIdRef.current = sessionId;
      nonceRef.current = nonce;
      const signaling = await DeviceSyncSignalingClient.connect(url, sessionId, 'sender');
      signalingRef.current = signaling;
      signaling.onMessage = async (message) => {
        try {
          const payload = message.payload;
          if (message.type === 'ready' && !senderPairingSentRef.current && payload && typeof payload === 'object' && (payload as { peerCount?: unknown }).peerCount === 2) {
            senderPairingSentRef.current = true;
            signaling.send({ type: 'public-key', role: 'sender', payload: { publicKey: pair.publicKey, nonce } });
          } else if (message.type === 'public-key' && message.role === 'receiver' && payload && typeof payload === 'object' && typeof (payload as { publicKey?: unknown }).publicKey === 'string') {
            const receiverPublicKey = (payload as { publicKey: string }).publicKey;
            const key = await deriveSessionKey(pair.privateKey, receiverPublicKey, sessionId, nonce);
            const shortAuthenticationString = await deriveShortAuthenticationString(pair.privateKey, receiverPublicKey, sessionId, nonce);
            sasRef.current = shortAuthenticationString;
            setSas(shortAuthenticationString);
            await configureTransport('sender', signaling, key);
            setPhase('connecting');
          } else if (['offer', 'answer', 'ice'].includes(message.type)) await transportRef.current?.handleSignal(message);
        } catch (caught) {
          failTransport(caught);
        }
      };
      signaling.onClose = (reason) => { if (!syncCompletedRef.current) { setError(`Phiên đã đóng: ${reason}`); setPhase('error'); } };
      const payload: PairingQrPayload = { protocol: DEVICE_SYNC_PROTOCOL, sessionId };
      setQrImage(await QRCode.toDataURL(JSON.stringify(payload), { width: 280, margin: 1, errorCorrectionLevel: 'M' }));
      setPairingCode(formatPairingCode(sessionId));
      setPhase('waiting');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể tạo phiên gửi.'); setPhase('error'); }
  };

  const connectReceiver = async (value: string) => {
    const url = getDeviceSyncSignalingUrl();
    if (!url) { setError('Chưa cấu hình máy chủ thiết lập kết nối.'); setPhase('error'); return; }
    syncCompletedRef.current = false;
    sasConfirmedRef.current = false;
    peerSasConfirmedRef.current = false;
    setSasConfirmed(false);
    setPeerSasConfirmed(false);
    setPhase('connecting'); setError('');
    try {
      const pairing = parsePairingInput(value);
      const pair = await createEphemeralKeyPair();
      sessionIdRef.current = pairing.sessionId;
      const signaling = await DeviceSyncSignalingClient.connect(url, pairing.sessionId, 'receiver');
      signalingRef.current = signaling;
      receiverRef.current = new SyncPackageReceiver();
      signaling.onMessage = async (message) => {
        try {
          const payload = message.payload;
          if (message.type === 'public-key' && message.role === 'sender' && payload && typeof payload === 'object' && typeof (payload as { publicKey?: unknown; nonce?: unknown }).publicKey === 'string' && typeof (payload as { nonce?: unknown }).nonce === 'string') {
            const senderPublicKey = (payload as { publicKey: string }).publicKey;
            const nonce = (payload as { nonce: string }).nonce;
            nonceRef.current = nonce;
            const key = await deriveSessionKey(pair.privateKey, senderPublicKey, pairing.sessionId, nonce);
            sessionKeyRef.current = key;
            const shortAuthenticationString = await deriveShortAuthenticationString(pair.privateKey, senderPublicKey, pairing.sessionId, nonce);
            sasRef.current = shortAuthenticationString;
            setSas(shortAuthenticationString);
            await configureTransport('receiver', signaling, key);
            signaling.send({ type: 'public-key', role: 'receiver', payload: { publicKey: pair.publicKey } });
          } else if (['offer', 'answer', 'ice'].includes(message.type)) await transportRef.current?.handleSignal(message);
        } catch (caught) {
          failTransport(caught);
        }
      };
      signaling.onClose = (reason) => { if (!syncCompletedRef.current) { setError(`Phiên đã đóng: ${reason}`); setPhase('error'); } };
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể tham gia phiên nhận.'); setPhase('error'); }
  };

  const send = async () => {
    const channel = transportRef.current?.channel;
    const key = sessionKeyRef.current;
    if (!channel || !key || !cryptoKey || !pin || !sasConfirmedRef.current || !peerSasConfirmedRef.current) return;
    setPhase('transferring'); setError('');
    let rawMasterKey: Uint8Array | null = null;
    try {
      rawMasterKey = await exportMasterKeyForDeviceSync(pin);
      const bytes = serializeDeviceSyncPackage(await buildDeviceSyncPackage(cryptoKey));
      await sendSyncPackage(channel, key, sessionIdRef.current, rawMasterKey, bytes, setProgress);
      syncCompletedRef.current = true;
      setPhase('done');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể gửi dữ liệu.'); setPhase('error'); }
    finally { rawMasterKey?.fill(0); }
  };

  const commitReceived = async () => {
    if (!received || !pin || (hasData && !replaceConfirmed)) return;
    setPhase('transferring'); setError('');
    try {
      const setup = await prepareReceivedMasterKey(pin, received.masterKey);
      await replaceDeviceSyncData(received.data, DEVICE_SYNC_STORAGE_KEYS, setup.cryptoMetadata, setup.masterKey);
      received.masterKey.fill(0);
      unlock(setup.masterKey);
      syncCompletedRef.current = true;
      setPhase('done');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể lưu dữ liệu đã nhận.'); setPhase('error'); }
  };

  const configured = Boolean(getDeviceSyncSignalingUrl());
  return <>
    <div className={`flex flex-col gap-3 ${hideHeader ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
      {!hideHeader && <div><h3 className="text-sm font-semibold text-gray-900">Đồng bộ giữa thiết bị</h3><p className="mt-1 text-sm text-gray-500">Truyền trực tiếp một lần giữa hai thiết bị, không dùng tài khoản hay cloud.</p></div>}
      <div className={`flex gap-2 ${hideHeader ? '' : 'sm:shrink-0'}`}>
        {canSend && <button type="button" onClick={() => setMode('send')} className="ustudy-button-outline h-10 text-sm" disabled={!configured}><Send className="h-4 w-4" />Gửi dữ liệu</button>}
        {canReceive && <button type="button" onClick={() => setMode('receive')} className="ustudy-button-primary h-10 text-sm" disabled={!configured}><Smartphone className="h-4 w-4" />Nhận dữ liệu</button>}
      </div>
    </div>
    {!configured && <p className="mt-3 text-xs text-amber-700">Cần đặt <code>VITE_DEVICE_SYNC_SIGNALING_URL</code> sau khi deploy Worker signaling.</p>}
    <AppDialog open={mode !== null} onOpenChange={(open) => { if (!open) close(); }} title={mode === 'send' ? 'Gửi sang thiết bị khác' : 'Nhận từ thiết bị khác'} description="Dữ liệu đi trực tiếp qua kết nối giữa hai thiết bị. Server chỉ giúp hai thiết bị thiết lập kết nối, không lưu nội dung đồng bộ." icon={mode === 'send' ? Laptop : QrCode} size="lg" mobileFullScreen contentClassName="space-y-4" footer={<button type="button" onClick={close} className="ustudy-button-outline h-10"><X className="h-4 w-4" />Đóng</button>}>
      {mode === 'send' && phase === 'idle' && <button type="button" onClick={() => void createSenderSession()} className="ustudy-button-primary h-11 w-full"><Laptop className="h-4 w-4" />Tạo mã kết nối</button>}
      {mode === 'send' && phase === 'creating' && <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-[#004A98]">Đang tạo mã kết nối...</div>}
      {mode === 'send' && phase === 'waiting' && <div className="space-y-4 text-center">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Mã kết nối</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <code className="font-mono text-3xl font-bold tracking-[0.18em] text-[#004A98]">{pairingCode}</code>
            <button type="button" onClick={() => void navigator.clipboard.writeText(pairingCode)} className="ustudy-button-icon h-9 w-9" title="Sao chép mã kết nối" aria-label="Sao chép mã kết nối"><Copy className="h-4 w-4" /></button>
          </div>
          <p className="mt-3 text-sm text-blue-800">Nhập mã này trên thiết bị nhận. Phiên hết hạn sau 5 phút.</p>
          <p className="mt-2 text-xs font-medium text-blue-700">Đang chờ thiết bị nhận...</p>
        </div>
        <button type="button" onClick={() => setShowQr((current) => !current)} className="ustudy-button-ghost mx-auto h-9 text-sm"><QrCode className="h-4 w-4" />{showQr ? 'Ẩn mã QR' : 'Hiện mã QR'}</button>
        {showQr && <img src={qrImage} alt="Mã QR ghép đôi UStudy" className="mx-auto w-56 rounded-lg border border-gray-200 bg-white p-2" />}
      </div>}
      {mode === 'receive' && phase === 'idle' && <div className="space-y-4">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold text-gray-900">Nhập mã kết nối</p>
          <p className="text-xs text-gray-500">Mã gồm 6 ký tự hiển thị trên thiết bị gửi.</p>
          <PairingCodeInput value={pairingText} onChange={setPairingText} />
        </div>
        <button type="button" onClick={() => void connectReceiver(pairingText)} className="ustudy-button-primary h-10 w-full" disabled={pairingText.replace(/[^A-HJ-NP-Z2-9]/gi, '').length !== 6}><RefreshCw className="h-4 w-4" />Kết nối</button>
        <div className="flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" />hoặc<span className="h-px flex-1 bg-gray-200" /></div>
        <PairingQrScanner onScan={(value) => void connectReceiver(value)} />
      </div>}
      {(phase === 'connecting' || phase === 'connected' || phase === 'transferring') && <div className="space-y-3">
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-[#004A98]">{phase === 'connected' ? 'Đã kết nối trực tiếp.' : phase === 'transferring' ? 'Đang truyền dữ liệu...' : 'Đang thiết lập kết nối trực tiếp...'}</div>
        {phase === 'connected' && <div className="rounded-xl border border-blue-100 bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mã xác minh trên cả hai thiết bị</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-[0.16em] text-[#004A98]">{sas || '...'}</p>
          <p className="mt-2 text-xs text-gray-500">Hãy kiểm tra mã này có giống trên thiết bị còn lại không.</p>
          {!sasConfirmed && <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="ustudy-button-outline h-10"><X className="h-4 w-4" />Không giống</button>
            <button type="button" onClick={() => void confirmSas()} className="ustudy-button-primary h-10" disabled={!sas}><ShieldCheck className="h-4 w-4" />Giống nhau</button>
          </div>}
          {sasConfirmed && !peerSasConfirmed && <p className="mt-3 text-sm font-medium text-amber-700">Đã xác nhận. Đang chờ thiết bị kia xác nhận.</p>}
          {sasConfirmed && peerSasConfirmed && <p className="mt-3 text-sm font-medium text-emerald-700">Hai thiết bị đã xác minh với nhau.</p>}
        </div>}
        <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-[#004A98] transition-[width]" style={{ width: `${progress * 100}%` }} /></div>
        {mode === 'send' && phase === 'connected' && sasConfirmed && peerSasConfirmed && <><input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="Nhập lại PIN hiện tại" className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#004A98]" /><button type="button" onClick={() => void send()} className="ustudy-button-primary h-11 w-full" disabled={!pin}>Bắt đầu truyền</button></>}
      </div>}
      {mode === 'receive' && phase === 'received' && received && <div className="space-y-3"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"><ShieldCheck className="mr-2 inline h-4 w-4" />Đã nhận và kiểm tra toàn vẹn {Object.keys(received.data).length} mục dữ liệu.</div>{hasData && <label className="flex gap-2 text-sm text-amber-800"><input type="checkbox" checked={replaceConfirmed} onChange={(event) => setReplaceConfirmed(event.target.checked)} />Thiết bị này đã có dữ liệu. Tôi xác nhận thay thế dữ liệu UStudy hiện tại.</label>}<input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="Đặt PIN riêng cho thiết bị này" className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#004A98]" /><button type="button" onClick={() => void commitReceived()} className="ustudy-button-primary h-11 w-full" disabled={!pin || (hasData && !replaceConfirmed)}>Lưu dữ liệu vào thiết bị này</button></div>}
      {phase === 'done' && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><ShieldCheck className="mr-2 inline h-4 w-4" />Đồng bộ đã hoàn tất. Khóa phiên đã được xóa khỏi bộ nhớ.</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    </AppDialog>
  </>;
}
