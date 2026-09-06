import * as AlertDialog from '@radix-ui/react-alert-dialog';

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
