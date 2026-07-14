importScripts('config.js');

const CONFIG = globalThis.USTUDY_EXTENSION_CONFIG;
const STORAGE_KEYS = {
  settings: 'ustudySyncSettings',
  stats: 'ustudySyncStats',
  pendingImport: 'ustudyPendingImport',
  pendingSyncRequest: 'ustudyPendingSyncRequest',
};

const DEFAULT_SETTINGS = {
  onboardingComplete: false,
  mode: CONFIG.defaults.mode,
  sources: {
    grades: true,
    registrations: true,
    exams: true,
    courses: true,
    tuition: true,
  },
  academicYear: CONFIG.defaults.academicYear,
  semester: CONFIG.defaults.semester,
  cooldownMinutes: CONFIG.defaults.cooldownMinutes,
  openAppAfterSync: true,
  autoSuggestionDismissed: false,
};

const DEFAULT_STATS = {
  successfulSyncs: 0,
  lastSyncedAt: null,
  lastError: null,
};
const runningPortalTabs = new Set();
const autoSyncedPortalTabs = new Set();

function mergeSettings(value) {
  const incoming = value && typeof value === 'object' ? value : {};
  const mode = ['manual', 'ask', 'auto'].includes(incoming.mode) ? incoming.mode : DEFAULT_SETTINGS.mode;
  const semester = ['1', '2', '3'].includes(String(incoming.semester))
    ? String(incoming.semester)
    : DEFAULT_SETTINGS.semester;
  const cooldownMinutes = Math.max(10, Math.min(240, Number(incoming.cooldownMinutes) || DEFAULT_SETTINGS.cooldownMinutes));

  return {
    ...DEFAULT_SETTINGS,
    ...incoming,
    mode,
    semester,
    cooldownMinutes,
    sources: {
      ...DEFAULT_SETTINGS.sources,
      ...(incoming.sources || {}),
      grades: true,
    },
  };
}

async function getStoredState() {
  const stored = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
  const settings = mergeSettings(stored[STORAGE_KEYS.settings]);
  const stats = { ...DEFAULT_STATS, ...(stored[STORAGE_KEYS.stats] || {}) };
  const pending = stored[STORAGE_KEYS.pendingImport] || null;

  return {
    installed: true,
    extensionVersion: CONFIG.extensionVersion,
    settings,
    stats,
    pendingImport: pending ? { id: pending.id, createdAt: pending.createdAt } : null,
    pendingSyncRequest: Boolean(stored[STORAGE_KEYS.pendingSyncRequest]),
  };
}

async function saveSettings(patch) {
  const current = await getStoredState();
  const settings = mergeSettings({
    ...current.settings,
    ...(patch || {}),
    sources: {
      ...current.settings.sources,
      ...(patch?.sources || {}),
    },
  });
  await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
  return getStoredState();
}

function isPortalUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    return new RegExp(CONFIG.portalHostnamePattern, 'i').test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function isAppUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsedUrl = new URL(url);
    return CONFIG.appOrigins.includes(parsedUrl.origin)
      || CONFIG.developmentAppHostnames.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

async function findTab(predicate) {
  const tabs = await chrome.tabs.query({});
  return tabs.find((tab) => predicate(tab.url));
}

async function focusTab(tab) {
  if (!tab?.id) return;
  await chrome.tabs.update(tab.id, { active: true });
  if (typeof tab.windowId === 'number') await chrome.windows.update(tab.windowId, { focused: true });
}

async function notifyAppTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.filter((tab) => tab.id && isAppUrl(tab.url)).map(async (tab) => {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'USTUDY_PENDING_IMPORT_AVAILABLE' });
    } catch {
      // The app may still be loading; it will request the pending packet on mount.
    }
  }));
}

async function openOrFocusApp() {
  const appTab = await findTab(isAppUrl);
  if (appTab) {
    await focusTab(appTab);
    await notifyAppTabs();
    return appTab;
  }
  return chrome.tabs.create({ url: CONFIG.productionAppUrl });
}

async function injectAppBridgeIntoOpenTabs() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.filter((tab) => tab.id && isAppUrl(tab.url)).map(async (tab) => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['config.js', 'app-bridge.js'],
      });
    } catch {
      // Restricted or closing tabs can reject injection; reloading uses the manifest script.
    }
  }));
}

async function openPortalAndRequestSync() {
  await chrome.storage.local.set({ [STORAGE_KEYS.pendingSyncRequest]: true });
  const portalTab = await findTab(isPortalUrl);
  if (portalTab) {
    await focusTab(portalTab);
    try {
      await chrome.tabs.sendMessage(portalTab.id, { type: 'USTUDY_START_SYNC' });
    } catch {
      // The content script will consume pendingSyncRequest after the page is ready.
    }
    return;
  }
  await chrome.tabs.create({ url: CONFIG.portalLoginUrl });
}

