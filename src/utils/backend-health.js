import { getApiBase } from '../api.js';

const WARMUP_INTERVAL_MS = 5 * 60 * 1000;
const RETRY_DELAY_MS = 5000;

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

export async function pingHealth({ signal } = {}) {
  const response = await fetch(`${getApiBase()}/api/health`, {
    method: 'GET',
    credentials: 'include',
    signal,
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json().catch(() => ({}));
  return data.ok === true;
}

async function warmupWithRetry(signal) {
  while (!signal?.aborted) {
    try {
      if (await pingHealth({ signal })) {
        return;
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        return;
      }
    }

    try {
      await sleep(RETRY_DELAY_MS, signal);
    } catch (err) {
      if (err?.name === 'AbortError') {
        return;
      }
    }
  }
}

/**
 * Ping /api/health on load (retry until ok) and every 5 minutes after that.
 * Helps wake Render after cold starts and reduces idle spin-down.
 */
export function startBackendWarmup({ signal } = {}) {
  warmupWithRetry(signal);

  const intervalId = setInterval(() => {
    pingHealth().catch(() => {});
  }, WARMUP_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
