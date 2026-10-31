import type { Reading } from '../types';

export function mergeReadings(
  existing: Reading[],
  incoming: Reading[],
  windowStart: Date,
): Reading[] {
  const readings = new Map<number, Reading>();
  for (const reading of [...existing, ...incoming]) {
    readings.set(reading.id, reading);
  }

  return [...readings.values()]
    .filter((reading) => new Date(reading.measured_at).getTime() >= windowStart.getTime())
    .sort(
      (left, right) =>
        new Date(left.measured_at).getTime() - new Date(right.measured_at).getTime(),
    );
}
