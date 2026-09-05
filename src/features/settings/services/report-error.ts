import { APP_CONFIG } from '../../../config/appConfig';

const GMAIL_COMPOSE_URL = 'https://mail.google.com/mail/';

export type ReportEmailOpenResult = 'gmail' | 'mailto' | 'manual';

interface ReportEmailDependencies {
  openWindow: (url: string, target: string) => Window | null;
  openMailClient: (url: string) => void;
}

export function buildGmailReportUrl(title: string, description: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: APP_CONFIG.CONTACT.GROUP_EMAIL,
    su: `${APP_CONFIG.CONTACT.REPORT_SUBJECT_PREFIX}${title}`,
    body: description,
  });

  return `${GMAIL_COMPOSE_URL}?${params.toString()}`;
}

export function buildMailtoReportUrl(title: string, description: string): string {
  const params = new URLSearchParams({
    subject: `${APP_CONFIG.CONTACT.REPORT_SUBJECT_PREFIX}${title}`,
    body: description,
  });

  return `mailto:${APP_CONFIG.CONTACT.GROUP_EMAIL}?${params.toString()}`;
}

export function openReportEmail(
  title: string,
  description: string,
  dependencies: ReportEmailDependencies = {
    openWindow: (url, target) => window.open(url, target),
    openMailClient: (url) => window.location.assign(url),
  },
): ReportEmailOpenResult {
  try {
    const gmailWindow = dependencies.openWindow(buildGmailReportUrl(title, description), '_blank');

    if (gmailWindow) {
      gmailWindow.opener = null;
      return 'gmail';
    }
  } catch {
    // Continue to the default mail client fallback.
  }

  try {
    dependencies.openMailClient(buildMailtoReportUrl(title, description));
    return 'mailto';
  } catch {
    return 'manual';
  }
}
