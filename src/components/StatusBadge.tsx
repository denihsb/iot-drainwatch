import type { DisplayStatus } from '../types';

interface StatusBadgeProps {
  status: DisplayStatus;
  compact?: boolean;
}

const labels: Record<DisplayStatus, string> = {
  NORMAL: 'NORMAL',
  WASPADA: 'WASPADA',
  BAHAYA: 'BAHAYA',
  SENSOR_FAULT: 'SENSOR ERROR',
  OFFLINE: 'OFFLINE',
};

function StatusIcon({ status }: { status: DisplayStatus }) {
  if (status === 'NORMAL') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="status-icon"><path d="m5 12 4 4L19 6" /></svg>;
  }
  if (status === 'WASPADA') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="status-icon"><path d="m12 4 9 16H3L12 4Z" /><path d="M12 9v5m0 3h.01" /></svg>;
  }
  if (status === 'BAHAYA') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="status-icon"><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></svg>;
  }
  if (status === 'SENSOR_FAULT') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="status-icon"><circle cx="12" cy="12" r="9" /><path d="M9 9h.01M15 9h.01M9 16c1.5-1.5 4.5-1.5 6 0" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="status-icon"><path d="M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4" /></svg>;
}

function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}${compact ? ' status-badge--compact' : ''}`}>
      <StatusIcon status={status} />
      <span>{labels[status]}</span>
    </span>
  );
}

export default StatusBadge;
