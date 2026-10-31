import { RANGES } from '../lib/constants';
import type { RangeKey } from '../types';

interface RangeSelectorProps {
  value: RangeKey;
  onChange: (range: RangeKey) => void;
}

function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="range-selector">
      <span className="control-label">Rentang</span>
      <div className="range-options" role="radiogroup" aria-label="Rentang waktu">
        {RANGES.map((range) => (
          <button
            className="range-option"
            key={range.key}
            type="button"
            role="radio"
            aria-checked={value === range.key}
            onClick={() => onChange(range.key)}
            onKeyDown={(event) => {
              const index = RANGES.findIndex((item) => item.key === value);
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                onChange(RANGES[(index + 1) % RANGES.length].key);
              }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                onChange(RANGES[(index - 1 + RANGES.length) % RANGES.length].key);
              }
            }}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RangeSelector;
