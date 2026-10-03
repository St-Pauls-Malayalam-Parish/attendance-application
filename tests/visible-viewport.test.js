import { describe, expect, it } from 'vitest';
import { syncVisibleViewport } from '../src/utils/visible-viewport.js';

function mockWin({
  innerHeight,
  visualViewport,
  mobile = false,
  finePointer = true,
  innerWidth = mobile ? 390 : 1200,
}) {
  return {
    innerWidth,
    innerHeight,
    visualViewport,
    matchMedia: (query) => ({
      matches:
        (query.includes('max-width') && mobile) || (query.includes('pointer: fine') && finePointer),
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };
}

describe('syncVisibleViewport', () => {
  it('records a small bottom inset for browser chrome', () => {
    const root = document.documentElement;
    const win = mockWin({
      innerHeight: 800,
      visualViewport: { height: 720, offsetTop: 0, scale: 1 },
    });

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--browser-chrome')).toBe('80px');
  });

  it('keeps the nav flush when no browser chrome is reported', () => {
    const root = document.documentElement;
    const win = mockWin({
      innerHeight: 800,
      visualViewport: { height: 800, offsetTop: 0, scale: 1 },
      mobile: true,
      finePointer: true,
    });

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--shell-bottom-offset')).toBe('0px');
  });

  it('uses measured chrome on mobile when the toolbar is visible', () => {
    const root = document.documentElement;
    const win = mockWin({
      innerHeight: 800,
      visualViewport: { height: 720, offsetTop: 0, scale: 1 },
      mobile: true,
      finePointer: false,
    });

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--shell-bottom-offset')).toBe('80px');
  });

  it('ignores large insets from the on-screen keyboard', () => {
    const root = document.documentElement;
    const win = mockWin({
      innerHeight: 800,
      visualViewport: { height: 420, offsetTop: 0, scale: 1 },
    });

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--browser-chrome')).toBe('0px');
  });

  it('ignores pinch zoom', () => {
    const root = document.documentElement;
    const win = mockWin({
      innerHeight: 800,
      visualViewport: { height: 720, offsetTop: 0, scale: 1.5 },
    });

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--browser-chrome')).toBe('0px');
  });

  it('clears the inset when the visual viewport is unavailable', () => {
    const root = document.documentElement;
    syncVisibleViewport({ innerHeight: 800, innerWidth: 1200, matchMedia: () => ({ matches: false }) }, root);
    expect(root.style.getPropertyValue('--browser-chrome')).toBe('0px');
  });
});
