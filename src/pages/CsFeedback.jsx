import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPrimaryCS } from '../utils/roleUtils';

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
    shortLabel: 'App Overall Satisfaction',
    category: 'Product Experience'
  },
  {
    id: 'csResponsiveness',
    title: 'Responsiveness and communication of the Customer Success Team: *',
    shortLabel: 'CS Responsiveness & Communication',
    category: 'Customer Success'
  },
  {
    id: 'csKnowledge',
    title: 'Knowledge and helpfulness of the Customer Success Team in addressing your queries and concerns: *',
    shortLabel: 'CS Knowledge & Helpfulness',
    category: 'Customer Success'
  },
  {
    id: 'csTimeliness',
    title: 'Timeliness of the resolution of your queries or concerns: *',
    shortLabel: 'Resolution Timeliness',
    category: 'Customer Success'
  },
  {
    id: 'appQuality',
    title: 'Quality of the App and ease of use: *',
    shortLabel: 'App Quality & Ease of Use',
    category: 'Product Experience'
  },
  {
    id: 'sessionsQuality',
    title: 'Quality of the Sessions and Activities provided: *',
    shortLabel: 'Sessions & Activities Quality',
    category: 'Wellness & Activities'
  },
  {
    id: 'overallEngagement',
    title: 'How would you rate the overall engagement with MantraCare *',
    shortLabel: 'Overall Engagement',
    category: 'Program Value'
  },
  {
    id: 'recommendLikelihood',
    title: 'How likely are you to recommend MantraCare, App & Activities to others based on your experience with our services? *',
    shortLabel: 'Likelihood to Recommend (NPS)',
    category: 'Advocacy & NPS'
  }
];

const SUGGESTION_TAGS = [
  'More interactive wellness webinars',
  'Faster query response time',
  'App navigation & speed enhancements',
  'Expanded trainer & doctor specializations',
  'Detailed employee participation reports',
  'Customized corporate challenge activities',
  'Simplified invoice & billing schedules'
];

