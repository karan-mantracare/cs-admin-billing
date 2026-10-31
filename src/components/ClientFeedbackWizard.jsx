import React, { useState, useMemo } from 'react';
import {
  STANDARD_RATING_OPTIONS,
  NOT_APPLICABLE_OPTION,
  PILLAR_QUESTIONS,
  GENERAL_SUGGESTION_TAGS
} from '../data/feedbackQuestions';

// 4 clean steps: Starting directly on the questions!
// 5 steps: Starting with Page 1 HR Details, then evaluation questions & review
const STEPS = [
  { id: 0, title: 'HR Details' },
  { id: 1, title: 'Service & Tech' },
  { id: 2, title: 'Helpline & 1-on-1' },
  { id: 3, title: 'Webinars' },
  { id: 4, title: 'Suggestions & Review' }
];

export default function ClientFeedbackWizard({ onClose, onSuccess, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(1); // Starts directly on Step 1: Questions
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  // HR details pre-populated from submission tracking record
  const companyName = initialData.company || initialData.companyName || 'Corporate Partner';
  const hrName = initialData.hrName || initialData.name || 'HR Partner';
  const designation = initialData.hrRole || initialData.designation || 'HR';

  const corporateId = initialData.corporateId || initialData.id || '1';

  // Respondent details pre-populated before sharing
  const respondent = useMemo(() => ({
    name: hrName.trim(),
    email: initialData.hrEmail || initialData.email || '',
    designation: designation.trim(),
    division: initialData.division || 'All Divisions / Corporate HQ',
    csSpocName: initialData.csSpocName || 'Karan Hinduja'
  }), [hrName, designation, initialData]);

  const [wantsFollowUp, setWantsFollowUp] = useState(false);

  // Ratings for all 10 dimensions
  const [ratings, setRatings] = useState({
    bdCommitment: '',
    csSupport: '',
    techSupport: '',
    hotlineCallQuality: '',
    hotlineCallSupport: '',
    hotlineOpsResponse: '',
    oneOnOneSessions: '',
    webinarTopic: '',
    webinarContent: '',
    webinarExpert: ''
  });

  // Remarks / low rating notes
  const [lowResponseRemarks, setLowResponseRemarks] = useState({});
  const [suggestions, setSuggestions] = useState('');

  // Step validation: Every question on current step must have an input selected
  const currentStepQuestions = useMemo(() => {
    if (currentStep === 1) return PILLAR_QUESTIONS.slice(0, 3);
    if (currentStep === 2) return PILLAR_QUESTIONS.slice(3, 7);
    if (currentStep === 3) return PILLAR_QUESTIONS.slice(7, 10);
    return [];
  }, [currentStep]);

  const answeredCount = useMemo(() => {
    return currentStepQuestions.filter((q) => Boolean(ratings[q.id])).length;
  }, [currentStepQuestions, ratings]);

  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 4) return true;
    return currentStepQuestions.length > 0 && currentStepQuestions.every((q) => Boolean(ratings[q.id]));
  }, [currentStep, currentStepQuestions, ratings]);

  const handleNext = () => {
    if (!isCurrentStepValid) return;
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRatingSelect = (questionId, value) => {
    setRatings((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleToggleLowTag = (questionId, tag) => {
    setLowResponseRemarks((prev) => {
      const current = prev[questionId] || '';
      const tags = current
        .split(';')
        .map((t) => t.trim())
        .filter(Boolean);
      let updated;
      if (tags.includes(tag)) {
        updated = tags.filter((t) => t !== tag).join('; ');
      } else {
        updated = tags.length ? `${current}; ${tag}` : tag;
      }
      return {
        ...prev,
        [questionId]: updated
      };
    });
  };

  const handleRemarkChange = (questionId, text) => {
    setLowResponseRemarks((prev) => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleAddGeneralSuggestion = (tag) => {
    setSuggestions((prev) => {
      const trimmed = (prev || '').trim();
      return trimmed ? `${trimmed}\n• ${tag}` : `• ${tag}`;
    });
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const targetSubId = initialData.submissionId || initialData.formId || initialData.id || `FB-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    let savedEntry = null;

    try {
      const existing = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
      const matchIndex = Array.isArray(existing) ? existing.findIndex((x) => x.id === targetSubId) : -1;

      const recordToSave = {
        id: targetSubId,
        timestamp: now.toISOString(),
        formattedDate,
        createdBy: (matchIndex >= 0 ? existing[matchIndex].createdBy : null) || initialData?.createdBy || 'CS Team',
        status: 'Submitted',
        clientDetails: {
          name: hrName.trim() || respondent.name,
          company: companyName.trim(),
          corporateId: corporateId,
          designation: designation.trim() || 'HR',
          hrRole: designation.trim() || 'HR',
          csSpocName: respondent.csSpocName || 'Karan Hinduja',
          selectedDivision: respondent.division || 'Healthcare',
          suggestions: suggestions.trim(),
          wantsFollowUp: Boolean(wantsFollowUp)
        },
        ratings: { ...ratings },
        lowResponseRemarks: { ...lowResponseRemarks }
      };

      savedEntry = recordToSave;

      let updatedList;
      if (matchIndex >= 0) {
        updatedList = [...existing];
        updatedList[matchIndex] = recordToSave;
      } else {
        updatedList = [recordToSave, ...(Array.isArray(existing) ? existing : [])];
      }

      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cs-feedback-updated', { detail: recordToSave }));
    } catch (err) {
      console.error('Failed to save feedback submission:', err);
    }

    setSubmissionId(targetSubId);
    setIsSubmitted(true);
    if (onSuccess) {
      onSuccess(savedEntry);
    }
  };

  // Render question card: DIRECTLY THE QUESTION, NO CATEGORY BADGES, NO SHORT LABELS
  const renderQuestion = (q, index) => {
    const currentValue = ratings[q.id];
    const isLowRating =
      currentValue === 'Dissatisfied' ||
      currentValue === 'Very dissatisfied' ||
      currentValue === 'Neutral';

    return (
      <div
        key={q.id}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: currentValue ? '1.5px solid #cbd5e1' : '1px solid #e2e8f0',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          boxShadow: currentValue ? '0 2px 6px rgba(0,0,0,0.04)' : '0 1px 3px rgba(0,0,0,0.02)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        {/* Directly the full question without category tags or short titles */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '0.94rem',
              fontWeight: '600',
              color: '#0f172a',
              lineHeight: '1.55',
              flex: 1
            }}
          >
            {index != null ? `${index}. ` : ''}{q.description}
          </h3>
          {currentValue ? (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#166534',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <i className="bx bx-check"></i> Answered
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#b91c1c',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              * Required
            </span>
          )}
        </div>

        {/* Rating Options */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.5rem' }}>
            {STANDARD_RATING_OPTIONS.map((opt) => {
              const isSelected = currentValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRatingSelect(q.id, opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? `2px solid ${opt.color}` : '1px solid #cbd5e1',
                    background: isSelected ? opt.bg : '#ffffff',
                    color: isSelected ? opt.color : '#334155',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? '700' : '500',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <i className={`bx ${opt.icon}`} style={{ fontSize: '1.1rem', color: opt.color }}></i>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Not Applicable option if allowed */}
          {q.allowNotApplicable && (
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleRatingSelect(q.id, NOT_APPLICABLE_OPTION.value)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: currentValue === NOT_APPLICABLE_OPTION.value ? '2px solid #64748b' : '1px dashed #cbd5e1',
                  background: currentValue === NOT_APPLICABLE_OPTION.value ? '#e2e8f0' : '#f8fafc',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className={`bx ${NOT_APPLICABLE_OPTION.icon}`}></i>
                <span>{NOT_APPLICABLE_OPTION.label}</span>
              </button>
            </div>
          )}
        </div>

        {/* Low Rating / Neutral Remarks Box */}
        {isLowRating && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.85rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}
          >
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: '700',
                color: '#991b1b',
                marginBottom: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <i className="bx bx-info-circle"></i>
              <span>Help us understand what went wrong:</span>
            </div>

            {q.lowRatingTags && q.lowRatingTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {q.lowRatingTags.map((tag) => {
                  const isTagSelected = (lowResponseRemarks[q.id] || '').includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleLowTag(q.id, tag)}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        border: isTagSelected ? '1px solid #ef4444' : '1px solid #cbd5e1',
                        background: isTagSelected ? '#fee2e2' : '#ffffff',
                        color: isTagSelected ? '#991b1b' : '#475569',
                        cursor: 'pointer',
                        fontWeight: isTagSelected ? '700' : '500'
                      }}
                    >
                      {isTagSelected ? '✓ ' : '+ '} {tag}
                    </button>
                  );
                })}
              </div>
            )}

            <input
              type="text"
              placeholder="Additional feedback or context on this item (optional)..."
              value={lowResponseRemarks[q.id] || ''}
              onChange={(e) => handleRemarkChange(q.id, e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem',
                fontSize: '0.78rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // Step 1: Questions 1, 2, 3 (Starts directly here!)
  const renderStep1 = () => {
    const stepQuestions = PILLAR_QUESTIONS.slice(0, 3);
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Part 1: Service Delivery & Platform Technology
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Rate your satisfaction with delivery commitments, account management, and digital app experience.
          </p>
        </div>
        {stepQuestions.map((q, idx) => renderQuestion(q, idx + 1))}
      </div>
    );
  };

  // Step 2: Questions 4, 5, 6, 7
  const renderStep2 = () => {
    const stepQuestions = PILLAR_QUESTIONS.slice(3, 7);
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Part 2: 24/7 Helpline & 1-on-1 Counseling Sessions
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Assess call pickup speed, counselor empathy, operational tickets, and individual wellness sessions.
          </p>
        </div>
        {stepQuestions.map((q, idx) => renderQuestion(q, idx + 4))}
      </div>
    );
  };

  // Step 3: Questions 8, 9, 10
  const renderStep3 = () => {
    const stepQuestions = PILLAR_QUESTIONS.slice(7, 10);
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Part 3: Workforce Webinars & Interactive Training
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Rate the topics, content depth, and trainer engagement during live wellness webinars.
          </p>
        </div>
        {stepQuestions.map((q, idx) => renderQuestion(q, idx + 8))}
      </div>
    );
  };

  // Step 4: Suggestions & Follow-up Call
  const renderStep4 = () => (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
          Part 4: Suggestions & Next Steps
        </h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
          Share any thoughts, requests, or areas where MantraCare can deliver greater value to your team.
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.5rem'
          }}
        >
          Quick suggestions (click to insert):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {GENERAL_SUGGESTION_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddGeneralSuggestion(tag)}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
          Additional Comments / Recommendations:
        </label>
        <textarea
          rows="6"
          placeholder="Share your detailed feedback, highlights, or requests for improvement..."
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '10px',
            border: '1.5px solid #cbd5e1',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            outline: 'none',
            color: '#0f172a',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Review Call Option */}
      <div
        style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}
          >
            <i className="bx bx-phone-call"></i>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1' }}>
              Would you like our CS Lead to schedule a 1-on-1 review call?
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              A dedicated 15-minute briefing to review your feedback and roadmap next actions.
            </div>
          </div>
        </div>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#0f172a',
            gap: '0.45rem'
          }}
        >
          <input
            type="checkbox"
            checked={wantsFollowUp}
            onChange={(e) => setWantsFollowUp(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
          />
          <span>Yes, request call</span>
        </label>
      </div>
    </div>
  );

  const progressPercentage = useMemo(() => {
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  }, [currentStep]);

  // Success view
  if (isSubmitted) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '750px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '3rem 2rem'
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#dcfce7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
            marginBottom: '1.5rem'
          }}
        >
          <i className="bx bx-check" style={{ fontSize: '3rem' }}></i>
        </div>

        <h1 style={{ margin: '0 0 0.75rem 0', fontSize: '24px', color: '#0f172a', fontWeight: '700' }}>
          Thank You for Your Feedback!
        </h1>

        <p style={{ margin: '0 0 1.5rem 0', fontSize: '14px', color: '#64748b', maxWidth: '460px', lineHeight: '1.6' }}>
          Your service evaluation for <strong style={{ color: '#0f172a' }}>{companyName}</strong> (Ref: <span style={{ color: '#0284c7', fontWeight: '600' }}>{submissionId}</span>) has been successfully recorded. Our Customer Success team will review your inputs to continue optimizing your workforce wellness programs.
        </p>

        {wantsFollowUp && (
          <div
            style={{
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              color: '#0369a1',
              fontSize: '0.82rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className="bx bx-calendar-check" style={{ fontSize: '1.1rem' }}></i>
            <span>Your request for a review call has been assigned to <strong>{respondent.csSpocName}</strong>.</span>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 2rem',
            background: '#0f172a',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)'
          }}
        >
          Close Window
        </button>

        <style
          dangerouslySetInnerHTML={{
            __html: `
            .animate-fade-in {
              animation: fadeIn 0.4s ease-out forwards;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '840px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        maxHeight: '90vh'
      }}
    >
      {/* Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '1.25rem',
              background: '#f1f5f9',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <i className="bx bx-x" style={{ fontSize: '1.25rem' }}></i>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: '#e0f2fe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}
          >
            <i className="bx bx-heart-circle" style={{ fontSize: '1.5rem' }}></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>
                MantraCare Corporate Service Feedback
              </h1>
              {hrName && (
                <span style={{ fontSize: '0.76rem', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.2rem 0.55rem', borderRadius: '6px', color: '#334155', fontWeight: '600' }}>
                  <i className="bx bx-user" style={{ color: '#0284c7', marginRight: '3px' }}></i>
                  HR: {hrName} ({designation})
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Quality Evaluation for <strong style={{ color: '#0f172a' }}>{companyName}</strong> (Company ID: {corporateId})
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: '#475569'
            }}
          >
            <span>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#0284c7',
                width: `${progressPercentage}%`,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '3px'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable Area: Questions and Review */}
      <div style={{ padding: '0 1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: currentStep === 1 ? '#94a3b8' : '#475569',
            fontWeight: '600',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem'
          }}
        >
          <i className="bx bx-left-arrow-alt"></i> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isCurrentStepValid && currentStep < 4 && (
            <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: '500', background: '#fee2e2', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
              Select an option for all questions ({answeredCount}/{currentStepQuestions.length} answered)
            </span>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              style={{
                padding: '0.65rem 1.5rem',
                background: isCurrentStepValid ? '#0f172a' : '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                color: isCurrentStepValid ? 'white' : '#64748b',
                fontWeight: '600',
                cursor: isCurrentStepValid ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                boxShadow: isCurrentStepValid ? '0 4px 6px -1px rgba(15, 23, 42, 0.2)' : 'none'
              }}
              title={!isCurrentStepValid ? 'Please select an option for each question before proceeding' : 'Proceed to next questions'}
            >
              Next <i className="bx bx-right-arrow-alt"></i>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                padding: '0.65rem 1.85rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
              }}
            >
              <i className="bx bx-check"></i> Complete & Submit Feedback
            </button>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
        }}
      />
    </div>
  );
}
