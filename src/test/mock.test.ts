import { describe, expect, it } from 'vitest';
import { createInitialMockReadings } from '../data/mock';

describe('mock scenarios', () => {
  it('starts with 30 minutes of readings', () => {
    expect(createInitialMockReadings('stabil')).toHaveLength(901);
  });

  it('reaches danger in the flood scenario', () => {
    const readings = createInitialMockReadings('banjir');
    expect(readings.some((reading) => reading.status === 'BAHAYA')).toBe(true);
  });

  it('produces sensor fault readings after the error delay', () => {
    const readings = createInitialMockReadings('sensor-error');
    expect(readings.at(-1)?.status).toBe('SENSOR_FAULT');
    expect(readings.at(-1)?.level_cm).toBeNull();
  });

  it('does not produce sensor faults in the stable scenario', () => {
    expect(createInitialMockReadings('stabil').every((reading) => reading.sensor_ok)).toBe(true);
  });
});
