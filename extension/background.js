importScripts('config.js');

const CONFIG = globalThis.USTUDY_EXTENSION_CONFIG;
const STORAGE_KEYS = {
  settings: 'ustudySyncSettings',
  stats: 'ustudySyncStats',
  pendingImport: 'ustudyPendingImport',
  pendingSyncRequest: 'ustudyPendingSyncRequest',
  syncSessions: 'ustudySyncSessions',
  autoCooldowns: 'ustudyAutoCooldowns',
};
const SYNC_SESSION_TIMEOUT_MS = 2 * 60 * 1000;

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
  openAppAfterSync: false,
  autoSuggestionDismissed: false,
};

const DEFAULT_STATS = {
  successfulSyncs: 0,
  lastSyncedAt: null,
  lastError: null,
};
const activePortalRuns = new Map();
const checkpointQueues = new Map();

function getSelectedSources(settings) {
  return ['grades', 'tuition', 'exams', 'courses', 'registrations']
    .filter((source) => source === 'grades' || Boolean(settings.sources[source]));
}

function enqueueCheckpoint(tabId, operation) {
  const previous = checkpointQueues.get(tabId) || Promise.resolve();
  const next = previous.catch(() => undefined).then(operation);
  checkpointQueues.set(tabId, next);
  void next.finally(() => {
    if (checkpointQueues.get(tabId) === next) checkpointQueues.delete(tabId);
  });
  return next;
}

async function readSyncSessions() {
  const stored = await chrome.storage.session.get(STORAGE_KEYS.syncSessions);
  return stored[STORAGE_KEYS.syncSessions] || {};
}

async function writeSyncSessions(sessions) {
  await chrome.storage.session.set({ [STORAGE_KEYS.syncSessions]: sessions });
}

async function removeSyncSession(tabId) {
  return enqueueCheckpoint(tabId, async () => {
    const sessions = await readSyncSessions();
    delete sessions[tabId];
    await writeSyncSessions(sessions);
  });
}

async function readAutoCooldowns() {
  const stored = await chrome.storage.session.get(STORAGE_KEYS.autoCooldowns);
  return stored[STORAGE_KEYS.autoCooldowns] || {};
}

async function setAutoCooldown(tabId, cooldownMinutes) {
  return enqueueCheckpoint(tabId, async () => {
    const cooldowns = await readAutoCooldowns();
    cooldowns[tabId] = Date.now() + cooldownMinutes * 60 * 1000;
    await chrome.storage.session.set({ [STORAGE_KEYS.autoCooldowns]: cooldowns });
  });
}

async function removeAutoCooldown(tabId) {
  return enqueueCheckpoint(tabId, async () => {
    const cooldowns = await readAutoCooldowns();
    delete cooldowns[tabId];
    await chrome.storage.session.set({ [STORAGE_KEYS.autoCooldowns]: cooldowns });
  });
}

function hasSameSourceSelection(session, selectedSources) {
  return Array.isArray(session?.selectedSources)
    && session.selectedSources.length === selectedSources.length
    && session.selectedSources.every((source, index) => source === selectedSources[index]);
}

