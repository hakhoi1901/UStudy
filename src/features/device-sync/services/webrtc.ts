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
  const attachChannel = (next: RTCDataChannel) => {
    next.binaryType = 'arraybuffer';
    channel = next;
    onChannel(next);
  };
  connection.onicecandidate = (event) => {
    if (event.candidate) signaling.send({ type: 'ice', candidate: event.candidate.toJSON() });
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
      signaling.send({ type: 'offer', sdp: offer });
    },
    async handleSignal(message) {
      if (message.type === 'offer' && role === 'receiver') {
        await connection.setRemoteDescription(message.sdp as RTCSessionDescriptionInit);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        signaling.send({ type: 'answer', sdp: answer });
      } else if (message.type === 'answer' && role === 'sender') {
        await connection.setRemoteDescription(message.sdp as RTCSessionDescriptionInit);
      } else if (message.type === 'ice' && message.candidate) {
        await connection.addIceCandidate(message.candidate as RTCIceCandidateInit);
      }
    },
    close() {
      channel?.close();
      connection.close();
    },
  };
}
