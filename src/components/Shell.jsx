import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { publicUrl } from '../publicUrl.js';

export function Shell({ children, links }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src={publicUrl('csi-logo.png')} alt="Church of South India" className="brand-logo" />
          <div>
            <strong>St Paul's Malayalam Parish</strong>
            <p>Choir attendance</p>
          </div>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="session">
          <span>
            {user.name}
            <small>
              {user.role === 'admin'
                ? 'Admin'
                : user.approvalStatus === 'pending'
                  ? 'Pending approval'
                  : user.voicePart}
            </small>
          </span>
          <button type="button" className="ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