function mergeSettings(value) {
  const incoming = value && typeof value === 'object' ? value : {};
  const mode = ['off', 'manual', 'ask', 'auto'].includes(incoming.mode) ? incoming.mode : DEFAULT_SETTINGS.mode;
  const semester = ['1', '2', '3'].includes(String(incoming.semester))
    ? String(incoming.semester)
    : DEFAULT_SETTINGS.semester;
  const cooldownMinutes = Math.max(1, Math.min(1440, Number(incoming.cooldownMinutes) || DEFAULT_SETTINGS.cooldownMinutes));

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

async function getStateForSender(sender) {
  const state = await getStoredState();
  if (!sender.tab?.id || !isPortalUrl(sender.tab.url)) return state;
  const sessions = await readSyncSessions();
  const session = sessions[sender.tab.id];
  if (!session) return state;
  return {
    ...state,
    syncSession: {
      id: session.id,
      trigger: session.trigger,
      completed: session.completedSources.length,
      total: session.selectedSources.length,
      updatedAt: session.updatedAt,
    },
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
  return chrome.tabs.create({ url: CONFIG.productionAppUrl, active: true });
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

function buildRunnerRuntime(requestId, settings, completedSources = []) {
  const completed = new Set(completedSources);
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
      getGrades: !completed.has('grades'),
      getTuition: settings.sources.tuition && !completed.has('tuition'),
      getExam: settings.sources.exams && !completed.has('exams'),
      getClass: settings.sources.courses && !completed.has('courses'),
      classYear: settings.academicYear,
      classSem: settings.semester,
      getReg: settings.sources.registrations && !completed.has('registrations'),
      regYear: settings.academicYear,
      regSem: settings.semester,
    },
  };
}

async function runPortalSync(sender, requestId, trigger = 'manual', documentInstanceId = '') {
  if (!sender.tab?.id || !isPortalUrl(sender.tab.url)) throw new Error('Chỉ có thể đồng bộ từ HCMUS Portal.');
  const tabId = sender.tab.id;
  const state = await getStoredState();
  const selectedSources = getSelectedSources(state.settings);
  const documentId = documentInstanceId || sender.documentId || null;
  const activeRun = activePortalRuns.get(tabId);
  if (activeRun?.documentId === documentId) return { requestId, skipped: true, reason: 'running' };

  let session;
  await enqueueCheckpoint(tabId, async () => {
    const sessions = await readSyncSessions();
    const existing = sessions[tabId];
    const isExpired = existing && Date.now() - new Date(existing.updatedAt).getTime() > SYNC_SESSION_TIMEOUT_MS;
    if (existing && !isExpired && hasSameSourceSelection(existing, selectedSources)) {
      session = { ...existing, currentRequestId: requestId, updatedAt: new Date().toISOString() };
    } else {
      session = {
        id: crypto.randomUUID(),
        tabId,
        selectedSources,
        completedSources: [],
        partialRaw: {},
        partialMeta: { params: {} },
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentRequestId: requestId,
        trigger: trigger === 'auto' ? 'auto' : 'manual',
      };
    }
    sessions[tabId] = session;
    await writeSyncSessions(sessions);
  });

  if (trigger === 'auto' && session.completedSources.length === 0) {
    const cooldowns = await readAutoCooldowns();
    if (Number(cooldowns[tabId] || 0) > Date.now()) {
      await removeSyncSession(tabId);
      return { requestId, skipped: true, reason: 'cooldown' };
    }
  }

  activePortalRuns.set(tabId, { requestId, documentId });
  const runtime = buildRunnerRuntime(requestId, state.settings, session.completedSources);

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
    activePortalRuns.delete(tabId);
    await chrome.tabs.sendMessage(tabId, {
      type: 'USTUDY_RUNNER_ERROR',
      requestId,
      message: error?.message || 'Không thể khởi chạy bộ đồng bộ.',
    }).catch(() => undefined);
  });

  return {
    requestId,
    resumed: session.completedSources.length > 0,
    completed: session.completedSources.length,
    total: session.selectedSources.length,
  };
}

async function saveSourceCheckpoint(sender, requestId, payload) {
  if (!sender.tab?.id || !isPortalUrl(sender.tab.url)) throw new Error('Nguồn checkpoint không hợp lệ.');
  const tabId = sender.tab.id;
  const source = payload?.source;
  if (!['grades', 'tuition', 'exams', 'courses', 'registrations'].includes(source)) {
    throw new Error('Nhóm dữ liệu checkpoint không hợp lệ.');
  }

  return enqueueCheckpoint(tabId, async () => {
    const sessions = await readSyncSessions();
    const session = sessions[tabId];
    if (!session || session.currentRequestId !== requestId || !session.selectedSources.includes(source)) {
      return { ignored: true };
    }
    session.partialRaw = { ...session.partialRaw, ...(payload.rawPatch || {}) };
    session.partialMeta = {
      ...session.partialMeta,
      ...(payload.metaPatch || {}),
      params: { ...(session.partialMeta?.params || {}), ...(payload.metaPatch?.params || {}) },
    };
    if (!session.completedSources.includes(source)) session.completedSources.push(source);
    session.updatedAt = new Date().toISOString();
    sessions[tabId] = session;
    await writeSyncSessions(sessions);
    return { completed: session.completedSources.length, total: session.selectedSources.length };
  });
}

