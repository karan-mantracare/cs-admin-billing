import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPrimaryCS } from '../utils/roleUtils';

const STANDARD_RATING_OPTIONS = [
  { label: 'Very satisfied', value: 'Very satisfied', color: '#166534', bg: '#dcfce7', icon: 'bx-smile' },
  { label: 'Satisfied', value: 'Satisfied', color: '#0369a1', bg: '#e0f2fe', icon: 'bx-happy' },
  { label: 'Neutral', value: 'Neutral', color: '#854d0e', bg: '#fef3c7', icon: 'bx-meh' },
  { label: 'Dissatisfied', value: 'Dissatisfied', color: '#c2410c', bg: '#ffedd5', icon: 'bx-sad' },
  { label: 'Very dissatisfied', value: 'Very dissatisfied', color: '#991b1b', bg: '#fee2e2', icon: 'bx-angry' }
];

const NOT_APPLICABLE_OPTION = {
  label: 'Not a part of SOW / No session done',
  value: 'Not a part of SOW / No session done',
  color: '#475569',
  bg: '#f1f5f9',
  icon: 'bx-minus-circle'
};

const PILLAR_QUESTIONS = [
  {
    id: 'bdCommitment',
    title: 'BD Commitment vs. Actual Service Delivery: *',
    description: 'How well did actual operational execution align with the deliverables, promises, and timelines agreed upon during the Business Development / sales phase?',
    shortLabel: 'BD Commitment vs Delivery',
    category: 'Sales & Onboarding Alignment',
    icon: 'bx-briefcase-alt-2',
    allowNotApplicable: false,
    lowRatingTags: [
      'Scope of services mismatched',
      'Delayed onboarding & kickoff',
      'Deliverables promised were missing',
      'Billing or pricing miscommunication'
    ]
  },
  {
    id: 'csSupport',
    title: 'Customer Success (CS) Support & Account Management: *',
    description: 'Responsiveness, proactiveness, and helpfulness of your dedicated Customer Success SPOC in resolving queries, managing account requests, and reviewing health metrics:',
    shortLabel: 'CS Support & Responsiveness',
    category: 'Customer Success Operations',
    icon: 'bx-user-voice',
    allowNotApplicable: false,
    lowRatingTags: [
      'Slow response to emails / queries',
      'Need more proactive follow-ups',
      'Escalations remained unresolved',
      'Need more frequent status reviews'
    ]
  },
  {
    id: 'techSupport',
    title: 'Tech & App Support (Platform Reliability & Usability): *',
    description: 'Ease of use, app speed, uptime reliability, and technical assistance for the MantraCare employee mobile app and corporate portal:',
    shortLabel: 'Tech & App Support',
    category: 'Product & Technology',
    icon: 'bx-laptop',
    allowNotApplicable: false,
    lowRatingTags: [
      'Login / OTP verification issues',
      'App performance / slow loading',
      'Feature bugs or app crashes',
      'Portal navigation was confusing'
    ]
  },
  {
    id: 'hotlineCalls',
    title: 'Hotline Calls (Pickup Ratio & Call Handling Capabilities): *',
    description: 'Helpline responsiveness, immediate pickup ratio, empathy, and problem resolution capabilities when your employees dial the corporate support hotline:',
    shortLabel: 'Hotline Pickup & Handling',
    category: 'Helpline & Assistance',
    icon: 'bx-phone-call',
    allowNotApplicable: true,
    lowRatingTags: [
      'High wait time before call answered',
      'Frequent dropped / unanswered calls',
      'Agent lacked required clinical knowledge',
      'Resolution required multiple callbacks'
    ]
  },
  {
    id: 'oneOnOneSessions',
    title: '1-on-1 Individual Sessions (Therapy, Coaching, Doctor Consultations): *',
    description: 'Quality, punctuality, practitioner expertise, confidentiality, and employee feedback regarding individual confidential wellness sessions:',
    shortLabel: '1-on-1 Expert Sessions',
    category: 'Clinical & Wellness Care',
    icon: 'bx-user-pin',
    allowNotApplicable: true,
    lowRatingTags: [
      'Limited expert slot availability',
      'Expert rescheduled / cancelled sessions',
      'Consultation quality was inconsistent',
      'Feedback from employees was mixed'
    ]
  },
  {
    id: 'webinars',
    title: 'Webinars & Corporate Group Activities: *',
    description: 'Engagement level, speaker expertise, interactive participation, and practical value of company-wide webinars and wellness group workshops:',
    shortLabel: 'Webinars & Group Sessions',
    category: 'Engagement & Activities',
    icon: 'bx-broadcast',
    allowNotApplicable: true, // Crucial requirement: option of no session done / not a part of SOW
    lowRatingTags: [
      'Topic lacked relevance for our team',
      'Speaker engagement was below expectations',
      'Audio / video technical difficulties',
      'Session timing was inconvenient'
    ]
  }
];

