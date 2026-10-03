import { describe, expect, it } from 'vitest';
import { syncVisibleViewport } from '../src/utils/visible-viewport.js';

describe('syncVisibleViewport', () => {
  it('records the height hidden by the browser toolbar', () => {
    const root = document.createElement('div');
    const win = {
      innerHeight: 800,
      visualViewport: { height: 720, offsetTop: 0 },
    };

    syncVisibleViewport(win, root);

    expect(root.style.getPropertyValue('--app-height')).toBe('720px');
    expect(root.style.getPropertyValue('--vv-offset-top')).toBe('0px');
    expect(root.style.getPropertyValue('--browser-bottom')).toBe('80px');
  });

  it('does nothing when the visual viewport is unavailable', () => {
    const root = document.createElement('div');
    syncVisibleViewport({ innerHeight: 800 }, root);
    expect(root.style.getPropertyValue('--app-height')).toBe('');
  });
});
