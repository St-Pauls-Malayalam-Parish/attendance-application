import { publicUrl } from '../publicUrl.js';

export function AuthLayout({ title, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-hero" aria-hidden="true">
        <picture>
          <source srcSet={publicUrl('church-hero.webp')} type="image/webp" />
          <img
            src={publicUrl('church-hero.jpg')}
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <p className="auth-photo-credit">
          Photo:{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:All_saints_church7.jpg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ccmarathe
          </a>
          {' · '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
        </p>
      </div>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-brand">
            <div className="auth-brand-row">
              <img src={publicUrl('csi-logo.png')} alt="Church of South India" className="auth-logo" />
              <span className="auth-brand-divider" aria-hidden="true">
                |
              </span>
              <div className="auth-parish-name">
                <span className="auth-parish-title">St Pauls Malayalam Parish</span>
                <span className="auth-parish-place">Pune</span>
              </div>
            </div>
            <h1>{title}</h1>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
