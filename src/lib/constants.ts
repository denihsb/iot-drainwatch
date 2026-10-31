export const OFFLINE_AFTER_SEC = 30;
export const MAX_CHART_POINTS = 600;
export const PAGE_SIZE = 20;
export const MOCK_TICK_MS = 2000;
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
export const DEVICE_ID = import.meta.env.VITE_DEVICE_ID ?? 'drainwatch-01';

export const RANGES = [
  { key: '15m', label: '15 menit', seconds: 15 * 60 },
  { key: '1h', label: '1 jam', seconds: 60 * 60 },
  { key: '6h', label: '6 jam', seconds: 6 * 60 * 60 },
  { key: '24h', label: '24 jam', seconds: 24 * 60 * 60 },
] as const;
