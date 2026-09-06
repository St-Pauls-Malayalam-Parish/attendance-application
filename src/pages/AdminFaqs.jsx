import { useEffect, useMemo, useState } from 'react';
import { api, formatFaqAudience } from '../api.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { FaqAccordion } from '../components/FaqAccordion.jsx';
import { FaqFormModal } from '../components/FaqFormModal.jsx';
import { StatusMessage } from '../components/StatusMessage.jsx';
import { useConfirmDialog } from '../hooks/useConfirmDialog.js';

const emptyForm = () => ({
  question: '',
  answer: '',
  audience: 'member',
  sortOrder: '0',
  published: true,
});

export function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [helpFaqs, setHelpFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { confirm, confirmProps } = useConfirmDialog({
    onError: (err) => setError(err.message),
  });

  const sortedFaqs = useMemo(
    () => [...faqs].sort((a, b) => a.sortOrder - b.sortOrder || a.question.localeCompare(b.question)),
    [faqs]
  );

  async function loadFaqs() {
    const [manageData, helpData] = await Promise.all([
      api('/api/faqs?manage=true'),
      api('/api/faqs'),
    ]);
    setFaqs(Array.isArray(manageData.faqs) ? manageData.faqs : []);
    setHelpFaqs(Array.isArray(helpData.faqs) ? helpData.faqs : []);
  }

  useEffect(() => {
    loadFaqs()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setError('');
    setSaved('');
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function startEdit(faq) {
    setError('');
    setSaved('');
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      audience: faq.audience,
      sortOrder: String(faq.sortOrder ?? 0),
      published: Boolean(faq.published),
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (busy) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function refreshAfterMutation() {
    await loadFaqs();
  }

  async function onSubmit() {
    setBusy(true);
    setError('');
    setSaved('');
    const body = {
      question: form.question,
      answer: form.answer,
      audience: form.audience,
      sortOrder: Number(form.sortOrder) || 0,
      published: form.published,
    };

    try {
      if (editingId) {
        await api(`/api/faqs/${editingId}`, { method: 'PATCH', body });
        setSaved('FAQ updated');
      } else {
        await api('/api/faqs', { method: 'POST', body });
        setSaved('FAQ added');
      }
      closeModal();
      await refreshAfterMutation();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function requestDelete(faqId) {
    setError('');
    setSaved('');
    confirm({
      title: 'Delete this FAQ?',
      description: 'This removes the question and answer permanently.',
      confirmLabel: 'Delete FAQ',
      cancelLabel: 'Keep FAQ',
      tone: 'danger',
      action: async () => {
        await api(`/api/faqs/${faqId}`, { method: 'DELETE' });
        if (editingId === faqId) {
          closeModal();
        }
        setSaved('FAQ deleted');
        await refreshAfterMutation();
      },
    });
  }

  function requestDeleteFromModal() {
    if (!editingId) return;
    requestDelete(editingId);
  }

  return (
    <>
      <section className="page-head page-head-with-action">
        <div>
          <p className="eyebrow">Help</p>
          <h1>FAQs</h1>
          <p className="lede">
            Add help articles for members, admins, or everyone. Members see published items on their
            Help page.
          </p>
        </div>
        <button type="button" className="page-head-action" onClick={openAdd}>
          Add FAQ
        </button>
      </section>

      {error ? <p className="alert">{error}</p> : null}
      <StatusMessage message={saved} onDismiss={() => setSaved('')} />

      <div className="card faq-admin-help-card">
        <h2>Admin help</h2>
        <p className="muted">Published FAQs for admins and shared topics.</p>
        <FaqAccordion
          faqs={helpFaqs}
          emptyMessage="No published admin FAQs yet. Add one with audience Admins or Everyone."
        />
      </div>

      <div className="card">
        <h2>Manage FAQs</h2>
        {loading ? (
          <p className="muted">Loading FAQs…</p>
        ) : sortedFaqs.length === 0 ? (
          <p className="muted">No FAQs yet. Add the first one above.</p>
        ) : (
          <>
            <table className="data-table faq-admin-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {sortedFaqs.map((faq) => (
                  <tr key={faq.id}>
                    <td>{faq.question}</td>
                    <td>{formatFaqAudience(faq.audience)}</td>
                    <td>{faq.published ? 'Published' : 'Draft'}</td>
                    <td>{faq.sortOrder}</td>
                    <td>
                      <div className="table-actions-row">
                        <button
                          type="button"
                          className="ghost table-action"
                          onClick={() => startEdit(faq)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ghost danger table-action"
                          onClick={() => requestDelete(faq.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="data-cards">
              {sortedFaqs.map((faq) => (
                <article key={faq.id} className="faq-admin-card">
                  <h3>{faq.question}</h3>
                  <p className="muted">
                    {formatFaqAudience(faq.audience)} · {faq.published ? 'Published' : 'Draft'} ·
                    Order {faq.sortOrder}
                  </p>
                  <p className="faq-admin-card-answer">{faq.answer}</p>
                  <div className="table-actions-row">
                    <button type="button" className="ghost table-action" onClick={() => startEdit(faq)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost danger table-action"
                      onClick={() => requestDelete(faq.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <FaqFormModal
        open={modalOpen}
        editingId={editingId}
        form={form}
        onFormChange={setForm}
        busy={busy}
        onSubmit={onSubmit}
        onClose={closeModal}
        onDelete={requestDeleteFromModal}
      />

      <ConfirmDialog {...confirmProps} />
    </>
  );
}
