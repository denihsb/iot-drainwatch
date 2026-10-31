import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getConnection } from '../lib/connection';
import { DEVICE_ID, RANGES } from '../lib/constants';
import { mergeReadings } from '../lib/merge';
import { getSupabaseClient, type Database } from '../lib/supabase';
import type {
  DashboardData,
  Device,
  DeviceConfig,
  RangeKey,
  Reading,
} from '../types';

const CONFIGURATION_ERROR =
  'Konfigurasi Supabase belum lengkap. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.';

type ReadingPayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['readings']['Row']
>;
type DevicePayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['devices']['Row']
>;

interface Snapshot {
  device: Device | null;
  config: DeviceConfig | null;
  readings: Reading[];
  history: Reading[];
}

function rangeSeconds(range: RangeKey): number {
  return RANGES.find((item) => item.key === range)?.seconds ?? RANGES[0].seconds;
}

function emptyData(error: string | null, loading: boolean): DashboardData {
  return {
    device: null,
    config: null,
    latest: null,
    readings: [],
    history: [],
    connection: 'unknown',
    lastUpdateAt: null,
    realtime: 'disconnected',
    loading,
    error,
  };
}

function getLastUpdateAt(device: Device | null, latest: Reading | null): Date | null {
  const deviceTime = device?.last_seen ? new Date(device.last_seen) : null;
  const readingTime = latest ? new Date(latest.measured_at) : null;
  if (deviceTime && readingTime) {
    return new Date(Math.max(deviceTime.getTime(), readingTime.getTime()));
  }
  return deviceTime ?? readingTime;
}

export function useSupabaseData(range: RangeKey): DashboardData {
  const client = useMemo(() => getSupabaseClient(), []);
  const rangeRef = useRef(range);
  const channelState = useRef<'connected' | 'disconnected'>('disconnected');
  const [data, setData] = useState<DashboardData>(() => emptyData(null, true));
  const [now, setNow] = useState(() => new Date());

  rangeRef.current = range;

  const loadSnapshot = useCallback(async (requestedRange: RangeKey): Promise<Snapshot> => {
    if (!client) {
      throw new Error(CONFIGURATION_ERROR);
    }
    const windowStart = new Date(
      Date.now() - rangeSeconds(requestedRange) * 1000,
    ).toISOString();
    const [deviceResult, configResult, readingsResult, historyResult] =
      await Promise.all([
        client.from('devices').select('*').eq('id', DEVICE_ID).maybeSingle(),
        client.from('device_config').select('*').eq('device_id', DEVICE_ID).maybeSingle(),
        client
          .from('readings')
          .select('*')
          .eq('device_id', DEVICE_ID)
          .gte('measured_at', windowStart)
          .order('measured_at', { ascending: true })
          .limit(5000),
        client
          .from('readings')
          .select('*')
          .eq('device_id', DEVICE_ID)
          .order('measured_at', { ascending: false })
          .limit(200),
      ]);
    const error =
      deviceResult.error ??
      configResult.error ??
      readingsResult.error ??
      historyResult.error;
    if (error) {
      throw new Error(`Gagal memuat data Supabase: ${error.message}`);
    }
    return {
      device: deviceResult.data as Device | null,
      config: configResult.data as DeviceConfig | null,
      readings: (readingsResult.data ?? []) as Reading[],
      history: (historyResult.data ?? []) as Reading[],
    };
  }, [client]);

  const applySnapshot = useCallback((snapshot: Snapshot, realtime: DashboardData['realtime']) => {
    const latest = snapshot.readings[snapshot.readings.length - 1] ?? snapshot.history[0] ?? null;
    const lastUpdateAt = getLastUpdateAt(snapshot.device, latest);
    setData({
      ...snapshot,
      latest,
      connection: getConnection(lastUpdateAt, new Date()),
      lastUpdateAt,
      realtime,
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    setData((current) => ({ ...current, loading: true, error: null }));
    void loadSnapshot(range)
      .then((snapshot) => {
        if (active) {
          applySnapshot(snapshot, channelState.current === 'connected' ? 'connected' : 'connecting');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const message = error instanceof Error ? error.message : 'Gagal memuat data Supabase.';
          setData(emptyData(message, false));
        }
      });
    return () => {
      active = false;
    };
  }, [applySnapshot, loadSnapshot, range]);

  useEffect(() => {
    if (!client) {
      setData(emptyData(CONFIGURATION_ERROR, false));
      return;
    }
    let active = true;
    const channel = client
      .channel(`drainwatch-${DEVICE_ID}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'readings',
          filter: `device_id=eq.${DEVICE_ID}`,
        },
        (payload: ReadingPayload) => {
          const incoming = payload.new as Reading;
          setData((current) => {
            const windowStart = new Date(
              Date.now() - rangeSeconds(rangeRef.current) * 1000,
            );
            const readings = mergeReadings(current.readings, [incoming], windowStart);
            const latest = readings[readings.length - 1] ?? current.latest;
            const history = [incoming, ...current.history.filter((item) => item.id !== incoming.id)]
              .sort((left, right) => new Date(right.measured_at).getTime() - new Date(left.measured_at).getTime())
              .slice(0, 200);
            const lastUpdateAt = getLastUpdateAt(current.device, latest);
            return {
              ...current,
              latest,
              readings,
              history,
              lastUpdateAt,
              connection: getConnection(lastUpdateAt, new Date()),
            };
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'devices',
          filter: `id=eq.${DEVICE_ID}`,
        },
        (payload: DevicePayload) => {
          const device = payload.new as Device;
          setData((current) => {
            const lastUpdateAt = getLastUpdateAt(device, current.latest);
            return {
              ...current,
              device,
              lastUpdateAt,
              connection: getConnection(lastUpdateAt, new Date()),
            };
          });
        },
      )
      .subscribe((status) => {
        if (!active) {
          return;
        }
        if (status === 'SUBSCRIBED') {
          const wasDisconnected = channelState.current === 'disconnected';
          channelState.current = 'connected';
          setData((current) => ({ ...current, realtime: 'connected' }));
          if (wasDisconnected) {
            void loadSnapshot(rangeRef.current)
              .then((snapshot) => {
                if (active) {
                  applySnapshot(snapshot, 'connected');
                }
              })
              .catch(() => {
                if (active) {
                  setData((current) => ({ ...current, realtime: 'connected' }));
                }
              });
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          channelState.current = 'disconnected';
          setData((current) => ({ ...current, realtime: 'disconnected' }));
        }
      });

    return () => {
      active = false;
      channelState.current = 'disconnected';
      void client.removeChannel(channel);
    };
  }, [applySnapshot, client, loadSnapshot]);

  return data.lastUpdateAt
    ? { ...data, connection: getConnection(data.lastUpdateAt, now) }
    : data;
}
