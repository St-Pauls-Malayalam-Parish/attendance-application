export function AuthLayout({ title, lede, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <img src="/st-pauls-church.png" alt="St Paul's Malayalam Parish church" />
      </div>
      <section className="auth-panel">
        <img src="/csi-logo.png" alt="Church of South India" className="auth-logo" />
        <p className="eyebrow">St Paul's Malayalam Parish</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {children}
      </section>
    </div>
  );
}
