(() => {
  if (globalThis.__USTUDY_APP_BRIDGE_INITIALIZED__) return;

  const APP_CONFIG = globalThis.USTUDY_EXTENSION_CONFIG;
  const BRIDGE_REQUEST = 'USTUDY_EXTENSION_BRIDGE_REQUEST';
  const BRIDGE_RESPONSE = 'USTUDY_EXTENSION_BRIDGE_RESPONSE';
  const PENDING_AVAILABLE = 'USTUDY_EXTENSION_PENDING_AVAILABLE';
  const READY_MESSAGE = 'USTUDY_EXTENSION_READY';
  const READY_EVENT = 'ustudy:extension-ready';
  const MARKER_ATTRIBUTE = 'data-ustudy-extension-version';

  const isSupportedApp = APP_CONFIG.appOrigins.includes(window.location.origin)
    || APP_CONFIG.developmentAppHostnames.includes(window.location.hostname);
  if (!isSupportedApp) return;

  globalThis.__USTUDY_APP_BRIDGE_INITIALIZED__ = true;

  window.addEventListener('message', async (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const request = event.data;
    if (request?.type !== BRIDGE_REQUEST || typeof request.requestId !== 'string') return;

    const allowedActions = new Set([
      'GET_STATE',
      'SAVE_SETTINGS',
      'OPEN_PORTAL',
      'GET_PENDING_IMPORT',
      'ACK_PENDING_IMPORT',
    ]);
    if (!allowedActions.has(request.action)) return;

    try {
      const response = await chrome.runtime.sendMessage({
        action: request.action,
        payload: request.payload,
      });
      window.postMessage({
        type: BRIDGE_RESPONSE,
        requestId: request.requestId,
        ok: Boolean(response?.ok),
        data: response?.data,
        error: response?.error,
      }, window.location.origin);
    } catch (error) {
      window.postMessage({
        type: BRIDGE_RESPONSE,
        requestId: request.requestId,
        ok: false,
        error: error?.message || String(error),
      }, window.location.origin);
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'USTUDY_PENDING_IMPORT_AVAILABLE') return;
    window.postMessage({ type: PENDING_AVAILABLE }, window.location.origin);
  });

  function announceReady() {
    document.documentElement?.setAttribute(MARKER_ATTRIBUTE, APP_CONFIG.extensionVersion);
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: APP_CONFIG.extensionVersion }));
    window.postMessage({
      type: READY_MESSAGE,
      extensionVersion: APP_CONFIG.extensionVersion,
    }, window.location.origin);
  }

  if (document.documentElement) announceReady();
  else document.addEventListener('DOMContentLoaded', announceReady, { once: true });
})();
