import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { publicUrl } from '../publicUrl.js';

function roleLabel(user) {
  if (user.role === 'admin') return 'Admin';
  if (user.approvalStatus === 'pending') return 'Pending approval';
  return user.voicePart;
}

export function Shell({ children, links }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src={publicUrl('csi-logo.png')} alt="Church of South India" className="brand-logo" />
          <div>
            <strong className="brand-title-full">St Pauls Malayalam Parish, Pune</strong>
            <strong className="brand-title-short">St Paul&apos;s Choir</strong>
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
          <button type="button" className="ghost session-signout" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className="bottom-nav-link">
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
