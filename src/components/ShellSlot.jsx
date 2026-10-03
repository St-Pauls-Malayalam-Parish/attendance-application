import { createContext, useContext, useEffect } from 'react';

const ShellSlotContext = createContext(null);

export function ShellSlotContextProvider({ value, children }) {
  return <ShellSlotContext.Provider value={value}>{children}</ShellSlotContext.Provider>;
}

/** Renders children between main content and the mobile bottom nav (flex layout, not fixed). */
export function ShellSlot({ children }) {
  const setSlot = useContext(ShellSlotContext);

  useEffect(() => {
    if (!setSlot) return undefined;
    setSlot(children);
    return () => setSlot(null);
  }, [children, setSlot]);

  return null;
}
