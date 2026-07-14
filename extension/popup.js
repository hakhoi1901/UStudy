const POPUP_CONFIG = globalThis.USTUDY_EXTENSION_CONFIG;
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
  auto: 'Tự chạy khi mở Portal và đã qua thời gian nghỉ.',
};

let popupState = null;

async function callExtension(action, payload) {
  const response = await chrome.runtime.sendMessage({ action, payload });
  if (!response?.ok) throw new Error(response?.error || 'Extension không phản hồi.');
  return response.data;
}

function formatTime(value) {
  if (!value) return 'Chưa đồng bộ';
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Vừa đồng bộ';
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
}

function selectedMode() {
  return document.querySelector('[data-mode].active')?.dataset.mode || 'ask';
}

function collectSettings() {
  const sources = { grades: true };
  document.querySelectorAll('[data-source]').forEach((input) => { sources[input.dataset.source] = input.checked; });
  return {
    onboardingComplete: true,
    mode: selectedMode(),
    sources,
    academicYear: document.getElementById('academic-year').value.trim() || POPUP_CONFIG.defaults.academicYear,
    semester: document.getElementById('semester').value,
    openAppAfterSync: document.getElementById('open-app').checked,
  };
}

function showError(message) {
  const element = document.getElementById('error-message');
  element.textContent = message;
  element.hidden = !message;
}

function render() {
  const settings = popupState.settings;
  document.getElementById('extension-status').textContent = `Phiên bản ${popupState.extensionVersion} · ${formatTime(popupState.stats.lastSyncedAt)}`;
  document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === settings.mode));
  document.getElementById('mode-description').textContent = MODE_DESCRIPTIONS[settings.mode];
  document.getElementById('academic-year').value = settings.academicYear;
  document.getElementById('semester').value = settings.semester;
  document.getElementById('open-app').checked = settings.openAppAfterSync;

  document.getElementById('source-list').innerHTML = Object.entries(SOURCE_LABELS).map(([key, label]) => `
    <label class="source ${key === 'grades' ? 'locked' : ''}">
      <input data-source="${key}" type="checkbox" ${settings.sources[key] ? 'checked' : ''} ${key === 'grades' ? 'disabled' : ''}>
      <span>${label}</span>
    </label>
  `).join('');

  const summary = document.getElementById('sync-summary');
  if (popupState.pendingImport) {
    summary.hidden = false;
    summary.textContent = 'Có một gói dữ liệu đang chờ xem trước trong UStudy.';
  } else if (popupState.stats.successfulSyncs >= 2 && settings.mode === 'ask' && !settings.autoSuggestionDismissed) {
    summary.hidden = false;
    summary.innerHTML = `Bạn đã đồng bộ thành công ${popupState.stats.successfulSyncs} lần. <button id="enable-auto" type="button">Bật tự động</button>`;
    document.getElementById('enable-auto').style.cssText = 'border:0;background:transparent;padding:0;color:#004a98;font-weight:800;cursor:pointer';
    document.getElementById('enable-auto').addEventListener('click', async () => {
      popupState = await callExtension('SAVE_SETTINGS', { mode: 'auto', autoSuggestionDismissed: true });
      render();
    });
  } else {
    summary.hidden = true;
  }
}

document.getElementById('sync-mode').addEventListener('click', (event) => {
  const button = event.target.closest('[data-mode]');
  if (!button) return;
  document.querySelectorAll('[data-mode]').forEach((item) => item.classList.toggle('active', item === button));
  document.getElementById('mode-description').textContent = MODE_DESCRIPTIONS[button.dataset.mode];
});

document.getElementById('save-settings').addEventListener('click', async () => {
  showError('');
  try {
    popupState = await callExtension('SAVE_SETTINGS', collectSettings());
    render();
    window.setTimeout(() => window.close(), 350);
  } catch (error) {
    showError(error?.message || String(error));
  }
});

document.getElementById('sync-now').addEventListener('click', async () => {
  showError('');
  const button = document.getElementById('sync-now');
  button.disabled = true;
  button.textContent = 'Đang mở Portal...';
  try {
    popupState = await callExtension('SAVE_SETTINGS', collectSettings());
    await callExtension('OPEN_PORTAL');
    window.close();
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Mở Portal và đồng bộ';
    showError(error?.message || String(error));
  }
});

async function initializePopup() {
  try {
    popupState = await callExtension('GET_STATE');
    render();
  } catch (error) {
    showError(error?.message || 'Không thể đọc trạng thái extension.');
  }
}

void initializePopup();
