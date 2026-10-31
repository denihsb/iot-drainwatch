import { useEffect, useMemo, useState } from 'react';
import { PAGE_SIZE } from '../lib/constants';
import { formatHistoryTime, formatNumber } from '../lib/format';
import type { Reading, Status } from '../types';
import StatusBadge from './StatusBadge';
import { EmptyState, ErrorState, LoadingState } from './States';

interface HistoryTableProps {
  history: Reading[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type StatusFilter = 'ALL' | Status;

const filters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Semua status' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'WASPADA', label: 'Waspada' },
  { value: 'BAHAYA', label: 'Bahaya' },
  { value: 'SENSOR_FAULT', label: 'Sensor error' },
];

function HistoryTable({ history, loading = false, error = null, onRetry }: HistoryTableProps) {
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredHistory = useMemo(
    () =>
      history.filter((reading) => filter === 'ALL' || reading.status === filter),
    [filter, history],
  );
  const pageCount = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section className="history-section" aria-labelledby="history-title">
      <div className="history-heading">
        <h2 id="history-title">Riwayat pengukuran</h2>
        <label className="history-filter">
          <span>Filter status</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as StatusFilter)}
          >
            {filters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? <LoadingState message="Memuat riwayat…" /> : null}
      {!loading && error ? (
        <div className="history-state">
          <ErrorState message={error} />
          {onRetry && <button type="button" onClick={onRetry}>Coba lagi</button>}
        </div>
      ) : null}
      {!loading && !error && filteredHistory.length === 0 ? (
        <EmptyState message="Belum ada riwayat pengukuran" />
      ) : null}
      {!loading && !error && filteredHistory.length > 0 ? (
        <>
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Ketinggian</th>
                  <th scope="col">Laju</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((reading) => (
                  <tr key={reading.id}>
                    <td>{formatHistoryTime(reading.measured_at)}</td>
                    <td>{formatNumber(reading.level_cm)} cm</td>
                    <td>{formatNumber(reading.rate_cm_min)} cm/menit</td>
                    <td><StatusBadge status={reading.status} compact /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="pagination" aria-label="Paginasi riwayat">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>
            <span aria-current="page">Halaman {currentPage} dari {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
            >
              Berikutnya
            </button>
          </nav>
        </>
      ) : null}
    </section>
  );
}

export default HistoryTable;
