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
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RangeSelector;
