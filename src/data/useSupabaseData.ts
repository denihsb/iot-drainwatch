import type { DashboardData, RangeKey } from '../types';

export function useSupabaseData(range: RangeKey): DashboardData {
  void range;
  return {
    device: null,
    config: null,
    latest: null,
    readings: [],
    history: [],
    connection: 'unknown',
    lastUpdateAt: null,
    realtime: 'disconnected',
    loading: false,
    error: 'Supabase belum diimplementasikan.',
  };
}
