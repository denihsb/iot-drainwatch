import type { DisplayStatus } from '../types';

interface AlertBannerProps {
  status: DisplayStatus;
  lastUpdateLabel?: string;
}

const messages: Partial<Record<DisplayStatus, string>> = {
  WASPADA: 'Waspada: ketinggian air atau laju kenaikan melewati ambang Waspada.',
  BAHAYA: 'Bahaya: air berpotensi meluap. Periksa saluran segera.',
  SENSOR_FAULT: 'Sensor tidak terbaca. Data ketinggian tidak tersedia.',
};

function AlertBanner({ status, lastUpdateLabel }: AlertBannerProps) {
  if (status === 'NORMAL') {
    return null;
  }
  const message =
    status === 'OFFLINE'
      ? `Perangkat offline. Data terakhir diterima ${lastUpdateLabel ?? '–'}.`
      : messages[status] ?? '';

  return (
    <div
      className={`alert-banner alert-banner--${status.toLowerCase()}`}
      role={status === 'BAHAYA' ? 'alert' : 'status'}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="alert-icon">
        <path d="m12 4 9 16H3L12 4Z" />
        <path d="M12 9v5m0 3h.01" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export default AlertBanner;
