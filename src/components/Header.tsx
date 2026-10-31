import { formatAbsoluteTime, formatRelativeTime } from '../lib/format';
import type { Connection, Device, RealtimeStatus } from '../types';

interface HeaderProps {
  device: Device | null;
  connection: Connection;
  lastUpdateAt: Date | null;
  realtime: RealtimeStatus;
}

const connectionLabels: Record<Connection, string> = {
  online: 'Online',
  offline: 'Offline',
  unknown: 'Belum diketahui',
};

function Header({ device, connection, lastUpdateAt, realtime }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="brand">
        <span className="brand-name">DrainWatch</span>
        <span className="device-name">{device?.name ?? 'Perangkat'}</span>
      </div>
      <div className="connection-summary">
        <span className={`connection-dot connection-dot--${connection}`} aria-hidden="true" />
        <span>{connectionLabels[connection]}</span>
        <span title={lastUpdateAt ? formatAbsoluteTime(lastUpdateAt) : undefined}>
          {formatRelativeTime(lastUpdateAt)}
        </span>
        {realtime !== 'connected' && (
          <span className="realtime-message">Menyambung ulang…</span>
        )}
      </div>
    </header>
  );
}

export default Header;
