import type { Scenario } from '../types';

interface ScenarioSwitcherProps {
  value: Scenario;
  onChange: (scenario: Scenario) => void;
}

const scenarios: Array<{ value: Scenario; label: string }> = [
  { value: 'stabil', label: 'Stabil' },
  { value: 'naik-perlahan', label: 'Naik perlahan' },
  { value: 'banjir', label: 'Banjir' },
  { value: 'sensor-error', label: 'Sensor error' },
  { value: 'offline', label: 'Offline' },
];

function ScenarioSwitcher({ value, onChange }: ScenarioSwitcherProps) {
  return (
    <div className="scenario-switcher">
      <span className="control-label">Mode simulasi</span>
      <select
        className="select-control"
        aria-label="Skenario simulasi"
        value={value}
        onChange={(event) => onChange(event.target.value as Scenario)}
      >
        {scenarios.map((scenario) => (
          <option key={scenario.value} value={scenario.value}>
            {scenario.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ScenarioSwitcher;
