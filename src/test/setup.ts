import '@testing-library/jest-dom/vitest';

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
