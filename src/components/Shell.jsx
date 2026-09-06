import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { useConfirmDialog } from '../hooks/useConfirmDialog.js';
import { publicUrl } from '../publicUrl.js';
import { formatVoicePart } from '../api.js';

function roleLabel(user) {
  if (user.role === 'admin') return 'Admin';
  if (user.approvalStatus === 'pending') return 'Pending approval';
  const voicePart = formatVoicePart(user.voicePart);
  return voicePart || 'Member';
}

export function Shell({ children, links }) {
  const { user, logout } = useAuth();
  const { confirm, confirmProps } = useConfirmDialog();

  function requestSignOut() {
    confirm({
      title: 'Sign out?',
      description: 'You will need to sign in again to access choir attendance.',
      confirmLabel: 'Sign out',
      cancelLabel: 'Stay signed in',
      tone: 'default',
      action: logout,
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src={publicUrl('csi-logo.png')} alt="Church of South India" className="brand-logo" />
          <div className="brand-text">
            <strong>St Pauls Malayalam Parish, Pune</strong>
            <p>Choir attendance</p>
          </div>
        </div>
        <nav className="nav nav-desktop" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="session">
          <span>
            {user.name}
            <small>{roleLabel(user)}</small>
          </span>
          <button type="button" className="ghost session-signout" onClick={requestSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

        <nav className="bottom-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="bottom-nav-link">
              <span className="bottom-nav-label-full">{link.label}</span>
              {link.mobileLabel ? (
                <span className="bottom-nav-label-short">{link.mobileLabel}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      <ConfirmDialog {...confirmProps} />
    </div>
  );
}
