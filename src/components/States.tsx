interface StateProps {
  message?: string;
}

export function LoadingState({ message = 'Memuat data…' }: StateProps) {
  return <div className="state skeleton" role="status">{message}</div>;
}

export function EmptyState({ message = 'Belum ada data.' }: StateProps) {
  return <div className="state">{message}</div>;
}

export function ErrorState({ message = 'Tidak dapat memuat data.' }: StateProps) {
  return <div className="state state--error" role="alert">{message}</div>;
}
