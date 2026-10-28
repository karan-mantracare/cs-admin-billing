import React, { useState, useEffect, useMemo } from 'react';
import { getDivisionOnboardingDetails, getAuthenticatedSchedulingUser } from '../utils/cadenceDivisionUtils';
import { createActivityLog, updateActivityLog } from '../utils/cadenceActivityLogs';

export default function AcceptanceReminderModal({
  isOpen,
  onClose,
  cadence,
  meeting,
  onReminderSent,
  mode = 'acceptance'
}) {
  if (!isOpen || !cadence) return null;

  const schedulingUser = useMemo(() => getAuthenticatedSchedulingUser(), []);
  
  // Resolve Primary CS strictly from division onboarding/roles record (NOT inferred from organizer)
  const divisionDetails = useMemo(() => {
    return getDivisionOnboardingDetails({
      id: cadence.divisionId || '1',
      divisionId: cadence.divisionId || '1',
      divisionName: cadence.divisionName,
      corporateName: cadence.clientName
    });
  }, [cadence]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const primaryCS = useMemo(() => {
    return divisionDetails?.primaryCS || {
      name: cadence.csName || 'Karan Hinduja',
      email: cadence.csEmail || 'cs-lead@mantracare.com'
    };
  }, [divisionDetails, cadence]);

  const [attendees, setAttendees] = useState(cadence.attendees || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // Fetch latest attendee responses before sending reminders
  const refreshAttendeeResponses = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/cadence/refresh-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: cadence.seriesId || cadence.id,
          cadenceId: cadence.id,
          attendees: cadence.attendees || []
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.attendees)) {
        setAttendees(data.attendees);
        setLastRefreshedAt(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Error refreshing attendee responses:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAttendeeResponses();
  }, [cadence.id]);

  // Identify eligible SPOC recipients:
  // - For acceptance reminder: only include selected SPOCs whose current responseStatus is needsAction
  // - For meeting reminder: include all external corporate participants
  // - Always exclude the organizer and internal CS attendees (e.g. @mantracare.com, cs-lead)
  const eligibleRecipients = useMemo(() => {
    return (attendees || []).filter(att => {
      const email = (att.email || '').toLowerCase().trim();
      const isInternalCS = email.includes('mantracare.com') || email.includes('cs-lead') || (att.roles && att.roles.includes('Scheduling CS'));
      if (isInternalCS) return false;
      if (mode === 'reminder') return true;
      const isAwaitingResponse = !att.responseStatus || att.responseStatus === 'needsAction';
      return isAwaitingResponse;
    });
  }, [attendees, mode]);

  // Meeting schedule & link details
  const targetMeeting = meeting || (cadence.meetings && cadence.meetings[0]) || {};
  const joiningLink = targetMeeting.meetLink || cadence.joiningLink || cadence.meetLink || '';
  const scheduleText = cadence.rrule 
    ? `${cadence.frequency} at ${cadence.startTime || '11:00'} (${cadence.timeZone || 'Asia/Kolkata'})`
    : `${cadence.startDate} at ${cadence.startTime} (${cadence.timeZone || 'Asia/Kolkata'})`;

  // Email Subject Template
  const defaultSubject = useMemo(() => {
    if (mode === 'reminder') {
      return `Reminder: Upcoming Cadence Meeting - ${cadence.topic || 'Review Sync'}`;
    }
    return 'Please accept your recurring MantraCare meeting invitation';
  }, [mode, cadence.topic]);

  const [subject, setSubject] = useState(defaultSubject);

  useEffect(() => {
    setSubject(defaultSubject);
  }, [defaultSubject]);

  // Email Body Template
  const defaultBody = useMemo(() => {
    const spocNames = eligibleRecipients.map(r => r.displayName || r.name || 'Team').join(', ') || 'Team';
    const primaryCsName = primaryCS.name;
    const primaryCsEmail = primaryCS.email;
    const meetingTitle = cadence.topic || 'MantraCare Cadence Sync';
    const linkDisplay = joiningLink ? joiningLink : 'Meeting link pending';
    const meetingScheduleDisplay = targetMeeting.date 
      ? `${targetMeeting.date} at ${targetMeeting.startTime || cadence.startTime} (${cadence.timeZone || 'Asia/Kolkata'})`
      : scheduleText;

    if (mode === 'reminder') {
      return `Hi ${spocNames},

This is a friendly reminder of your upcoming cadence meeting with your Account Manager, ${primaryCsName}.

Meeting: ${meetingTitle}
Date & Time: ${meetingScheduleDisplay}
Join meeting: ${linkDisplay}

Please join on time. If you have any agenda topics to discuss, please feel free to reply directly to this email.

For any questions or changes, please contact ${primaryCsName} at ${primaryCsEmail}.

Regards,
MantraCare Team`;
    }

    return `Hi ${spocNames},

We have scheduled a recurring cadence meeting with your Account Manager, ${primaryCsName}.

Please accept the invitation in your calendar to confirm your availability.

Meeting: ${meetingTitle}
Schedule: ${scheduleText}
Join meeting: ${linkDisplay}

For any questions or changes to the schedule, please contact ${primaryCsName} at ${primaryCsEmail}.

Regards,
MantraCare Team`;
  }, [eligibleRecipients, primaryCS, cadence, scheduleText, joiningLink, targetMeeting, mode]);

  const [body, setBody] = useState('');

  useEffect(() => {
    setBody(defaultBody);
  }, [defaultBody]);

  // Handle Send Reminder
  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (eligibleRecipients.length === 0 || isSending) return;

    setIsSending(true);
    setSendError(null);

    // Initial log entry marked 'Pending'
    const logEntry = createActivityLog({
      actionType: mode === 'reminder' ? 'Meeting Reminder' : 'Acceptance Reminder',
      status: 'Pending',
      requestedBy: schedulingUser,
      divisionId: cadence.divisionId || '1',
      divisionName: cadence.divisionName || 'testt',
      corporateName: cadence.clientName || '',
      cadenceId: cadence.id,
      meetingId: targetMeeting.id || null,
      meetingTitle: cadence.topic || 'Cadence Meeting',
      calendarEventId: cadence.seriesId || cadence.id,
      recipients: eligibleRecipients.map(r => ({ name: r.displayName || r.name || 'SPOC', email: r.email }))
    });

    try {
      const response = await fetch('/api/cadence/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderType: mode,
          action: mode === 'reminder' ? 'meeting_reminder' : 'acceptance_reminder',
          cadenceId: cadence.id,
          meetingId: targetMeeting.id,
          divisionId: cadence.divisionId || '1',
          divisionName: cadence.divisionName,
          meetingTitle: cadence.topic,
          primaryCS,
          recipients: eligibleRecipients,
          subject,
          body,
          joiningLink,
          requestedBy: schedulingUser
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch acceptance reminder.');
      }

      // Update Activity Log to Success
      const executionId = data.executionId || String(Math.floor(10000 + Math.random() * 90000));
      if (logEntry?.id) {
        updateActivityLog(logEntry.id, {
          status: 'Success',
          executionId
        });
      }

      const nowIso = new Date().toISOString();
      if (onReminderSent) {
        onReminderSent({
          cadenceId: cadence.id,
          meetingId: targetMeeting.id,
          lastReminderSentAt: nowIso,
          sentCount: eligibleRecipients.length
        });
      }

      setIsSending(false);
      onClose();
    } catch (err) {
      if (logEntry?.id) {
        updateActivityLog(logEntry.id, {
          status: 'Failed',
          errorMessage: err.message
        });
      }
      setSendError(err.message);
      setIsSending(false);
    }
  };

  const hasNoAwaiting = eligibleRecipients.length === 0;

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
          maxWidth: '680px',
          maxHeight: '90vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: mode === 'reminder' ? '#e0f2fe' : '#fef3c7',
                color: mode === 'reminder' ? '#0284c7' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}
            >
              <i className={mode === 'reminder' ? 'bx bx-bell' : 'bx bx-mail-send'}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: '#0f172a' }}>
                {mode === 'reminder' ? 'Send Meeting Reminder' : 'Send Acceptance Reminder'}
              </h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {mode === 'reminder'
                  ? 'Send an upcoming meeting reminder with schedule and joining details to participants'
                  : 'Prompt SPOCs awaiting confirmation to accept the Google Calendar invitation'}
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

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {sendError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="bx bx-error-circle" style={{ fontSize: '1.2rem' }}></i>
              <span>{sendError}</span>
            </div>
          )}

          {/* Primary CS Info Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                Division Primary CS (Account Manager):
              </span>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginTop: '0.15rem' }}>
                {primaryCS.name}{' '}
                <span style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: '600' }}>
                  ({primaryCS.email})
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Resolved from division record
            </div>
          </div>

          {/* Recipient SPOCs section with live refresh */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                {mode === 'reminder' ? `Meeting Recipients (${eligibleRecipients.length})` : 'Eligible SPOC Recipients (Awaiting Response)'}
              </label>
              <button
                type="button"
                onClick={refreshAttendeeResponses}
                disabled={isRefreshing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <i className={`bx bx-refresh ${isRefreshing ? 'bx-spin' : ''}`}></i>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status from Calendar'}</span>
                {lastRefreshedAt && <span style={{ color: '#94a3b8' }}>({lastRefreshedAt})</span>}
              </button>
            </div>

            {hasNoAwaiting ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}
              >
                <i className="bx bx-check-circle" style={{ color: '#16a34a', fontSize: '1.3rem' }}></i>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#15803d' }}>
                    {mode === 'reminder' ? 'No external participants found' : 'No SPOCs awaiting response'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#166534', marginTop: '0.15rem' }}>
                    {mode === 'reminder'
                      ? 'No corporate client participants were found to receive the reminder.'
                      : 'All corporate SPOC attendees have already accepted or responded to the invitation. Action is disabled to prevent unnecessary notifications.'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {eligibleRecipients.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    <span style={{ fontWeight: '700', color: '#92400e' }}>
                      {rec.displayName || rec.name || 'SPOC'}
                    </span>
                    <span style={{ color: '#b45309', fontSize: '0.74rem' }}>
                      ({rec.email})
                    </span>
                    <span
                      style={{
                        background: '#fde68a',
                        color: '#78350f',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: '700'
                      }}
                    >
                      Awaiting response
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last reminder sent timestamp info */}
          {cadence.lastReminderSentAt && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className="bx bx-history"></i>
              <span>Last reminder sent on: <strong>{new Date(cadence.lastReminderSentAt).toLocaleString()}</strong></span>
            </div>
          )}

          {/* Editable Subject */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={hasNoAwaiting}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Editable Body Preview */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
              Email Body Preview (Editable)
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={e => setBody(e.target.value)}
              disabled={hasNoAwaiting}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            background: '#ffffff'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendReminder}
            disabled={hasNoAwaiting || isSending}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              background: hasNoAwaiting || isSending ? '#94a3b8' : (mode === 'reminder' ? '#0284c7' : '#d97706'),
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: hasNoAwaiting || isSending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: hasNoAwaiting || isSending ? 'none' : (mode === 'reminder' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 4px 12px rgba(217, 119, 6, 0.25)')
            }}
          >
            {isSending ? (
              <>
                <i className="bx bx-loader-alt bx-spin"></i>
                <span>{mode === 'reminder' ? 'Sending Meeting Reminder...' : 'Sending Acceptance Reminder...'}</span>
              </>
            ) : (
              <>
                <i className={mode === 'reminder' ? 'bx bx-bell' : 'bx bx-send'}></i>
                <span>{mode === 'reminder' ? 'Send Reminder Email' : 'Send Acceptance Email'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
