import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { FaqAccordion } from '../components/FaqAccordion.jsx';
import { Shell } from '../components/Shell.jsx';
import { useAuth } from '../AuthContext.jsx';
import { memberLinks } from '../nav/memberLinks.js';

export function MemberFaqs() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const pending = user.approvalStatus === 'pending';

  useEffect(() => {
    if (pending) {
      setFaqs([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    api('/api/faqs')
      .then((data) => {
        if (!cancelled) {
          setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pending]);

  return (
    <Shell links={memberLinks}>
      <section className="page-head">
        <div>
          <p className="eyebrow">Help</p>
          <h1>Help &amp; FAQs</h1>
          <p className="lede">
            {pending
              ? 'Once a choir admin approves your account, help articles will appear here.'
              : 'Answers to common questions about choir attendance and your account.'}
          </p>
        </div>
      </section>

      {error ? <p className="alert">{error}</p> : null}

      <div className="card">
        {loading ? (
          <p className="muted">Loading help articles…</p>
        ) : (
          <FaqAccordion
            faqs={faqs}
            emptyMessage={
              pending
                ? 'No help articles are available while your account is pending approval.'
                : 'No help articles yet. Ask a choir admin if you need assistance.'
            }
          />
        )}
      </div>
    </Shell>
  );
}
