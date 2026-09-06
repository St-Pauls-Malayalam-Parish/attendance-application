export function FaqAccordion({ faqs, emptyMessage = 'No FAQs yet.' }) {
  if (!faqs.length) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="faq-list">
      {faqs.map((faq) => (
        <details key={faq.id} className="faq-item">
          <summary className="faq-question">{faq.question}</summary>
          <div className="faq-answer">
            {faq.answer.split('\n').map((line, index) => (
              <p key={`${faq.id}-${index}`}>{line}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
