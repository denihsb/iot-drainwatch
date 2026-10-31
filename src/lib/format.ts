const numberFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const absoluteTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  dateStyle: 'medium',
  timeStyle: 'medium',
});

const historyTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function formatNumber(value: number | null): string {
  return value === null ? '–' : numberFormatter.format(value);
}

export function formatAbsoluteTime(value: Date | string): string {
  return absoluteTimeFormatter.format(value instanceof Date ? value : new Date(value));
}

export function formatHistoryTime(value: Date | string): string {
  return historyTimeFormatter.format(value instanceof Date ? value : new Date(value));
}

export function formatRelativeTime(value: Date | string | null, now = new Date()): string {
  if (value === null) {
    return '–';
  }

  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 1000));
  if (seconds < 60) {
    return `${seconds} detik lalu`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} jam lalu`;
  }
  return `${Math.floor(hours / 24)} hari lalu`;
}
