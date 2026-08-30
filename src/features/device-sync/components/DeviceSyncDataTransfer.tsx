import { Camera, Laptop, QrCode, RefreshCw, Send, ShieldCheck, Smartphone, X } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { AppDialog } from '../../../components/ui/overlays/app-dialog';
import { useCrypto } from '../../../context/CryptoContext';
import { exportMasterKeyForDeviceSync, prepareReceivedMasterKey, replaceDeviceSyncData } from '../../../helpers/localStorage/save';
import { createOpticalDecodeWorker } from '../../optical-sync/workers/create-optical-decode-worker';
import { createEphemeralKeyPair, deriveSessionKey, deriveShortAuthenticationString } from '../services/sync-crypto';
import { DEVICE_SYNC_PROTOCOL, parsePairingQr, type PairingQrPayload } from '../services/sync-protocol';
import { buildDeviceSyncPackage, DEVICE_SYNC_STORAGE_KEYS, serializeDeviceSyncPackage } from '../services/sync-package';
import { createDeviceSyncSession, DeviceSyncSignalingClient, getDeviceSyncSignalingUrl, type DeviceSyncRole } from '../services/signaling';
import { readEncryptedSyncMessage, sendEncryptedSyncMessage, sendSyncPackage, SyncPackageReceiver } from '../services/transfer';
import { createWebRtcTransport } from '../services/webrtc';

type Mode = 'send' | 'receive';
type Phase = 'idle' | 'creating' | 'waiting' | 'connecting' | 'connected' | 'transferring' | 'received' | 'done' | 'error';

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

