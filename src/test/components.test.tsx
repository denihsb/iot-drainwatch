import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AlertBanner from '../components/AlertBanner';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
  it('renders text and an accessible-hidden SVG icon for each status', () => {
    render(<StatusBadge status="OFFLINE" />);
    expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('AlertBanner', () => {
  it('uses status role for warnings and alert role for danger', () => {
    const { rerender } = render(<AlertBanner status="WASPADA" />);
    expect(screen.getByRole('status')).toHaveTextContent('Waspada');

    rerender(<AlertBanner status="BAHAYA" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Bahaya');
  });

  it('renders no banner for normal status', () => {
    const { container } = render(<AlertBanner status="NORMAL" />);
    expect(container).toBeEmptyDOMElement();
  });
});
