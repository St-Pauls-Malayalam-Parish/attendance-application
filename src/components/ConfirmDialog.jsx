import { useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { syncVisibleViewport } from '../utils/visible-viewport.js';

const TONE_CLASS = {
  default: 'confirm-primary',
  primary: 'confirm-primary',
  danger: 'confirm-danger',
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  danger = false,
  busy = false,
  onConfirm,
}) {
  const resolvedTone = danger ? 'danger' : tone;
  const confirmClass = TONE_CLASS[resolvedTone] ?? TONE_CLASS.default;

  useEffect(() => {
    document.body.classList.toggle('confirm-dialog-open', open);
    if (!open) return undefined;

    syncVisibleViewport();
    const sync = () => syncVisibleViewport();
    window.visualViewport?.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('scroll', sync);

    return () => {
      document.body.classList.remove('confirm-dialog-open');
      window.visualViewport?.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('scroll', sync);
    };
  }, [open]);

  async function handleConfirm(event) {
    event.preventDefault();
    await onConfirm?.();
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="confirm-overlay" />
        <AlertDialog.Content className="confirm-dialog" aria-describedby="confirm-dialog-description">
          <AlertDialog.Title className="confirm-title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="confirm-description" id="confirm-dialog-description">
            {description}
          </AlertDialog.Description>
          <div className="confirm-actions">
            <AlertDialog.Cancel asChild>
              <button type="button" className="ghost confirm-cancel" disabled={busy}>
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                className={confirmClass}
                disabled={busy}
                onClick={handleConfirm}
              >
                {busy ? 'Please wait…' : confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
