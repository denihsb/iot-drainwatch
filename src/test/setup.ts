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

Object.defineProperties(HTMLElement.prototype, {
  offsetWidth: { configurable: true, value: 800 },
  offsetHeight: { configurable: true, value: 240 },
});

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    bottom: 240,
    height: 240,
    left: 0,
    right: 800,
    top: 0,
    width: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
};
