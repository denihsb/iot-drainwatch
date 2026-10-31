import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  children?: ReactNode;
  muted?: boolean;
  statusClass?: string;
}

function MetricCard({ label, value, unit, children, muted = false, statusClass = '' }: MetricCardProps) {
  return (
    <article className={`metric-card ${muted ? 'metric-card--muted' : ''} ${statusClass}`}>
      <p className="metric-label">{label}</p>
      {children ?? (
        <p className="metric-value">
          <span>{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </p>
      )}
    </article>
  );
}

export default MetricCard;
