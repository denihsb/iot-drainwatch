import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HistoryTable from '../components/HistoryTable';
import type { Reading } from '../types';

function makeReading(id: number, status: Reading['status'] = 'NORMAL'): Reading {
  return {
    id,
    device_id: 'device',
    measured_at: `2026-10-31T13:${String(id).padStart(2, '0')}:00.000Z`,
    distance_cm: 15,
    level_cm: 5,
    rate_cm_min: 0.2,
    status,
    sensor_ok: status !== 'SENSOR_FAULT',
    rssi: -60,
  };
}

describe('HistoryTable', () => {
  it('shows newest-first data with 20 rows per page and paginates', async () => {
    const history = Array.from({ length: 21 }, (_, index) => makeReading(21 - index));
    render(<HistoryTable history={history} />);

    expect(screen.getAllByRole('row')).toHaveLength(21);
    expect(screen.getByText('Halaman 1 dari 2')).toBeInTheDocument();
    expect(screen.getByText('Waktu')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(screen.getByText('Halaman 2 dari 2')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('filters by status and resets to the first page', async () => {
    const history = Array.from({ length: 21 }, (_, index) =>
      makeReading(index + 1, index === 20 ? 'BAHAYA' : 'NORMAL'),
    );
    render(<HistoryTable history={history} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'BAHAYA' } });
    expect(screen.getByText('BAHAYA')).toBeInTheDocument();
    expect(screen.getByText('Halaman 1 dari 1')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('keeps the active page when new data arrives', async () => {
    const initial = Array.from({ length: 21 }, (_, index) => makeReading(21 - index));
    const { rerender } = render(<HistoryTable history={initial} />);
    fireEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    rerender(<HistoryTable history={[makeReading(22), ...initial]} />);
    expect(screen.getByText('Halaman 2 dari 2')).toBeInTheDocument();
  });
});
