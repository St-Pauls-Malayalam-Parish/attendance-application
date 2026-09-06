import { useCallback, useMemo, useState } from 'react';

/**
 * @param {{ onError?: (error: Error) => void }} options
 */
export function useConfirmDialog({ onError } = {}) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirm = useCallback((options) => {
    setState(options);
  }, []);

  const close = useCallback(() => {
    if (!busy) {
      setState(null);
    }
  }, [busy]);

  const handleConfirm = useCallback(async () => {
    if (!state?.action) {
      return;
    }

    setBusy(true);
    try {
      await state.action();
      setState(null);
    } catch (err) {
      onError?.(err);
    } finally {
      setBusy(false);
    }
  }, [state, onError]);

  const confirmProps = useMemo(
    () => ({
      open: state !== null,
      onOpenChange: (open) => {
        if (!open) {
          close();
        }
      },
      title: state?.title ?? '',
      description: state?.description ?? '',
      confirmLabel: state?.confirmLabel ?? 'Confirm',
      cancelLabel: state?.cancelLabel ?? 'Cancel',
      tone: state?.tone ?? (state?.danger ? 'danger' : 'default'),
      busy,
      onConfirm: handleConfirm,
    }),
    [state, busy, close, handleConfirm]
  );

  return { confirm, confirmProps, close, busy };
}