const GENERAL_SUGGESTION_TAGS = [
  'More interactive wellness webinars',
  'Faster query response time',
  'Enhanced app loading speed',
  'Expanded specialist doctor network',
  'Detailed monthly employee participation reports',
  'Flexible trainer webinar scheduling',
  'Custom corporate fitness challenges'
];

export default function CsFeedback() {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0); // 0 to 5 = questions, 6 = details & remarks, 7 = submitted

  // Ratings for each pillar
  const [ratings, setRatings] = useState({
    bdCommitment: '',
    csSupport: '',
    techSupport: '',
    hotlineCalls: '',
    oneOnOneSessions: '',
    webinars: ''
  });

  // Optional remarks on low responses
  const [lowResponseRemarks, setLowResponseRemarks] = useState({
    bdCommitment: '',
    csSupport: '',
    techSupport: '',
    hotlineCalls: '',
    oneOnOneSessions: '',
    webinars: ''
  });

  // Client Details state
  const [clientDetails, setClientDetails] = useState({
    name: 'Priya Sharma',
    company: 'TechCorp Solutions',
    csSpocName: 'Karan Hinduja',
    suggestions: '',
    wantsFollowUp: false,
    selectedDivision: 'Healthcare'
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
      const resolvedCS = getPrimaryCS(null, 'Healthcare', 'TechCorp Solutions', null);
      setClientDetails((prev) => ({
        ...prev,
        csSpocName: resolvedCS || 'Karan Hinduja'
      }));
    }
  }, [searchParams]);

  const handleDivisionChange = (divName) => {
    const resolvedCS = getPrimaryCS(null, divName, clientDetails.company, null);
    setClientDetails((prev) => ({
      ...prev,
      selectedDivision: divName,
      csSpocName: resolvedCS || prev.csSpocName
    }));
  };

  const isDetailsStep = currentStep === PILLAR_QUESTIONS.length;
  const activeQuestion = PILLAR_QUESTIONS[currentStep];

  const handleSelectOption = (optionValue) => {
    setRatings((prev) => ({
      ...prev,
      [activeQuestion.id]: optionValue
    }));
    setValidationError('');
  };

  const isLowRating = (rating) => {
    return rating === 'Dissatisfied' || rating === 'Very dissatisfied' || rating === 'Neutral';
  };

  const handleAddLowRatingTag = (questionId, tag) => {
    setLowResponseRemarks((prev) => {
      const curr = prev[questionId] ? prev[questionId].trim() : '';
      const updated = curr ? `${curr}, ${tag}` : tag;
      return { ...prev, [questionId]: updated };
    });
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

  const handleAddGeneralSuggestionTag = (tag) => {
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
      ratings: { ...ratings },
      lowResponseRemarks: { ...lowResponseRemarks }
    };

    try {
      const existing = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify([newSubmission, ...existing]));
    } catch {}

    setSubmitted(true);
    setCurrentStep(PILLAR_QUESTIONS.length + 1);
  };

  const handleReset = () => {
    setRatings({
      bdCommitment: '',
      csSupport: '',
      techSupport: '',
      hotlineCalls: '',
      oneOnOneSessions: '',
      webinars: ''
    });
    setLowResponseRemarks({
      bdCommitment: '',
      csSupport: '',
      techSupport: '',
      hotlineCalls: '',
      oneOnOneSessions: '',
      webinars: ''
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
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Feedback & Service Evaluation</span>
        </div>

        {/* Page Heading & Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              Feedback
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Corporate Health Partner Evaluation • 6 Core Delivery Pillars
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
              <i className="bx bx-user" style={{ color: '#0284c7' }}></i>
              <span>Logged in: <strong style={{ color: '#0f172a' }}>{clientDetails.name}</strong> ({clientDetails.company})</span>
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

        {/* Survey Progress Pills */}
        <div style={{ maxWidth: '880px', margin: '0 auto 1.25rem auto', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {PILLAR_QUESTIONS.map((q, idx) => {
            const hasAnswer = Boolean(ratings[q.id]);
            const isCurrent = idx === currentStep;
            return (
              <div
                key={q.id}
                onClick={() => {
                  if (idx <= currentStep || hasAnswer) {
                    setCurrentStep(idx);
                  }
                }}
                style={{
                  flex: '1 1 0',
                  minWidth: '120px',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  background: isCurrent ? '#034ea2' : hasAnswer ? '#e0f2fe' : '#ffffff',
                  color: isCurrent ? '#ffffff' : hasAnswer ? '#0369a1' : '#64748b',
                  border: isCurrent ? '1px solid #034ea2' : hasAnswer ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: idx <= currentStep || hasAnswer ? 'pointer' : 'default',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
                title={q.shortLabel}
              >
                {hasAnswer && !isCurrent ? '✓ ' : `${idx + 1}. `}
                {q.shortLabel.split(' ')[0]}
              </div>
            );
          })}
          <div
            onClick={() => {
              // Allow jump if all questions answered
              const allAnswered = PILLAR_QUESTIONS.every((q) => Boolean(ratings[q.id]));
              if (allAnswered) setCurrentStep(PILLAR_QUESTIONS.length);
            }}
            style={{
              flex: '1 1 0',
              minWidth: '110px',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              background: isDetailsStep ? '#034ea2' : '#ffffff',
              color: isDetailsStep ? '#ffffff' : '#64748b',
              border: isDetailsStep ? '1px solid #034ea2' : '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: '600',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            7. Submit
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#034ea2' }}>
                      {isDetailsStep ? 'Final Step: Corporate SPOC & Summary' : `Question ${currentStep + 1} of ${PILLAR_QUESTIONS.length}`}
                    </span>
                    {!isDetailsStep && (
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                        {activeQuestion.category}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    {Math.round((currentStep / (PILLAR_QUESTIONS.length + 1)) * 100)}% Complete
                  </span>
                </div>

                {/* Progress bar line */}
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(currentStep / PILLAR_QUESTIONS.length) * 100}%`,
                      background: 'linear-gradient(90deg, #034ea2, #0284c7)',
                      borderRadius: '3px',
                      transition: 'width 0.25s ease'
                    }}
                  />
                </div>
              </div>

              {/* Step View: Questions (0 to 5) */}
              {!isDetailsStep ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#034ea2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}
                    >
                      <i className={`bx ${activeQuestion.icon}`}></i>
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: '#1e293b',
                          lineHeight: '1.4'
                        }}
                      >
                        {activeQuestion.title.split('*')[0]}
                        <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: '#64748b', lineHeight: '1.45' }}>
                        {activeQuestion.description}
                      </p>
                    </div>
                  </div>

                  {/* Radio Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '1.75rem 0 1.25rem 0' }}>
                    {STANDARD_RATING_OPTIONS.map((opt) => {
                      const isSelected = ratings[activeQuestion.id] === opt.value;
                      return (
                        <label
                          key={opt.value}
                          onClick={() => handleSelectOption(opt.value)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.15s ease',
                            backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                            border: isSelected ? '1.5px solid #034ea2' : '1px solid #e2e8f0',
                            boxShadow: isSelected ? '0 2px 6px rgba(3, 78, 162, 0.1)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="radio"
                              name={activeQuestion.id}
                              value={opt.value}
                              checked={isSelected}
                              onChange={() => handleSelectOption(opt.value)}
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
                              {opt.label}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              background: opt.bg,
                              color: opt.color
                            }}
                          >
                            <i className={`bx ${opt.icon}`} style={{ marginRight: '0.25rem' }}></i>
                            {opt.value}
                          </span>
                        </label>
                      );
                    })}

                    {/* Option: Not a part of SOW / No session done */}
                    {activeQuestion.allowNotApplicable && (
                      <label
                        onClick={() => handleSelectOption(NOT_APPLICABLE_OPTION.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                          backgroundColor: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '#f1f5f9' : '#ffffff',
                          border: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '1.5px solid #64748b' : '1px dashed #cbd5e1'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="radio"
                            name={activeQuestion.id}
                            value={NOT_APPLICABLE_OPTION.value}
                            checked={ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value}
                            onChange={() => handleSelectOption(NOT_APPLICABLE_OPTION.value)}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: '#64748b',
                              cursor: 'pointer',
                              margin: 0
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.92rem',
                              color: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '#0f172a' : '#64748b',
                              fontWeight: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '600' : '500'
                            }}
                          >
                            {NOT_APPLICABLE_OPTION.label}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#64748b'
                          }}
                        >
                          Excluded from Corporate SOW
                        </span>
                      </label>
                    )}
                  </div>

                  {/* OPTIONAL REMARK CARD ON LOW RESPONSE (Dissatisfied, Very dissatisfied, Neutral) */}
                  {isLowRating(ratings[activeQuestion.id]) && (
                    <div
                      style={{
                        marginTop: '1.25rem',
                        marginBottom: '1.5rem',
                        padding: '1.25rem',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        animation: 'fadeIn 0.2s ease-in'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="bx bx-message-alt-error" style={{ fontSize: '1.1rem' }}></i>
                          <span>What could we have done better? (Optional remark)</span>
                        </label>
                        <span style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                          Optional
                        </span>
                      </div>

                      <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.8rem', color: '#78350f' }}>
                        We strive for excellence. Click any tag below to quickly specify the issue, or leave a brief remark so your CS SPOC can take corrective action.
                      </p>

                      {/* Pillar Quick Issue Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.65rem' }}>
                        {activeQuestion.lowRatingTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddLowRatingTag(activeQuestion.id, tag)}
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              border: '1px solid #fcd34d',
                              background: '#ffffff',
                              color: '#92400e',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef3c7';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                            }}
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        value={lowResponseRemarks[activeQuestion.id]}
                        onChange={(e) =>
                          setLowResponseRemarks({
                            ...lowResponseRemarks,
                            [activeQuestion.id]: e.target.value
                          })
                        }
                        placeholder="Share any specifics about delays, missing commitments, or issues experienced (optional)..."
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #fcd34d',
                          background: '#ffffff',
                          fontSize: '0.88rem',
                          color: '#1e293b',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          lineHeight: '1.45',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  )}

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
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.5rem' }}>
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
                /* Step 7 / Final Details & Suggestions Form */
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
                      <strong>Pre-Populated Identity:</strong> Your details are prefilled based on your HR session, and your Customer Success SPOC is linked from your division configuration.
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
                        Prefilled from HR Login ID
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
                        Corporate Account
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={clientDetails.company}
                      onChange={(e) => setClientDetails({ ...clientDetails, company: e.target.value })}
                      placeholder="Enter corporate company name"
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
                        Prefilled from Division Roles
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

                    {/* Quick Suggestions Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>Quick insert:</span>
                      {GENERAL_SUGGESTION_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddGeneralSuggestionTag(tag)}
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
                      placeholder="Share your overall experience regarding webinar variety, response times, session quality, or any new features you would like to see..."
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
                      Submit Feedback
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
                Your responses have been successfully submitted for <strong>{clientDetails.company}</strong>. They have been routed directly to Customer Success SPOC <strong>{clientDetails.csSpocName}</strong> and executive management.
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
                  maxWidth: '680px',
                  margin: '0 auto 2rem auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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

                {/* 6 Core Pillars Summary */}
                <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.6rem' }}>
                  6 Service Pillars Evaluation:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {PILLAR_QUESTIONS.map((q) => {
                    const ans = ratings[q.id];
                    const remark = lowResponseRemarks[q.id];
                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: '#ffffff',
                          border: '1px solid #f1f5f9',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: '600' }}>
                            {q.shortLabel}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor:
                                ans === 'Very satisfied'
                                  ? '#dcfce7'
                                  : ans === 'Satisfied'
                                  ? '#e0f2fe'
                                  : ans === 'Neutral'
                                  ? '#fef3c7'
                                  : ans?.includes('Not a part')
                                  ? '#f1f5f9'
                                  : '#fee2e2',
                              color:
                                ans === 'Very satisfied'
                                  ? '#166534'
                                  : ans === 'Satisfied'
                                  ? '#0369a1'
                                  : ans === 'Neutral'
                                  ? '#92400e'
                                  : ans?.includes('Not a part')
                                  ? '#475569'
                                  : '#991b1b'
                            }}
                          >
                            {ans || 'Not answered'}
                          </span>
                        </div>

                        {/* Low rating remark if provided */}
                        {remark && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#b45309', background: '#fffbeb', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                            <strong>Remark:</strong> {remark}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Qualitative Suggestions if provided */}
                {clientDetails.suggestions && (
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Overall Suggestions & Feedback:
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
