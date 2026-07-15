(function () {
const EXTENSION_CONFIG = globalThis.USTUDY_EXTENSION_CONFIG;
if (!new RegExp(EXTENSION_CONFIG.portalHostnamePattern, 'i').test(window.location.hostname)) return;
const HOST_ID = 'ustudy-portal-sync-host';
const SOURCE_LABELS = {
  grades: 'Bảng điểm',
  registrations: 'Đăng ký học phần',
  exams: 'Lịch thi',
  courses: 'Danh sách lớp mở',
  tuition: 'Học phí',
};
const MODE_DESCRIPTIONS = {
  off: 'Không tự chạy và không hiển thị thanh điều khiển trên Portal.',
  manual: 'Chỉ chạy khi bạn bấm đồng bộ.',
  ask: 'Hiện lời nhắc trước mỗi lần đồng bộ. Đây là chế độ khuyên dùng.',
  auto: 'Tự chạy khi mở Portal và đã đăng nhập.',
};
const EXTENSION_ICON_URL = chrome.runtime.getURL('icon.svg');
const DOCUMENT_INSTANCE_ID = crypto.randomUUID();

let extensionState = null;
let activeRequestId = null;
let activeSyncTrigger = 'manual';
let phase = 'idle';
let phaseMessage = '';
let hiddenForSession = false;
let isPanelExpanded = false;
let lastHeartbeatAt = 0;
const pendingCheckpoints = new Set();

function trackCheckpoint(promise) {
  pendingCheckpoints.add(promise);
  void promise.finally(() => pendingCheckpoints.delete(promise));
  return promise;
}

const host = document.createElement('div');
host.id = HOST_ID;
host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
const shadow = host.attachShadow({ mode: 'open' });
document.documentElement.appendChild(host);

shadow.innerHTML = `
  <style></style>
  <div id="mount"></div>
`;

const mount = shadow.getElementById('mount');

async function callExtension(action, payload, extra = {}) {
  const response = await chrome.runtime.sendMessage({ action, payload, ...extra });
  if (!response?.ok) throw new Error(response?.error || 'Extension không phản hồi.');
  return response.data;
}

function isPortalReady() {
  return !new RegExp(EXTENSION_CONFIG.portalLoginPathPattern, 'i').test(window.location.pathname);
}

function formatLastSync(value) {
  if (!value) return 'Chưa đồng bộ lần nào';
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Vừa đồng bộ';
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
}

function renderSettingsBody(settings) {
  return `
    <section class="section">
      <div class="section-heading"><h2>Cách đồng bộ</h2></div>
      <div class="segmented" role="group" aria-label="Cách đồng bộ">
        <button class="${settings.mode === 'off' ? 'active' : ''}" data-mode="off" type="button">Tắt</button>
        <button class="${settings.mode === 'manual' ? 'active' : ''}" data-mode="manual" type="button">Thủ công</button>
        <button class="${settings.mode === 'ask' ? 'active' : ''}" data-mode="ask" type="button">Hỏi trước</button>
        <button class="${settings.mode === 'auto' ? 'active' : ''}" data-mode="auto" type="button">Tự động</button>
      </div>
      <p class="hint" id="ustudy-mode-description">${MODE_DESCRIPTIONS[settings.mode]}</p>
    </section>
    <section class="section">
      <div class="section-heading"><h2>Nguồn dữ liệu</h2><span>Chỉ lưu trên máy</span></div>
      <div class="source-list">
        ${Object.entries(SOURCE_LABELS).map(([key, label]) => `<label class="source ${key === 'grades' ? 'locked' : ''}"><input data-source="${key}" type="checkbox" ${settings.sources[key] ? 'checked' : ''} ${key === 'grades' ? 'disabled' : ''}><span>${label}</span></label>`).join('')}
      </div>
    </section>
    <section class="section">
      <div class="section-heading"><h2>Kỳ cho lớp mở và ĐKHP</h2></div>
      <div class="period-grid">
        <label for="ustudy-year">Năm học<input id="ustudy-year" value="${settings.academicYear}" maxlength="5" placeholder="25-26"></label>
        <label for="ustudy-semester">Học kỳ<select id="ustudy-semester"><option value="1" ${settings.semester === '1' ? 'selected' : ''}>Học kỳ 1</option><option value="2" ${settings.semester === '2' ? 'selected' : ''}>Học kỳ 2</option><option value="3" ${settings.semester === '3' ? 'selected' : ''}>Học kỳ 3</option></select></label>
      </div>
    </section>
    <label class="open-app-option"><input id="ustudy-open-app" type="checkbox" ${settings.openAppAfterSync ? 'checked' : ''}><span><strong>Mở UStudy sau khi quét</strong><small>Luôn xem trước trước khi áp dụng dữ liệu.</small></span></label>
  `;
}

function render() {
  if (hiddenForSession || !extensionState) {
    host.style.display = 'none';
    return;
  }
  host.style.display = 'block';
  const settings = extensionState.settings;
  if (settings.onboardingComplete && settings.mode === 'off' && phase === 'idle' && !isPanelExpanded) {
    host.style.display = 'none';
    return;
  }
  const compactAutoMode = settings.onboardingComplete && settings.mode === 'auto';
  if (compactAutoMode) {
    if (phase === 'idle') {
      host.style.display = 'none';
      return;
    }
    mount.innerHTML = `
      <div class="compact-wrap">
        <section class="compact" aria-live="polite">
          <img src="${EXTENSION_ICON_URL}" alt="">
          <div class="compact-copy">
            <strong>${phase === 'running' ? 'UStudy đang đồng bộ' : phase === 'success' ? 'Đồng bộ hoàn tất' : 'Không thể đồng bộ'}</strong>
            <span>${phaseMessage || 'Đang chuẩn bị dữ liệu Portal...'}</span>
          </div>
          ${phase === 'running' ? '<span class="spinner"></span>' : `<span class="compact-dot ${phase === 'error' ? 'error' : ''}"></span>`}
        </section>
      </div>
    `;
    return;
  }
  const compactControlMode = settings.onboardingComplete && !isPanelExpanded;
  if (compactControlMode) {
    const statusTitle = phase === 'running'
      ? 'UStudy đang đồng bộ'
      : phase === 'success'
        ? 'Đồng bộ hoàn tất'
        : phase === 'error'
          ? 'Không thể đồng bộ'
          : settings.mode === 'ask'
            ? 'Sẵn sàng đồng bộ dữ liệu?'
            : 'UStudy Portal Sync';
    const statusMessage = phaseMessage || (settings.mode === 'ask'
      ? 'Kiểm tra và đồng bộ khi bạn sẵn sàng.'
      : formatLastSync(extensionState.stats.lastSyncedAt));
    mount.innerHTML = `
      <div class="compact-wrap">
        <section class="compact control" aria-live="polite">
          <img src="${EXTENSION_ICON_URL}" alt="">
          <div class="compact-copy"><strong>${statusTitle}</strong><span>${statusMessage}</span></div>
          <div class="compact-actions">
            <button class="compact-button primary" id="ustudy-compact-sync" type="button" ${phase === 'running' || !isPortalReady() ? 'disabled' : ''}>${phase === 'running' ? 'Đang đồng bộ' : 'Đồng bộ ngay'}</button>
            <button class="compact-button secondary" id="ustudy-open-settings" type="button">Cài đặt</button>
          </div>
        </section>
      </div>
    `;
    shadow.getElementById('ustudy-compact-sync')?.addEventListener('click', () => { void startSync('manual'); });
    shadow.getElementById('ustudy-open-settings')?.addEventListener('click', () => {
      isPanelExpanded = true;
      render();
    });
    return;
  }
  const isFirstSetup = !settings.onboardingComplete;
  const phaseClass = phase === 'error' ? 'error' : phase === 'success' ? 'success' : '';
  const showAutoSuggestion = extensionState.stats.successfulSyncs >= 2
    && settings.mode === 'ask'
    && !settings.autoSuggestionDismissed;

  mount.innerHTML = `
    <div class="overlay">
      <button class="backdrop" id="ustudy-backdrop" type="button" aria-label="Đóng hộp thoại"></button>
      <section class="panel" role="dialog" aria-modal="true" aria-label="UStudy Portal Sync">
        <header class="header">
          <img src="${EXTENSION_ICON_URL}" alt="">
          <div class="heading"><strong>UStudy Portal Sync</strong><span>Phiên bản ${extensionState.extensionVersion} · ${formatLastSync(extensionState.stats.lastSyncedAt)}</span></div>
          <button class="icon-btn" id="ustudy-close" type="button" aria-label="Ẩn">×</button>
        </header>
        <div class="panel-scroll">
          ${!isPortalReady() ? '<div class="summary warning">Hãy đăng nhập Portal trước khi đồng bộ dữ liệu.</div>' : ''}
          ${phaseMessage ? `<div class="summary ${phaseClass}">${phaseMessage}</div>` : ''}
          ${showAutoSuggestion ? `<div class="summary">Bạn đã đồng bộ thành công ${extensionState.stats.successfulSyncs} lần. Bật tự động khi mở Portal?<div class="suggestion-actions"><button class="link-btn" id="ustudy-enable-auto" type="button">Bật tự động</button><button class="link-btn muted" id="ustudy-dismiss-auto" type="button">Giữ như hiện tại</button></div></div>` : ''}
          ${renderSettingsBody(settings)}
        </div>
        <footer class="actions">
          ${isFirstSetup ? '<button class="button secondary" id="ustudy-cancel-setup" type="button">Để sau</button>' : '<button class="button secondary" id="ustudy-save-settings" type="button">Lưu thiết lập</button>'}
          <button class="button primary" id="ustudy-save-and-sync" type="button" ${phase === 'running' || !isPortalReady() ? 'disabled' : ''}>${phase === 'running' ? 'Đang đồng bộ' : isFirstSetup ? 'Lưu và đồng bộ' : 'Đồng bộ ngay'}</button>
        </footer>
      </section>
    </div>
  `;

  const hidePanel = () => {
    if (settings.onboardingComplete) isPanelExpanded = false;
    else hiddenForSession = true;
    render();
  };
  shadow.getElementById('ustudy-close')?.addEventListener('click', hidePanel);
  shadow.getElementById('ustudy-backdrop')?.addEventListener('click', hidePanel);
  shadow.getElementById('ustudy-cancel-setup')?.addEventListener('click', () => {
    hiddenForSession = true;
    render();
  });
  shadow.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
    shadow.querySelectorAll('[data-mode]').forEach((item) => item.classList.toggle('active', item === button));
    const description = shadow.getElementById('ustudy-mode-description');
    if (description) description.textContent = MODE_DESCRIPTIONS[button.dataset.mode];
  }));
  shadow.getElementById('ustudy-save-settings')?.addEventListener('click', () => savePanelSettings(false));
  shadow.getElementById('ustudy-save-and-sync')?.addEventListener('click', () => savePanelSettings(true));
  shadow.getElementById('ustudy-enable-auto')?.addEventListener('click', async () => {
    extensionState = await callExtension('SAVE_SETTINGS', { mode: 'auto', autoSuggestionDismissed: true });
    render();
  });
  shadow.getElementById('ustudy-dismiss-auto')?.addEventListener('click', async () => {
    extensionState = await callExtension('SAVE_SETTINGS', { autoSuggestionDismissed: true });
    render();
  });
}

