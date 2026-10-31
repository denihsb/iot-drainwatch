import { describe, expect, it } from 'vitest';
import { getConnection } from '../lib/connection';
import { formatAbsoluteTime, formatNumber, formatRelativeTime } from '../lib/format';
import { mergeReadings } from '../lib/merge';
import { downsample, linearSlope } from '../lib/stats';
import { classify, estimateMinutesToThreshold } from '../lib/status';
import type { DeviceConfig, Reading } from '../types';

const config: DeviceConfig = {
  device_id: 'device',
  sensor_height_cm: 20,
  level_waspada_cm: 7,
  level_bahaya_cm: 10,
  rate_waspada_cm_min: 0.5,
  rate_bahaya_cm_min: 1.5,
  window_sec: 90,
  interval_normal_sec: 10,
  interval_alert_sec: 3,
};

const reading = (id: number, measuredAt: string, level = 5): Reading => ({
  id,
  device_id: 'device',
  measured_at: measuredAt,
  distance_cm: 15,
  level_cm: level,
  rate_cm_min: 0.2,
  status: 'NORMAL',
  sensor_ok: true,
  rssi: -60,
});

describe('status helpers', () => {
  it('classifies the most severe level or rate at exact thresholds', () => {
    expect(classify(7, 0, true, config)).toBe('WASPADA');
    expect(classify(5, 1.5, true, config)).toBe('BAHAYA');
  });

  it('handles sensor faults and null rates', () => {
    expect(classify(null, null, false, config)).toBe('SENSOR_FAULT');
    expect(classify(5, null, true, config)).toBe('NORMAL');
  });

  it('estimates only when the threshold is ahead and the rate is positive', () => {
    expect(estimateMinutesToThreshold(5, 1, 10)).toBe(5);
    expect(estimateMinutesToThreshold(10, 1, 10)).toBeNull();
    expect(estimateMinutesToThreshold(5, 0, 10)).toBeNull();
  });
});

describe('statistics helpers', () => {
  it('calculates a least-squares slope and handles insufficient points', () => {
    expect(linearSlope([{ t: 0, y: 1 }, { t: 2, y: 5 }])).toBe(2);
    expect(linearSlope([])).toBe(0);
    expect(linearSlope([{ t: 1, y: 2 }, { t: 1, y: 4 }])).toBe(0);
  });

  it('averages contiguous buckets while preserving order', () => {
    expect(downsample([{ t: 0, y: 0 }, { t: 1, y: 2 }, { t: 2, y: 4 }], 2)).toEqual([
      { t: 0.5, y: 1 },
      { t: 2, y: 4 },
    ]);
    const points = [{ t: 0, y: 1 }];
    expect(downsample(points, 2)).toBe(points);
  });
});

describe('format helpers', () => {
  const now = new Date('2026-10-31T13:00:00.000Z');

  it('formats numbers and null as the Indonesian placeholder', () => {
    expect(formatNumber(1234.56)).toBe('1.234,6');
    expect(formatNumber(null)).toBe('–');
  });

  it('formats absolute time in Asia/Jakarta and relative time', () => {
    expect(formatAbsoluteTime('2026-10-31T13:00:00.000Z')).toContain('20.00.00');
    expect(formatRelativeTime('2026-10-31T12:59:55.000Z', now)).toBe('5 detik lalu');
    expect(formatRelativeTime(null, now)).toBe('–');
  });
});

describe('connection and reading merge helpers', () => {
  const now = new Date('2026-10-31T13:00:00.000Z');

  it('distinguishes unknown, online, and offline at the configured boundary', () => {
    expect(getConnection(null, now)).toBe('unknown');
    expect(getConnection(new Date(now.getTime() - 30_000), now)).toBe('online');
    expect(getConnection(new Date(now.getTime() - 30_001), now)).toBe('offline');
  });

  it('deduplicates, filters by window, and sorts readings ascending', () => {
    const old = reading(1, '2026-10-31T12:59:00.000Z');
    const current = reading(2, '2026-10-31T13:00:02.000Z');
    const replacement = reading(2, '2026-10-31T13:00:02.000Z', 8);
    expect(mergeReadings([current, old], [replacement], new Date('2026-10-31T13:00:00.000Z'))).toEqual([
      replacement,
    ]);
    expect(mergeReadings([], [], now)).toEqual([]);
  });
});
