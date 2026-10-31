import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { MAX_CHART_POINTS } from '../lib/constants';
import { formatAbsoluteTime, formatNumber } from '../lib/format';
import { downsample } from '../lib/stats';
import type { DeviceConfig, RangeKey, Reading } from '../types';
import { EmptyState, ErrorState, LoadingState } from './States';

interface RateChartProps {
  readings: Reading[];
  config: DeviceConfig | null;
  range: RangeKey;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

interface ChartPoint {
  t: number;
  y: number | null;
  status: Reading['status'];
}

function preparePoints(readings: Reading[]): ChartPoint[] {
  const points: ChartPoint[] = [];
  let segment: Array<{ t: number; y: number; status: Reading['status'] }> = [];
  const flush = () => {
    if (segment.length > 0) {
      points.push(...downsample(segment, MAX_CHART_POINTS));
      segment = [];
    }
  };
  for (const reading of readings) {
    const point = {
      t: new Date(reading.measured_at).getTime(),
      y: reading.rate_cm_min,
      status: reading.status,
    };
    if (point.y === null) {
      flush();
      points.push(point);
    } else {
      segment.push({ t: point.t, y: point.y, status: point.status });
    }
  }
  flush();
  return points.sort((left, right) => left.t - right.t);
}

function formatTick(value: number, range: RangeKey): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: range === '15m' ? '2-digit' : undefined,
  }).format(value);
}

function RateChart({
  readings,
  config,
  range,
  loading = false,
  error = null,
  onRetry,
}: RateChartProps) {
  const latest = readings[readings.length - 1];
  const ariaLabel = latest?.rate_cm_min === null || latest === undefined
    ? 'Grafik laju kenaikan, belum ada nilai terbaru'
    : `Grafik laju kenaikan, nilai terbaru ${formatNumber(latest.rate_cm_min)} cm per menit`;

  return (
    <section className="chart-card" aria-labelledby="rate-chart-title">
      <h2 id="rate-chart-title">Laju kenaikan</h2>
      {loading ? <LoadingState message="Memuat grafik…" /> : null}
      {!loading && error ? (
        <div className="chart-state">
          <ErrorState message={error} />
          {onRetry && <button type="button" onClick={onRetry}>Coba lagi</button>}
        </div>
      ) : null}
      {!loading && !error && readings.length === 0 ? (
        <EmptyState message="Belum ada data pada rentang ini" />
      ) : null}
      {!loading && !error && readings.length > 0 ? (
        <div className="chart-frame" aria-label={ariaLabel}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={240}>
            <LineChart data={preparePoints(readings)} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="t" tickFormatter={(value: number) => formatTick(value, range)} />
              <YAxis unit=" cm/menit" />
              <Tooltip
                labelFormatter={(value) => formatAbsoluteTime(new Date(Number(value)))}
                formatter={(value: ValueType) => [typeof value === 'number' ? `${formatNumber(value)} cm/menit` : '–', 'Laju']}
              />
              <ReferenceLine y={0} stroke="var(--text-muted)" />
              {config && (
                <>
                  <ReferenceLine y={config.rate_waspada_cm_min} stroke="var(--status-waspada)" strokeDasharray="5 5" label="Waspada" />
                  <ReferenceLine y={config.rate_bahaya_cm_min} stroke="var(--status-bahaya)" strokeDasharray="5 5" label="Bahaya" />
                </>
              )}
              <Line type="monotone" dataKey="y" name="Laju" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}

export default RateChart;