function collectPanelSettings() {
  const activeMode = shadow.querySelector('[data-mode].active')?.dataset.mode || 'ask';
  const sources = { grades: true };
  shadow.querySelectorAll('[data-source]').forEach((input) => { sources[input.dataset.source] = input.checked; });
  const academicYear = shadow.getElementById('ustudy-year')?.value.trim() || EXTENSION_CONFIG.defaults.academicYear;
  const semester = shadow.getElementById('ustudy-semester')?.value || EXTENSION_CONFIG.defaults.semester;
  const openAppAfterSync = Boolean(shadow.getElementById('ustudy-open-app')?.checked);

  return {
    onboardingComplete: true,
    mode: activeMode,
    sources,
    academicYear,
    semester,
    openAppAfterSync,
  };
}

async function savePanelSettings(shouldSync) {
  try {
    extensionState = await callExtension('SAVE_SETTINGS', collectPanelSettings());
    phase = 'idle';
    phaseMessage = '';
    isPanelExpanded = false;
    if (shouldSync) await startSync();
    else render();
  } catch (error) {
    phase = 'error';
    phaseMessage = error?.message || String(error);
    render();
  }
}

async function startSync(trigger = 'manual') {
  if (phase === 'running') return;
  if (!isPortalReady()) {
    phase = 'error';
    phaseMessage = 'Bạn cần đăng nhập Portal trước khi đồng bộ.';
    render();
    return;
  }

  activeRequestId = crypto.randomUUID();
  activeSyncTrigger = trigger;
  phase = 'running';
  phaseMessage = 'Đang khởi tạo bộ thu thập dữ liệu...';
  render();

  try {
    const result = await callExtension('RUN_PORTAL_SYNC', undefined, { requestId: activeRequestId, trigger, documentInstanceId: DOCUMENT_INSTANCE_ID });
    if (result?.skipped) {
      phase = 'idle';
      phaseMessage = '';
      render();
    } else if (result?.resumed) {
      phaseMessage = `Đang tiếp tục phiên đồng bộ (${result.completed}/${result.total} nguồn đã xong)...`;
      render();
    }
  } catch (error) {
    phase = 'error';
    phaseMessage = error?.message || String(error);
    render();
  }
}

