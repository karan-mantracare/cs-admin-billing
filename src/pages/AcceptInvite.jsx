import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getAllUsers, saveUser, getUserById } from '../utils/userStorage';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'HR',
    divisionAccess: 'Healthcare',
    status: 'Pending',
    invitedBy: 'Karan Hinduja (Admin)'
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let resolvedEmail = emailParam.trim();
    let resolvedRole = 'HR';

    // Decode token if provided (encoded as btoa('email:role'))
    if (tokenParam) {
      try {
        const decoded = atob(decodeURIComponent(tokenParam));
        if (decoded.includes(':')) {
          const parts = decoded.split(':');
          if (!resolvedEmail) resolvedEmail = parts[0];
          resolvedRole = parts[1] || 'HR';
        }
      } catch (err) {
        console.warn('Could not decode invite token:', err);
      }
    }

    if (!resolvedEmail) {
      resolvedEmail = 'priya.hr@company.com';
    }

    // Look up existing user in storage
    const existing = getUserById(resolvedEmail);
    const inferredName = resolvedEmail.includes('@')
      ? resolvedEmail
          .split('@')[0]
          .replace(/[-_.]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Invited User';

    setInviteData({
      name: existing?.name && existing.name !== 'Karan Hinduja' ? existing.name : inferredName,
      email: resolvedEmail,
      role: existing?.role || resolvedRole || 'HR',
      divisionAccess: existing?.divisionAccess || 'Healthcare',
      status: existing?.status || 'Pending',
      invitedBy: 'Karan Hinduja (Admin)'
    });
  }, [tokenParam, emailParam]);

  const handleAcceptInvite = (e) => {
    e.preventDefault();
    setError('');

    if (!inviteData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Save user to central user storage with Active status
      const updatedUser = {
        user_id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
        name: inviteData.name.trim(),
        email: inviteData.email.trim(),
        role: inviteData.role,
        divisionAccess: inviteData.divisionAccess,
        status: 'Active',
        acceptedAt: new Date().toISOString()
      };

      saveUser(updatedUser);

      // 2. Mark invite as Accepted in all division_invites_* storage keys
      try {
        const inviteKeys = new Set(Object.keys(localStorage).filter(k => k.startsWith('division_invites_')));
        inviteKeys.add('division_invites_1');
        inviteKeys.add('division_invites_div_1789450630540');

        inviteKeys.forEach((key) => {
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [
            { id: 1, email: 'priya.hr@company.com', role: 'HR', status: 'Pending', invitedAt: '2026-10-15' }
          ];
          if (Array.isArray(list)) {
            let found = false;
            const updatedList = list.map((inv) => {
              if (inv.email?.toLowerCase() === inviteData.email.toLowerCase()) {
                found = true;
                return { ...inv, status: 'Accepted', acceptedAt: new Date().toISOString() };
              }
              return inv;
            });
            if (!found) {
              updatedList.push({
                id: Date.now(),
                email: inviteData.email,
                role: inviteData.role,
                status: 'Accepted',
                acceptedAt: new Date().toISOString()
              });
            }
            localStorage.setItem(key, JSON.stringify(updatedList));
          }
        });
      } catch (err) {
        console.warn('Error updating division invites storage:', err);
      }

      // 3. Add accepted user into division_roles_* active member lists
      try {
        const roleKeys = new Set(Object.keys(localStorage).filter(k => k.startsWith('division_roles_')));
        roleKeys.add('division_roles_1');
        roleKeys.add('division_roles_div_1789450630540');

        roleKeys.forEach((key) => {
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [
            { id: 1, name: 'Karan Hinduja', email: 'hinduja1988@gmail.com', role: 'Customer Success', isPrimary: true }
          ];
          if (Array.isArray(list)) {
            if (!list.some(r => r.email?.toLowerCase() === inviteData.email.toLowerCase())) {
              list.push({
                id: Date.now(),
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isPrimary: false
              });
              localStorage.setItem(key, JSON.stringify(list));
            }
          }
        });
      } catch (err) {
        console.warn('Error updating division roles storage:', err);
      }

      // 4. Set current active session
      try {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            divisionAccess: updatedUser.divisionAccess
          })
        );
        window.dispatchEvent(new Event('storage'));
      } catch {}

      setIsSubmitting(false);
      setIsAccepted(true);
    }, 400);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#f8fafc', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
          <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Accept Invitation</span>
        </div>

        {!isAccepted ? (
          /* Invitation Review & Acceptance Card */
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden'
            }}
          >
            {/* Card Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #034ea2 0%, #0284c7 100%)',
                padding: '1.75rem 2rem',
                color: '#ffffff'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                <i className="bx bx-mail-send"></i>
                <span>Corporate Workspace Invitation</span>
              </div>
              <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
                Join MantraCare Portal
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.9 }}>
                You have been invited by {inviteData.invitedBy} to collaborate on the {inviteData.divisionAccess} division.
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleAcceptInvite} style={{ padding: '1.75rem 2rem' }}>
              {/* Invitation Summary Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Invited Email:</span>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{inviteData.email}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Assigned Role:</span>
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: '600', color: '#034ea2', background: '#e0f2fe', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                      {inviteData.role}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Division Access:</span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{inviteData.divisionAccess}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.15rem' }}>Status:</span>
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: '600', color: '#d97706', background: '#fef3c7', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                      Pending Acceptance
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Input: Full Name */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#034ea2')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              </div>

              {/* Form Input: Verified Email (Read-only) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={inviteData.email}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f1f5f9',
                    fontSize: '0.9rem',
                    color: '#64748b',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Form Input: Optional Password Setup */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      color: '#1e293b',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      color: '#1e293b',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{ padding: '0.55rem 0.85rem', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  background: isSubmitting ? '#93c5fd' : '#034ea2',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(3, 78, 162, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <i className="bx bx-check-circle" style={{ fontSize: '1.15rem' }}></i>
                <span>{isSubmitting ? 'Accepting Invitation...' : 'Accept Invitation & Join Workspace'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success Screen */
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06)',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <i className="bx bx-check"></i>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Welcome Aboard, {inviteData.name}!
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
              Your invitation has been accepted. You are now active as an <strong>{inviteData.role}</strong> with access to the <strong>{inviteData.divisionAccess}</strong> workspace.
            </p>

            {/* Quick Action Navigation Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
              {inviteData.role === 'HR' && (
                <button
                  type="button"
                  onClick={() => navigate('/hr-dash')}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '6px',
                    background: '#034ea2',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <i className="bx bx-layout"></i>
                  <span>Go to HR Dashboard</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/cs/feedback')}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <i className="bx bx-message-square-check"></i>
                <span>Submit Service Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/home')}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go to Home Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
