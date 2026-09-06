import { useEffect, useState } from 'react';

const DEFAULT_DISMISS_MS = 5000;
const FADE_MS = 280;

export function StatusMessage({
  message,
  variant = 'ok',
  onDismiss,
  autoDismiss = variant === 'ok',
  dismissMs = DEFAULT_DISMISS_MS,
  className = '',
}) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!message || !autoDismiss || !onDismiss) {
      setFading(false);
      return undefined;
    }

    let fadeTimer;
    const timer = setTimeout(() => {
      setFading(true);
      fadeTimer = setTimeout(() => {
        onDismiss();
        setFading(false);
      }, FADE_MS);
    }, dismissMs);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, [message, autoDismiss, dismissMs, onDismiss]);

  if (!message) {
    return null;
  }

  const classNames = [
    variant,
    'status-message',
    fading ? 'status-message-fading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <p
      className={classNames}
      role={variant === 'alert' ? 'alert' : 'status'}
      aria-live={variant === 'alert' ? 'assertive' : 'polite'}
    >
      {message}
    </p>
  );
}
