export interface TimedPoint {
  t: number;
  y: number;
}

export function linearSlope(points: TimedPoint[]): number {
  if (points.length < 2) {
    return 0;
  }

  const meanT = points.reduce((sum, point) => sum + point.t, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const numerator = points.reduce(
    (sum, point) => sum + (point.t - meanT) * (point.y - meanY),
    0,
  );
  const denominator = points.reduce((sum, point) => sum + (point.t - meanT) ** 2, 0);

  return denominator === 0 ? 0 : numerator / denominator;
}

export function downsample<T extends TimedPoint>(points: T[], maxPoints: number): T[] {
  if (points.length <= maxPoints || maxPoints <= 0) {
    return points;
  }

  const bucketSize = Math.ceil(points.length / maxPoints);
  const result: T[] = [];

  for (let start = 0; start < points.length; start += bucketSize) {
    const bucket = points.slice(start, start + bucketSize);
    const averageT = bucket.reduce((sum, point) => sum + point.t, 0) / bucket.length;
    const averageY = bucket.reduce((sum, point) => sum + point.y, 0) / bucket.length;
    result.push({ ...bucket[0], t: averageT, y: averageY });
  }

  return result;
}
