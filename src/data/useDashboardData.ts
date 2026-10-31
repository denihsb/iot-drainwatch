import type { DashboardData, RangeKey, Scenario } from '../types';
import { USE_MOCK } from '../lib/constants';
import { useMockData } from './useMockData';
import { useSupabaseData } from './useSupabaseData';

export function useDashboardData(
  range: RangeKey,
  scenario: Scenario = 'stabil',
): DashboardData {
  const mockData = useMockData(range, scenario, USE_MOCK);
  const supabaseData = useSupabaseData(range);
  return USE_MOCK ? mockData : supabaseData;
}
