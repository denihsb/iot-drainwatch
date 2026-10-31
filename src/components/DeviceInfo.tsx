import type { Connection, Device, DeviceConfig } from '../types';

interface DeviceInfoProps {
  device: Device | null;
  config: DeviceConfig | null;
  connection: Connection;
}

const connectionLabels: Record<Connection, string> = {
  online: 'Online',
  offline: 'Offline',
  unknown: '–',
};

function value(value: string | number | null): string {
  return value === null ? '–' : String(value);
}

function DeviceInfo({ device, config, connection }: DeviceInfoProps) {
  return (
    <section className="device-info" aria-labelledby="device-info-title">
      <h2 id="device-info-title">Info perangkat</h2>
      <dl>
        <div><dt>Perangkat</dt><dd>{value(device?.name ?? null)}</dd></div>
        <div><dt>Koneksi</dt><dd>{connectionLabels[connection]}</dd></div>
        <div><dt>RSSI</dt><dd>{device?.rssi === null || device === null ? '–' : `${device.rssi} dBm`}</dd></div>
        <div><dt>Firmware</dt><dd>{value(device?.firmware_version ?? null)}</dd></div>
        <div><dt>Ambang level</dt><dd>{config ? `${config.level_waspada_cm} / ${config.level_bahaya_cm} cm` : '–'}</dd></div>
        <div><dt>Ambang laju</dt><dd>{config ? `${config.rate_waspada_cm_min} / ${config.rate_bahaya_cm_min} cm/menit` : '–'}</dd></div>
      </dl>
    </section>
  );
}

export default DeviceInfo;
