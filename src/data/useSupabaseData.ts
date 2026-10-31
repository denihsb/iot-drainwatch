import { useEffect, useState } from 'react';
import { getConnection } from '../lib/connection';
import { DEVICE_ID, RANGES } from '../lib/constants';
import { getSupabaseClient } from '../lib/supabase';
import type {
  DashboardData,
  Device,
  DeviceConfig,
  RangeKey,
  Reading,
} from '../types';

const CONFIGURATION_ERROR =
  'Konfigurasi Supabase belum lengkap. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.';

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

export function useSupabaseData(range: RangeKey): DashboardData {
  const [data, setData] = useState<DashboardData>(() => emptyData(null, true));
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    if (!client) {
      setData(emptyData(CONFIGURATION_ERROR, false));
      return () => {
        active = false;
      };
    }
    const supabaseClient = client;

    setData((current) => ({ ...current, loading: true, error: null }));
    const windowStart = new Date(Date.now() - rangeSeconds(range) * 1000).toISOString();

    async function loadData(): Promise<void> {
      const [deviceResult, configResult, readingsResult, historyResult] =
        await Promise.all([
          supabaseClient.from('devices').select('*').eq('id', DEVICE_ID).maybeSingle(),
          supabaseClient.from('device_config').select('*').eq('device_id', DEVICE_ID).maybeSingle(),
          supabaseClient
            .from('readings')
            .select('*')
            .eq('device_id', DEVICE_ID)
            .gte('measured_at', windowStart)
            .order('measured_at', { ascending: true })
            .limit(5000),
          supabaseClient
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

      const device = deviceResult.data as Device | null;
      const config = configResult.data as DeviceConfig | null;
      const readings = (readingsResult.data ?? []) as Reading[];
      const history = (historyResult.data ?? []) as Reading[];
      const latest = readings[readings.length - 1] ?? history[0] ?? null;
      const deviceTime = device?.last_seen ? new Date(device.last_seen) : null;
      const readingTime = latest ? new Date(latest.measured_at) : null;
      const lastUpdateAt =
        deviceTime && readingTime
          ? new Date(Math.max(deviceTime.getTime(), readingTime.getTime()))
          : deviceTime ?? readingTime;

      if (active) {
        setData({
          device,
          config,
          latest,
          readings,
          history,
          connection: getConnection(lastUpdateAt, new Date()),
          lastUpdateAt,
          realtime: 'disconnected',
          loading: false,
          error: null,
        });
      }
    }

    void loadData().catch((loadError: unknown) => {
      if (active) {
        const message = loadError instanceof Error ? loadError.message : 'Gagal memuat data Supabase.';
        setData(emptyData(message, false));
      }
    });

    return () => {
      active = false;
    };
  }, [range]);

  if (data.lastUpdateAt) {
    return {
      ...data,
      connection: getConnection(data.lastUpdateAt, now),
    };
  }
  return data;
}