export default function CsFeedback() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0); // 0 to 7 = questions, 8 = details form, 9 = submitted
  
  // Answers state
  const [ratings, setRatings] = useState({
    appSatisfaction: '',
    csResponsiveness: '',
    csKnowledge: '',
    csTimeliness: '',
    appQuality: '',
    sessionsQuality: '',
    overallEngagement: '',
    recommendLikelihood: ''
  });

  // Client Details state
  const [clientDetails, setClientDetails] = useState({
    name: 'Priya Sharma',
    company: 'TechCorp Solutions',
    csSpocName: 'Karan Hinduja',
    suggestions: '',
    wantsFollowUp: false,
    selectedDivision: 'Healthcare',
    submittedAt: null
  });

  const [validationError, setValidationError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [availableDivisions, setAvailableDivisions] = useState([]);

  // Auto pre-fill HR name and Customer Success SPOC Name
  useEffect(() => {
    // 1. Resolve logged in HR User
    try {
      const storedHr = localStorage.getItem('logged_in_user') || localStorage.getItem('hr_user_profile');
      if (storedHr) {
        const parsedHr = JSON.parse(storedHr);
        if (parsedHr?.name) {
          setClientDetails((prev) => ({ ...prev, name: parsedHr.name }));
        }
      }
    } catch {}

    // 2. Discover divisions and resolve CS SPOC from Division Information
    try {
      const allClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      const divisionsList = [];
      let defaultCompany = 'TechCorp Solutions';
      let defaultDivName = 'Healthcare';

      if (Array.isArray(allClients) && allClients.length > 0) {
        defaultCompany = allClients[0].companyName || allClients[0].clientName || 'TechCorp Solutions';
        if (Array.isArray(allClients[0].divisions) && allClients[0].divisions.length > 0) {
          defaultDivName = allClients[0].divisions[0].divisionName || 'Healthcare';
          allClients[0].divisions.forEach((d) => {
            divisionsList.push({
              id: d.id,
              name: d.divisionName,
              company: defaultCompany
            });
          });
        }
      }

      setAvailableDivisions(divisionsList);

      const targetDiv = searchParams.get('division') || defaultDivName;
      const targetCompany = searchParams.get('company') || defaultCompany;
      const resolvedCS = getPrimaryCS(null, targetDiv, targetCompany, null);

      setClientDetails((prev) => ({
        ...prev,
        company: targetCompany,
        selectedDivision: targetDiv,
        csSpocName: resolvedCS || 'Karan Hinduja'
      }));
    } catch {
      // Fallback default
      const resolvedCS = getPrimaryCS(null, 'Healthcare', 'TechCorp Solutions', null);
      setClientDetails((prev) => ({
        ...prev,
        csSpocName: resolvedCS || 'Karan Hinduja'
      }));
    }
  }, [searchParams]);

  // Handle Division Switch to auto-update CS SPOC Name
  const handleDivisionChange = (divName) => {
    const resolvedCS = getPrimaryCS(null, divName, clientDetails.company, null);
    setClientDetails((prev) => ({
      ...prev,
      selectedDivision: divName,
      csSpocName: resolvedCS || prev.csSpocName
    }));
  };

  const isDetailsStep = currentStep === QUESTIONS.length;
  const activeQuestion = QUESTIONS[currentStep];

  const handleSelectOption = (option) => {
    setRatings((prev) => ({
      ...prev,
      [activeQuestion.id]: option
    }));
    setValidationError('');
  };

  const handleNext = () => {
    if (!isDetailsStep) {
      const currentAnswer = ratings[activeQuestion.id];
      if (!currentAnswer) {
        setValidationError('Please select an option to proceed.');
        return;
      }
      setValidationError('');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setValidationError('');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAddSuggestionTag = (tag) => {
    setClientDetails((prev) => {
      const current = prev.suggestions.trim();
      const updated = current ? `${current}, ${tag}` : tag;
      return { ...prev, suggestions: updated };
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!clientDetails.name.trim()) {
      setValidationError('Please provide your name.');
      return;
    }
    if (!clientDetails.company.trim()) {
      setValidationError('Please provide your company name.');
      return;
    }
    if (!clientDetails.csSpocName.trim()) {
      setValidationError('Please provide the Customer Success SPOC Name.');
      return;
    }

    setValidationError('');

    const newSubmission = {
      id: 'FB-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      clientDetails: { ...clientDetails },
      ratings: { ...ratings }
    };

    try {
      const existing = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify([newSubmission, ...existing]));
    } catch {}

    setSubmitted(true);
    setCurrentStep(QUESTIONS.length + 1);
  };

  const handleReset = () => {
    setRatings({
      appSatisfaction: '',
      csResponsiveness: '',
      csKnowledge: '',
      csTimeliness: '',
      appQuality: '',
      sessionsQuality: '',
      overallEngagement: '',
      recommendLikelihood: ''
    });
    setClientDetails((prev) => ({
      ...prev,
      suggestions: '',
      wantsFollowUp: false
    }));
    setCurrentStep(0);
    setSubmitted(false);
    setValidationError('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#f8fafc', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/cs/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Customer Success</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Feedback</span>
        </div>

        {/* Page Heading & Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              Feedback
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              MantraCare Corporate Client Experience & Customer Success Evaluation
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
              <i className="bx bx-user" style={{ color: '#0284c7' }}></i>
              <span>Logged in as: <strong style={{ color: '#0f172a' }}>{clientDetails.name}</strong></span>
            </div>

            <button
              type="button"
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
              <span>{showHistory ? 'Hide Submissions' : 'Submissions Log'}</span>
            </button>
          </div>
        </div>

        {/* Main Survey Card Container */}
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto 3rem auto',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
            padding: '2.25rem 2.5rem',
            position: 'relative'
          }}
        >
          {!submitted ? (
            <div>
              {/* Stepper Progress Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#034ea2' }}>
                    {isDetailsStep ? 'Final Step: Contact Details & Feedback' : `Question ${currentStep + 1} of ${QUESTIONS.length}`}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    {Math.round(((currentStep) / (QUESTIONS.length + 1)) * 100)}% Complete
                  </span>
                </div>

                {/* Progress bar line */}
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${((currentStep) / (QUESTIONS.length)) * 100}%`,
                      background: 'linear-gradient(90deg, #034ea2, #0284c7)',
                      borderRadius: '3px',
                      transition: 'width 0.25s ease'
                    }}
                  />
                </div>
              </div>

              {/* Step View: Questions (0 to 7) */}
              {!isDetailsStep ? (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '1.5rem',
                      lineHeight: '1.5'
                    }}
                  >
                    {activeQuestion.title.split('*')[0]}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  {/* Radio options matching exact screenshot format */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {RATING_OPTIONS.map((option) => {
                      const isSelected = ratings[activeQuestion.id] === option;
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
                            transition: 'all 0.15s ease',
                            backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                            border: isSelected ? '1px solid #bfdbfe' : '1px solid #f1f5f9'
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

                  {/* Validation Error banner */}
                  {validationError && (
                    <div
                      style={{
                        marginBottom: '1.25rem',
                        padding: '0.65rem 0.85rem',
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

                  {/* Navigation Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        style={{
                          padding: '0.75rem 1.35rem',
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
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 9 / Final Details & Suggestions Form (Screenshot 5) */
                <form onSubmit={handleSubmit}>
                  {/* Pre-fill Intelligence Notification */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.85rem',
                      color: '#0369a1'
                    }}
                  >
                    <i className="bx bx-info-circle" style={{ fontSize: '1.25rem', color: '#0284c7' }}></i>
                    <div>
                      <strong>Auto-Populated Details:</strong> Your name is prefilled from your active HR session, and the Customer Success SPOC is fetched directly from division information.
                    </div>
                  </div>

                  {/* Division Switcher if multiple divisions exist */}
                  {availableDivisions.length > 1 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>
                        Corporate Division:
                      </label>
                      <select
                        value={clientDetails.selectedDivision}
                        onChange={(e) => handleDivisionChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.9rem',
                          color: '#1e293b'
                        }}
                      >
                        {availableDivisions.map((d) => (
                          <option key={d.id || d.name} value={d.name}>
                            {d.name} ({d.company})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Name field (Prefilled as HR name) */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.92rem', fontWeight: '600', color: '#1e293b' }}>
                        Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#0284c7', background: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                        Prefilled from HR Login
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={clientDetails.name}
                      onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        color: '#1e293b',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#034ea2')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                  </div>

                  {/* Company field */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.92rem', fontWeight: '600', color: '#1e293b' }}>
                        Company <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#059669', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                        Client Account
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={clientDetails.company}
                      onChange={(e) => setClientDetails({ ...clientDetails, company: e.target.value })}
                      placeholder="Enter client company name"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        color: '#1e293b',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#034ea2')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                  </div>

                  {/* Customer Success SPOC Name field */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.92rem', fontWeight: '600', color: '#1e293b' }}>
                        Customer Success SPOC Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#034ea2', background: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                        Prefilled from Division CS
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={clientDetails.csSpocName}
                      onChange={(e) => setClientDetails({ ...clientDetails, csSpocName: e.target.value })}
                      placeholder="Enter Customer Success SPOC Name"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        color: '#1e293b',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#034ea2')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                  </div>

                  {/* Suggestions / Feedback Textarea */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.4rem' }}>
                      Do you have any suggestions or feedback for us to improve our services?
                    </label>

                    {/* Quick Suggestions Chips to capture maximum information */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>Quick insert:</span>
                      {SUGGESTION_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddSuggestionTag(tag)}
                          style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0f2fe';
                            e.currentTarget.style.borderColor = '#93c5fd';
                            e.currentTarget.style.color = '#0284c7';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#334155';
                          }}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={4}
                      value={clientDetails.suggestions}
                      onChange={(e) => setClientDetails({ ...clientDetails, suggestions: e.target.value })}
                      placeholder="Share your thoughts on session topics, app experience, trainer interactions, or any other areas where we can improve..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.92rem',
                        color: '#1e293b',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#034ea2')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                  </div>

                  {/* Follow-up Checkbox */}
                  <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input
                      type="checkbox"
                      id="followUpCheck"
                      checked={clientDetails.wantsFollowUp}
                      onChange={(e) => setClientDetails({ ...clientDetails, wantsFollowUp: e.target.checked })}
                      style={{ width: '17px', height: '17px', accentColor: '#034ea2', cursor: 'pointer' }}
                    />
                    <label htmlFor="followUpCheck" style={{ fontSize: '0.88rem', color: '#475569', cursor: 'pointer' }}>
                      Request Customer Success SPOC ({clientDetails.csSpocName}) to schedule a brief follow-up call regarding this feedback.
                    </label>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div
                      style={{
                        marginBottom: '1.25rem',
                        padding: '0.65rem 0.85rem',
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

                  {/* Navigation and Submit Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handlePrevious}
                      style={{
                        padding: '0.8rem 1.4rem',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '0.8rem 1.5rem',
                        borderRadius: '6px',
                        background: '#034ea2',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(3, 78, 162, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#023c7d')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#034ea2')}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Submission Confirmation Screen */
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.25rem',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <i className="bx bx-check-circle"></i>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                Thank You for Your Feedback!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: '1.5' }}>
                Your responses have been successfully submitted for <strong>{clientDetails.company}</strong>. They have been routed directly to Customer Success SPOC <strong>{clientDetails.csSpocName}</strong> and leadership.
              </p>

              {/* Recorded Feedback Details Card */}
              <div
                style={{
                  textAlign: 'left',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  maxWidth: '640px',
                  margin: '0 auto 2rem auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Respondent (HR)</span>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{clientDetails.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Company</span>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{clientDetails.company}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>CS SPOC</span>
                    <div style={{ fontWeight: '600', color: '#034ea2' }}>{clientDetails.csSpocName}</div>
                  </div>
                </div>

                {/* Quantitative Ratings */}
                <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.6rem' }}>
                  Ratings Summary ({QUESTIONS.length} Questions):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {QUESTIONS.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        padding: '0.45rem 0.65rem',
                        background: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '500' }}>{q.shortLabel}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor:
                            ratings[q.id]?.includes('Very satisfied')
                              ? '#dcfce7'
                              : ratings[q.id]?.includes('Satisfied')
                              ? '#e0f2fe'
                              : ratings[q.id]?.includes('Neutral')
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            ratings[q.id]?.includes('Very satisfied')
                              ? '#166534'
                              : ratings[q.id]?.includes('Satisfied')
                              ? '#0369a1'
                              : ratings[q.id]?.includes('Neutral')
                              ? '#92400e'
                              : '#991b1b'
                        }}
                      >
                        {ratings[q.id] || 'Not answered'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Qualitative Suggestions if provided */}
                {clientDetails.suggestions && (
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Suggestions & Feedback:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{clientDetails.suggestions}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
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

        {/* History / Recent Submissions drawer if toggled */}
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
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Stored locally in browser session</span>
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
                        <div>
                          <strong style={{ color: '#034ea2' }}>{item.id}</strong>
                          <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>
                            • {item.clientDetails?.name || 'HR'} ({item.clientDetails?.company || 'Company'}) • SPOC: {item.clientDetails?.csSpocName || 'CS'}
                          </span>
                        </div>
                        <span style={{ color: '#94a3b8' }}>{item.formattedDate}</span>
                      </div>
                      {item.clientDetails?.suggestions && (
                        <div style={{ marginTop: '0.35rem', color: '#334155', fontStyle: 'italic' }}>
                          "{item.clientDetails.suggestions}"
                        </div>
                      )}
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
