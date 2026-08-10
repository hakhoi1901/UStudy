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
host.style.cssText = 'all:initial;font-family:"Inter",ui-sans-serif,system-ui,sans-serif;font-synthesis:none;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
const shadow = host.attachShadow({ mode: 'open' });
document.documentElement.appendChild(host);

shadow.innerHTML = `
  <style>
    :host{font-family:"Inter",ui-sans-serif,system-ui,sans-serif;color:#172033;font-synthesis:none;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    *{box-sizing:border-box;letter-spacing:0}
    button,input,select{font:inherit}
    button{cursor:pointer}
    .overlay{position:fixed;inset:0;display:grid;place-items:center;padding:16px;pointer-events:auto}.backdrop{position:absolute;inset:0;border:0;background:rgba(15,23,42,.42);backdrop-filter:blur(2px)}
    .panel{position:relative;display:flex;width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 32px);flex-direction:column;overflow:hidden;border:1px solid #cbd5e1;border-radius:16px;background:#fff;box-shadow:0 24px 64px rgba(15,23,42,.3)}
    .panel-scroll{min-height:0;overflow-y:auto;padding:4px 20px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}
    .panel-scroll::-webkit-scrollbar{width:8px}.panel-scroll::-webkit-scrollbar-track{background:transparent}.panel-scroll::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:999px;background:#98a2b3;background-clip:padding-box}
    .compact-wrap{position:fixed;right:18px;top:18px;pointer-events:auto}.compact{display:flex;width:min(360px,calc(100vw - 28px));align-items:center;gap:11px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;padding:12px 13px;box-shadow:0 12px 32px rgba(15,23,42,.18)}
    .compact.control{width:min(500px,calc(100vw - 28px))}.compact img{width:30px;height:30px;flex:0 0 auto;border-radius:7px}.compact-copy{min-width:0;flex:1}.compact-copy strong{display:block;color:#172033;font-size:12.5px}.compact-copy span{display:block;margin-top:3px;overflow:hidden;color:#667085;font-size:11px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}.compact-actions{display:flex;flex:0 0 auto;align-items:center;gap:7px}.compact-button{height:34px;border-radius:7px;padding:0 11px;font-size:12px;font-weight:700}.compact-button.primary{border:1px solid #004a98;background:#004a98;color:#fff}.compact-button.primary:hover{background:#003a78}.compact-button.secondary{border:1px solid #d0d5dd;background:#fff;color:#344054}.compact-button.secondary:hover{background:#f8fafc}.compact-button:disabled{cursor:not-allowed;opacity:.55}
    .spinner{width:17px;height:17px;flex:0 0 auto;border:2px solid #bfdbfe;border-top-color:#004a98;border-radius:50%;animation:ustudy-spin .8s linear infinite}.compact-dot{width:9px;height:9px;flex:0 0 auto;border-radius:50%;background:#12b76a}.compact-dot.error{background:#d92d20}@keyframes ustudy-spin{to{transform:rotate(360deg)}}
    .header{display:flex;align-items:center;gap:13px;padding:20px 22px;border-bottom:1px solid #003a78;background:#004a98}.header img{width:42px;height:42px;flex:0 0 auto;border:3px solid rgba(255,255,255,.22);border-radius:11px}.heading{min-width:0;flex:1}.heading strong{display:block;color:#fff;font-size:17px;line-height:1.3}.heading span{display:block;margin-top:4px;color:#dbeafe;font-size:13px}.icon-btn{display:grid;width:34px;height:34px;flex:0 0 auto;place-items:center;border:0;border-radius:8px;background:rgba(255,255,255,.1);color:#fff;font-size:21px;line-height:1}.icon-btn:hover{background:rgba(255,255,255,.2)}
    .summary{margin:14px 0 0;padding:11px 12px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#184e8a;font-size:13px;line-height:1.5}.summary.error{border-color:#fecaca;background:#fff5f5;color:#b42318}.summary.success{border-color:#bbebd2;background:#f2fbf7;color:#176448}.summary.warning{border-color:#fedf89;background:#fffaeb;color:#7a4d00}
    .section{padding:16px 0;border-bottom:1px solid #e5e7eb}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.section-heading h2{margin:0;color:#111827;font-size:14px;font-weight:700}.section-heading span{color:#078553;font-size:12px;font-weight:650}
    .segmented{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc}.segmented button{height:38px;border:0;border-radius:7px;background:transparent;color:#64748b;font-size:13px;font-weight:650}.segmented button.active{background:#fff;color:#004a98;box-shadow:0 1px 5px rgba(15,23,42,.13)}.hint{min-height:18px;margin:9px 1px 0;color:#64748b;font-size:12px;line-height:1.5}
    .source-list{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}.source{display:flex;align-items:center;gap:9px;min-height:46px;padding:9px 11px;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;color:#334155;font-size:13px}.source:nth-child(even){border-right:0}.source:last-child{border-bottom:0}.source input{width:16px;height:16px;margin:0;accent-color:#004a98}.source.locked{background:#f8fafc;color:#64748b}
    .period-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.period-grid label{color:#64748b;font-size:12px}.period-grid input,.period-grid select{display:block;width:100%;height:40px;margin-top:6px;border:1px solid #d1d5db;border-radius:8px;background:#fff;padding:0 11px;color:#334155;font-size:13px;outline:0}.period-grid input:focus,.period-grid select:focus{border-color:#004a98;box-shadow:0 0 0 3px rgba(0,74,152,.14)}.cooldown-field{display:block;color:#64748b;font-size:12px}.cooldown-field input{display:block;width:100%;height:40px;margin-top:6px;border:1px solid #d1d5db;border-radius:8px;background:#fff;padding:0 11px;color:#334155;font-size:13px;outline:0}.cooldown-field input:focus{border-color:#004a98;box-shadow:0 0 0 3px rgba(0,74,152,.14)}
    .open-app-option{display:flex;align-items:flex-start;gap:10px;padding:16px 0;color:#334155}.open-app-option input{width:16px;height:16px;margin:2px 0 0;accent-color:#004a98}.open-app-option span{display:flex;flex-direction:column}.open-app-option strong{font-size:13px}.open-app-option small{margin-top:3px;color:#64748b;font-size:12px}
    .suggestion-actions{display:flex;gap:12px;margin-top:8px}.link-btn{border:0;background:transparent;padding:0;color:#004a98;font-size:12px;font-weight:700}.link-btn.muted{color:#667085}
    .actions{display:flex;justify-content:flex-end;gap:9px;padding:13px 20px;border-top:1px solid #e5e7eb;background:#f8fafc}.button{height:40px;border-radius:8px;padding:0 16px;font-size:13px;font-weight:700}.button.secondary{border:1px solid rgba(0,74,152,.3);background:#fff;color:#004a98}.button.secondary:hover{background:#eff6ff}.button.primary{min-width:180px;border:1px solid #004a98;background:#004a98;color:#fff;box-shadow:0 1px 2px rgba(15,23,42,.08)}.button.primary:hover{background:#003a78}.button:disabled{cursor:not-allowed;opacity:.55}
    @media(max-width:520px){.overlay{padding:10px}.panel{width:calc(100vw - 20px);max-height:calc(100vh - 20px)}.header{padding:16px}.panel-scroll{padding:4px 16px}.actions{padding:12px 16px}.button{padding:0 12px}.button.primary{min-width:0;flex:1}.period-grid{grid-template-columns:1fr}.compact.control{align-items:stretch;flex-wrap:wrap}.compact.control .compact-copy{padding-top:1px}.compact-actions{width:100%}.compact-button{flex:1}}
  </style>
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
        <label for="ustudy-year">Năm học<input id="ustudy-year" maxlength="5" placeholder="25-26"></label>
        <label for="ustudy-semester">Học kỳ<select id="ustudy-semester"><option value="1" ${settings.semester === '1' ? 'selected' : ''}>Học kỳ 1</option><option value="2" ${settings.semester === '2' ? 'selected' : ''}>Học kỳ 2</option><option value="3" ${settings.semester === '3' ? 'selected' : ''}>Học kỳ 3</option></select></label>
      </div>
    </section>
    <section class="section">
      <div class="section-heading"><h2>Thời gian nghỉ tự động</h2></div>
      <label class="cooldown-field" for="ustudy-cooldown">Số phút giữa hai lần tự động quét<input id="ustudy-cooldown" type="number" min="1" max="1440" step="1" value="${settings.cooldownMinutes}"></label>
      <p class="hint">Chỉ áp dụng khi điều hướng trong cùng tab Portal. Đồng bộ thủ công luôn chạy ngay.</p>
    </section>
    <label class="open-app-option"><input id="ustudy-open-app" type="checkbox" ${settings.openAppAfterSync ? 'checked' : ''}><span><strong>Mở UStudy sau khi quét</strong><small>Dùng tab UStudy đang mở hoặc tạo tab mới.</small></span></label>
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

  const academicYearInput = shadow.getElementById('ustudy-year');
  if (academicYearInput) academicYearInput.value = settings.academicYear;

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
  const cooldownMinutes = Number(shadow.getElementById('ustudy-cooldown')?.value) || EXTENSION_CONFIG.defaults.cooldownMinutes;
  const openAppAfterSync = Boolean(shadow.getElementById('ustudy-open-app')?.checked);

  return {
    onboardingComplete: true,
    mode: activeMode,
    sources,
    academicYear,
    semester,
    cooldownMinutes,
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
    if (shouldResume) window.setTimeout(() => startSync(extensionState.syncSession.trigger || 'manual'), 500);
    else if (shouldRunRequested) window.setTimeout(() => startSync('manual'), 700);
    else if (shouldAutoRun) window.setTimeout(() => startSync('auto'), 500);
  } catch (error) {
    phase = 'error';
    phaseMessage = error?.message || 'Không thể kết nối UStudy Extension.';
    render();
  }
}

void initialize();
})();
