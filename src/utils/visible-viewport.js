/**
 * Chrome's bottom toolbar (Ask Gemini, New tab, All tabs) can cover the
 * layout viewport. The visual viewport is the part that is actually on screen.
 */
export function syncVisibleViewport(win = window, root = document.documentElement) {
  const viewport = win.visualViewport;
  if (!viewport) return;

  const bottom = Math.max(0, Math.round(win.innerHeight - viewport.offsetTop - viewport.height));
  root.style.setProperty('--app-height', `${Math.round(viewport.height)}px`);
  root.style.setProperty('--vv-offset-top', `${Math.round(viewport.offsetTop)}px`);
  root.style.setProperty('--browser-bottom', `${bottom}px`);
}

export function startVisibleViewport() {
  const sync = () => syncVisibleViewport();
  sync();
  window.visualViewport?.addEventListener('resize', sync);
  window.visualViewport?.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', sync);
  return () => {
    window.visualViewport?.removeEventListener('resize', sync);
    window.visualViewport?.removeEventListener('scroll', sync);
    window.removeEventListener('resize', sync);
    window.removeEventListener('orientationchange', sync);
  };
}
