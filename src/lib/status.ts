import type { DeviceConfig, Status } from '../types';

const severity: Record<Status, number> = {
  NORMAL: 0,
  WASPADA: 1,
  BAHAYA: 2,
  SENSOR_FAULT: 3,
};

export function classify(
  level: number | null,
  rate: number | null,
  sensorOk: boolean,
  config: DeviceConfig,
): Status {
  if (!sensorOk || level === null) {
    return 'SENSOR_FAULT';
  }

  const levelStatus: Status =
    level >= config.level_bahaya_cm
      ? 'BAHAYA'
      : level >= config.level_waspada_cm
        ? 'WASPADA'
        : 'NORMAL';
  const effectiveRate = rate ?? 0;
  const rateStatus: Status =
    effectiveRate >= config.rate_bahaya_cm_min
      ? 'BAHAYA'
      : effectiveRate >= config.rate_waspada_cm_min
        ? 'WASPADA'
        : 'NORMAL';

  return severity[levelStatus] >= severity[rateStatus] ? levelStatus : rateStatus;
}

export function estimateMinutesToThreshold(
  level: number,
  rate: number,
  thresholdCm: number,
): number | null {
  if (rate <= 0 || level >= thresholdCm) {
    return null;
  }
  return (thresholdCm - level) / rate;
}
