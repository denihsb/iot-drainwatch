import { useEffect, useRef, useState } from 'react';
import { MOCK_TICK_MS } from '../lib/constants';
import { getConnection } from '../lib/connection';
import type { DashboardData, RangeKey, Reading, Scenario } from '../types';
import {
  createInitialMockReadings,
  createMockReading,
  getRangeSeconds,
  MOCK_CONFIG,
  MOCK_DEVICE,
} from './mock';

export function useMockData(
  range: RangeKey,
  scenario: Scenario = 'stabil',
  enabled = true,
): DashboardData {
  const [readings, setReadings] = useState<Reading[]>(() =>
    createInitialMockReadings(scenario),
  );
  const [now, setNow] = useState(() => new Date());
  const nextId = useRef(readings.length + 1);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setReadings(createInitialMockReadings(scenario));
    nextId.current = 901;
  }, [enabled, scenario]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [enabled, scenario]);

  useEffect(() => {
    if (!enabled || scenario === 'offline') {
      return;
    }
    const timer = window.setInterval(() => {
      setReadings((current) => {
        const measuredAt = new Date().toISOString();
        const elapsedSeconds =
          (Date.now() - new Date(current[0]?.measured_at ?? measuredAt).getTime()) / 1000;
        const next = createMockReading(
          scenario,
          measuredAt,
          elapsedSeconds,
          nextId.current,
          current,
        );
        nextId.current += 1;
        return [...current, next];
      });
    }, MOCK_TICK_MS);
    return () => window.clearInterval(timer);
  }, [enabled, scenario]);

  const windowStart = now.getTime() - getRangeSeconds(range) * 1000;
  const visibleReadings = readings.filter(
    (reading) => new Date(reading.measured_at).getTime() >= windowStart,
  );
  const latest = readings[readings.length - 1] ?? null;
  const lastUpdateAt = latest ? new Date(latest.measured_at) : null;
  const device = {
    ...MOCK_DEVICE,
    last_seen: lastUpdateAt?.toISOString() ?? null,
  };

  return {
    device,
    config: MOCK_CONFIG,
    latest,
    readings: visibleReadings,
    history: [...readings].reverse().slice(0, 200),
    connection: getConnection(lastUpdateAt, now),
    lastUpdateAt,
    realtime: 'connected',
    loading: false,
    error: null,
  };
}
