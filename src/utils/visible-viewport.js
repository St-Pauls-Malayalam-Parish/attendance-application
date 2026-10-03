/**
 * Measure browser UI that overlays the page (Chrome bottom bar, etc.) and
 * position the mobile bottom nav above it.
 *
 * Large gaps (on-screen keyboard) and pinch-zoom are ignored.
 */
const MAX_BROWSER_CHROME_PX = 140;

export function isMobileLayout(win = window) {
  const byMedia = win.matchMedia?.('(max-width: 768px)').matches ?? false;
  return byMedia || win.innerWidth <= 768;
}

function applyShellBottomOffset(win, root, browserBottomPx) {
  if (!isMobileLayout(win)) {
    root.style.removeProperty('--shell-bottom-offset');
    return;
  }

  root.style.setProperty('--shell-bottom-offset', `${browserBottomPx}px`);
}

export function syncVisibleViewport(win = window, root = document.documentElement) {
  const viewport = win.visualViewport;
  if (!viewport) {
    root.style.setProperty('--browser-chrome', '0px');
    applyShellBottomOffset(win, root, 0);
    return;
  }

  const scale = viewport.scale || 1;
  if (scale !== 1) {
    root.style.setProperty('--browser-chrome', '0px');
    applyShellBottomOffset(win, root, 0);
    return;
  }

  const bottom = Math.max(0, Math.round(win.innerHeight - viewport.offsetTop - viewport.height));
  const browserBottom = bottom > 0 && bottom <= MAX_BROWSER_CHROME_PX ? bottom : 0;
  root.style.setProperty('--browser-chrome', `${browserBottom}px`);
  applyShellBottomOffset(win, root, browserBottom);
}

export function startVisibleViewport() {
  const sync = () => syncVisibleViewport();
  sync();

  window.visualViewport?.addEventListener('resize', sync);
  window.visualViewport?.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', sync);

  const mobileQuery = window.matchMedia('(max-width: 768px)');
  mobileQuery.addEventListener('change', sync);

  // Safari often settles toolbar size after the first paint / focus change.
  window.setTimeout(sync, 0);
  window.setTimeout(sync, 250);

  return () => {
    window.visualViewport?.removeEventListener('resize', sync);
    window.visualViewport?.removeEventListener('scroll', sync);
    window.removeEventListener('resize', sync);
    window.removeEventListener('orientationchange', sync);
    mobileQuery.removeEventListener('change', sync);
  };
}
