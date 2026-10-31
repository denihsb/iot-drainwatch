import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DeviceInfo from '../components/DeviceInfo';
import { formatNumber } from '../lib/format';

describe('T10 edge cases', () => {
  it('shows safe placeholders when device metadata is unavailable', () => {
    render(<DeviceInfo device={null} config={null} connection="unknown" />);
    expect(screen.getAllByText('–').length).toBeGreaterThan(0);
  });

  it('preserves negative levels as received', () => {
    expect(formatNumber(-1.5)).toBe('-1,5');
  });
});