async function touchSyncSession(sender, requestId) {
  if (!sender.tab?.id) return { ignored: true };
  const tabId = sender.tab.id;
  return enqueueCheckpoint(tabId, async () => {
    const sessions = await readSyncSessions();
    const session = sessions[tabId];
    if (!session || session.currentRequestId !== requestId) return { ignored: true };
    session.updatedAt = new Date().toISOString();
    sessions[tabId] = session;
    await writeSyncSessions(sessions);
    return { touched: true };
  });
}

async function storeSyncResult(packet, trigger = 'manual', tabId, requestId) {
  let finalPacket = packet;
  if (tabId) {
    await (checkpointQueues.get(tabId) || Promise.resolve()).catch(() => undefined);
    const sessions = await readSyncSessions();
    const session = sessions[tabId];
    if (session && session.currentRequestId === requestId) {
      finalPacket = {
        ...packet,
        raw: { ...(packet?.raw || {}), ...(session.partialRaw || {}) },
        meta: {
          ...(packet?.meta || {}),
          ...(session.partialMeta || {}),
          params: { ...(packet?.meta?.params || {}), ...(session.partialMeta?.params || {}) },
        },
      };
    }
  }
  if (!finalPacket?.raw || !Array.isArray(finalPacket.raw.grades)) throw new Error('Gói dữ liệu Portal không hợp lệ.');
  const state = await getStoredState();
  const now = new Date().toISOString();
  const pendingImport = {
    id: crypto.randomUUID(),
    createdAt: now,
    trigger: trigger === 'auto' ? 'auto' : 'manual',
    packet: finalPacket,
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
  if (tabId) {
    activePortalRuns.delete(tabId);
    if (trigger === 'auto' || state.settings.mode === 'auto') {
      await setAutoCooldown(tabId, state.settings.cooldownMinutes);
    }
    await removeSyncSession(tabId);
  }

  if (state.settings.openAppAfterSync) await openOrFocusApp();
  else await notifyAppTabs();
  return { pendingImport: { id: pendingImport.id, createdAt: pendingImport.createdAt }, stats };
}

async function handleMessage(message, sender) {
  switch (message?.action) {
    case 'GET_STATE':
      return getStateForSender(sender);
    case 'SAVE_SETTINGS':
      return saveSettings(message.payload);
    case 'OPEN_PORTAL':
      await openPortalAndRequestSync();
      return { opened: true };
    case 'RUN_PORTAL_SYNC':
      return runPortalSync(sender, message.requestId || crypto.randomUUID(), message.trigger, message.documentInstanceId);
    case 'SYNC_SOURCE_COMPLETE':
      return saveSourceCheckpoint(sender, message.requestId, message.payload);
    case 'SYNC_HEARTBEAT':
      return touchSyncSession(sender, message.requestId);
    case 'SYNC_COMPLETE':
      if (!isPortalUrl(sender.tab?.url)) throw new Error('Nguồn đồng bộ không hợp lệ.');
      return storeSyncResult(message.payload, message.trigger, sender.tab?.id, message.requestId);
    case 'SYNC_FAILED': {
      if (sender.tab?.id) {
        activePortalRuns.delete(sender.tab.id);
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
  activePortalRuns.delete(tabId);
  void removeSyncSession(tabId);
  void removeAutoCooldown(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
  return true;
});
