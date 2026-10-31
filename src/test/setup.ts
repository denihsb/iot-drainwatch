import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());

class MockResizeObserver implements ResizeObserver {
  disconnect(): void {}

  observe(target: Element, options?: ResizeObserverOptions): void {
    void target;
    void options;
  }

  unobserve(target: Element): void {
    void target;
  }
}

globalThis.ResizeObserver = MockResizeObserver;
