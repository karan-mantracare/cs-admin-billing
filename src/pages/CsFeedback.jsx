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
    pillarGroup: 'BD',
    title: 'BD Commitment vs. Actual Service Delivery: *',
    description: 'How well did actual operational execution align with deliverables, promised scope, and timelines agreed during the Business Development / sales phase?',
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
    pillarGroup: 'CS',
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
    pillarGroup: 'Tech',
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
    id: 'hotlineCallQuality',
    pillarGroup: 'Hotline',
    title: 'Hotline: Call Quality & Pickup Ratio: *',
    description: 'Immediate call pickup speed, zero connection dropouts, audio clarity, and 24/7 helpline accessibility when employees call in:',
    shortLabel: 'Hotline: Call Quality',
    category: 'Helpline & Assistance',
    icon: 'bx-phone-call',
    allowNotApplicable: true,
    lowRatingTags: [
      'High wait time before call answered',
      'Frequent dropped / disconnected calls',
      'Audio line crackling or lag',
      'Pickup delays during peak hours'
    ]
  },
  {
    id: 'hotlineCallSupport',
    pillarGroup: 'Hotline',
    title: 'Hotline: Counselor & Agent Call Support: *',
    description: 'Empathy, active listening, problem handling, and professionalism displayed by helpline agents when handling employee situations:',
    shortLabel: 'Hotline: Call Support',
    category: 'Helpline & Assistance',
    icon: 'bx-support',
    allowNotApplicable: true,
    lowRatingTags: [
      'Agent sounded rushed or impatient',
      'Lacked active empathy & understanding',
      'Inadequate clinical / wellness guidance',
      'Tone was perceived as unprofessional'
    ]
  },
  {
    id: 'hotlineOpsResponse',
    pillarGroup: 'Hotline',
    title: 'Hotline: Ops Response to Queries & Follow-ups: *',
    description: 'Operational turnaround speed and efficiency in closing ticket escalations, scheduled callbacks, and resolving employee queries:',
    shortLabel: 'Hotline: Ops Response',
    category: 'Helpline & Assistance',
    icon: 'bx-time-five',
    allowNotApplicable: true,
    lowRatingTags: [
      'Scheduled callback was delayed / missed',
      'Ticket escalation took days to resolve',
      'Lack of clear status communication',
      'Operations resolution was incomplete'
    ]
  },
  {
    id: 'oneOnOneSessions',
    pillarGroup: '1-on-1',
    title: '1-on-1 Individual Sessions: *',
    description: 'Quality, punctuality, practitioner expertise, confidentiality, and employee satisfaction with individual 1-on-1 sessions:',
    shortLabel: '1-on-1 Sessions',
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
    id: 'webinarTopic',
    pillarGroup: 'Webinars',
    title: 'Webinars: Topic Relevance & Variety: *',
    description: 'Alignment of webinar themes with workforce wellness priorities, mental health awareness, and employee interest:',
    shortLabel: 'Webinars: Topic Relevance',
    category: 'Engagement & Activities',
    icon: 'bx-list-check',
    allowNotApplicable: true, // SOW exclusion option
    lowRatingTags: [
      'Topics too generic or repetitive',
      'Did not resonate with workforce needs',
      'Need more specialized wellness themes',
      'Too few topics to choose from'
    ]
  },
  {
    id: 'webinarContent',
    pillarGroup: 'Webinars',
    title: 'Webinars: Content Depth & Presentation Quality: *',
    description: 'Practicality, visual presentation, depth of actionable health takeaways, and reference materials provided to attendees:',
    shortLabel: 'Webinars: Content Quality',
    category: 'Engagement & Activities',
    icon: 'bx-slideshow',
    allowNotApplicable: true, // SOW exclusion option
    lowRatingTags: [
      'Slides were text-heavy & hard to follow',
      'Lack of actionable everyday tips',
      'Content was too theoretical/basic',
      'Resource guides / recordings delayed'
    ]
  },
  {
    id: 'webinarExpert',
    pillarGroup: 'Webinars',
    title: 'Webinars: Trainer / Expert Engagement & Q&A: *',
    description: 'Speaker energy, subject mastery, audience engagement, and effectiveness in answering live employee questions:',
    shortLabel: 'Webinars: Expert Engagement',
    category: 'Engagement & Activities',
    icon: 'bx-broadcast',
    allowNotApplicable: true, // SOW exclusion option
    lowRatingTags: [
      'Speaker lacked dynamic engagement',
      'Audience Q&A was rushed or skipped',
      'Session started late or ran overtime',
      'Could not answer complex attendee queries'
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
  const [currentStep, setCurrentStep] = useState(0); // 0 to 9 = questions, 10 = details & remarks, 11 = submitted

  // Ratings for all 10 questions
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

  // Optional remarks on low responses
  const [lowResponseRemarks, setLowResponseRemarks] = useState({
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
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false); // Collapsed by default for compact page
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
      hotlineCallQuality: '',
      hotlineCallSupport: '',
      hotlineOpsResponse: '',
      oneOnOneSessions: '',
      webinarTopic: '',
      webinarContent: '',
      webinarExpert: ''
    });
    setLowResponseRemarks({
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
    <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#f8fafc', padding: '1.25rem 1.25rem 2.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
          <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/cs/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Customer Success</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Feedback & Service Evaluation</span>
        </div>

        {/* Page Heading & Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
              Feedback
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Corporate Health Partner Evaluation • Granular Delivery Analysis ({PILLAR_QUESTIONS.length} Dimensions)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
              <i className="bx bx-user" style={{ color: '#0284c7' }}></i>
              <span>Logged in: <strong style={{ color: '#0f172a' }}>{clientDetails.name}</strong> ({clientDetails.company})</span>
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: showHistory ? '#e0f2fe' : '#ffffff',
                color: showHistory ? '#0284c7' : '#475569',
                fontSize: '0.8rem',
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

        {/* Question Selector Quick-Bar */}
        <div style={{ maxWidth: '860px', margin: '0 auto 0.75rem auto', display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
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
                  minWidth: '95px',
                  padding: '0.35rem 0.45rem',
                  borderRadius: '5px',
                  background: isCurrent ? '#034ea2' : hasAnswer ? '#e0f2fe' : '#ffffff',
                  color: isCurrent ? '#ffffff' : hasAnswer ? '#0369a1' : '#64748b',
                  border: isCurrent ? '1px solid #034ea2' : hasAnswer ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                  fontSize: '0.7rem',
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
                {q.shortLabel.replace('Hotline: ', '').replace('Webinars: ', '')}
              </div>
            );
          })}
          <div
            onClick={() => {
              const allAnswered = PILLAR_QUESTIONS.every((q) => Boolean(ratings[q.id]));
              if (allAnswered) setCurrentStep(PILLAR_QUESTIONS.length);
            }}
            style={{
              flex: '1 1 0',
              minWidth: '75px',
              padding: '0.35rem 0.45rem',
              borderRadius: '5px',
              background: isDetailsStep ? '#034ea2' : '#ffffff',
              color: isDetailsStep ? '#ffffff' : '#64748b',
              border: isDetailsStep ? '1px solid #034ea2' : '1px solid #e2e8f0',
              fontSize: '0.7rem',
              fontWeight: '600',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            Submit
          </div>
        </div>

        {/* Main Survey Card Container */}
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto 1.5rem auto',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            padding: '1.25rem 1.5rem',
            position: 'relative'
          }}
        >
          {!submitted ? (
            <div>
              {/* Stepper Header exactly matching user screenshot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#034ea2' }}>
                  {isDetailsStep ? 'FINAL STEP' : `QUESTION ${currentStep + 1} OF ${PILLAR_QUESTIONS.length}`}
                </span>

                {/* Dashed Segment Progress Indicators matching screenshot */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {PILLAR_QUESTIONS.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '20px',
                        height: '4px',
                        borderRadius: '2px',
                        background: idx === currentStep ? '#034ea2' : idx < currentStep ? '#93c5fd' : '#e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Step View: Questions (0 to 9) */}
              {!isDetailsStep ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#034ea2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        flexShrink: 0
                      }}
                    >
                      <i className={`bx ${activeQuestion.icon}`}></i>
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '1.02rem',
                          fontWeight: '700',
                          color: '#1e293b',
                          lineHeight: '1.35'
                        }}
                      >
                        {activeQuestion.title.split('*')[0]}
                        <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: '1.4' }}>
                        {activeQuestion.description}
                      </p>
                    </div>
                  </div>

                  {/* Radio Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0 0.75rem 0' }}>
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
                            padding: '0.42rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.15s ease',
                            backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                            border: isSelected ? '1.5px solid #034ea2' : '1px solid #e2e8f0',
                            boxShadow: isSelected ? '0 1px 3px rgba(3, 78, 162, 0.08)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <input
                              type="radio"
                              name={activeQuestion.id}
                              value={opt.value}
                              checked={isSelected}
                              onChange={() => handleSelectOption(opt.value)}
                              style={{
                                width: '16px',
                                height: '16px',
                                accentColor: '#034ea2',
                                cursor: 'pointer',
                                margin: 0
                              }}
                            />
                            <span
                              style={{
                                fontSize: '0.88rem',
                                color: isSelected ? '#034ea2' : '#334155',
                                fontWeight: isSelected ? '600' : '500'
                              }}
                            >
                              {opt.label}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: opt.bg,
                              color: opt.color
                            }}
                          >
                            <i className={`bx ${opt.icon}`} style={{ marginRight: '0.2rem' }}></i>
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
                          padding: '0.42rem 0.75rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'all 0.15s ease',
                          backgroundColor: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '#f1f5f9' : '#ffffff',
                          border: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '1.5px solid #64748b' : '1px dashed #cbd5e1'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <input
                            type="radio"
                            name={activeQuestion.id}
                            value={NOT_APPLICABLE_OPTION.value}
                            checked={ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value}
                            onChange={() => handleSelectOption(NOT_APPLICABLE_OPTION.value)}
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: '#64748b',
                              cursor: 'pointer',
                              margin: 0
                            }}
                          />
                          <span
                            style={{
                              fontSize: '0.85rem',
                              color: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '#0f172a' : '#64748b',
                              fontWeight: ratings[activeQuestion.id] === NOT_APPLICABLE_OPTION.value ? '600' : '500'
                            }}
                          >
                            {NOT_APPLICABLE_OPTION.label}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '0.15rem 0.45rem',
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
                        marginTop: '0.65rem',
                        marginBottom: '0.65rem',
                        padding: '0.75rem 0.9rem',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        animation: 'fadeIn 0.2s ease-in'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className="bx bx-message-alt-error" style={{ fontSize: '1rem' }}></i>
                          <span>What could we have done better in {activeQuestion.shortLabel}? (Optional remark)</span>
                        </label>
                        <span style={{ fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '600' }}>
                          Optional
                        </span>
                      </div>

                      <p style={{ margin: '0 0 0.45rem 0', fontSize: '0.76rem', color: '#78350f' }}>
                        Click any tag below to quickly specify the reason, or write your feedback so your CS SPOC can review:
                      </p>

                      {/* Dimension Specific Issue Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                        {activeQuestion.lowRatingTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleAddLowRatingTag(activeQuestion.id, tag)}
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '10px',
                              border: '1px solid #fcd34d',
                              background: '#ffffff',
                              color: '#92400e',
                              fontSize: '0.72rem',
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
                        rows={2}
                        value={lowResponseRemarks[activeQuestion.id]}
                        onChange={(e) =>
                          setLowResponseRemarks({
                            ...lowResponseRemarks,
                            [activeQuestion.id]: e.target.value
                          })
                        }
                        placeholder={`Share any specific issues regarding ${activeQuestion.shortLabel.toLowerCase()} (optional)...`}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.65rem',
                          borderRadius: '5px',
                          border: '1px solid #fcd34d',
                          background: '#ffffff',
                          fontSize: '0.82rem',
                          color: '#1e293b',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          lineHeight: '1.4',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  )}

                  {/* Validation Error banner */}
                  {validationError && (
                    <div
                      style={{
                        marginBottom: '0.85rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <i className="bx bx-error-circle"></i>
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.85rem' }}>
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        style={{
                          padding: '0.5rem 1.15rem',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          fontSize: '0.88rem',
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
                        padding: '0.55rem 1.25rem',
                        borderRadius: '6px',
                        background: '#034ea2',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(3, 78, 162, 0.2)',
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
                /* Step 11 / Final Details & Suggestions Form */
                <form onSubmit={handleSubmit}>
                  {/* Pre-fill Intelligence Notification */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.85rem',
                      fontSize: '0.8rem',
                      color: '#0369a1'
                    }}
                  >
                    <i className="bx bx-info-circle" style={{ fontSize: '1.1rem', color: '#0284c7' }}></i>
                    <div>
                      <strong>Pre-Populated Identity:</strong> Details are prefilled based on your HR session, and your CS SPOC is linked from your division configuration.
                    </div>
                  </div>

                  {/* Division Switcher if multiple divisions exist */}
                  {availableDivisions.length > 1 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>
                        Corporate Division:
                      </label>
                      <select
                        value={clientDetails.selectedDivision}
                        onChange={(e) => handleDivisionChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.7rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.85rem',
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
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                        Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.7rem', color: '#0284c7', background: '#e0f2fe', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '600' }}>
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
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
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
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                        Company <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.7rem', color: '#059669', background: '#dcfce7', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '600' }}>
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
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
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
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                        Customer Success SPOC Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.7rem', color: '#034ea2', background: '#e0f2fe', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: '600' }}>
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
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
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
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                      Do you have any suggestions or feedback for us to improve our services?
                    </label>

                    {/* Quick Suggestions Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.45rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Quick insert:</span>
                      {GENERAL_SUGGESTION_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddGeneralSuggestionTag(tag)}
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '10px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            fontSize: '0.72rem',
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
                      rows={3}
                      value={clientDetails.suggestions}
                      onChange={(e) => setClientDetails({ ...clientDetails, suggestions: e.target.value })}
                      placeholder="Share your overall experience regarding webinar variety, response times, session quality, or any new features you would like to see..."
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        color: '#1e293b',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        lineHeight: '1.45',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#034ea2')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                    />
                  </div>

                  {/* Follow-up Checkbox */}
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="followUpCheck"
                      checked={clientDetails.wantsFollowUp}
                      onChange={(e) => setClientDetails({ ...clientDetails, wantsFollowUp: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#034ea2', cursor: 'pointer' }}
                    />
                    <label htmlFor="followUpCheck" style={{ fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                      Request Customer Success SPOC ({clientDetails.csSpocName}) to schedule a brief follow-up call regarding this feedback.
                    </label>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div
                      style={{
                        marginBottom: '0.85rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <i className="bx bx-error-circle"></i>
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Action Buttons for Step 11 */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(PILLAR_QUESTIONS.length - 1)}
                      style={{
                        padding: '0.5rem 1.15rem',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '0.55rem 1.25rem',
                        borderRadius: '6px',
                        background: '#059669',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
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
                  maxWidth: '700px',
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

                {/* 10 Granular Dimensions Summary */}
                <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.6rem' }}>
                  Service Evaluation ({PILLAR_QUESTIONS.length} Dimensions):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
                  {PILLAR_QUESTIONS.map((q) => {
                    const ans = ratings[q.id];
                    const remark = lowResponseRemarks[q.id];
                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '0.6rem 0.85rem',
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
                              fontSize: '0.74rem',
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

        {/* Customer Escalation & Resolution Matrix Collapsible Accordion */}
        <div
          style={{
            marginTop: '1.25rem',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Accordion Header Trigger */}
          <div
            onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: isMatrixExpanded ? '#f8fafc' : '#ffffff',
              borderBottom: isMatrixExpanded ? '1px solid #e2e8f0' : 'none',
              transition: 'background-color 0.15s ease'
            }}
            onMouseOver={(e) => {
              if (!isMatrixExpanded) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseOut={(e) => {
              if (!isMatrixExpanded) e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isMatrixExpanded ? '#e0f2fe' : '#f1f5f9',
                  color: isMatrixExpanded ? '#034ea2' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}
              >
                <i className="bx bx-table"></i>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    Customer Service Escalation Matrix
                  </h2>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#034ea2', background: '#e0f2fe', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                    8-Tier SLA Protocol
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                  {isMatrixExpanded
                    ? 'Click to collapse standard resolution SLAs and intervention triggers across support tiers.'
                    : 'Click to expand standard operational resolution SLAs, complaint workflows, and intervention triggers.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMatrixExpanded(!isMatrixExpanded);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                background: isMatrixExpanded ? '#034ea2' : '#ffffff',
                color: isMatrixExpanded ? '#ffffff' : '#334155',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{isMatrixExpanded ? 'Collapse Matrix' : 'Expand Matrix'}</span>
              <i className={`bx ${isMatrixExpanded ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1rem' }}></i>
            </button>
          </div>

          {/* Collapsible Body containing the full 8-column matrix table */}
          {isMatrixExpanded && (
            <div style={{ padding: '0.85rem', overflowX: 'auto', background: '#ffffff' }}>
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
          )}
        </div>

      </div>
    </div>
  );
}
