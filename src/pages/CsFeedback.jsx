import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RATING_OPTIONS = [
  'Very satisfied',
  'Satisfied',
  'Neutral',
  'Dissatisfied',
  'Very dissatisfied'
];

const QUESTIONS = [
  {
    id: 'appSatisfaction',
    title: 'How satisfied are you with the MantraCare app? *',
    shortLabel: 'MantraCare App Satisfaction'
  },
  {
    id: 'csResponsiveness',
    title: 'Responsiveness and communication of the Customer Success Team: *',
    shortLabel: 'CS Responsiveness & Communication'
  },
  {
    id: 'csKnowledge',
    title: 'Knowledge and helpfulness of the Customer Success Team in addressing your queries and concerns: *',
    shortLabel: 'CS Knowledge & Helpfulness'
  },
  {
    id: 'csTimeliness',
    title: 'Timeliness of the resolution of your queries or concerns: *',
    shortLabel: 'Timeliness of Resolution'
  }
];

export default function CsFeedback() {
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2, 3, 4 (completion)
  const [answers, setAnswers] = useState({
    appSatisfaction: '',
    csResponsiveness: '',
    csKnowledge: '',
    csTimeliness: '',
    additionalComments: ''
  });
  const [validationError, setValidationError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const activeQuestion = QUESTIONS[currentStep];

  const handleSelectOption = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: option
    }));
    setValidationError('');
  };

  const handleNext = () => {
    const currentAnswer = answers[activeQuestion.id];
    if (!currentAnswer) {
      setValidationError('Please select an option to proceed.');
      return;
    }
    setValidationError('');

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final question answered - complete submission
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setValidationError('');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const newSubmission = {
      id: 'FB-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      answers: { ...answers }
    };

    try {
      const existing = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify([newSubmission, ...existing]));
    } catch {
      // LocalStorage access fallback
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({
      appSatisfaction: '',
      csResponsiveness: '',
      csKnowledge: '',
      csTimeliness: '',
      additionalComments: ''
    });
    setCurrentStep(0);
    setSubmitted(false);
    setValidationError('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#f8fafc', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/cs/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Customer Success</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Feedback</span>
        </div>

        {/* Page Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Feedback
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/cs/home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="bx bx-arrow-back"></i>
              <span>CS Portal</span>
            </Link>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: showHistory ? '#e0f2fe' : '#ffffff',
                color: showHistory ? '#0284c7' : '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="bx bx-history"></i>
              <span>{showHistory ? 'Hide Submissions' : 'Recent Submissions'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Survey Card */}
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto 3rem auto',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem 2.25rem',
            position: 'relative'
          }}
        >
          {!submitted ? (
            <div>
              {/* Question header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#034ea2' }}>
                  Question {currentStep + 1} of {QUESTIONS.length}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {QUESTIONS.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '24px',
                        height: '4px',
                        borderRadius: '2px',
                        background: idx === currentStep ? '#034ea2' : idx < currentStep ? '#93c5fd' : '#e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Question title */}
              <label
                style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '1.25rem',
                  lineHeight: '1.5'
                }}
              >
                {activeQuestion.title.split('*')[0]}
                <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {/* Radio options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {RATING_OPTIONS.map((option) => {
                  const isSelected = answers[activeQuestion.id] === option;
                  return (
                    <label
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'background-color 0.15s ease',
                        backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                        border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name={activeQuestion.id}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleSelectOption(option)}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#034ea2',
                          cursor: 'pointer',
                          margin: 0
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.95rem',
                          color: isSelected ? '#034ea2' : '#334155',
                          fontWeight: isSelected ? '600' : '400'
                        }}
                      >
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Validation error */}
              {validationError && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <i className="bx bx-error-circle"></i>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '6px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    background: '#034ea2',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(3, 78, 162, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#023c7d')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#034ea2')}
                >
                  {currentStep === QUESTIONS.length - 1 ? 'Next' : 'Next'}
                </button>
              </div>
            </div>
          ) : (
            /* Submission Confirmation */
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <i className="bx bx-check-circle"></i>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                Thank You for Your Feedback!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.75rem auto' }}>
                Your insights help MantraCare continuously elevate client experience, support responsiveness, and care delivery quality.
              </p>

              {/* Response Summary */}
              <div
                style={{
                  textAlign: 'left',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  maxWidth: '560px',
                  margin: '0 auto 1.75rem auto'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem' }}>
                  Recorded Ratings:
                </div>
                {QUESTIONS.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.4rem 0',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: '#334155', fontWeight: '500' }}>{q.shortLabel}</span>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backgroundColor:
                          answers[q.id]?.includes('Very satisfied')
                            ? '#dcfce7'
                            : answers[q.id]?.includes('Satisfied')
                            ? '#e0f2fe'
                            : answers[q.id]?.includes('Neutral')
                            ? '#fef3c7'
                            : '#fee2e2',
                        color:
                          answers[q.id]?.includes('Very satisfied')
                            ? '#166534'
                            : answers[q.id]?.includes('Satisfied')
                            ? '#0369a1'
                            : answers[q.id]?.includes('Neutral')
                            ? '#92400e'
                            : '#991b1b'
                      }}
                    >
                      {answers[q.id]}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Submit Another Response
                </button>
                <Link
                  to="/cs/home"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    background: '#034ea2',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  <span>Return to CS Portal</span>
                  <i className="bx bx-right-arrow-alt"></i>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Submissions drawer if toggled */}
        {showHistory && (
          <div
            style={{
              maxWidth: '880px',
              margin: '0 auto 2.5rem auto',
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                Logged Feedback Submissions
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Stored locally in browser</span>
            </div>
            {(() => {
              const list = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
              if (list.length === 0) {
                return <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No submissions logged yet.</p>;
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {list.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <strong style={{ color: '#034ea2' }}>{item.id}</strong>
                        <span style={{ color: '#94a3b8' }}>{item.formattedDate}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {Object.entries(item.answers).map(([key, val]) => (
                          <span
                            key={key}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              color: '#334155'
                            }}
                          >
                            <strong>{key.replace('cs', 'CS ')}:</strong> {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Customer Escalation & Resolution Matrix Table */}
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Customer Service Escalation Matrix
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Standard operational escalation workflow, resolution SLAs, and intervention triggers across support tiers.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
              8-Tier Matrix • Internal Protocol
            </span>
          </div>

          <div
            style={{
              overflowX: 'auto',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #94a3b8'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1020px',
                fontSize: '0.85rem',
                color: '#1e293b'
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #94a3b8' }}>
                  <th
                    style={{
                      width: '180px',
                      padding: '0.85rem 1rem',
                      borderRight: '1px solid #94a3b8',
                      background: '#f8fafc'
                    }}
                  ></th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRight: '1px solid #94a3b8',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Call Center<br />Representative
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRight: '1px solid #94a3b8',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Call Center<br />Support Manager
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRight: '1px solid #94a3b8',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Account<br />Manager
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRight: '1px solid #94a3b8',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Sales Manager
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRight: '1px solid #94a3b8',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Director of Sales &<br />Operations
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      borderRight: '1px solid #94a3b8',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Stake Holder
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 0.75rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      color: '#0f172a',
                      lineHeight: '1.3'
                    }}
                  >
                    Senior<br />Management
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* ROW 1: Timeline */}
                <tr style={{ borderBottom: '1px solid #94a3b8' }}>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      background: '#f8fafc',
                      borderRight: '1px solid #94a3b8',
                      color: '#334155'
                    }}
                  >
                    Timeline
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #94a3b8', textAlign: 'left', color: '#1e293b' }}>
                    15mins – 30mins
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #94a3b8', textAlign: 'left', color: '#1e293b' }}>
                    30mins – 1hr
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #94a3b8', textAlign: 'left', color: '#1e293b' }}>
                    1hr – 2hr
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #94a3b8', textAlign: 'left', color: '#1e293b' }}>
                    2hr – 5hr
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #94a3b8', textAlign: 'left', color: '#1e293b' }}>
                    1-2 business days
                  </td>
                  <td style={{ padding: '0.75rem', borderRight: '1px solid #94a3b8', textAlign: 'left', color: '#1e293b' }}>
                    1-3 business days
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'left', color: '#1e293b' }}>
                    Resolution
                  </td>
                </tr>

                {/* ROW 2: Complaint about product quality or past customer service */}
                <tr style={{ borderBottom: '1px solid #94a3b8', verticalAlign: 'top' }}>
                  <td
                    style={{
                      padding: '0.85rem 1rem',
                      fontWeight: '600',
                      background: '#f8fafc',
                      borderRight: '1px solid #94a3b8',
                      color: '#334155',
                      lineHeight: '1.4'
                    }}
                  >
                    Complaint about product quality or past customer service
                  </td>

                  {/* Call Center Representative */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Customer states their problem</div>
                  </td>

                  {/* Call Center Support Manager */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Attempted solution</div>
                    <div style={{ marginTop: '0.35rem' }}>– Collect Contact Details</div>
                    <div style={{ marginTop: '0.35rem' }}>– Follow-up after internal review</div>
                  </td>

                  {/* Account Manager */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Review Account Details</div>
                    <div style={{ marginTop: '0.35rem' }}>– Communicate new information</div>
                    <div style={{ marginTop: '0.35rem' }}>– Outline resolution plan</div>
                    <div style={{ marginTop: '0.35rem' }}>– Attempt Solution</div>
                    <div style={{ marginTop: '0.35rem' }}>– Create incident report</div>
                  </td>

                  {/* Sales Manager */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Further investigate issue</div>
                    <div style={{ marginTop: '0.35rem' }}>– Offers financial incentive</div>
                    <div style={{ marginTop: '0.35rem' }}>– Documentation of conversation and problems</div>
                  </td>

                  {/* Director of Sales & Operations */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Apologize</div>
                    <div style={{ marginTop: '0.35rem' }}>– Ask for feedback</div>
                  </td>

                  {/* Stake Holder */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Review prior attempts</div>
                    <div style={{ marginTop: '0.35rem' }}>– Offers refund or cancellation</div>
                    <div style={{ marginTop: '0.35rem' }}>– Speak to representatives</div>
                    <div style={{ marginTop: '0.35rem' }}>– Plan to improve process</div>
                  </td>

                  {/* Senior Management */}
                  <td style={{ padding: '0.85rem 0.75rem', lineHeight: '1.45' }}>
                    <div>– Review incident report</div>
                    <div style={{ marginTop: '0.35rem' }}>– Sign off on plans</div>
                    <div style={{ marginTop: '0.35rem' }}>– Redefine objectives</div>
                    <div style={{ marginTop: '0.35rem' }}>– Hire experts to evaluate new process</div>
                  </td>
                </tr>

                {/* ROW 3: Triggers */}
                <tr style={{ verticalAlign: 'top' }}>
                  <td
                    style={{
                      padding: '0.85rem 1rem',
                      fontWeight: '600',
                      background: '#f8fafc',
                      borderRight: '1px solid #94a3b8',
                      color: '#334155'
                    }}
                  >
                    Triggers
                  </td>

                  {/* Call Center Representative */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Representatives unable to solve problem</div>
                    <div style={{ marginTop: '0.35rem' }}>– Representatives asks to speak to manager</div>
                  </td>

                  {/* Call Center Support Manager */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Unsuccessful Solution</div>
                    <div style={{ marginTop: '0.35rem' }}>– Requires a specific department or skill</div>
                  </td>

                  {/* Account Manager */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Account closure threatened</div>
                    <div style={{ marginTop: '0.35rem' }}>– Potential switch to competitor</div>
                    <div style={{ marginTop: '0.35rem' }}>– Bad review</div>
                    <div style={{ marginTop: '0.35rem' }}>– Issue remains unsolved</div>
                  </td>

                  {/* Sales Manager */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Issue unsolved</div>
                    <div style={{ marginTop: '0.35rem' }}>– Customer's privacy/data threatened</div>
                    <div style={{ marginTop: '0.35rem' }}>– Customer lodges formal complaint</div>
                    <div style={{ marginTop: '0.35rem' }}>– Customer asks to speak to director</div>
                  </td>

                  {/* Director of Sales & Operations */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Customer demands refund/cancellation</div>
                    <div style={{ marginTop: '0.35rem' }}>– No possible resolution</div>
                    <div style={{ marginTop: '0.35rem' }}>– Customer wants to keep account</div>
                  </td>

                  {/* Stake Holder */}
                  <td style={{ padding: '0.85rem 0.75rem', borderRight: '1px solid #94a3b8', lineHeight: '1.45' }}>
                    <div>– Senior management approval needed</div>
                  </td>

                  {/* Senior Management */}
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    {/* Empty cell as shown in the reference matrix */}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
