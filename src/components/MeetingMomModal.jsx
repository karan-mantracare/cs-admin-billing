import React, { useState, useEffect, useMemo } from 'react';
import { getAuthenticatedSchedulingUser } from '../utils/cadenceDivisionUtils';

export default function MeetingMomModal({
  isOpen,
  onClose,
  meeting,
  cadence,
  initialMode = 'complete', // 'complete' | 'view' | 'edit'
  onSave
}) {
  if (!isOpen || !meeting) return null;

  const schedulingUser = useMemo(() => getAuthenticatedSchedulingUser(), []);
  const [mode, setMode] = useState(initialMode); // 'view' | 'edit' | 'complete'

  // Initialize state from existing MOM or defaults
  const existingMom = meeting.mom || {};
  const [summary, setSummary] = useState(existingMom.summary || '');
  const [actionItems, setActionItems] = useState(existingMom.actionItems || '');
  const [decisions, setDecisions] = useState(existingMom.decisions || '');
  const [attendeesPresent, setAttendeesPresent] = useState(
    existingMom.attendeesPresent || (meeting.primaryCS?.name ? `${meeting.clientName} SPOC, ${meeting.primaryCS.name}` : '')
  );
  const [nextFollowUpDate, setNextFollowUpDate] = useState(existingMom.nextFollowUpDate || '');
  const [error, setError] = useState(null);

  // Sync state if meeting changes
  useEffect(() => {
    setMode(initialMode);
    const mom = meeting.mom || {};
    setSummary(mom.summary || '');
    setActionItems(mom.actionItems || '');
    setDecisions(mom.decisions || '');
    setAttendeesPresent(
      mom.attendeesPresent || (meeting.primaryCS?.name ? `${meeting.clientName} SPOC, ${meeting.primaryCS.name}` : '')
    );
    setNextFollowUpDate(mom.nextFollowUpDate || '');
    setError(null);
  }, [meeting, initialMode]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Save with MOM
  const handleSaveWithMom = (e) => {
    if (e) e.preventDefault();
    if (!summary.trim()) {
      setError('Please provide at least a brief summary or key discussion points for the MOM.');
      return;
    }

    const momData = {
      summary: summary.trim(),
      actionItems: actionItems.trim(),
      decisions: decisions.trim(),
      attendeesPresent: attendeesPresent.trim(),
      nextFollowUpDate: nextFollowUpDate || null,
      savedAt: new Date().toISOString(),
      savedBy: schedulingUser.name || 'CS SPOC'
    };

    onSave(momData, true); // true = ensure marked as completed
    onClose();
  };

  // Handle Skip MOM & Mark as Done
  const handleSkipMom = () => {
    // Save without MOM (or retain existing MOM if editing)
    onSave(null, true);
    onClose();
  };

  const isEditing = mode === 'edit' || mode === 'complete';
  const hasExistingMom = Boolean(meeting.mom && (meeting.mom.summary || meeting.mom.actionItems));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #ffffff, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: mode === 'view' ? '#eff6ff' : '#dcfce7',
                color: mode === 'view' ? '#0284c7' : '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem'
              }}
            >
              <i className={mode === 'view' ? 'bx bx-file' : 'bx bx-edit'}></i>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: '#0f172a' }}>
                  {mode === 'complete' && 'Mark as Done: Minutes of Meeting (MOM)'}
                  {mode === 'view' && 'Minutes of Meeting (MOM)'}
                  {mode === 'edit' && (hasExistingMom ? 'Edit Minutes of Meeting (MOM)' : 'Add Minutes of Meeting (MOM)')}
                </h3>
                {meeting.status === 'Completed' && (
                  <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: '700' }}>
                    Completed
                  </span>
                )}
              </div>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {meeting.topic} • {meeting.clientName} {meeting.date ? `(${meeting.date})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <i className="bx bx-x" style={{ fontSize: '1.3rem' }}></i>
          </button>
        </div>

        {/* Meeting Meta Strip */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span><i className='bx bx-calendar' style={{ color: '#0284c7' }}></i> Date: <strong>{meeting.date}</strong></span>
            <span><i className='bx bx-time' style={{ color: '#0284c7' }}></i> Time: <strong>{meeting.startTime} - {meeting.endTime}</strong></span>
            <span><i className='bx bx-git-branch' style={{ color: '#0284c7' }}></i> Division: <strong>{meeting.divisionName || 'Default'}</strong></span>
          </div>
          {existingMom.savedAt && (
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Last saved: {new Date(existingMom.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(existingMom.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by <strong>{existingMom.savedBy || 'CS SPOC'}</strong>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="bx bx-error-circle" style={{ fontSize: '1.1rem' }}></i>
              <span>{error}</span>
            </div>
          )}

          {/* VIEW MODE */}
          {mode === 'view' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Discussion Summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <i className='bx bx-notepad' style={{ color: '#0284c7' }}></i>
                  Key Discussion & Meeting Summary
                </div>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {existingMom.summary || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No discussion summary recorded.</span>}
                </div>
              </div>

              {/* Action Items */}
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: '#15803d', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <i className='bx bx-task' style={{ color: '#16a34a' }}></i>
                  Action Items & Follow-ups
                </div>
                <div style={{ fontSize: '0.88rem', color: '#166534', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {existingMom.actionItems || <span style={{ color: '#86efac', fontStyle: 'italic' }}>No pending action items specified.</span>}
                </div>
              </div>

              {/* Key Decisions */}
              {existingMom.decisions && (
                <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: '#92400e', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    <i className='bx bx-check-shield' style={{ color: '#d97706' }}></i>
                    Key Decisions Made
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {existingMom.decisions}
                  </div>
                </div>
              )}

              {/* Metadata Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {existingMom.attendeesPresent && (
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>Attendees Present:</span>
                    <span style={{ color: '#1e293b', fontWeight: '700' }}>{existingMom.attendeesPresent}</span>
                  </div>
                )}
                {existingMom.nextFollowUpDate && (
                  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                    <span style={{ color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '0.2rem' }}>Next Follow-up Date:</span>
                    <span style={{ color: '#0284c7', fontWeight: '700' }}>{existingMom.nextFollowUpDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT / COMPLETE MODE */}
          {isEditing && (
            <form onSubmit={handleSaveWithMom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode === 'complete' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className='bx bx-info-circle' style={{ fontSize: '1.2rem', color: '#16a34a' }}></i>
                  <span>
                    You are marking this meeting as <strong>Done</strong>. Add the Minutes of Meeting (MOM) now, or click <em>"Skip for now & Complete"</em> to add it later.
                  </span>
                </div>
              )}

              {/* Field 1: Discussion Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Meeting Summary & Key Discussion Topics <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={e => {
                    setSummary(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Summarize the core topics discussed, client feedback, adoption metrics reviewed, trainer feedback..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  autoFocus
                />
              </div>

              {/* Field 2: Action Items */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Action Items & Follow-ups (with Assignee & Timeline)
                </label>
                <textarea
                  rows={3}
                  value={actionItems}
                  onChange={e => setActionItems(e.target.value)}
                  placeholder="1. Send revised trainer calendar by Friday (CS SPOC)&#10;2. Corporate SPOC to share employee SSO list by Nov 10"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Field 3: Key Decisions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Key Decisions Made (Optional)
                </label>
                <input
                  type="text"
                  value={decisions}
                  onChange={e => setDecisions(e.target.value)}
                  placeholder="e.g. Cadence cadence shifted to weekly; Approved Q4 wellness rollout"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Field 4 & 5: Attendees Present & Next Follow-up Date */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Attendees Present
                  </label>
                  <input
                    type="text"
                    value={attendeesPresent}
                    onChange={e => setAttendeesPresent(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (Client), Karan Hinduja (CS)"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Next Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={e => setNextFollowUpDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          {/* Left side actions */}
          <div>
            {mode === 'complete' && (
              <button
                type="button"
                onClick={handleSkipMom}
                title="Mark this meeting as Done without adding MOM now (you can add it later)"
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className='bx bx-fast-forward'></i>
                <span>Skip for now & Complete</span>
              </button>
            )}
            {mode === 'view' && (
              <button
                type="button"
                onClick={() => setMode('edit')}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #0284c7',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className='bx bx-edit-alt'></i>
                <span>Edit MOM</span>
              </button>
            )}
          </div>

          {/* Right side buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => {
                if (mode === 'edit' && hasExistingMom) {
                  setMode('view');
                } else {
                  onClose();
                }
              }}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleSaveWithMom}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === 'complete' ? '#15803d' : '#0284c7',
                  color: 'white',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: mode === 'complete'
                    ? '0 3px 10px rgba(21, 128, 61, 0.25)'
                    : '0 3px 10px rgba(2, 132, 199, 0.25)'
                }}
              >
                <i className='bx bx-save'></i>
                <span>{mode === 'complete' ? 'Save MOM & Mark Done' : 'Save MOM'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
