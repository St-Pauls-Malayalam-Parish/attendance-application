import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MemberProfileEditor } from '../components/MemberProfileEditor.jsx';

export function AdminMemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState('');

  return (
    <>
      <section className="page-head page-head-with-action">
        <div>
          <p className="eyebrow">
            <Link to="/admin/members" className="text-link">Members</Link>
            <span aria-hidden="true"> / </span>
            Feedback
          </p>
          <h1>{memberName || 'Member feedback'}</h1>
          <p className="lede">
            Voice range, pathway, and feedback history. Use <strong>Feedback</strong> on the roster to
            add updates.
          </p>
        </div>
        <button type="button" className="ghost page-head-action" onClick={() => navigate('/admin/members')}>
          Back to members
        </button>
      </section>

      <MemberProfileEditor memberId={memberId} onMemberLoaded={(member) => setMemberName(member.name)} />
    </>
  );
}