function buildRunnerRuntime(requestId, settings) {
  return {
    transport: 'extension',
    requestId,
    config: {
      URL_DIEM: CONFIG.endpoints.grades,
      URL_LICHTHI: CONFIG.endpoints.exams,
      URL_HOCPHI: CONFIG.endpoints.tuition,
      URL_LOPMO: CONFIG.endpoints.openClasses,
      URL_DKHP: CONFIG.endpoints.registrations,
      TARGET_YEAR: settings.academicYear,
      TARGET_SEM: settings.semester,
      CLASS_TARGET_YEAR: settings.academicYear,
      CLASS_TARGET_SEM: settings.semester,
      REG_TARGET_YEAR: settings.academicYear,
      REG_TARGET_SEM: settings.semester,
      VERSION: CONFIG.scraperVersion,
      PROTOCOL_VERSION: CONFIG.protocolVersion,
      CONCURRENCY: '4',
    },
    syncOptions: {
      getTuition: settings.sources.tuition,
      getExam: settings.sources.exams,
      getClass: settings.sources.courses,
      classYear: settings.academicYear,
      classSem: settings.semester,
      getReg: settings.sources.registrations,
      regYear: settings.academicYear,
      regSem: settings.semester,
    },
  };
}

async function runPortalSync(sender, requestId, trigger = 'manual') {
  if (!sender.tab?.id || !isPortalUrl(sender.tab.url)) throw new Error('Chỉ có thể đồng bộ từ HCMUS Portal.');
  const tabId = sender.tab.id;
  if (runningPortalTabs.has(tabId) || (trigger === 'auto' && autoSyncedPortalTabs.has(tabId))) {
    return { requestId, skipped: true };
  }
  runningPortalTabs.add(tabId);
  if (trigger === 'auto') autoSyncedPortalTabs.add(tabId);
  const state = await getStoredState();
  const runtime = buildRunnerRuntime(requestId, state.settings);

  await chrome.storage.local.set({ [STORAGE_KEYS.pendingSyncRequest]: false });
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: (value) => { window.__USTUDY_PORTAL_SYNC_RUNTIME__ = value; },
    args: [runtime],
  });
  void chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    files: ['portal-runner.js'],
  }).catch(async (error) => {
    runningPortalTabs.delete(tabId);
    if (trigger === 'auto') autoSyncedPortalTabs.delete(tabId);
    await chrome.tabs.sendMessage(tabId, {
      type: 'USTUDY_RUNNER_ERROR',
      requestId,
      message: error?.message || 'Không thể khởi chạy bộ đồng bộ.',
    }).catch(() => undefined);
  });

  return { requestId };
}

async function storeSyncResult(packet) {
  if (!packet?.raw || !Array.isArray(packet.raw.grades)) throw new Error('Gói dữ liệu Portal không hợp lệ.');
  const state = await getStoredState();
  const now = new Date().toISOString();
  const pendingImport = {
    id: crypto.randomUUID(),
    createdAt: now,
    packet,
  };
  const stats = {
    ...state.stats,
    successfulSyncs: state.stats.successfulSyncs + 1,
    lastSyncedAt: now,
    lastError: null,
  };

  await chrome.storage.local.set({
    [STORAGE_KEYS.pendingImport]: pendingImport,
    [STORAGE_KEYS.stats]: stats,
  });
  await chrome.action.setBadgeBackgroundColor({ color: '#004A98' });
  await chrome.action.setBadgeText({ text: '1' });

  if (state.settings.openAppAfterSync) await openOrFocusApp();
  else await notifyAppTabs();
  return { pendingImport: { id: pendingImport.id, createdAt: pendingImport.createdAt }, stats };
}

async function handleMessage(message, sender) {
  switch (message?.action) {
    case 'GET_STATE':
      return getStoredState();
    case 'SAVE_SETTINGS':
      return saveSettings(message.payload);
    case 'OPEN_PORTAL':
      await openPortalAndRequestSync();
      return { opened: true };
    case 'RUN_PORTAL_SYNC':
      return runPortalSync(sender, message.requestId || crypto.randomUUID(), message.trigger);
    case 'SYNC_COMPLETE':
      if (!isPortalUrl(sender.tab?.url)) throw new Error('Nguồn đồng bộ không hợp lệ.');
      if (sender.tab?.id) runningPortalTabs.delete(sender.tab.id);
      return storeSyncResult(message.payload);
    case 'SYNC_FAILED': {
      if (sender.tab?.id) {
        runningPortalTabs.delete(sender.tab.id);
        autoSyncedPortalTabs.delete(sender.tab.id);
      }
      const state = await getStoredState();
      await chrome.storage.local.set({
        [STORAGE_KEYS.stats]: { ...state.stats, lastError: String(message.message || 'Đồng bộ thất bại.') },
      });
      return { recorded: true };
    }
    case 'GET_PENDING_IMPORT': {
      const stored = await chrome.storage.local.get(STORAGE_KEYS.pendingImport);
      return stored[STORAGE_KEYS.pendingImport] || null;
    }
    case 'ACK_PENDING_IMPORT': {
      const stored = await chrome.storage.local.get(STORAGE_KEYS.pendingImport);
      const pending = stored[STORAGE_KEYS.pendingImport];
      if (!pending || pending.id === message.payload?.id) {
        await chrome.storage.local.remove(STORAGE_KEYS.pendingImport);
        await chrome.action.setBadgeText({ text: '' });
      }
      return { acknowledged: true };
    }
    default:
      throw new Error('Yêu cầu extension không được hỗ trợ.');
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getStoredState();
  await chrome.storage.local.set({
    [STORAGE_KEYS.settings]: state.settings,
    [STORAGE_KEYS.stats]: state.stats,
  });
  await injectAppBridgeIntoOpenTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void injectAppBridgeIntoOpenTabs();
});

void injectAppBridgeIntoOpenTabs();

chrome.tabs.onRemoved.addListener((tabId) => {
  runningPortalTabs.delete(tabId);
  autoSyncedPortalTabs.delete(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
  return true;
});
