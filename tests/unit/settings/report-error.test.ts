import { describe, expect, it, vi } from 'vitest';

import {
  buildGmailReportUrl,
  buildMailtoReportUrl,
  openReportEmail,
} from '../../../src/features/settings/services/report-error';

describe('buildGmailReportUrl', () => {
  it('opens a Gmail compose window addressed to the support mailbox with the entered report', () => {
    expect(buildGmailReportUrl('Không tải được điểm', 'Mở trang Điểm thì màn hình trắng.')).toBe(
      'https://mail.google.com/mail/?view=cm&fs=1&to=unopia.contact%40gmail.com&su=%5BB%C3%A1o+c%C3%A1o%5D+-+Kh%C3%B4ng+t%E1%BA%A3i+%C4%91%C6%B0%E1%BB%A3c+%C4%91i%E1%BB%83m&body=M%E1%BB%9F+trang+%C4%90i%E1%BB%83m+th%C3%AC+m%C3%A0n+h%C3%ACnh+tr%E1%BA%AFng.',
    );
  });
});

describe('report email fallback', () => {
  it('stops after Gmail opens successfully', () => {
    const gmailWindow = {} as Window;
    const openWindow = vi.fn(() => gmailWindow);
    const openMailClient = vi.fn();

    expect(openReportEmail('Lỗi điểm', 'Màn hình trắng', { openWindow, openMailClient }))
      .toBe('gmail');
    expect(openWindow).toHaveBeenCalledWith(buildGmailReportUrl('Lỗi điểm', 'Màn hình trắng'), '_blank');
    expect(openMailClient).not.toHaveBeenCalled();
  });

  it('uses the default mail app when Gmail cannot be opened', () => {
    const openWindow = vi.fn(() => null);
    const openMailClient = vi.fn();

    expect(openReportEmail('Lỗi điểm', 'Màn hình trắng', { openWindow, openMailClient }))
      .toBe('mailto');
    expect(openMailClient).toHaveBeenCalledWith(buildMailtoReportUrl('Lỗi điểm', 'Màn hình trắng'));
  });

  it('reports a manual fallback when neither Gmail nor the default mail app can be opened', () => {
    const openWindow = vi.fn(() => {
      throw new Error('Popup blocked');
    });
    const openMailClient = vi.fn(() => {
      throw new Error('No mail handler');
    });

    expect(openReportEmail('Lỗi điểm', 'Màn hình trắng', { openWindow, openMailClient }))
      .toBe('manual');
  });
});
