import type { DeviceSyncRole, DeviceSyncSignalingClient, SignalMessage } from './signaling';

const STUN_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

export interface WebRtcTransport {
  channel: RTCDataChannel | null;
  handleSignal(message: SignalMessage): Promise<void>;
  start(): Promise<void>;
  close(): void;
}

export function createWebRtcTransport(
  role: DeviceSyncRole,
  signaling: DeviceSyncSignalingClient,
  onChannel: (channel: RTCDataChannel) => void,
  onConnectionState: (state: RTCPeerConnectionState) => void,
): WebRtcTransport {
  const connection = new RTCPeerConnection({ iceServers: STUN_SERVERS });
  let channel: RTCDataChannel | null = null;
  const pendingRemoteCandidates: RTCIceCandidateInit[] = [];

  const addRemoteCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!connection.remoteDescription) {
      pendingRemoteCandidates.push(candidate);
      return;
    }
    await connection.addIceCandidate(candidate);
  };

  const applyRemoteDescription = async (description: RTCSessionDescriptionInit) => {
    await connection.setRemoteDescription(description);
    while (pendingRemoteCandidates.length) {
      const candidate = pendingRemoteCandidates.shift();
      if (candidate) await connection.addIceCandidate(candidate);
    }
  };
  const attachChannel = (next: RTCDataChannel) => {
    next.binaryType = 'arraybuffer';
    channel = next;
    onChannel(next);
  };
  connection.onicecandidate = (event) => {
    if (event.candidate) signaling.send({ type: 'ice', payload: event.candidate.toJSON() });
  };
  connection.onconnectionstatechange = () => onConnectionState(connection.connectionState);
  if (role === 'sender') attachChannel(connection.createDataChannel('ustudy-sync-v1', { ordered: true }));
  else connection.ondatachannel = (event) => attachChannel(event.channel);

  return {
    get channel() { return channel; },
    async start() {
      if (role !== 'sender') return;
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      signaling.send({ type: 'offer', payload: offer });
    },
    async handleSignal(message) {
      if (message.type === 'offer' && role === 'receiver') {
        await applyRemoteDescription(message.payload as RTCSessionDescriptionInit);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        signaling.send({ type: 'answer', payload: answer });
      } else if (message.type === 'answer' && role === 'sender') {
        await applyRemoteDescription(message.payload as RTCSessionDescriptionInit);
      } else if (message.type === 'ice' && message.payload) {
        await addRemoteCandidate(message.payload as RTCIceCandidateInit);
      }
    },
    close() {
      channel?.close();
      connection.close();
    },
  };
}
