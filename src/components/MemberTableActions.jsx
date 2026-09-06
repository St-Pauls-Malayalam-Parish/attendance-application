import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MENU_WIDTH = 184;
const MENU_GAP = 6;

function MemberManageMenu({ member, onEdit, onSetActive, onDelete }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const menuId = useId();

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const panelHeight = panelRef.current?.offsetHeight || 148;
    const left = Math.min(
      Math.max(12, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 12
    );

    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const openAbove = spaceBelow < panelHeight && rect.top > panelHeight + MENU_GAP;
    const top = openAbove ? rect.top - panelHeight - MENU_GAP : rect.bottom + MENU_GAP;

    setMenuStyle({
      position: 'fixed',
      top: Math.max(12, top),
      left,
      width: MENU_WIDTH,
      zIndex: 1200,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    updateMenuPosition();
    const frame = window.requestAnimationFrame(() => {
      updateMenuPosition();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, updateMenuPosition]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    function handleReposition() {
      updateMenuPosition();
    }

    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return undefined;

    function handleClick(event) {
      const target = event.target;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 0);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function runAction(action) {
    setOpen(false);
    action();
  }

  const menuPanel =
    open && menuStyle
      ? createPortal(
          <div
            ref={panelRef}
            className="action-menu-panel action-menu-panel-fixed"
            id={menuId}
            role="menu"
            style={menuStyle}
          >
            <button
              type="button"
              role="menuitem"
              className="action-menu-item"
              onClick={() => runAction(() => onEdit(member))}
            >
              Edit member
            </button>
            {member.active ? (
              <button
                type="button"
                role="menuitem"
                className="action-menu-item"
                onClick={() => runAction(() => onSetActive(member, false))}
              >
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                className="action-menu-item"
                onClick={() => runAction(() => onSetActive(member, true))}
              >
                Reactivate
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="action-menu-item danger"
              onClick={() => runAction(() => onDelete(member))}
            >
              Delete permanently
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="action-menu">
      <button
        ref={triggerRef}
        type="button"
        className="ghost table-action action-menu-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        Manage
      </button>
      {menuPanel}
    </div>
  );
}

export function MemberTableActions({ member, onFeedback, onEdit, onSetActive, onDelete }) {
  return (
    <div className="member-row-actions">
      <button type="button" className="table-action primary" onClick={() => onFeedback(member)}>
        Feedback
      </button>
      <MemberManageMenu
        member={member}
        onEdit={onEdit}
        onSetActive={onSetActive}
        onDelete={onDelete}
      />
    </div>
  );
}
