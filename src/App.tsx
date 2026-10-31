import { useState } from 'react';
import Header from './components/Header';
import RangeSelector from './components/RangeSelector';
import ScenarioSwitcher from './components/ScenarioSwitcher';
import { ErrorState } from './components/States';
import { useDashboardData } from './data/useDashboardData';
import type { RangeKey, Scenario } from './types';

function App() {
  const [range, setRange] = useState<RangeKey>('15m');
  const [scenario, setScenario] = useState<Scenario>('stabil');
  const data = useDashboardData(range, scenario);
  const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

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
          <section className="dashboard-placeholder" aria-label="Konten dashboard">
            <span>Dashboard siap dikembangkan.</span>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
