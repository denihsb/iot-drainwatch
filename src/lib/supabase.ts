import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './constants';

export interface Database {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string;
          name: string | null;
          last_seen: string | null;
          rssi: number | null;
          firmware_version: string | null;
          status: string | null;
        };
        Insert: never;
        Update: never;
      };
      device_config: {
        Row: {
          device_id: string;
          sensor_height_cm: number;
          level_waspada_cm: number;
          level_bahaya_cm: number;
          rate_waspada_cm_min: number;
          rate_bahaya_cm_min: number;
          window_sec: number;
          interval_normal_sec: number;
          interval_alert_sec: number;
        };
        Insert: never;
        Update: never;
      };
      readings: {
        Row: {
          id: number;
          device_id: string;
          measured_at: string;
          distance_cm: number | null;
          level_cm: number | null;
          rate_cm_min: number | null;
          status: 'NORMAL' | 'WASPADA' | 'BAHAYA' | 'SENSOR_FAULT';
          sensor_ok: boolean;
          rssi: number | null;
        };
        Insert: never;
        Update: never;
      };
    };
  };
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
