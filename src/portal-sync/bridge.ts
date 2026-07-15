import {
  PORTAL_EXTENSION_BRIDGE_REQUEST,
  PORTAL_EXTENSION_BRIDGE_RESPONSE,
  PORTAL_EXTENSION_MARKER_ATTRIBUTE,
  PORTAL_EXTENSION_READY,
  PORTAL_EXTENSION_READY_EVENT,
  type PortalBridgeResponse,
} from './protocol';

export type PortalBridgeAction =
  | 'GET_STATE'
  | 'SAVE_SETTINGS'
  | 'OPEN_PORTAL'
  | 'GET_PENDING_IMPORT'
  | 'ACK_PENDING_IMPORT';

export function isPortalExtensionInjected(): boolean {
  return document.documentElement?.hasAttribute(PORTAL_EXTENSION_MARKER_ATTRIBUTE) ?? false;
}

export function getInjectedPortalExtensionVersion(): string | null {
  return document.documentElement?.getAttribute(PORTAL_EXTENSION_MARKER_ATTRIBUTE) || null;
}

export async function requestPortalExtension<T>(
  action: PortalBridgeAction,
  payload?: unknown,
  timeoutMs = 4000,
): Promise<T | null> {
  const requestId = crypto.randomUUID();

  return new Promise<T | null>((resolve) => {
    let hasRepostedAfterReady = false;

    const postRequest = () => {
      window.postMessage({
        type: PORTAL_EXTENSION_BRIDGE_REQUEST,
        requestId,
        action,
        payload,
      }, window.location.origin);
    };

    const cleanup = () => {
      window.removeEventListener('message', handleResponse);
      window.removeEventListener('message', handleReadyMessage);
      document.removeEventListener(PORTAL_EXTENSION_READY_EVENT, handleReadyEvent);
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    function handleResponse(event: MessageEvent<PortalBridgeResponse<T>>) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (event.data?.type !== PORTAL_EXTENSION_BRIDGE_RESPONSE || event.data.requestId !== requestId) return;

      window.clearTimeout(timeoutId);
      cleanup();
      resolve(event.data.ok ? event.data.data ?? null : null);
    }

    function repostAfterReady() {
      if (hasRepostedAfterReady) return;
      hasRepostedAfterReady = true;
      postRequest();
    }

    function handleReadyMessage(event: MessageEvent) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (event.data?.type === PORTAL_EXTENSION_READY) repostAfterReady();
    }

    function handleReadyEvent() {
      repostAfterReady();
    }

    window.addEventListener('message', handleResponse);
    window.addEventListener('message', handleReadyMessage);
    document.addEventListener(PORTAL_EXTENSION_READY_EVENT, handleReadyEvent);
    postRequest();
  });
}
