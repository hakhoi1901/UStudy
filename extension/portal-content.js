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
  manual: 'Chỉ chạy khi bạn bấm đồng bộ.',
  ask: 'Hiện lời nhắc trước mỗi lần đồng bộ. Đây là chế độ khuyên dùng.',
  auto: 'Tự chạy khi mở Portal và đã đăng nhập.',
};
const EXTENSION_ICON_URL = chrome.runtime.getURL('icon.svg');

let extensionState = null;
let activeRequestId = null;
let phase = 'idle';
let phaseMessage = '';
let hiddenForSession = false;

const host = document.createElement('div');
host.id = HOST_ID;
host.style.cssText = 'all:initial;position:fixed;right:18px;top:18px;z-index:2147483647;';
const shadow = host.attachShadow({ mode: 'open' });
document.documentElement.appendChild(host);

shadow.innerHTML = `
  <style>
    :host{font-family:Inter,"Segoe UI",Arial,sans-serif;color:#172033}
    *{box-sizing:border-box;letter-spacing:0}
    button,input,select{font:inherit}
    button{cursor:pointer}
    .panel{display:flex;width:min(380px,calc(100vw - 28px));max-height:calc(100vh - 36px);flex-direction:column;overflow:hidden;border:1px solid #dbe3ec;border-radius:12px;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.18)}
    .panel-scroll{min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#98a2b3 transparent}
    .panel-scroll::-webkit-scrollbar{width:8px}.panel-scroll::-webkit-scrollbar-track{background:transparent}.panel-scroll::-webkit-scrollbar-thumb{border:2px solid transparent;border-radius:999px;background:#98a2b3;background-clip:padding-box}
    .compact{display:flex;width:min(340px,calc(100vw - 28px));align-items:center;gap:10px;border:1px solid #cbd9e8;border-radius:10px;background:#fff;padding:11px 12px;box-shadow:0 12px 32px rgba(15,23,42,.16)}
    .compact img{width:30px;height:30px;flex:0 0 auto;border-radius:7px}.compact-copy{min-width:0;flex:1}.compact-copy strong{display:block;color:#172033;font-size:12.5px}.compact-copy span{display:block;margin-top:3px;overflow:hidden;color:#667085;font-size:11px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
    .spinner{width:17px;height:17px;flex:0 0 auto;border:2px solid #bfdbfe;border-top-color:#004a98;border-radius:50%;animation:ustudy-spin .8s linear infinite}.compact-dot{width:9px;height:9px;flex:0 0 auto;border-radius:50%;background:#12b76a}.compact-dot.error{background:#d92d20}@keyframes ustudy-spin{to{transform:rotate(360deg)}}
    .header{display:flex;align-items:center;gap:12px;padding:17px 18px;border-bottom:1px solid #e5eaf0;background:#fff}.header img{width:42px;height:42px;flex:0 0 auto;border-radius:10px}.heading{min-width:0;flex:1}.heading strong{display:block;color:#101828;font-size:15px;line-height:1.3}.heading span{display:block;margin-top:3px;color:#667085;font-size:11.5px}.icon-btn{display:grid;width:30px;height:30px;flex:0 0 auto;place-items:center;border:0;border-radius:7px;background:transparent;color:#667085;font-size:19px;line-height:1}.icon-btn:hover{background:#f1f5f9;color:#172033}
    .summary{margin:14px 16px 0;padding:11px 12px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#184e8a;font-size:12px;line-height:1.45}.summary.error{border-color:#fecaca;background:#fff5f5;color:#b42318}.summary.success{border-color:#bbebd2;background:#f2fbf7;color:#176448}.summary.warning{border-color:#fedf89;background:#fffaeb;color:#7a4d00}
    .section{padding:15px 16px;border-bottom:1px solid #edf0f3}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}.section-heading h2{margin:0;color:#344054;font-size:11px;font-weight:800;text-transform:uppercase}.section-heading span{color:#078553;font-size:10.5px;font-weight:650}
    .segmented{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;border:1px solid #e4e7ec;border-radius:9px;background:#f8fafc}.segmented button{height:33px;border:0;border-radius:6px;background:transparent;color:#667085;font-size:11.5px;font-weight:700}.segmented button.active{background:#fff;color:#004a98;box-shadow:0 1px 5px rgba(15,23,42,.13)}.hint{min-height:16px;margin:8px 1px 0;color:#667085;font-size:11px;line-height:1.45}
    .source-list{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e4e7ec;border-radius:9px;overflow:hidden}.source{display:flex;align-items:center;gap:8px;min-height:42px;padding:8px 9px;border-right:1px solid #edf0f3;border-bottom:1px solid #edf0f3;color:#344054;font-size:11px}.source:nth-child(even){border-right:0}.source:nth-last-child(-n+2){border-bottom:0}.source input{width:15px;height:15px;margin:0;accent-color:#004a98}.source.locked{background:#fafafa;color:#667085}
    .period-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.period-grid label{color:#667085;font-size:10.5px}.period-grid input,.period-grid select{display:block;width:100%;height:35px;margin-top:5px;border:1px solid #d0d5dd;border-radius:7px;background:#fff;padding:0 9px;color:#344054;font-size:12px;outline:0}.period-grid input:focus,.period-grid select:focus{border-color:#1570ef;box-shadow:0 0 0 3px rgba(21,112,239,.1)}
    .open-app-option{display:flex;align-items:flex-start;gap:9px;padding:14px 16px;border-bottom:1px solid #edf0f3;color:#344054}.open-app-option input{width:15px;height:15px;margin:2px 0 0;accent-color:#004a98}.open-app-option span{display:flex;flex-direction:column}.open-app-option strong{font-size:11.5px}.open-app-option small{margin-top:2px;color:#667085;font-size:10.5px}
    .suggestion-actions{display:flex;gap:12px;margin-top:8px}.link-btn{border:0;background:transparent;padding:0;color:#004a98;font-size:12px;font-weight:700}.link-btn.muted{color:#667085}
    .actions{display:flex;gap:8px;padding:14px 16px;border-top:1px solid #edf0f3;background:#f8fafc}.button{height:37px;border-radius:8px;padding:0 12px;font-size:11.5px;font-weight:750}.button.secondary{border:1px solid #d0d5dd;background:#fff;color:#475467}.button.secondary:hover{background:#f4f6f8}.button.primary{flex:1;border:1px solid #004a98;background:#004a98;color:#fff}.button.primary:hover{background:#003a78}.button:disabled{cursor:not-allowed;opacity:.55}
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
  const compactAutoMode = settings.onboardingComplete && settings.mode === 'auto';
  if (compactAutoMode) {
    if (phase === 'idle') {
      host.style.display = 'none';
      return;
    }
    mount.innerHTML = `
      <section class="compact" aria-live="polite">
        <img src="${EXTENSION_ICON_URL}" alt="">
        <div class="compact-copy">
          <strong>${phase === 'running' ? 'UStudy đang đồng bộ' : phase === 'success' ? 'Đồng bộ hoàn tất' : 'Không thể đồng bộ'}</strong>
          <span>${phaseMessage || 'Đang chuẩn bị dữ liệu Portal...'}</span>
        </div>
        ${phase === 'running' ? '<span class="spinner"></span>' : `<span class="compact-dot ${phase === 'error' ? 'error' : ''}"></span>`}
      </section>
    `;
    return;
  }
  const isFirstSetup = !settings.onboardingComplete;
  const phaseClass = phase === 'error' ? 'error' : phase === 'success' ? 'success' : '';
  const showAutoSuggestion = extensionState.stats.successfulSyncs >= 2
    && settings.mode === 'ask'
    && !settings.autoSuggestionDismissed;

  mount.innerHTML = `
    <section class="panel" aria-label="UStudy Portal Sync">
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
  `;

  shadow.getElementById('ustudy-close')?.addEventListener('click', () => {
    hiddenForSession = true;
    render();
  });
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
  phase = 'running';
  phaseMessage = 'Đang khởi tạo bộ thu thập dữ liệu...';
  render();

  try {
    const result = await callExtension('RUN_PORTAL_SYNC', undefined, { requestId: activeRequestId, trigger });
    if (result?.skipped) {
      phase = 'idle';
      phaseMessage = '';
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
    render();
    return;
  }

  if (message.type === 'USTUDY_PORTAL_SYNC_RESULT') {
    phaseMessage = 'Đã thu thập xong. Đang chuyển dữ liệu sang UStudy...';
    render();
    try {
      await callExtension('SYNC_COMPLETE', message.payload);
      extensionState = await callExtension('GET_STATE');
      phase = 'success';
      phaseMessage = 'Đồng bộ hoàn tất. UStudy sẽ mở màn hình xem trước thay đổi.';
      if (extensionState.settings.mode === 'auto') {
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
    if (shouldRunRequested) window.setTimeout(() => startSync('manual'), 700);
    else if (shouldAutoRun) window.setTimeout(() => startSync('auto'), 700);
  } catch (error) {
    phase = 'error';
    phaseMessage = error?.message || 'Không thể kết nối UStudy Extension.';
    render();
  }
}

void initialize();
})();
