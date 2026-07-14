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

let extensionState = null;
let activeRequestId = null;
let phase = 'idle';
let phaseMessage = '';
let editingSettings = false;
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
    .panel{width:min(380px,calc(100vw - 28px));overflow:hidden;border:1px solid #dbe3ec;border-radius:12px;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.18)}
    .compact{display:flex;width:min(340px,calc(100vw - 28px));align-items:center;gap:10px;border:1px solid #cbd9e8;border-radius:10px;background:#fff;padding:11px 12px;box-shadow:0 12px 32px rgba(15,23,42,.16)}
    .compact .mark{width:30px;height:30px;border-radius:7px;font-size:13px}.compact-copy{min-width:0;flex:1}.compact-copy strong{display:block;color:#172033;font-size:12.5px}.compact-copy span{display:block;margin-top:3px;overflow:hidden;color:#667085;font-size:11px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
    .spinner{width:17px;height:17px;flex:0 0 auto;border:2px solid #bfdbfe;border-top-color:#004a98;border-radius:50%;animation:ustudy-spin .8s linear infinite}.compact-dot{width:9px;height:9px;flex:0 0 auto;border-radius:50%;background:#12b76a}.compact-dot.error{background:#d92d20}@keyframes ustudy-spin{to{transform:rotate(360deg)}}
    .header{display:flex;align-items:center;gap:11px;padding:14px 15px;border-bottom:1px solid #e7edf4;background:#fff}
    .mark{display:grid;width:34px;height:34px;flex:0 0 auto;place-items:center;border-radius:8px;background:#004a98;color:#fff;font-size:15px;font-weight:800}
    .heading{min-width:0;flex:1}.heading strong{display:block;font-size:14px;color:#101828}.heading span{display:block;margin-top:2px;color:#667085;font-size:11.5px}
    .icon-btn{display:grid;width:30px;height:30px;place-items:center;border:0;border-radius:7px;background:transparent;color:#667085;font-size:18px}.icon-btn:hover{background:#f1f5f9;color:#172033}
    .body{padding:15px}.intro{margin:0;color:#475467;font-size:13px;line-height:1.55}.privacy{display:flex;gap:8px;margin-top:12px;padding:10px 11px;border:1px solid #cde7dc;border-radius:8px;background:#f2fbf7;color:#176448;font-size:12px;line-height:1.45}
    .status-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}.dot{width:8px;height:8px;border-radius:50%;background:#12b76a}.dot.running{background:#1570ef;box-shadow:0 0 0 4px #eaf3ff}.dot.error{background:#d92d20}.status-row strong{font-size:13px}.meta{margin:0;color:#667085;font-size:12px;line-height:1.5}
    .progress{margin-top:12px;padding:11px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#184e8a;font-size:12px;line-height:1.45}.progress.error{border-color:#fecaca;background:#fff5f5;color:#b42318}.progress.success{border-color:#bbebd2;background:#f2fbf7;color:#176448}
    .section{margin-top:15px}.section-title{display:flex;justify-content:space-between;margin-bottom:8px;color:#344054;font-size:11px;font-weight:750;text-transform:uppercase}
    .modes{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:4px;border:1px solid #e4e7ec;border-radius:9px;background:#f8fafc}.mode{min-height:34px;border:0;border-radius:6px;background:transparent;color:#667085;font-size:11.5px;font-weight:650}.mode.active{background:#fff;color:#004a98;box-shadow:0 1px 4px rgba(15,23,42,.12)}
    .sources{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e4e7ec;border-radius:9px;overflow:hidden}.source{display:flex;align-items:center;gap:8px;min-height:42px;padding:8px 10px;border-right:1px solid #edf0f3;border-bottom:1px solid #edf0f3;color:#344054;font-size:11.5px}.source:nth-child(even){border-right:0}.source:nth-last-child(-n+2){border-bottom:0}.source input{width:15px;height:15px;margin:0;accent-color:#004a98}.source.locked{color:#667085;background:#fafafa}
    .period{display:grid;grid-template-columns:1fr 1fr;gap:8px}.field label{display:block;margin-bottom:5px;color:#667085;font-size:11px}.field input,.field select{width:100%;height:36px;border:1px solid #d0d5dd;border-radius:7px;background:#fff;padding:0 10px;color:#344054;font-size:12px;outline:none}.field input:focus,.field select:focus{border-color:#1570ef;box-shadow:0 0 0 3px rgba(21,112,239,.12)}
    .check-row{display:flex;align-items:flex-start;gap:8px;margin-top:13px;color:#475467;font-size:12px;line-height:1.4}.check-row input{width:15px;height:15px;margin:1px 0 0;accent-color:#004a98}
    .suggestion{margin-top:12px;padding:11px;border:1px solid #fedf89;border-radius:8px;background:#fffaeb;color:#7a4d00;font-size:12px;line-height:1.45}.suggestion-actions{display:flex;gap:12px;margin-top:8px}.link-btn{border:0;background:transparent;padding:0;color:#004a98;font-size:12px;font-weight:700}.link-btn.muted{color:#667085}
    .actions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px}.button{height:36px;border-radius:8px;padding:0 13px;font-size:12px;font-weight:700}.button.secondary{border:1px solid #d0d5dd;background:#fff;color:#475467}.button.secondary:hover{background:#f8fafc}.button.primary{border:1px solid #004a98;background:#004a98;color:#fff}.button.primary:hover{background:#003a78}.button:disabled{cursor:not-allowed;opacity:.55}
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

function modeLabel(mode) {
  return mode === 'auto' ? 'Tự động' : mode === 'manual' ? 'Thủ công' : 'Hỏi trước';
}

function renderSettingsBody(settings) {
  return `
    <p class="intro">Chọn dữ liệu UStudy được phép đọc. Bảng điểm luôn bật để nhận diện hồ sơ sinh viên.</p>
    <div class="privacy"><span>✓</span><span>Dữ liệu chỉ đi từ Portal sang UStudy trên trình duyệt này, không được tải lên máy chủ.</span></div>
    <div class="section">
      <div class="section-title"><span>Cách đồng bộ</span></div>
      <div class="modes" role="group" aria-label="Cách đồng bộ">
        ${['manual', 'ask', 'auto'].map((mode) => `<button class="mode ${settings.mode === mode ? 'active' : ''}" data-mode="${mode}" type="button">${modeLabel(mode)}</button>`).join('')}
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span>Nguồn dữ liệu</span></div>
      <div class="sources">
        ${Object.entries(SOURCE_LABELS).map(([key, label]) => `<label class="source ${key === 'grades' ? 'locked' : ''}"><input data-source="${key}" type="checkbox" ${settings.sources[key] ? 'checked' : ''} ${key === 'grades' ? 'disabled' : ''}><span>${label}</span></label>`).join('')}
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span>Kỳ cho lớp mở và ĐKHP</span></div>
      <div class="period">
        <div class="field"><label for="ustudy-year">Năm học</label><input id="ustudy-year" value="${settings.academicYear}" maxlength="5" placeholder="25-26"></div>
        <div class="field"><label for="ustudy-semester">Học kỳ</label><select id="ustudy-semester"><option value="1" ${settings.semester === '1' ? 'selected' : ''}>Học kỳ 1</option><option value="2" ${settings.semester === '2' ? 'selected' : ''}>Học kỳ 2</option><option value="3" ${settings.semester === '3' ? 'selected' : ''}>Học kỳ 3</option></select></div>
      </div>
    </div>
    <label class="check-row"><input id="ustudy-open-app" type="checkbox" ${settings.openAppAfterSync ? 'checked' : ''}><span>Mở UStudy sau khi thu thập xong để xem trước thay đổi.</span></label>
  `;
}

function render() {
  if (hiddenForSession || !extensionState) {
    host.style.display = 'none';
    return;
  }
  host.style.display = 'block';
  const settings = extensionState.settings;
  const compactAutoMode = settings.onboardingComplete && settings.mode === 'auto' && !editingSettings;
  if (compactAutoMode) {
    if (phase === 'idle') {
      host.style.display = 'none';
      return;
    }
    mount.innerHTML = `
      <section class="compact" aria-live="polite">
        <div class="mark">U</div>
        <div class="compact-copy">
          <strong>${phase === 'running' ? 'UStudy đang đồng bộ' : phase === 'success' ? 'Đồng bộ hoàn tất' : 'Không thể đồng bộ'}</strong>
          <span>${phaseMessage || 'Đang chuẩn bị dữ liệu Portal...'}</span>
        </div>
        ${phase === 'running' ? '<span class="spinner"></span>' : `<span class="compact-dot ${phase === 'error' ? 'error' : ''}"></span>`}
      </section>
    `;
    return;
  }
  const showSetup = !settings.onboardingComplete || editingSettings;

  mount.innerHTML = `
    <section class="panel" aria-label="UStudy Portal Sync">
      <div class="header">
        <div class="mark">U</div>
        <div class="heading"><strong>${showSetup ? 'Thiết lập đồng bộ UStudy' : 'UStudy Portal Sync'}</strong><span>${showSetup ? 'Bạn luôn có thể đổi lại trong popup Extension' : `${modeLabel(settings.mode)} · ${formatLastSync(extensionState.stats.lastSyncedAt)}`}</span></div>
        <button class="icon-btn" id="ustudy-close" type="button" aria-label="Ẩn">×</button>
      </div>
      <div class="body">
        ${showSetup ? renderSettingsBody(settings) : `
          <div class="status-row"><span class="dot ${phase === 'running' ? 'running' : phase === 'error' ? 'error' : ''}"></span><strong>${isPortalReady() ? 'Portal đã sẵn sàng' : 'Hãy đăng nhập Portal trước'}</strong></div>
          <p class="meta">${settings.sources && Object.entries(settings.sources).filter(([, enabled]) => enabled).map(([key]) => SOURCE_LABELS[key]).join(' · ')}</p>
          ${phaseMessage ? `<div class="progress ${phase === 'error' ? 'error' : phase === 'success' ? 'success' : ''}">${phaseMessage}</div>` : ''}
          ${extensionState.stats.successfulSyncs >= 2 && settings.mode === 'ask' && !settings.autoSuggestionDismissed ? `<div class="suggestion">Bạn đã đồng bộ thành công ${extensionState.stats.successfulSyncs} lần. Bật tự động khi mở Portal?<div class="suggestion-actions"><button class="link-btn" id="ustudy-enable-auto" type="button">Bật tự động</button><button class="link-btn muted" id="ustudy-dismiss-auto" type="button">Giữ như hiện tại</button></div></div>` : ''}
        `}
        <div class="actions">
          ${showSetup ? `<button class="button secondary" id="ustudy-cancel-setup" type="button">${settings.onboardingComplete ? 'Hủy' : 'Để sau'}</button><button class="button primary" id="ustudy-save-setup" type="button">Lưu và đồng bộ</button>` : `<button class="button secondary" id="ustudy-settings" type="button">Thiết lập</button><button class="button primary" id="ustudy-sync" type="button" ${phase === 'running' || !isPortalReady() ? 'disabled' : ''}>${phase === 'running' ? 'Đang đồng bộ' : 'Đồng bộ ngay'}</button>`}
        </div>
      </div>
    </section>
  `;

  shadow.getElementById('ustudy-close')?.addEventListener('click', () => {
    hiddenForSession = true;
    render();
  });
  shadow.getElementById('ustudy-settings')?.addEventListener('click', () => {
    editingSettings = true;
    render();
  });
  shadow.getElementById('ustudy-cancel-setup')?.addEventListener('click', () => {
    if (settings.onboardingComplete) {
      editingSettings = false;
      render();
    } else {
      hiddenForSession = true;
      render();
    }
  });
  shadow.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
    shadow.querySelectorAll('[data-mode]').forEach((item) => item.classList.toggle('active', item === button));
  }));
  shadow.getElementById('ustudy-save-setup')?.addEventListener('click', saveSetupAndSync);
  shadow.getElementById('ustudy-sync')?.addEventListener('click', startSync);
  shadow.getElementById('ustudy-enable-auto')?.addEventListener('click', async () => {
    extensionState = await callExtension('SAVE_SETTINGS', { mode: 'auto', autoSuggestionDismissed: true });
    render();
  });
  shadow.getElementById('ustudy-dismiss-auto')?.addEventListener('click', async () => {
    extensionState = await callExtension('SAVE_SETTINGS', { autoSuggestionDismissed: true });
    render();
  });
}

async function saveSetupAndSync() {
  const activeMode = shadow.querySelector('[data-mode].active')?.dataset.mode || 'ask';
  const sources = { grades: true };
  shadow.querySelectorAll('[data-source]').forEach((input) => { sources[input.dataset.source] = input.checked; });
  const academicYear = shadow.getElementById('ustudy-year')?.value.trim() || EXTENSION_CONFIG.defaults.academicYear;
  const semester = shadow.getElementById('ustudy-semester')?.value || EXTENSION_CONFIG.defaults.semester;
  const openAppAfterSync = Boolean(shadow.getElementById('ustudy-open-app')?.checked);

  try {
    extensionState = await callExtension('SAVE_SETTINGS', {
      onboardingComplete: true,
      mode: activeMode,
      sources,
      academicYear,
      semester,
      openAppAfterSync,
    });
    editingSettings = false;
    await startSync();
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