window.addEventListener('message', async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  const message = event.data;
  if (message?.channel !== 'USTUDY_PORTAL_SYNC' || message.requestId !== activeRequestId) return;

  if (message.type === 'USTUDY_PORTAL_SYNC_PROGRESS') {
    phase = 'running';
    phaseMessage = message.message || 'Đang đồng bộ...';
    if (Date.now() - lastHeartbeatAt > 8000) {
      lastHeartbeatAt = Date.now();
      trackCheckpoint(callExtension('SYNC_HEARTBEAT', undefined, { requestId: activeRequestId }).catch(() => undefined));
    }
    render();
    return;
  }

  if (message.type === 'USTUDY_PORTAL_SYNC_SOURCE_RESULT') {
    const checkpoint = callExtension('SYNC_SOURCE_COMPLETE', message.payload, { requestId: activeRequestId })
      .then((progress) => {
        if (!progress?.ignored) {
          phase = 'running';
          phaseMessage = `Đã hoàn thành ${progress.completed}/${progress.total} nguồn dữ liệu...`;
          render();
        }
        return progress;
      });
    trackCheckpoint(checkpoint);
    return;
  }

  if (message.type === 'USTUDY_PORTAL_SYNC_RESULT') {
    phaseMessage = 'Đã thu thập xong. Đang chuyển dữ liệu sang UStudy...';
    render();
    try {
      await Promise.all(Array.from(pendingCheckpoints));
      await callExtension('SYNC_COMPLETE', message.payload, { requestId: activeRequestId, trigger: activeSyncTrigger });
      extensionState = await callExtension('GET_STATE');
      phase = 'success';
      phaseMessage = 'Đồng bộ hoàn tất. UStudy sẽ mở màn hình xem trước thay đổi.';
      if (extensionState.settings.mode === 'auto' || extensionState.settings.mode === 'off') {
        window.setTimeout(() => {
          hiddenForSession = true;
          render();
        }, 3000);
      }
    } catch (error) {
      phase = 'error';
      phaseMessage = error?.message || String(error);
    }
    render();
    return;
  }

  if (message.type === 'USTUDY_PORTAL_SYNC_ERROR') {
    phase = 'error';
    phaseMessage = message.message || 'Không thể đồng bộ dữ liệu Portal.';
    await callExtension('SYNC_FAILED', undefined, { message: phaseMessage }).catch(() => undefined);
    render();
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'USTUDY_START_SYNC') {
    hiddenForSession = false;
    isPanelExpanded = false;
    void startSync();
  }
  if (message?.type === 'USTUDY_RUNNER_ERROR' && message.requestId === activeRequestId) {
    phase = 'error';
    phaseMessage = message.message || 'Không thể khởi chạy bộ đồng bộ.';
    render();
  }
});

async function initialize() {
  try {
    extensionState = await callExtension('GET_STATE');
    render();

    const settings = extensionState.settings;
    const shouldAutoRun = settings.onboardingComplete && settings.mode === 'auto' && isPortalReady();
    const shouldRunRequested = extensionState.pendingSyncRequest && settings.onboardingComplete && isPortalReady();
    const shouldResume = extensionState.syncSession && settings.onboardingComplete && isPortalReady();
    if (shouldResume) window.setTimeout(() => startSync(extensionState.syncSession.trigger || 'manual'), 2200);
    else if (shouldRunRequested) window.setTimeout(() => startSync('manual'), 700);
    else if (shouldAutoRun) window.setTimeout(() => startSync('auto'), 2200);
  } catch (error) {
    phase = 'error';
    phaseMessage = error?.message || 'Không thể kết nối UStudy Extension.';
    render();
  }
}

void initialize();
})();
