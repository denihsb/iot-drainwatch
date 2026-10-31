export type Status = 'NORMAL' | 'WASPADA' | 'BAHAYA' | 'SENSOR_FAULT';
export type DisplayStatus = Status | 'OFFLINE';

export interface Reading {
  id: number;
  device_id: string;
  measured_at: string;
  distance_cm: number | null;
  level_cm: number | null;
  rate_cm_min: number | null;
  status: Status;
  sensor_ok: boolean;
  rssi: number | null;
}

export interface Device {
  id: string;
  name: string | null;
  last_seen: string | null;
  rssi: number | null;
  firmware_version: string | null;
  status: string | null;
}

export interface DeviceConfig {
  device_id: string;
  sensor_height_cm: number;
  level_waspada_cm: number;
  level_bahaya_cm: number;
  rate_waspada_cm_min: number;
  rate_bahaya_cm_min: number;
  window_sec: number;
  interval_normal_sec: number;
  interval_alert_sec: number;
}

export type Connection = 'online' | 'offline' | 'unknown';
export type RangeKey = '15m' | '1h' | '6h' | '24h';
export type RealtimeStatus = 'connected' | 'connecting' | 'disconnected';
export type Scenario =
  | 'stabil'
  | 'naik-perlahan'
  | 'banjir'
  | 'sensor-error'
  | 'offline';

export interface DashboardData {
  device: Device | null;
  config: DeviceConfig | null;
  latest: Reading | null;
  readings: Reading[];
  history: Reading[];
  connection: Connection;
  lastUpdateAt: Date | null;
  realtime: RealtimeStatus;
  loading: boolean;
  error: string | null;
}