export function DeviceSyncDataTransfer() {
  const { cryptoKey, hasData, unlock } = useCrypto();
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [pairingText, setPairingText] = useState('');
  const [pin, setPin] = useState('');
  const [sas, setSas] = useState('');
  const [progress, setProgress] = useState(0);
  const [received, setReceived] = useState<{ masterKey: Uint8Array; data: Record<string, string> } | null>(null);
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);
  const signalingRef = useRef<DeviceSyncSignalingClient | null>(null);
  const transportRef = useRef<ReturnType<typeof createWebRtcTransport> | null>(null);
  const receiverRef = useRef<SyncPackageReceiver | null>(null);
  const sessionKeyRef = useRef<CryptoKey | null>(null);
  const sessionIdRef = useRef('');
  const nonceRef = useRef('');
  const sasRef = useRef('');

  const close = () => {
    signalingRef.current?.close();
    transportRef.current?.close();
    receiverRef.current?.release();
    received?.masterKey.fill(0);
    signalingRef.current = null;
    transportRef.current = null;
    receiverRef.current = null;
    sessionKeyRef.current = null;
    sessionIdRef.current = ''; nonceRef.current = ''; sasRef.current = '';
    setMode(null); setPhase('idle'); setError(''); setQrImage(''); setPairingText(''); setPin(''); setSas(''); setProgress(0); setReceived(null); setReplaceConfirmed(false);
  };

  useEffect(() => () => close(), []);

  const attachChannel = (role: DeviceSyncRole, channel: RTCDataChannel) => {
    channel.onopen = () => {
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
        if (role !== 'receiver') return;
        const result = await receiverRef.current?.accept(message);
        setProgress(receiverRef.current?.progress ?? 0);
        if (result) {
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

  const configureTransport = async (role: DeviceSyncRole, signaling: DeviceSyncSignalingClient, sessionKey: CryptoKey) => {
    sessionKeyRef.current = sessionKey;
    const transport = createWebRtcTransport(role, signaling, (channel) => attachChannel(role, channel), (state) => {
      if (state === 'failed' || state === 'disconnected') { setError('Kết nối trực tiếp giữa hai thiết bị bị ngắt.'); setPhase('error'); }
    });
    transportRef.current = transport;
    if (role === 'sender') await transport.start();
  };

  const receive = async () => {
    const url = getDeviceSyncSignalingUrl();
    if (!url) { setError('Chưa cấu hình máy chủ thiết lập kết nối.'); setPhase('error'); return; }
    setPhase('creating'); setError('');
    try {
      const pair = await createEphemeralKeyPair();
      const nonce = crypto.getRandomValues(new Uint32Array(4)).join('-');
      const session = await createDeviceSyncSession(url, pair.publicKey, nonce);
      sessionIdRef.current = session.sessionId;
      nonceRef.current = nonce;
      const payload: PairingQrPayload = { protocol: DEVICE_SYNC_PROTOCOL, sessionId: session.sessionId, publicKey: pair.publicKey, nonce };
      setQrImage(await QRCode.toDataURL(JSON.stringify(payload), { width: 280, margin: 1, errorCorrectionLevel: 'M' }));
      const signaling = await DeviceSyncSignalingClient.connect(url, session.sessionId, 'receiver');
      signalingRef.current = signaling;
      receiverRef.current = new SyncPackageReceiver();
      signaling.onMessage = (message) => void (async () => {
        if (message.type === 'public-key' && typeof message.publicKey === 'string') {
          const key = await deriveSessionKey(pair.privateKey, message.publicKey, session.sessionId, nonce);
          const shortAuthenticationString = await deriveShortAuthenticationString(pair.privateKey, message.publicKey, session.sessionId, nonce);
          sasRef.current = shortAuthenticationString;
          setSas(shortAuthenticationString);
          await configureTransport('receiver', signaling, key);
          setPhase('connecting');
        } else if (['offer', 'answer', 'ice'].includes(message.type)) await transportRef.current?.handleSignal(message);
      });
      signaling.onClose = (reason) => { if (phase !== 'done') { setError(`Phiên đã đóng: ${reason}`); setPhase('error'); } };
      setPhase('waiting');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể tạo phiên nhận.'); setPhase('error'); }
  };

  const connectSender = async (value: string) => {
    const url = getDeviceSyncSignalingUrl();
    if (!url || !cryptoKey) { setError(!url ? 'Chưa cấu hình máy chủ thiết lập kết nối.' : 'Hãy mở khóa dữ liệu trước khi gửi.'); setPhase('error'); return; }
    setPhase('connecting'); setError('');
    try {
      const pairing = parsePairingQr(value);
      const pair = await createEphemeralKeyPair();
      sessionIdRef.current = pairing.sessionId;
      nonceRef.current = pairing.nonce;
      const signaling = await DeviceSyncSignalingClient.connect(url, pairing.sessionId, 'sender');
      signalingRef.current = signaling;
      const key = await deriveSessionKey(pair.privateKey, pairing.publicKey, pairing.sessionId, pairing.nonce);
      sessionKeyRef.current = key;
      setSas(await deriveShortAuthenticationString(pair.privateKey, pairing.publicKey, pairing.sessionId, pairing.nonce));
      signaling.send({ type: 'public-key', publicKey: pair.publicKey, receiverPublicKey: pairing.publicKey });
      const shortAuthenticationString = await deriveShortAuthenticationString(pair.privateKey, pairing.publicKey, pairing.sessionId, pairing.nonce);
      sasRef.current = shortAuthenticationString;
      setSas(shortAuthenticationString);
      signaling.onMessage = (message) => void (async () => {
        if (['offer', 'answer', 'ice'].includes(message.type)) await transportRef.current?.handleSignal(message);
        if (message.type === 'peer-joined') await configureTransport('sender', signaling, key);
      });
      signaling.onClose = (reason) => { if (phase !== 'done') { setError(`Phiên đã đóng: ${reason}`); setPhase('error'); } };
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Mã QR không hợp lệ.'); setPhase('error'); }
  };

  const send = async () => {
    const channel = transportRef.current?.channel;
    const key = sessionKeyRef.current;
    if (!channel || !key || !cryptoKey || !pin) return;
    setPhase('transferring'); setError('');
    let rawMasterKey: Uint8Array | null = null;
    try {
      rawMasterKey = await exportMasterKeyForDeviceSync(pin);
      const bytes = serializeDeviceSyncPackage(await buildDeviceSyncPackage(cryptoKey));
      await sendSyncPackage(channel, key, sessionIdRef.current, rawMasterKey, bytes, setProgress);
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
      setPhase('done');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Không thể lưu dữ liệu đã nhận.'); setPhase('error'); }
  };

  const configured = Boolean(getDeviceSyncSignalingUrl());
  return <>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h3 className="text-sm font-semibold text-gray-900">Đồng bộ giữa thiết bị</h3><p className="mt-1 text-sm text-gray-500">Truyền trực tiếp một lần giữa hai thiết bị, không dùng tài khoản hay cloud.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => setMode('send')} className="ustudy-button-outline h-10 text-sm" disabled={!configured}><Send className="h-4 w-4" />Gửi dữ liệu</button><button type="button" onClick={() => setMode('receive')} className="ustudy-button-primary h-10 text-sm" disabled={!configured}><Smartphone className="h-4 w-4" />Nhận dữ liệu</button></div>
    </div>
    {!configured && <p className="mt-3 text-xs text-amber-700">Cần đặt <code>VITE_DEVICE_SYNC_SIGNALING_URL</code> sau khi deploy Worker signaling.</p>}
    <AppDialog open={mode !== null} onOpenChange={(open) => { if (!open) close(); }} title={mode === 'send' ? 'Gửi sang thiết bị khác' : 'Nhận từ thiết bị khác'} description="Dữ liệu đi trực tiếp qua kết nối giữa hai thiết bị. Server chỉ giúp hai thiết bị thiết lập kết nối, không lưu nội dung đồng bộ." icon={mode === 'send' ? Laptop : QrCode} size="lg" mobileFullScreen contentClassName="space-y-4" footer={<button type="button" onClick={close} className="ustudy-button-outline h-10"><X className="h-4 w-4" />Đóng</button>}>
      {mode === 'receive' && phase === 'idle' && <button type="button" onClick={() => void receive()} className="ustudy-button-primary h-11 w-full"><QrCode className="h-4 w-4" />Tạo mã QR để nhận</button>}
      {mode === 'receive' && (phase === 'waiting' || phase === 'connecting') && <div className="space-y-3 text-center"><img src={qrImage} alt="Mã QR ghép đôi UStudy" className="mx-auto w-64 rounded-lg border border-gray-200 bg-white p-2" /><p className="text-sm text-gray-600">Dùng thiết bị gửi để quét mã này. Phiên sẽ hết hạn sau 5 phút.</p></div>}
      {mode === 'send' && phase === 'idle' && <div className="space-y-3"><PairingQrScanner onScan={(value) => { setPairingText(value); void connectSender(value); }} /><textarea value={pairingText} onChange={(event) => setPairingText(event.target.value)} placeholder="Hoặc dán nội dung mã QR tại đây" className="min-h-20 w-full rounded-lg border border-gray-200 p-3 text-xs outline-none focus:border-[#004A98]" /><button type="button" onClick={() => void connectSender(pairingText)} className="ustudy-button-primary h-10 w-full" disabled={!pairingText.trim()}><RefreshCw className="h-4 w-4" />Kết nối</button></div>}
      {(phase === 'connecting' || phase === 'connected' || phase === 'transferring') && <div className="space-y-3"><div className="rounded-lg bg-blue-50 p-3 text-sm text-[#004A98]">{phase === 'connected' ? `Đã kết nối. Mã xác thực: ${sas || '...'}` : 'Đang thiết lập kết nối trực tiếp...'}</div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-[#004A98] transition-[width]" style={{ width: `${progress * 100}%` }} /></div>{mode === 'send' && phase === 'connected' && <><input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="Nhập lại PIN hiện tại" className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#004A98]" /><button type="button" onClick={() => void send()} className="ustudy-button-primary h-11 w-full" disabled={!pin}>Bắt đầu truyền</button></>}</div>}
      {mode === 'receive' && phase === 'received' && received && <div className="space-y-3"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"><ShieldCheck className="mr-2 inline h-4 w-4" />Đã nhận và kiểm tra toàn vẹn {Object.keys(received.data).length} mục dữ liệu.</div>{hasData && <label className="flex gap-2 text-sm text-amber-800"><input type="checkbox" checked={replaceConfirmed} onChange={(event) => setReplaceConfirmed(event.target.checked)} />Thiết bị này đã có dữ liệu. Tôi xác nhận thay thế dữ liệu UStudy hiện tại.</label>}<input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder="Đặt PIN riêng cho thiết bị này" className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#004A98]" /><button type="button" onClick={() => void commitReceived()} className="ustudy-button-primary h-11 w-full" disabled={!pin || (hasData && !replaceConfirmed)}>Lưu dữ liệu vào thiết bị này</button></div>}
      {phase === 'done' && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><ShieldCheck className="mr-2 inline h-4 w-4" />Đồng bộ đã hoàn tất. Khóa phiên đã được xóa khỏi bộ nhớ.</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    </AppDialog>
  </>;
}
