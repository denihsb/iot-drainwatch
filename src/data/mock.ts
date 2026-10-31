import { MOCK_TICK_MS, RANGES } from '../lib/constants';
import { linearSlope } from '../lib/stats';
import { classify } from '../lib/status';
import type {
  Device,
  DeviceConfig,
  RangeKey,
  Reading,
  Scenario,
} from '../types';

export const MOCK_DEVICE_ID = 'drainwatch-01';

export const MOCK_CONFIG: DeviceConfig = {
  device_id: MOCK_DEVICE_ID,
  sensor_height_cm: 20,
  level_waspada_cm: 7,
  level_bahaya_cm: 10,
  rate_waspada_cm_min: 0.5,
  rate_bahaya_cm_min: 1.5,
  window_sec: 90,
  interval_normal_sec: 10,
  interval_alert_sec: 3,
};

export const MOCK_DEVICE: Device = {
  id: MOCK_DEVICE_ID,
  name: 'DrainWatch Prototipe',
  last_seen: null,
  rssi: -60,
  firmware_version: 'simulator',
  status: 'online',
};

const INITIAL_HISTORY_SECONDS = 30 * 60;

export function getRangeSeconds(range: RangeKey): number {
  return RANGES.find((item) => item.key === range)?.seconds ?? RANGES[0].seconds;
}

function levelAt(scenario: Scenario, elapsedSeconds: number): number | null {
  const noise = Math.sin(elapsedSeconds * 0.17) * 0.2;
  switch (scenario) {
    case 'stabil':
      return 2 + noise;
    case 'naik-perlahan':
      return Math.min(8, 2 + elapsedSeconds / 200 + noise);
    case 'banjir':
      return Math.min(11, 3 + elapsedSeconds / 30 + noise);
    case 'sensor-error':
      return elapsedSeconds < 10 ? 2 + noise : null;
    case 'offline':
      return 2 + noise;
  }
}

function measuredAtForTick(start: number, tick: number): string {
  return new Date(start + tick * MOCK_TICK_MS).toISOString();
}

export function createMockReading(
  scenario: Scenario,
  measuredAt: string,
  elapsedSeconds: number,
  id: number,
  recentReadings: Reading[],
): Reading {
  const level = levelAt(scenario, elapsedSeconds);
  const sensorOk = level !== null;
  const ratePoints = recentReadings
    .filter((reading) => reading.level_cm !== null)
    .slice(-Math.ceil(MOCK_CONFIG.window_sec / (MOCK_TICK_MS / 1000)))
    .map((reading) => ({
      t: new Date(reading.measured_at).getTime() / 1000,
      y: reading.level_cm as number,
    }));
  if (level !== null) {
    ratePoints.push({ t: new Date(measuredAt).getTime() / 1000, y: level });
  }
  const rate = sensorOk ? linearSlope(ratePoints) * 60 : null;

  return {
    id,
    device_id: MOCK_DEVICE_ID,
    measured_at: measuredAt,
    distance_cm: level === null ? null : MOCK_CONFIG.sensor_height_cm - level,
    level_cm: level,
    rate_cm_min: rate,
    status: classify(level, rate, sensorOk, MOCK_CONFIG),
    sensor_ok: sensorOk,
    rssi: -60,
  };
}

export function createInitialMockReadings(
  scenario: Scenario,
  now = Date.now(),
): Reading[] {
  const tickCount = Math.floor(INITIAL_HISTORY_SECONDS / (MOCK_TICK_MS / 1000));
  const start = now - INITIAL_HISTORY_SECONDS * 1000;
  const readings: Reading[] = [];
  for (let tick = 0; tick <= tickCount; tick += 1) {
    readings.push(
      createMockReading(
        scenario,
        measuredAtForTick(start, tick),
        tick * (MOCK_TICK_MS / 1000),
        tick + 1,
        readings,
      ),
    );
  }
  return readings;
}
