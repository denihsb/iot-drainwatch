import type { DashboardData, RangeKey, Scenario } from '../types';
import { useMockData } from './useMockData';
import { useSupabaseData } from './useSupabaseData';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export function useDashboardData(
  range: RangeKey,
  scenario: Scenario = 'stabil',
): DashboardData {
  const mockData = useMockData(range, scenario, useMock);
  const supabaseData = useSupabaseData(range);
  return useMock ? mockData : supabaseData;
}
