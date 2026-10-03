import { describe, expect, it } from 'vitest';
import { syncVisibleViewport } from '../src/utils/visible-viewport.js';

describe('syncVisibleViewport', () => {
  it('records a small bottom inset for browser chrome', () => {
    const root = document.createElement('div');
    const win = {
      innerHeight: 800,
      visualViewport: { height: 720, offsetTop: 0, scale: 1 },
    };

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--browser-bottom')).toBe('80px');
  });

  it('ignores large insets from the on-screen keyboard', () => {
    const root = document.createElement('div');
    const win = {
      innerHeight: 800,
      visualViewport: { height: 420, offsetTop: 0, scale: 1 },
    };

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--browser-bottom')).toBe('0px');
  });

  it('ignores pinch zoom', () => {
    const root = document.createElement('div');
    const win = {
      innerHeight: 800,
      visualViewport: { height: 720, offsetTop: 0, scale: 1.5 },
    };

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--browser-bottom')).toBe('0px');
  });

  it('clears the inset when the visual viewport is unavailable', () => {
    const root = document.createElement('div');
    syncVisibleViewport({ innerHeight: 800 }, root);
    expect(root.style.getPropertyValue('--browser-bottom')).toBe('0px');
  });
});
