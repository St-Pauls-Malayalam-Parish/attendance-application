/**
 * Measure browser UI that overlays the page (Chrome Ask Gemini, etc.).
 *
 * The shell itself uses 100svh so Safari/Chrome toolbars stay outside the
 * layout. This inset only covers overlay chrome that still sits on top of
 * the page after that.
 *
 * Large gaps (on-screen keyboard) and pinch-zoom are ignored.
 */
const MAX_BROWSER_CHROME_PX = 140;

export function syncVisibleViewport(win = window, root = document.documentElement) {
  const viewport = win.visualViewport;
  if (!viewport) {
    root.style.setProperty('--browser-bottom', '0px');
    return;
  }

  const scale = viewport.scale || 1;
  if (scale !== 1) {
    root.style.setProperty('--browser-bottom', '0px');
    return;
  }

  const bottom = Math.max(0, Math.round(win.innerHeight - viewport.offsetTop - viewport.height));
  const browserBottom = bottom > 0 && bottom <= MAX_BROWSER_CHROME_PX ? bottom : 0;
  root.style.setProperty('--browser-bottom', `${browserBottom}px`);
}

export function startVisibleViewport() {
  const sync = () => syncVisibleViewport();
  sync();

  window.visualViewport?.addEventListener('resize', sync);
  window.visualViewport?.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', sync);

  // Safari often settles toolbar size after the first paint / focus change.
  window.setTimeout(sync, 0);
  window.setTimeout(sync, 250);

  return () => {
    window.visualViewport?.removeEventListener('resize', sync);
    window.visualViewport?.removeEventListener('scroll', sync);
    window.removeEventListener('resize', sync);
    window.removeEventListener('orientationchange', sync);
  };
}
