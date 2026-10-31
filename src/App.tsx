import { useState } from 'react';
import AlertBanner from './components/AlertBanner';
import DeviceInfo from './components/DeviceInfo';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import RangeSelector from './components/RangeSelector';
import ScenarioSwitcher from './components/ScenarioSwitcher';
import StatusBadge from './components/StatusBadge';
import { ErrorState } from './components/States';
import { useDashboardData } from './data/useDashboardData';
import { formatNumber, formatRelativeTime } from './lib/format';
import { estimateMinutesToThreshold } from './lib/status';
import type { RangeKey, Scenario } from './types';

function App() {
  const [range, setRange] = useState<RangeKey>('15m');
  const [scenario, setScenario] = useState<Scenario>('stabil');
  const data = useDashboardData(range, scenario);
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false';
  const displayStatus = data.connection === 'offline' ? 'OFFLINE' : data.latest?.status ?? 'NORMAL';
  const estimate =
    data.latest &&
    data.config &&
    data.latest.level_cm !== null &&
    data.latest.rate_cm_min !== null
      ? estimateMinutesToThreshold(
          data.latest.level_cm,
          data.latest.rate_cm_min,
          data.config.level_bahaya_cm,
        )
      : null;

  return (
    <main className="app-shell" aria-label="DrainWatch">
      <div className="app-content">
        <Header
          device={data.device}
          connection={data.connection}
          lastUpdateAt={data.lastUpdateAt}
          realtime={data.realtime}
        />
        {useMock && (
          <ScenarioSwitcher value={scenario} onChange={setScenario} />
        )}
        <RangeSelector value={range} onChange={setRange} />
        {data.error ? (
          <ErrorState message={data.error} />
        ) : (
          <>
            <div
              className="status-announcer"
              aria-live={displayStatus === 'BAHAYA' ? 'assertive' : 'polite'}
              aria-atomic="true"
            >
              <AlertBanner
                status={displayStatus}
                lastUpdateLabel={formatRelativeTime(data.lastUpdateAt)}
              />
            </div>
            <section className="metric-grid" aria-label="Metrik terbaru">
              <MetricCard
                label="Ketinggian air"
                value={formatNumber(data.latest?.level_cm ?? null)}
                unit="cm"
                muted={displayStatus === 'OFFLINE'}
              />
              <MetricCard
                label="Laju kenaikan"
                value={formatNumber(data.latest?.rate_cm_min ?? null)}
                unit="cm/menit"
                muted={displayStatus === 'OFFLINE'}
              />
              <MetricCard
                label="Status"
                value=""
                statusClass={`metric-card--${displayStatus.toLowerCase()}`}
              >
                <StatusBadge status={displayStatus} />
              </MetricCard>
              <MetricCard
                label="Estimasi menuju Bahaya"
                value={estimate === null ? '–' : `±${formatNumber(estimate)}`}
                unit={estimate === null ? undefined : 'menit'}
                muted={displayStatus === 'OFFLINE'}
              />
            </section>
            <DeviceInfo device={data.device} config={data.config} connection={data.connection} />
          </>
        )}
      </div>
    </main>
  );
}

export default App;
