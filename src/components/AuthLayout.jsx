import { publicUrl } from '../publicUrl.js';

export function AuthLayout({ title, lede, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <img src={publicUrl('st-pauls-church.png')} alt="St Paul's Malayalam Parish church" />
      </div>
      <section className="auth-panel">
        <img src={publicUrl('csi-logo.png')} alt="Church of South India" className="auth-logo" />
        <p className="eyebrow">St Paul's Malayalam Parish</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {children}
      </section>
    </div>
  );
}
