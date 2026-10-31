import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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

const SEED_FEEDBACK_SUBMISSIONS = [
  {
    id: 'FB-984210',
    timestamp: '2026-10-27T10:15:00Z',
    formattedDate: 'Oct 27, 2026, 3:45 PM',
    createdBy: 'Karan Hinduja',
    status: 'Submitted',
    clientDetails: {
      name: 'Sarah Jenkins',
      company: 'TechVision Global Inc.',
      designation: 'Head of People Operations',
      csSpocName: 'Karan Hinduja',
      selectedDivision: 'Healthcare',
      suggestions: 'Trainer for ergonomic webinar was exceptional! Hotline response has also been super quick.',
      wantsFollowUp: false
    },
    ratings: {
      bdCommitment: 'Very satisfied',
      csSupport: 'Very satisfied',
      techSupport: 'Satisfied',
      hotlineCallQuality: 'Very satisfied',
      hotlineCallSupport: 'Very satisfied',
      hotlineOpsResponse: 'Satisfied',
      oneOnOneSessions: 'Very satisfied',
      webinarTopic: 'Very satisfied',
      webinarContent: 'Very satisfied',
      webinarExpert: 'Very satisfied'
    },
    lowResponseRemarks: {}
  },
  {
    id: 'FB-983192',
    timestamp: '2026-10-26T14:30:00Z',
    formattedDate: 'Oct 26, 2026, 8:00 PM',
    createdBy: 'Priya Mehta',
    status: 'Submitted',
    clientDetails: {
      name: 'Rajesh Sharma',
      company: 'Apex Health Corp',
      designation: 'Director of Human Resources',
      csSpocName: 'Priya Mehta',
      selectedDivision: 'Corporate Wellness',
      suggestions: 'Would appreciate monthly health analytics deck earlier before the 5th of every month.',
      wantsFollowUp: true
    },
    ratings: {
      bdCommitment: 'Satisfied',
      csSupport: 'Very satisfied',
      techSupport: 'Neutral',
      hotlineCallQuality: 'Satisfied',
      hotlineCallSupport: 'Satisfied',
      hotlineOpsResponse: 'Satisfied',
      oneOnOneSessions: 'Satisfied',
      webinarTopic: 'Satisfied',
      webinarContent: 'Satisfied',
      webinarExpert: 'Satisfied'
    },
    lowResponseRemarks: {
      techSupport: 'Some employees had OTP login lag during initial app rollout.'
    }
  },
  {
    id: 'FB-982054',
    timestamp: '2026-10-25T09:20:00Z',
    formattedDate: 'Oct 25, 2026, 2:50 PM',
    createdBy: 'Karan Hinduja',
    status: 'Submitted',
    clientDetails: {
      name: 'David Miller',
      company: 'Nova FinTech Solutions',
      designation: 'Head of People Operations',
      csSpocName: 'Karan Hinduja',
      selectedDivision: 'Operations',
      suggestions: 'Mental health counseling sessions have received outstanding praise from our engineering team.',
      wantsFollowUp: false
    },
    ratings: {
      bdCommitment: 'Very satisfied',
      csSupport: 'Very satisfied',
      techSupport: 'Very satisfied',
      hotlineCallQuality: 'Very satisfied',
      hotlineCallSupport: 'Very satisfied',
      hotlineOpsResponse: 'Very satisfied',
      oneOnOneSessions: 'Very satisfied',
      webinarTopic: 'Very satisfied',
      webinarContent: 'Very satisfied',
      webinarExpert: 'Very satisfied'
    },
    lowResponseRemarks: {}
  },
  {
    id: 'FB-981108',
    timestamp: '2026-10-24T11:00:00Z',
    formattedDate: 'Oct 24, 2026, 4:30 PM',
    createdBy: 'Aman Verma',
    status: 'Submitted',
    clientDetails: {
      name: 'Ananya Roy',
      company: 'Zenith Retail Network',
      designation: 'VP - Talent & Culture',
      csSpocName: 'Aman Verma',
      selectedDivision: 'Supply Chain',
      suggestions: 'Need faster email response for trainer rescheduling on weekend shifts.',
      wantsFollowUp: true
    },
    ratings: {
      bdCommitment: 'Neutral',
      csSupport: 'Dissatisfied',
      techSupport: 'Satisfied',
      hotlineCallQuality: 'Satisfied',
      hotlineCallSupport: 'Satisfied',
      hotlineOpsResponse: 'Neutral',
      oneOnOneSessions: 'Satisfied',
      webinarTopic: 'Satisfied',
      webinarContent: 'Neutral',
      webinarExpert: 'Satisfied'
    },
    lowResponseRemarks: {
      csSupport: 'Slow response to emails / queries; Need more proactive follow-ups'
    }
  }
];

export default function CsFeedback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab');
  const validTabs = ['submissions', 'matrix', 'summary'];
  const [activeTab, setActiveTab] = useState(
    validTabs.includes(initialTab) ? initialTab : 'submissions'
  );
  const [submissionsList, setSubmissionsList] = useState(() => {
    try {
      const stored = localStorage.getItem('mc_cs_feedback_submissions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            createdBy: item.createdBy || 'Karan Hinduja',
            status: item.status || (item.ratings && Object.keys(item.ratings).length > 0 ? 'Submitted' : 'Pending'),
            clientDetails: {
              ...item.clientDetails,
              designation: item.clientDetails?.designation || item.clientDetails?.hrRole || 'HR'
            }
          }));
        }
      }
    } catch {}
    try {
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify(SEED_FEEDBACK_SUBMISSIONS));
    } catch {}
    return SEED_FEEDBACK_SUBMISSIONS;
  });
  const [selectedInspectItem, setSelectedInspectItem] = useState(null);
  const [submissionsSearch, setSubmissionsSearch] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('All');
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal and details states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState({
    company: '',
    selectedUserId: '',
    hrName: '',
    hrEmail: '',
    designation: 'HR',
    division: ''
  });
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewData, setEmailPreviewData] = useState({
    toName: '',
    toEmail: '',
    company: '',
    designation: '',
    division: '',
    feedbackId: '',
    formLink: '',
    subject: '',
    body: ''
  });
  const [isOpenFormModalOpen, setIsOpenFormModalOpen] = useState(false);
  const [openFormData, setOpenFormData] = useState({
    company: '',
    hrName: '',
    designation: 'HR',
    division: '',
    csSpoc: ''
  });
  const [openFormPageData, setOpenFormPageData] = useState({
    company: '',
    hrName: '',
    designation: 'HR',
    division: '',
    csSpoc: ''
  });
  const [openFormInlineMode, setOpenFormInlineMode] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [selectedScoreExplainItem, setSelectedScoreExplainItem] = useState(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

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
    } catch { }

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

      const corporateIdParam = searchParams.get('corporateId') || searchParams.get('corpId');
      const companyParam = searchParams.get('company');
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        if (['submissions', 'matrix', 'summary'].includes(tabParam)) {
          setActiveTab(tabParam);
        } else {
          setActiveTab('submissions');
        }
      }

      let targetCompany = companyParam;
      if (!targetCompany && corporateIdParam) {
        const matched = (Array.isArray(allClients) ? allClients : []).find(
          (c) => String(c.id) === String(corporateIdParam) || String(c.corporateId) === String(corporateIdParam)
        );
        if (matched) targetCompany = matched.companyName || matched.clientName;
      }
      if (!targetCompany) targetCompany = defaultCompany;

      // If opened specifically as client evaluation survey, seamlessly redirect to the client-facing form
      if (corporateIdParam && (tabParam === 'survey' || searchParams.get('clientView') === 'true')) {
        const redirectParams = new URLSearchParams();
        if (targetCompany) redirectParams.set('company', targetCompany);
        const divParam = searchParams.get('division');
        if (divParam) redirectParams.set('division', divParam);
        const hrParam = searchParams.get('hrName');
        if (hrParam) redirectParams.set('hrName', hrParam);
        const queryStr = redirectParams.toString();
        navigate(`/feedback-form/${encodeURIComponent(corporateIdParam)}${queryStr ? '?' + queryStr : ''}`, { replace: true });
        return;
      }

      const targetDiv = searchParams.get('division') || defaultDivName;
      const resolvedCS = getPrimaryCS(null, targetDiv, targetCompany, null);

      setClientDetails((prev) => ({
        ...prev,
        company: targetCompany,
        selectedDivision: targetDiv,
        csSpocName: resolvedCS || 'Karan Hinduja'
      }));
      setSelectedCompanyFilter(targetCompany);
    } catch {
      const resolvedCS = getPrimaryCS(null, 'Healthcare', 'TechCorp Solutions', null);
      setClientDetails((prev) => ({
        ...prev,
        csSpocName: resolvedCS || 'Karan Hinduja'
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleGlobalCompanyUpdate = (e) => {
      const newComp = e.detail?.company || (() => {
        try {
          const u = JSON.parse(localStorage.getItem('logged_in_user') || '{}');
          return u.company;
        } catch { return null; }
      })();
      if (newComp && newComp !== clientDetails.company) {
        setSelectedCompanyFilter(newComp);
        handleCompanyChange(newComp);
      }
    };
    window.addEventListener('company-changed', handleGlobalCompanyUpdate);
    window.addEventListener('user-profile-updated', handleGlobalCompanyUpdate);
    return () => {
      window.removeEventListener('company-changed', handleGlobalCompanyUpdate);
      window.removeEventListener('user-profile-updated', handleGlobalCompanyUpdate);
    };
  }, [clientDetails.company]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-menu-dropdown-wrap')) {
        setActiveActionMenuId(null);
      }
    };
    if (activeActionMenuId) {
      document.addEventListener('click', handleOutsideClick);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setActiveActionMenuId(null);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeActionMenuId]);

  const allCompanyOptions = useMemo(() => {
    const list = new Set();
    try {
      const storedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      if (Array.isArray(storedClients)) {
        storedClients.forEach((c) => {
          const name = c.name || c.companyName || c.clientName || c.corporateName;
          if (name && name !== 'N/A' && name !== 'All') list.add(name);
        });
      }
    } catch { }

    try {
      const storedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      if (Array.isArray(storedOrders)) {
        storedOrders.forEach((o) => {
          const name = o.corporate || o.clientName;
          if (name && name !== 'N/A' && name !== 'All') list.add(name);
        });
      }
    } catch { }

    if (Array.isArray(submissionsList)) {
      submissionsList.forEach((s) => {
        const name = s.clientDetails?.company;
        if (name && name !== 'N/A' && name !== 'All') list.add(name);
      });
    }

    if (list.size === 0) {
      list.add('TechCorp Solutions');
      list.add('Corporate 1');
      list.add('Corporate 2');
    }

    return Array.from(list);
  }, [submissionsList]);

  const handleCompanyChange = (newCompany) => {
    if (!newCompany) return;
    const divisionsList = [];
    let firstDivName = '';
    try {
      const allClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      const matchedClient = Array.isArray(allClients)
        ? allClients.find((c) => (c.name || c.companyName || c.clientName || c.corporateName) === newCompany)
        : null;

      if (matchedClient && Array.isArray(matchedClient.divisions) && matchedClient.divisions.length > 0) {
        matchedClient.divisions.forEach((d) => {
          divisionsList.push({
            id: d.id,
            name: d.divisionName,
            company: newCompany
          });
        });
        firstDivName = matchedClient.divisions[0].divisionName;
      }
    } catch { }

    if (divisionsList.length === 0) {
      divisionsList.push({ id: '1', name: 'Healthcare', company: newCompany });
      firstDivName = 'Healthcare';
    }

    setAvailableDivisions(divisionsList);
    const resolvedCS = getPrimaryCS(null, firstDivName, newCompany, null);

    setClientDetails((prev) => ({
      ...prev,
      company: newCompany,
      selectedDivision: firstDivName || prev.selectedDivision,
      csSpocName: resolvedCS || prev.csSpocName || 'Karan Hinduja'
    }));

    setSelectedCompanyFilter(newCompany);

    // Sync with topbar logged_in_user in localStorage
    try {
      const currentStored = JSON.parse(localStorage.getItem('logged_in_user') || '{}');
      const updatedUser = { ...currentStored, name: clientDetails.name || 'Priya Sharma', company: newCompany };
      localStorage.setItem('logged_in_user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-profile-updated'));
    } catch {}
  };

  // State and helpers for HR Feedback Form link sharing
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareHrName, setShareHrName] = useState('Priya Sharma');
  const [shareHrRole, setShareHrRole] = useState('Head of HR / People Operations');
  const [shareDivision, setShareDivision] = useState('Healthcare');
  const [shareHrEmail, setShareHrEmail] = useState('');

  // Look up comprehensive company profile across cs-admin-clients, submissions, and orders
  const getCompanyProfile = (companyName) => {
    if (!companyName || companyName === 'All') return null;
    const lower = companyName.toLowerCase().trim();

    // 1. Check in cs-admin-clients
    try {
      const storedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      if (Array.isArray(storedClients)) {
        const found = storedClients.find(
          (c) => (c.name || c.companyName || c.clientName || c.corporateName || '').toLowerCase().trim() === lower || String(c.id) === lower
        );
        if (found) {
          const divList = Array.isArray(found.divisions)
            ? found.divisions.map((d) => (typeof d === 'string' ? d : d.name || d.divisionName)).filter(Boolean)
            : [];
          return {
            id: String(found.id || found.corporateId || '1'),
            name: found.name || found.companyName || found.clientName || companyName,
            spocName: found.keySpoc?.name || found.spocName || 'HR Partner',
            spocRole: found.keySpoc?.designation || 'Head of HR / People Operations',
            spocEmail: found.keySpoc?.email || '',
            divisions: divList.length > 0 ? divList : ['Healthcare', 'Corporate Wellness', 'Operations'],
            primaryDivision: divList[0] || 'Healthcare'
          };
        }
      }
    } catch {}

    // 2. Check in submissionsList
    if (Array.isArray(submissionsList)) {
      const foundSub = submissionsList.find(
        (s) => (s.clientDetails?.company || '').toLowerCase().trim() === lower
      );
      if (foundSub?.clientDetails) {
        const cleanCorpId = `CORP-${companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
        return {
          id: cleanCorpId,
          name: foundSub.clientDetails.company || companyName,
          spocName: foundSub.clientDetails.name || 'HR Partner',
          spocRole: 'Head of People Operations',
          spocEmail: '',
          divisions: foundSub.clientDetails.selectedDivision
            ? [foundSub.clientDetails.selectedDivision, 'Operations', 'Corporate Wellness']
            : ['Operations', 'Healthcare'],
          primaryDivision: foundSub.clientDetails.selectedDivision || 'Operations',
          csSpoc: foundSub.clientDetails.csSpocName
        };
      }
    }

    // 3. Check in division_orders
    try {
      const storedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      if (Array.isArray(storedOrders)) {
        const foundOrder = storedOrders.find(
          (o) => (o.corporate || o.clientName || '').toLowerCase().trim() === lower
        );
        if (foundOrder) {
          return {
            id: String(foundOrder.corporateId || `CORP-${companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`),
            name: foundOrder.corporate || foundOrder.clientName || companyName,
            spocName: foundOrder.spocName || 'HR Partner',
            spocRole: 'Corporate HR',
            spocEmail: foundOrder.spocEmail || '',
            divisions: foundOrder.division ? [foundOrder.division, 'Operations'] : ['Operations'],
            primaryDivision: foundOrder.division || 'Operations'
          };
        }
      }
    } catch {}

    const cleanCorpId = `CORP-${companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
    return {
      id: cleanCorpId,
      name: companyName,
      spocName: 'HR Partner',
      spocRole: 'Head of HR / People Operations',
      spocEmail: '',
      divisions: ['All Divisions', 'Operations', 'Engineering', 'HR & People Operations', 'Sales & Marketing'],
      primaryDivision: 'Operations'
    };
  };

  // Pull all users added in Access & Roles against a specific company
  const getAccessRolesUsersForCompany = (companyName) => {
    if (!companyName || companyName === 'All') return [];
    const lower = companyName.toLowerCase().trim();
    const users = [];
    const seen = new Set();

    const addUser = (name, email, role, division = '') => {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanName && !cleanEmail) return;
      const key = `${cleanName.toLowerCase()}_${cleanEmail}`;
      if (seen.has(key)) return;
      seen.add(key);
      users.push({
        id: `usr-${users.length + 1}`,
        name: cleanName || cleanEmail.split('@')[0],
        email: cleanEmail || '',
        role: role || 'HR',
        division: division || ''
      });
    };

    // 1. From localStorage cs-admin-clients (divisions -> roles & invites)
    try {
      const storedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      if (Array.isArray(storedClients)) {
        const matched = storedClients.find(
          c => (c.name || c.companyName || c.clientName || c.corporateName || '').toLowerCase().trim() === lower
        );
        if (matched) {
          if (Array.isArray(matched.divisions)) {
            matched.divisions.forEach(div => {
              const divName = div.divisionName || div.name || '';
              if (Array.isArray(div.roles)) {
                div.roles.forEach(r => addUser(r.name, r.email, r.role, divName));
              }
              try {
                const divRoles1 = JSON.parse(localStorage.getItem('division_roles_' + div.id) || 'null');
                if (Array.isArray(divRoles1)) divRoles1.forEach(r => addUser(r.name, r.email, r.role, divName));
                const divRoles2 = JSON.parse(localStorage.getItem('division_roles_' + divName) || 'null');
                if (Array.isArray(divRoles2)) divRoles2.forEach(r => addUser(r.name, r.email, r.role, divName));
              } catch {}

              if (Array.isArray(div.invites)) {
                div.invites.forEach(inv => addUser(inv.name || inv.email, inv.email, inv.role, divName));
              }
              try {
                const divInvites = JSON.parse(localStorage.getItem('division_invites_' + div.id) || 'null');
                if (Array.isArray(divInvites)) divInvites.forEach(inv => addUser(inv.name || inv.email, inv.email, inv.role, divName));
              } catch {}

              if (div.clientName || div.clientEmail) {
                addUser(div.clientName, div.clientEmail, 'HR', divName);
              }
              if (div.keySpoc?.name || div.keySpoc?.email) {
                addUser(div.keySpoc.name, div.keySpoc.email, div.keySpoc.designation || 'Key SPOC', divName);
              }
            });
          }

          if (Array.isArray(matched.roles)) {
            matched.roles.forEach(r => addUser(r.name, r.email, r.role));
          }
          if (matched.keySpoc?.name || matched.keySpoc?.email) {
            addUser(matched.keySpoc.name, matched.keySpoc.email, matched.keySpoc.designation || 'Key SPOC');
          }
          if (matched.clientName || matched.clientEmail) {
            addUser(matched.clientName, matched.clientEmail, 'HR');
          }
        }
      }
    } catch {}

    // 2. Direct division_roles_ lookup keys
    try {
      const compRoles = JSON.parse(localStorage.getItem('division_roles_' + companyName) || 'null');
      if (Array.isArray(compRoles)) compRoles.forEach(r => addUser(r.name, r.email, r.role));
      const testtRoles = JSON.parse(localStorage.getItem('division_roles_testt') || 'null');
      if (Array.isArray(testtRoles)) testtRoles.forEach(r => addUser(r.name, r.email, r.role));
      const div1Roles = JSON.parse(localStorage.getItem('division_roles_1') || 'null');
      if (Array.isArray(div1Roles)) div1Roles.forEach(r => addUser(r.name, r.email, r.role));
    } catch {}

    // 3. User storage
    try {
      const allUsers = JSON.parse(localStorage.getItem('mc_all_users') || '[]');
      if (Array.isArray(allUsers)) {
        allUsers.forEach(u => {
          if (u.company?.toLowerCase() === lower || u.divisionAccess?.toLowerCase() === lower) {
            addUser(u.name, u.email, u.role, u.divisionAccess);
          }
        });
      }
    } catch {}

    // 4. Past submissions for this company
    try {
      const pastSubs = JSON.parse(localStorage.getItem('mc_cs_feedback_submissions') || '[]');
      if (Array.isArray(pastSubs)) {
        pastSubs.forEach(s => {
          if ((s.clientDetails?.company || '').toLowerCase().trim() === lower) {
            addUser(s.clientDetails.name, s.clientDetails.email || '', s.clientDetails.designation || 'HR', s.clientDetails.selectedDivision || '');
          }
        });
      }
    } catch {}

    // 5. Fallback defaults if no users found yet for this company
    if (users.length === 0) {
      const domainSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company';
      addUser('Priya Sharma', `priya.hr@${domainSlug}.com`, 'HR', 'Healthcare');
      addUser('HR Partner', `hr@${domainSlug}.com`, 'Head of People Operations', 'Corporate');
      addUser('Karan Hinduja', 'hinduja1988@gmail.com', 'Customer Success', 'Healthcare');
    }

    return users;
  };

  // Retrieve all configured divisions for a corporate company
  const getDivisionsForCompany = (companyName) => {
    if (!companyName || companyName === 'All') return ['Healthcare', 'Operations', 'Corporate Wellness'];
    const divSet = new Set();
    const lower = companyName.toLowerCase().trim();

    // 1. Check corporate divisions in cs-admin-clients (from Corporate Tab)
    try {
      const storedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      if (Array.isArray(storedClients)) {
        const matched = storedClients.find(
          c => (c.name || c.companyName || c.clientName || c.corporateName || '').toLowerCase().trim() === lower || String(c.id) === lower
        );
        if (matched && Array.isArray(matched.divisions)) {
          matched.divisions.forEach(d => {
            const name = typeof d === 'string' ? d : (d.divisionName || d.name);
            if (name && name.trim()) divSet.add(name.trim());
          });
        }
      }
    } catch {}

    // 2. Check company profile helper
    const profile = getCompanyProfile(companyName);
    if (profile && Array.isArray(profile.divisions)) {
      profile.divisions.forEach(d => {
        if (d && d.trim()) divSet.add(d.trim());
      });
    }

    // 3. Check division_orders
    try {
      const storedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      if (Array.isArray(storedOrders)) {
        storedOrders.forEach(o => {
          if ((o.corporate || o.clientName || '').toLowerCase().trim() === lower && o.division) {
            divSet.add(o.division.trim());
          }
        });
      }
    } catch {}

    // 4. Check user records for this company
    try {
      const users = getAccessRolesUsersForCompany(companyName);
      if (Array.isArray(users)) {
        users.forEach(u => {
          if (u.division && u.division.trim()) divSet.add(u.division.trim());
        });
      }
    } catch {}

    // Fallback if none found
    if (divSet.size === 0) {
      divSet.add('Healthcare');
      divSet.add('Operations');
      divSet.add('Corporate Wellness');
    }

    return Array.from(divSet);
  };

  // Auto-populate HR details when selected company changes
  useEffect(() => {
    if (!selectedCompanyFilter || selectedCompanyFilter === 'All') return;
    const profile = getCompanyProfile(selectedCompanyFilter);
    if (profile) {
      if (profile.spocName) setShareHrName(profile.spocName);
      if (profile.spocRole) setShareHrRole(profile.spocRole);
      if (profile.spocEmail) setShareHrEmail(profile.spocEmail);
      if (profile.primaryDivision) setShareDivision(profile.primaryDivision);
    }
  }, [selectedCompanyFilter]);

  // Divisions available for the currently selected company
  const companyDivisions = useMemo(() => {
    const profile = getCompanyProfile(selectedCompanyFilter);
    if (profile && Array.isArray(profile.divisions) && profile.divisions.length > 0) {
      return profile.divisions;
    }
    return ['All Divisions', 'Operations', 'Engineering', 'HR & People Operations', 'Sales & Marketing'];
  }, [selectedCompanyFilter]);

  const resolvedCorporateId = useMemo(() => {
    const comp = (!selectedCompanyFilter || selectedCompanyFilter === 'All') ? (clientDetails.company || 'TechCorp Solutions') : selectedCompanyFilter;
    const profile = getCompanyProfile(comp);
    if (profile && profile.id) return profile.id;
    return `CORP-${(comp || '1').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
  }, [selectedCompanyFilter, clientDetails.company]);

  const shareResolvedCsSpoc = useMemo(() => {
    const comp = (!selectedCompanyFilter || selectedCompanyFilter === 'All') ? (clientDetails.company || 'TechCorp Solutions') : selectedCompanyFilter;
    const csFromUtil = getPrimaryCS(null, shareDivision, comp, null);
    if (csFromUtil) return csFromUtil;
    const profile = getCompanyProfile(comp);
    if (profile?.csSpoc) return profile.csSpoc;
    return clientDetails.csSpocName || 'Karan Hinduja';
  }, [shareDivision, selectedCompanyFilter, clientDetails.company, clientDetails.csSpocName]);

  const hrFeedbackShareUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const comp = (!selectedCompanyFilter || selectedCompanyFilter === 'All') ? (clientDetails.company || 'TechCorp Solutions') : selectedCompanyFilter;
    const params = new URLSearchParams();
    if (comp) {
      params.set('company', comp.trim());
    }
    if (resolvedCorporateId) {
      params.set('corporateId', resolvedCorporateId);
    }
    if (shareHrName && shareHrName.trim()) {
      params.set('hrName', shareHrName.trim());
    }
    if (shareHrRole && shareHrRole.trim()) {
      params.set('hrRole', shareHrRole.trim());
    }
    if (shareDivision && shareDivision.trim()) {
      params.set('division', shareDivision.trim());
    }
    if (shareHrEmail && shareHrEmail.trim()) {
      params.set('hrEmail', shareHrEmail.trim());
    }
    if (shareResolvedCsSpoc && shareResolvedCsSpoc.trim()) {
      params.set('csSpoc', shareResolvedCsSpoc.trim());
    }
    const queryStr = params.toString();
    return `${origin}/feedback-form/${encodeURIComponent(resolvedCorporateId)}${queryStr ? '?' + queryStr : ''}`;
  }, [resolvedCorporateId, selectedCompanyFilter, clientDetails.company, shareHrName, shareHrRole, shareDivision, shareHrEmail, shareResolvedCsSpoc]);

  // Real-time synchronization for feedback submissions across tabs & forms
  useEffect(() => {
    const handleFeedbackSync = () => {
      try {
        const stored = localStorage.getItem('mc_cs_feedback_submissions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSubmissionsList(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleFeedbackSync);
    window.addEventListener('cs-feedback-updated', handleFeedbackSync);
    return () => {
      window.removeEventListener('storage', handleFeedbackSync);
      window.removeEventListener('cs-feedback-updated', handleFeedbackSync);
    };
  }, []);

  const handleCopyFeedbackLink = async () => {
    try {
      await navigator.clipboard.writeText(hrFeedbackShareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = hrFeedbackShareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

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
      const updated = [newSubmission, ...existing];
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify(updated));
      setSubmissionsList(updated);
    } catch { }

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

  const calculateFeedbackScore = (ratingsMap) => {
    if (!ratingsMap) return { score: 0, text: 'N/A', color: '#64748b', bg: '#f1f5f9' };
    const scoreMap = { 'Very satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Very dissatisfied': 1 };
    let total = 0;
    let count = 0;
    Object.values(ratingsMap).forEach(v => {
      if (scoreMap[v]) {
        total += scoreMap[v];
        count++;
      }
    });
    if (count === 0) return { score: 0, text: 'N/A', color: '#64748b', bg: '#f1f5f9' };
    const avg = Number((total / count).toFixed(1));
    if (avg >= 4.5) return { score: avg, text: 'Very Satisfied', color: '#166534', bg: '#dcfce7' };
    if (avg >= 3.8) return { score: avg, text: 'Satisfied', color: '#0369a1', bg: '#e0f2fe' };
    if (avg >= 3.0) return { score: avg, text: 'Neutral', color: '#854d0e', bg: '#fef3c7' };
    return { score: avg, text: 'Low / Escalation', color: '#991b1b', bg: '#fee2e2' };
  };

  const handleDeleteSubmission = (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback submission?')) return;
    const updated = submissionsList.filter(s => s.id !== id);
    setSubmissionsList(updated);
    try {
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify(updated));
    } catch {}
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Client Name', 'Company', 'CS SPOC', 'Overall Rating', 'Score', 'Suggestions'];
    const rows = filteredSubmissions.map(s => {
      const { score, text } = calculateFeedbackScore(s.ratings);
      return [
        s.id,
        s.formattedDate,
        `"${s.clientDetails?.name || ''}"`,
        `"${s.clientDetails?.company || ''}"`,
        `"${s.clientDetails?.csSpocName || ''}"`,
        text,
        score,
        `"${(s.clientDetails?.suggestions || '').replace(/"/g, '""')}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feedback_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleOpenShareModal = () => {
    const comp = (selectedCompanyFilter && selectedCompanyFilter !== 'All')
      ? selectedCompanyFilter
      : (clientDetails.company || (() => {
          try {
            return JSON.parse(localStorage.getItem('logged_in_user'))?.company;
          } catch { return 'test'; }
        })() || 'test');

    const users = getAccessRolesUsersForCompany(comp);
    const divisions = getDivisionsForCompany(comp);
    const firstUser = users[0] || { id: 'usr-1', name: 'Priya Sharma', email: 'priya.hr@company.com', role: 'HR', division: divisions[0] || 'Healthcare' };
    const profile = getCompanyProfile(comp);

    setShareModalData({
      company: comp,
      selectedUserId: firstUser.id || 'usr-1',
      hrName: firstUser.name || '',
      hrEmail: firstUser.email || '',
      designation: firstUser.role || 'HR',
      division: firstUser.division || profile?.primaryDivision || divisions[0] || 'Healthcare'
    });
    setIsShareModalOpen(true);
  };

  const createNewSubmissionRecord = (data) => {
    const newId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const newRecord = {
      id: newId,
      timestamp: now.toISOString(),
      formattedDate,
      createdBy: clientDetails.csSpocName || 'Karan Hinduja',
      status: 'Pending',
      clientDetails: {
        name: data.hrName.trim(),
        email: (data.hrEmail || '').trim(),
        company: data.company.trim(),
        designation: (data.designation || 'HR').trim(),
        hrRole: (data.designation || 'HR').trim(),
        csSpocName: clientDetails.csSpocName || 'Karan Hinduja',
        selectedDivision: data.division || 'Healthcare',
        suggestions: '',
        wantsFollowUp: false
      },
      ratings: {},
      lowResponseRemarks: {}
    };

    const updatedList = [newRecord, ...submissionsList];
    setSubmissionsList(updatedList);
    try {
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify(updatedList));
    } catch {}

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cs-feedback-updated', { detail: newRecord }));

    const formLink = `${window.location.origin}/feedback-form/${encodeURIComponent(newId)}`;
    return { newRecord, newId, formLink };
  };

  const handleCreateAndCopyLink = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!shareModalData.company || !shareModalData.hrName.trim()) {
      alert('Please select or specify a user.');
      return;
    }

    const { newId, formLink } = createNewSubmissionRecord(shareModalData);
    try {
      navigator.clipboard.writeText(formLink);
    } catch {}

    triggerToast(`Feedback Form ${newId} created! Link copied to clipboard.`);
    setIsShareModalOpen(false);
  };

  const handleCreateAndEmail = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!shareModalData.company || !shareModalData.hrName.trim()) {
      alert('Please select or specify a user.');
      return;
    }

    const { newId, formLink } = createNewSubmissionRecord(shareModalData);

    const subject = `MantraCare Service Evaluation & Feedback — ${shareModalData.company}`;
    const body = `Dear ${shareModalData.hrName},\n\nWe deeply value our corporate partnership with ${shareModalData.company} and strive to maintain exemplary service standards across all your programs.\n\nTo help us continually elevate service quality and support responsiveness, please take 2-3 minutes to complete our service evaluation:\n\n👉 Complete Feedback Form:\n${formLink}\n\nYour feedback directly influences our support SLAs, provider responsiveness, and account governance.\n\nWarm regards,\nCustomer Success Team\nMantraCare (cs@mantracare.com)`;

    setEmailPreviewData({
      toName: shareModalData.hrName,
      toEmail: shareModalData.hrEmail || 'priya.hr@company.com',
      company: shareModalData.company,
      designation: shareModalData.designation,
      division: shareModalData.division,
      feedbackId: newId,
      formLink,
      subject,
      body
    });

    setIsShareModalOpen(false);
    setIsEmailPreviewOpen(true);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('tab', tab);
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const handleDirectOpenForm = () => {
    // 1. Select the Company as selected on the top
    const targetComp = (selectedCompanyFilter && selectedCompanyFilter !== 'All')
      ? selectedCompanyFilter
      : (localStorage.getItem('selected_company') || clientDetails.company || (() => {
          try {
            return JSON.parse(localStorage.getItem('logged_in_user'))?.company;
          } catch { return 'test'; }
        })() || 'test');

    // 2. Select user as the logged in user
    const loggedInUser = (() => {
      try {
        const stored = localStorage.getItem('logged_in_user');
        if (stored) return JSON.parse(stored);
      } catch {}
      return { name: 'Priya Sharma', company: targetComp, role: 'HR', email: 'priya.hr@company.com' };
    })();

    const profile = getCompanyProfile(targetComp);
    const targetDiv = profile?.primaryDivision || clientDetails.selectedDivision || 'Healthcare';

    // 3. Create the entry of the form with user details same as logged in user
    const newId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const userEmail = (loggedInUser.email || '').trim() || 
      `${(loggedInUser.name || 'user').toLowerCase().replace(/\s+/g, '.')}@${targetComp.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;

    const userRole = (loggedInUser.role || loggedInUser.designation || 'HR').trim();

    const newRecord = {
      id: newId,
      timestamp: now.toISOString(),
      formattedDate,
      createdBy: clientDetails.csSpocName || 'Karan Hinduja',
      status: 'Pending',
      clientDetails: {
        name: (loggedInUser.name || 'Priya Sharma').trim(),
        email: userEmail,
        company: targetComp.trim(),
        designation: userRole,
        hrRole: userRole,
        csSpocName: clientDetails.csSpocName || 'Karan Hinduja',
        selectedDivision: targetDiv,
        suggestions: '',
        wantsFollowUp: false
      },
      ratings: {},
      lowResponseRemarks: {}
    };

    const updatedList = [newRecord, ...submissionsList];
    setSubmissionsList(updatedList);
    try {
      localStorage.setItem('mc_cs_feedback_submissions', JSON.stringify(updatedList));
    } catch {}

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('cs-feedback-updated', { detail: newRecord }));

    // 4. Directly open the feedback form in a new tab
    const formUrl = `/feedback-form/${encodeURIComponent(newId)}`;
    window.open(formUrl, '_blank');

    triggerToast(`Created & opened Feedback Form #${newId} for ${loggedInUser.name} (${targetComp})!`);
  };

  const handleCopySingleFormLink = async (id, company) => {
    const cleanLink = `${window.location.origin}/feedback-form/${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(cleanLink);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = cleanLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    triggerToast(`Copied form link for ${company || id} to clipboard!`);
  };

  const uniqueSubmissionCompanies = Array.from(new Set(submissionsList.map(s => s.clientDetails?.company).filter(Boolean)));

  const filteredSubmissions = submissionsList.filter(s => {
    if (selectedCompanyFilter !== 'All' && s.clientDetails?.company !== selectedCompanyFilter) return false;
    if (selectedStatusFilter !== 'All' && (s.status || 'Submitted') !== selectedStatusFilter) return false;

    const { text } = calculateFeedbackScore(s.ratings);
    if (selectedSentimentFilter === 'Positive' && text !== 'Very Satisfied' && text !== 'Satisfied') return false;
    if (selectedSentimentFilter === 'Neutral' && text !== 'Neutral') return false;
    if (selectedSentimentFilter === 'Low' && text !== 'Low / Escalation') return false;

    if (submissionsSearch.trim()) {
      const q = submissionsSearch.toLowerCase();
      const matchName = s.clientDetails?.name?.toLowerCase().includes(q);
      const matchComp = s.clientDetails?.company?.toLowerCase().includes(q);
      const matchSpoc = s.clientDetails?.csSpocName?.toLowerCase().includes(q);
      const matchId = s.id?.toLowerCase().includes(q);
      const matchRemarks = s.clientDetails?.suggestions?.toLowerCase().includes(q);
      const matchCreatedBy = s.createdBy?.toLowerCase().includes(q);
      const matchDesignation = (s.clientDetails?.designation || s.clientDetails?.hrRole || '').toLowerCase().includes(q);
      const matchStatus = (s.status || '').toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchSpoc && !matchId && !matchRemarks && !matchCreatedBy && !matchDesignation && !matchStatus) return false;
    }
    return true;
  });

  // Calculate metrics
  const totalSubmissionsCount = submissionsList.length;
  let totalScoreSum = 0;
  let scoredCount = 0;
  let positiveCount = 0;
  let lowCount = 0;

  submissionsList.forEach(s => {
    const { score, text } = calculateFeedbackScore(s.ratings);
    if (score > 0) {
      totalScoreSum += score;
      scoredCount++;
    }
    if (text === 'Very Satisfied' || text === 'Satisfied') positiveCount++;
    if (text === 'Low / Escalation') lowCount++;
  });

  const avgSatisfaction = scoredCount > 0 ? (totalScoreSum / scoredCount).toFixed(1) : '5.0';
  const positiveRatio = totalSubmissionsCount > 0 ? Math.round((positiveCount / totalSubmissionsCount) * 100) : 100;

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
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
            Feedback
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Corporate Health Partner Evaluation • Granular Delivery Analysis ({PILLAR_QUESTIONS.length} Dimensions)
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Tab 1: Feedback Directory (Table) */}
            <button
              onClick={() => handleTabClick('submissions')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'submissions' ? '#034ea2' : '#ffffff',
                color: activeTab === 'submissions' ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: activeTab === 'submissions' ? '0 2px 6px rgba(3, 78, 162, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="bx bx-table"></i>
              <span>Feedback Directory</span>
              <span style={{
                background: activeTab === 'submissions' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'submissions' ? '#ffffff' : '#475569',
                padding: '0.1rem 0.5rem',
                borderRadius: '999px',
                fontSize: '0.75rem'
              }}>
                {submissionsList.length}
              </span>
            </button>

            {/* Tab 2: Escalation Matrix */}
            <button
              onClick={() => handleTabClick('matrix')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'matrix' ? '#034ea2' : '#ffffff',
                color: activeTab === 'matrix' ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: activeTab === 'matrix' ? '0 2px 6px rgba(3, 78, 162, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="bx bx-shield-quarter"></i>
              <span>Escalation Matrix</span>
            </button>

            {/* Tab 3: Summary */}
            <button
              onClick={() => handleTabClick('summary')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'summary' ? '#034ea2' : '#ffffff',
                color: activeTab === 'summary' ? '#ffffff' : '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: activeTab === 'summary' ? '0 2px 6px rgba(3, 78, 162, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="bx bx-bar-chart-alt-2"></i>
              <span>Summary</span>
            </button>
          </div>

          {/* Action Buttons: Share Form & Open Form */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleOpenShareModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #034ea2 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
              }}
              title="Share form link with HR partner via modal"
            >
              <i className="bx bx-share-alt" style={{ fontSize: '1.15rem' }}></i>
              <span>Share Form</span>
            </button>

            <button
              type="button"
              onClick={handleDirectOpenForm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#eff6ff',
                color: '#034ea2',
                border: '1px solid #bfdbfe',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(3, 78, 162, 0.1)'
              }}
              title="Directly create entry for logged-in user & selected company and open form"
            >
              <i className="bx bx-open-in-new" style={{ fontSize: '1.15rem' }}></i>
              <span>Open Form</span>
            </button>
          </div>
        </div>

        {/* OPEN FORM TAB */}
        {(activeTab === 'open-form' || activeTab === 'survey') && (
          <div style={{ maxWidth: '860px', margin: '0 auto 1.5rem auto' }}>
            {/* Open Form Setup Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#034ea2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem'
                }}>
                  <i className='bx bx-open-in-new'></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                    Open Form for Client Feedback
                  </h2>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Enter client and HR contact information to launch the service evaluation form.
                  </p>
                </div>
              </div>

              {/* Form to take required information */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const targetComp = openFormPageData.company || clientDetails.company || 'TechCorp Solutions';
                const profile = getCompanyProfile(targetComp);
                handleConfirmOpenForm(e, {
                  company: targetComp,
                  hrName: openFormPageData.hrName || clientDetails.name || profile?.spocName || 'HR Partner',
                  designation: openFormPageData.designation || 'HR',
                  division: openFormPageData.division || clientDetails.selectedDivision || 'Healthcare',
                  csSpoc: openFormPageData.csSpoc || clientDetails.csSpocName || 'Karan Hinduja'
                });
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  {/* Company */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                      Company Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={openFormPageData.company || clientDetails.company}
                      onChange={(e) => {
                        const newComp = e.target.value;
                        const prof = getCompanyProfile(newComp);
                        setOpenFormPageData((prev) => ({
                          ...prev,
                          company: newComp,
                          hrName: prof?.spocName || prev.hrName,
                          division: prof?.primaryDivision || prev.division
                        }));
                        handleCompanyChange(newComp);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      {allCompanyOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* HR Contact Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                      HR Contact Person Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={openFormPageData.hrName !== undefined ? openFormPageData.hrName : clientDetails.name}
                      onChange={(e) => {
                        setOpenFormPageData({ ...openFormPageData, hrName: e.target.value });
                        setClientDetails({ ...clientDetails, name: e.target.value });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                      Designation <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HR / Head of People Operations"
                      value={openFormPageData.designation || 'HR'}
                      onChange={(e) => setOpenFormPageData({ ...openFormPageData, designation: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Corporate Division */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                      Division / Branch
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Healthcare, Operations"
                      value={openFormPageData.division || clientDetails.selectedDivision || 'Healthcare'}
                      onChange={(e) => {
                        setOpenFormPageData({ ...openFormPageData, division: e.target.value });
                        handleDivisionChange(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.35rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0284c7 0%, #034ea2 100%)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <i className='bx bx-open-in-new' style={{ fontSize: '1.1rem' }}></i>
                    <span>Open Form in New Tab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenFormInlineMode(!openFormInlineMode)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: openFormInlineMode ? '#f1f5f9' : '#ffffff',
                      color: '#334155',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <i className={openFormInlineMode ? 'bx bx-chevron-up' : 'bx bx-edit-alt'}></i>
                    <span>{openFormInlineMode ? 'Hide In-Page Survey' : 'Fill Form Here Now'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* In-Page Survey Container (only shown when user clicks Fill Form Here Now, or when submitted) */}
            {(openFormInlineMode || submitted) && (
              <>
                <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
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
                            padding: '0.60rem 0.75rem',
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
                          padding: '0.60rem 0.75rem',
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

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('submissions');
                    setSubmitted(false);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    border: '1px solid #0284c7',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <i className="bx bx-folder-open"></i>
                  <span>View in Submissions Directory ({submissionsList.length})</span>
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
              </>
            )}
          </div>
        )}

        {/* ESCALATION MATRIX TAB */}
        {activeTab === 'matrix' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
            {/* Header & Overview Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#034ea2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem'
                  }}>
                    <i className='bx bx-shield-quarter'></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Customer Service Escalation Matrix
                      </h2>
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#034ea2', background: '#e0f2fe', padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                        8-Tier SLA Protocol
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                      Standard operational resolution SLAs, complaint workflows, and intervention triggers across support tiers.
                    </p>
                  </div>
                </div>
              </div>

              {/* SLA Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginTop: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>Tier 1 - 2: Frontline Support</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>15m – 1hr Response</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Call Center Rep & Support Manager triage</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#ea580c', textTransform: 'uppercase' }}>Tier 3 - 4: Account & Sales</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>1hr – 5hr Resolution</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Manager & Sales Manager incident review</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' }}>Tier 5 - 8: Leadership & Exec</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>1 – 3 Business Days</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Director, Stakeholders & Senior Management sign-off</div>
                </div>
              </div>
            </div>

            {/* Matrix Table Container */}
            <div
              style={{
                marginTop: '1.25rem',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
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
    )}

    {/* SUBMISSIONS DIRECTORY (DIRECT TABLE VIEW MATCHING USER SCREENSHOT) */}
    {activeTab === 'submissions' && (
      <div>
        {/* Filter Controls Bar */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
            <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
            <input
              type="text"
              placeholder="Search by client name, company, SPOC, remarks, ID..."
              value={submissionsSearch}
              onChange={e => setSubmissionsSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Dropdown Filters & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Company Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Company:</label>
              <select
                value={selectedCompanyFilter}
                onChange={e => {
                  setSelectedCompanyFilter(e.target.value);
                  handleCompanyChange(e.target.value);
                }}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: 'white',
                  color: '#0f172a'
                }}
              >
                {allCompanyOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sentiment Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Sentiment:</label>
              <select
                value={selectedSentimentFilter}
                onChange={e => setSelectedSentimentFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: 'white',
                  color: '#0f172a'
                }}
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive (Satisfied+)</option>
                <option value="Neutral">Neutral</option>
                <option value="Low">Low / Escalations</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Status:</label>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: 'white',
                  color: '#0f172a'
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Directory Table */}
        <div style={{
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          {filteredSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
              <i className='bx bx-message-rounded-x' style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.5rem' }}></i>
              <p style={{ margin: 0, fontWeight: '600' }}>No feedback submissions match your filter.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', minHeight: filteredSubmissions.length <= 3 ? '220px' : 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Feedback ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Created By</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                    <th style={{ padding: '0.75rem 1rem' }}>HR Contact & Designation</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Overall Satisfaction</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((item, rowIndex) => {
                    const isPending = item.status === 'Pending';
                    const { score, text, color, bg } = calculateFeedbackScore(item.ratings);

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#034ea2', whiteSpace: 'nowrap' }}>
                          {item.id}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.84rem' }}>
                            {item.createdBy || 'CS Team'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                            {item.formattedDate || new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <i className='bx bx-buildings'></i>
                            <span>{item.clientDetails?.company || 'Company'}</span>
                          </div>
                          {item.clientDetails?.selectedDivision && (
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                              Div: {item.clientDetails.selectedDivision}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>
                            {item.clientDetails?.name || 'HR Contact'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: '500', display: 'inline-block', background: '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '4px', marginTop: '0.15rem' }}>
                            {item.clientDetails?.designation || item.clientDetails?.hrRole || 'HR'}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          {isPending ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: '#fef3c7',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '700'
                            }}>
                              <i className='bx bx-time'></i>
                              <span>Pending</span>
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '700'
                            }}>
                              <i className='bx bx-check-circle'></i>
                              <span>Submitted</span>
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {isPending ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#f8fafc', color: '#94a3b8', fontSize: '0.78rem', fontStyle: 'italic', border: '1px dashed #cbd5e1' }}>
                              <i className='bx bx-hourglass'></i>
                              <span>Awaiting Response</span>
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: bg, color: color, fontWeight: '700', fontSize: '0.8rem' }}>
                              <i className={score >= 4.0 ? 'bx bx-smile' : score >= 3.0 ? 'bx bx-meh' : 'bx bx-sad'}></i>
                              <span>{text} ({score} / 5)</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center', justifyContent: 'center' }}>
                            {/* 1. Copy Icon */}
                            <button
                              type="button"
                              onClick={() => handleCopySingleFormLink(item.id, item.clientDetails?.company)}
                              title="Copy Form Link"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#0284c7',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e0f2fe';
                                e.currentTarget.style.borderColor = '#38bdf8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                            >
                              <i className='bx bx-copy'></i>
                            </button>

                            {/* 2. View Icon or Edit Icon */}
                            {item.status === 'Submitted' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedInspectItem(item)}
                                title="View Filled Form"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: '1px solid #93c5fd',
                                  background: '#eff6ff',
                                  color: '#034ea2',
                                  cursor: 'pointer',
                                  fontSize: '1.05rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dbeafe';
                                  e.currentTarget.style.borderColor = '#60a5fa';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#eff6ff';
                                  e.currentTarget.style.borderColor = '#93c5fd';
                                }}
                              >
                                <i className='bx bx-show'></i>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => window.open(`/feedback-form/${encodeURIComponent(item.id)}`, '_blank')}
                                title="Edit / Open Form"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: '1px solid #fde68a',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  cursor: 'pointer',
                                  fontSize: '1.05rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fef08a';
                                  e.currentTarget.style.borderColor = '#f59e0b';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fef3c7';
                                  e.currentTarget.style.borderColor = '#fde68a';
                                }}
                              >
                                <i className='bx bx-edit-alt'></i>
                              </button>
                            )}

                            {/* 3. 3 Dots Icon (Options: View Details, Delete) */}
                            <div className="action-menu-dropdown-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(prev => prev === item.id ? null : item.id);
                                }}
                                title="More Options"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: activeActionMenuId === item.id ? '1px solid #034ea2' : '1px solid #cbd5e1',
                                  background: activeActionMenuId === item.id ? '#eff6ff' : '#f8fafc',
                                  color: activeActionMenuId === item.id ? '#034ea2' : '#64748b',
                                  cursor: 'pointer',
                                  fontSize: '1.15rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (activeActionMenuId !== item.id) {
                                    e.currentTarget.style.background = '#f1f5f9';
                                    e.currentTarget.style.color = '#1e293b';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (activeActionMenuId !== item.id) {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.color = '#64748b';
                                  }
                                }}
                              >
                                <i className='bx bx-dots-vertical-rounded'></i>
                              </button>

                              {activeActionMenuId === item.id && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: rowIndex >= filteredSubmissions.length - 2 && filteredSubmissions.length > 2 ? 'auto' : 'calc(100% + 4px)',
                                    bottom: rowIndex >= filteredSubmissions.length - 2 && filteredSubmissions.length > 2 ? 'calc(100% + 4px)' : 'auto',
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                                    minWidth: '150px',
                                    zIndex: 100,
                                    padding: '0.35rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    textAlign: 'left'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* View Details Option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDetailsItem(item);
                                      setActiveActionMenuId(null);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.55rem',
                                      width: '100%',
                                      padding: '0.5rem 0.75rem',
                                      border: 'none',
                                      background: 'transparent',
                                      borderRadius: '6px',
                                      color: '#334155',
                                      fontSize: '0.82rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#f1f5f9';
                                      e.currentTarget.style.color = '#034ea2';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.color = '#334155';
                                    }}
                                  >
                                    <i className='bx bx-info-circle' style={{ fontSize: '1rem', color: '#034ea2' }}></i>
                                    <span>View Details</span>
                                  </button>

                                  {/* Score Explanation Option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedScoreExplainItem(item);
                                      setActiveActionMenuId(null);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.55rem',
                                      width: '100%',
                                      padding: '0.5rem 0.75rem',
                                      border: 'none',
                                      background: 'transparent',
                                      borderRadius: '6px',
                                      color: '#334155',
                                      fontSize: '0.82rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#f0f9ff';
                                      e.currentTarget.style.color = '#0284c7';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.color = '#334155';
                                    }}
                                  >
                                    <i className='bx bx-calculator' style={{ fontSize: '1rem', color: '#0284c7' }}></i>
                                    <span>Score Explanation</span>
                                  </button>

                                  {/* Delete Option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleDeleteSubmission(item.id);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.55rem',
                                      width: '100%',
                                      padding: '0.5rem 0.75rem',
                                      border: 'none',
                                      background: 'transparent',
                                      borderRadius: '6px',
                                      color: '#dc2626',
                                      fontSize: '0.82rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#fee2e2';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'transparent';
                                    }}
                                  >
                                    <i className='bx bx-trash' style={{ fontSize: '1rem', color: '#dc2626' }}></i>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}

    {/* SUMMARY TAB (RETAINED FOR ARCHIVAL & REFERENCE) */}
    {activeTab === 'summary' && (
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
        {/* Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e0f2fe',
              color: '#034ea2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              <i className='bx bx-bar-chart-alt-2'></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                Feedback Performance & Service Summary
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Aggregated client satisfaction metrics, sentiment distribution, and pillar evaluations (retained for reference).
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: '600' }}>
            Reference & Archival
          </span>
        </div>

        {/* Metric KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Feedbacks</span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#034ea2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                <i className='bx bx-message-square-detail'></i>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
              {totalSubmissionsCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
              Across {uniqueSubmissionCompanies.length} client organizations
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CS Satisfaction Index</span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                <i className='bx bx-star'></i>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <span>{avgSatisfaction}</span>
              <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600' }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <i className='bx bx-trending-up'></i> High Service Quality Benchmark
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Positive Sentiment</span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                <i className='bx bx-smile'></i>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0369a1' }}>
              {positiveRatio}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
              Rated Very Satisfied or Satisfied
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Escalation Alerts</span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                <i className='bx bx-error-circle'></i>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: lowCount > 0 ? '#b91c1c' : '#0f172a' }}>
              {lowCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: lowCount > 0 ? '#b91c1c' : '#64748b', marginTop: '0.3rem' }}>
              {lowCount > 0 ? 'Requires CS SPOC follow-up' : 'Zero active escalations'}
            </div>
          </div>
        </div>

        {/* Sentiment Distribution Breakdown */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
            Sentiment Distribution Across Feedbacks
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534' }}>Positive (Satisfied+)</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#15803d' }}>{positiveCount}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>
                {totalSubmissionsCount > 0 ? Math.round((positiveCount / totalSubmissionsCount) * 100) : 0}% of all responses
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#92400e' }}>Neutral</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#b45309' }}>
                  {totalSubmissionsCount - positiveCount - lowCount > 0 ? totalSubmissionsCount - positiveCount - lowCount : 0}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#b45309' }}>
                Requires monitoring for service lift
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#991b1b' }}>Low / Escalation</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#dc2626' }}>{lowCount}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#dc2626' }}>
                Follow-up required per Escalation SLA
              </div>
            </div>
          </div>
        </div>

        {/* 10 Granular Dimensions Summary */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
            Service Evaluation ({PILLAR_QUESTIONS.length} Dimensions Overview)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {PILLAR_QUESTIONS.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <i className={`bx ${q.icon}`} style={{ color: '#034ea2', fontSize: '1.1rem' }}></i>
                  <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
                    {q.shortLabel}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                  {q.category} • {q.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* FULL FEEDBACK INSPECTION MODAL */}
    {selectedInspectItem && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', color: '#034ea2', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                <i className='bx bx-detail'></i>
                <span>EVALUATION REPORT #{selectedInspectItem.id}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                {selectedInspectItem.clientDetails?.company}
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Submitted by <strong>{selectedInspectItem.clientDetails?.name}</strong> • CS SPOC: <strong style={{ color: '#034ea2' }}>{selectedInspectItem.clientDetails?.csSpocName}</strong> • {selectedInspectItem.formattedDate}
              </p>
            </div>

            <button
              onClick={() => setSelectedInspectItem(null)}
              style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            >
              <i className='bx bx-x' style={{ fontSize: '1.3rem' }}></i>
            </button>
          </div>

          {/* Respondent & Follow-up banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Division</span>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>{selectedInspectItem.clientDetails?.selectedDivision || 'Default'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Follow-up Request</span>
              <div>
                {selectedInspectItem.clientDetails?.wantsFollowUp ? (
                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Requested Meeting
                  </span>
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.82rem' }}>No meeting requested</span>
                )}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Overall Assessment</span>
              <div>
                {(() => {
                  const { score, text, color, bg } = calculateFeedbackScore(selectedInspectItem.ratings);
                  return (
                    <span style={{ background: bg, color: color, padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '800' }}>
                      {text} ({score}/5)
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* All 10 Dimension Questions Breakdown */}
          <div style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Granular Ratings Breakdown ({PILLAR_QUESTIONS.length} Dimensions)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {PILLAR_QUESTIONS.map((q, idx) => {
              const ans = selectedInspectItem.ratings[q.id];
              const remark = selectedInspectItem.lowResponseRemarks?.[q.id];

              return (
                <div
                  key={q.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <span style={{ width: '22px', height: '22px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                          {q.shortLabel}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {q.category}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      background: ans === 'Very satisfied' ? '#dcfce7' : ans === 'Satisfied' ? '#e0f2fe' : ans === 'Neutral' ? '#fef3c7' : '#fee2e2',
                      color: ans === 'Very satisfied' ? '#166534' : ans === 'Satisfied' ? '#0369a1' : ans === 'Neutral' ? '#92400e' : '#991b1b',
                      whiteSpace: 'nowrap'
                    }}>
                      {ans || 'Not answered'}
                    </span>
                  </div>

                  {remark && (
                    <div style={{ marginTop: '0.5rem', padding: '0.45rem 0.75rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', fontSize: '0.78rem', color: '#991b1b' }}>
                      <i className='bx bx-error' style={{ marginRight: '0.35rem' }}></i>
                      <strong>Reported Issue:</strong> {remark}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Respondent Suggestions */}
          {selectedInspectItem.clientDetails?.suggestions && (
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Client's Written Suggestions & Comments
              </div>
              <div style={{ fontSize: '0.92rem', color: '#0f172a', fontStyle: 'italic', lineHeight: '1.5' }}>
                "{selectedInspectItem.clientDetails.suggestions}"
              </div>
            </div>
          )}

          {/* Close Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <button
              onClick={() => setSelectedInspectItem(null)}
              style={{
                padding: '0.6rem 1.4rem',
                background: '#034ea2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Close Evaluation
            </button>
          </div>
        </div>
      </div>
    )}

    {/* SCORE EXPLANATION & DERIVATION MODAL */}
    {selectedScoreExplainItem && (() => {
      const item = selectedScoreExplainItem;
      const ratingsMap = item.ratings || {};
      const scoreMap = { 'Very satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Very dissatisfied': 1 };
      
      // Calculate breakdown metrics
      let totalPoints = 0;
      let validQuestionsCount = 0;
      let excludedCount = 0;
      const pointsList = [];

      PILLAR_QUESTIONS.forEach((q, idx) => {
        const userChoice = ratingsMap[q.id];
        if (scoreMap[userChoice]) {
          const pts = scoreMap[userChoice];
          totalPoints += pts;
          validQuestionsCount++;
          pointsList.push({ qNo: `Q${idx + 1}`, label: q.shortLabel, pts });
        } else if (userChoice === 'Not a part of SOW / No session done') {
          excludedCount++;
        }
      });

      const { score, text, color, bg } = calculateFeedbackScore(ratingsMap);
      const isPending = item.status === 'Pending' || validQuestionsCount === 0;

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem'
                }}>
                  <i className='bx bx-calculator'></i>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                      Score Explanation & Derivation
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: '#eff6ff',
                      color: '#034ea2'
                    }}>
                      {item.id}
                    </span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {item.clientDetails?.company || 'Company'} • HR Contact: {item.clientDetails?.name || 'HR Partner'} ({item.clientDetails?.designation || 'HR'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScoreExplainItem(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.15s ease'
                }}
                title="Close modal"
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Question-by-Question Breakdown Card */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <i className='bx bx-list-check' style={{ color: '#0284c7' }}></i>
                    <span>Question-by-Question Score Breakdown</span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    10 Evaluation Pillars
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {PILLAR_QUESTIONS.map((q, idx) => {
                    const userSelection = ratingsMap[q.id];
                    const ptsEarned = scoreMap[userSelection];
                    const isNa = userSelection === 'Not a part of SOW / No session done';

                    return (
                      <div
                        key={q.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        {/* Question Title & Category */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.55rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#034ea2',
                              fontWeight: '800',
                              fontSize: '0.74rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              Q{idx + 1}
                            </span>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                                {q.title.replace(/\s*\*$/, '')}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                                {q.description}
                              </div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                          }}>
                            {q.category}
                          </span>
                        </div>

                        {/* Options Score Matrix */}
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '0.45rem 0.75rem',
                          marginBottom: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          fontSize: '0.74rem'
                        }}>
                          <span style={{ fontWeight: '700', color: '#64748b' }}>Score for each option:</span>
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: '700' }}>
                            Very satisfied: 5
                          </span>
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: '700' }}>
                            Satisfied: 4
                          </span>
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fef3c7', color: '#854d0e', fontWeight: '700' }}>
                            Neutral: 3
                          </span>
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontWeight: '700' }}>
                            Dissatisfied: 2
                          </span>
                          <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', fontWeight: '700' }}>
                            Very dissatisfied: 1
                          </span>
                          {q.allowNotApplicable && (
                            <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}>
                              Not in SOW: Excluded (N/A)
                            </span>
                          )}
                        </div>

                        {/* User Selection & Points Awarded */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px dashed #e2e8f0',
                          paddingTop: '0.55rem',
                          fontSize: '0.82rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>User Selection:</span>
                            {userSelection ? (
                              <span style={{
                                fontWeight: '700',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                background: ptsEarned === 5 ? '#dcfce7' : ptsEarned === 4 ? '#e0f2fe' : ptsEarned === 3 ? '#fef3c7' : isNa ? '#f1f5f9' : '#fee2e2',
                                color: ptsEarned === 5 ? '#166534' : ptsEarned === 4 ? '#0369a1' : ptsEarned === 3 ? '#854d0e' : isNa ? '#475569' : '#991b1b',
                                border: '1px solid currentColor'
                              }}>
                                {userSelection}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                Not Selected / Pending
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>Score for Question:</span>
                            {ptsEarned !== undefined ? (
                              <span style={{
                                fontWeight: '800',
                                fontSize: '0.88rem',
                                color: ptsEarned >= 4 ? '#166534' : ptsEarned === 3 ? '#b45309' : '#dc2626'
                              }}>
                                {ptsEarned} / 5 Points
                              </span>
                            ) : isNa ? (
                              <span style={{ fontWeight: '700', color: '#64748b', fontSize: '0.78rem' }}>
                                Excluded from calculation (SOW N/A)
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>
                                0 Points (Pending)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: THE CALCULATION & MATHEMATICAL DERIVATION */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 4px 12px rgba(3, 78, 162, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#034ea2',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem'
                  }}>
                    <i className='bx bx-math'></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                      Overall Satisfaction Calculation & Derivation
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                      Exact formula and arithmetic steps used to compute the overall rating
                    </p>
                  </div>
                </div>

                {/* Calculation Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      Total Points Earned
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#034ea2', marginTop: '0.2rem' }}>
                      {totalPoints} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>Points</span>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      Valid Scored Questions (N)
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                      {validQuestionsCount} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>/ 10 Rated</span>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      Average Score
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                      {validQuestionsCount > 0 ? (totalPoints / validQuestionsCount).toFixed(2) : '0.00'} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>/ 5.0</span>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      Final Overall Satisfaction
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: bg,
                      color: color,
                      fontWeight: '800',
                      fontSize: '0.92rem',
                      marginTop: '0.35rem'
                    }}>
                      <i className={score >= 4.0 ? 'bx bx-smile' : score >= 3.0 ? 'bx bx-meh' : 'bx bx-sad'}></i>
                      <span>{text} ({score} / 5)</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Derivation Explanation */}
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.65rem' }}>
                    Step-by-Step Derivation Walkthrough:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: '#334155' }}>
                    {/* Step 1 */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: '#034ea2' }}>1. Sum of Points:</span>
                      <div>
                        {pointsList.length > 0 ? (
                          <>
                            {pointsList.map(p => `${p.qNo} (${p.pts})`).join(' + ')} = <strong style={{ color: '#034ea2' }}>{totalPoints} Points</strong>
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No questions answered yet (0 Points)</span>
                        )}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: '#034ea2' }}>2. Valid Questions Count:</span>
                      <div>
                        <strong>{validQuestionsCount} valid questions</strong> were scored.
                        {excludedCount > 0 && ` (${excludedCount} questions marked 'Not a part of SOW' were strictly excluded from the divisor).`}
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: '#034ea2' }}>3. Arithmetic Average:</span>
                      <div>
                        <code>Score = Total Points ÷ Valid Questions = {totalPoints} ÷ {validQuestionsCount || 1} = <strong>{validQuestionsCount > 0 ? (totalPoints / validQuestionsCount).toFixed(2) : '0.00'}</strong></code>
                        {' ➔ '}Rounded to 1 decimal place = <strong style={{ color: '#034ea2' }}>{score} / 5.0</strong>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: '#034ea2' }}>4. Sentiment Threshold Matching:</span>
                      <div>
                        Since the rounded score is <strong>{score}</strong>:
                        <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
                          <li style={{ color: score >= 4.5 ? '#166534' : '#64748b', fontWeight: score >= 4.5 ? '800' : 'normal' }}>
                            Score ≥ 4.5 ➔ <strong>Very Satisfied</strong> {score >= 4.5 && '✓ (Active Match)'}
                          </li>
                          <li style={{ color: score >= 3.8 && score < 4.5 ? '#0369a1' : '#64748b', fontWeight: score >= 3.8 && score < 4.5 ? '800' : 'normal' }}>
                            3.8 ≤ Score &lt; 4.5 ➔ <strong>Satisfied</strong> {score >= 3.8 && score < 4.5 && '✓ (Active Match)'}
                          </li>
                          <li style={{ color: score >= 3.0 && score < 3.8 ? '#854d0e' : '#64748b', fontWeight: score >= 3.0 && score < 3.8 ? '800' : 'normal' }}>
                            3.0 ≤ Score &lt; 3.8 ➔ <strong>Neutral</strong> {score >= 3.0 && score < 3.8 && '✓ (Active Match)'}
                          </li>
                          <li style={{ color: score < 3.0 && validQuestionsCount > 0 ? '#991b1b' : '#64748b', fontWeight: score < 3.0 && validQuestionsCount > 0 ? '800' : 'normal' }}>
                            Score &lt; 3.0 ➔ <strong>Low / Escalation</strong> {score < 3.0 && validQuestionsCount > 0 && '✓ (Active Match)'}
                          </li>
                        </ul>
                        <div style={{ marginTop: '0.45rem', fontWeight: '700', color: color }}>
                          Result displayed in table: {text} ({score} / 5)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setSelectedScoreExplainItem(null)}
                style={{
                  padding: '0.55rem 1.4rem',
                  borderRadius: '8px',
                  background: '#034ea2',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close Score Explanation
              </button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* SHARE FEEDBACK FORM MODAL */}
    {isShareModalOpen && (() => {
      const currentComp = shareModalData.company || selectedCompanyFilter || clientDetails.company || (() => {
        try {
          return JSON.parse(localStorage.getItem('logged_in_user'))?.company;
        } catch { return 'test'; }
      })() || 'test';
      const availableUsers = getAccessRolesUsersForCompany(currentComp);
      const companyDivisions = (() => {
        const list = getDivisionsForCompany(currentComp);
        if (shareModalData.division && !list.includes(shareModalData.division)) {
          return [shareModalData.division, ...list];
        }
        return list;
      })();

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to right, #eff6ff, #ffffff)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#034ea2',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  <i className='bx bx-share-alt'></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                    Share Form
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Select recipient from Access & Roles to create and share feedback form
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'background 0.15s ease'
                }}
                title="Close modal"
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Select User (Pull all users added in Access & Roles against this company) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Select User <span style={{ color: '#ef4444' }}>*</span>
                    <span style={{ fontWeight: 'normal', color: '#64748b', fontSize: '0.75rem', marginLeft: '0.35rem' }}>
                      (From Access & Roles against {currentComp})
                    </span>
                  </label>
                  <select
                    value={shareModalData.selectedUserId || (availableUsers[0]?.id || '')}
                    onChange={(e) => {
                      const sel = availableUsers.find(u => u.id === e.target.value);
                      if (sel) {
                        setShareModalData(prev => ({
                          ...prev,
                          selectedUserId: sel.id,
                          hrName: sel.name,
                          hrEmail: sel.email,
                          designation: sel.role || 'HR',
                          division: sel.division || prev.division
                        }));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role} ({u.email || 'No email'})
                      </option>
                    ))}
                  </select>

                  {/* Selected User & Email single-line info */}
                  {shareModalData.hrName && (
                    <div style={{
                      marginTop: '0.45rem',
                      fontSize: '0.82rem',
                      color: '#475569',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <i className='bx bx-user' style={{ color: '#0284c7', fontSize: '0.92rem' }}></i>
                      <span>
                        {shareModalData.hrName}{shareModalData.hrEmail ? `, ${shareModalData.hrEmail}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Designation (Editable, prefilled with role assigned in Corporate Tab) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                      Designation <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                      Prefilled from Corporate Tab • Editable
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HR / Head of People Operations"
                    value={shareModalData.designation}
                    onChange={(e) => setShareModalData({ ...shareModalData, designation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Division / Branch Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Division / Branch <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={shareModalData.division || (companyDivisions[0] || 'Healthcare')}
                    onChange={(e) => setShareModalData({ ...shareModalData, division: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {companyDivisions.map((divName) => (
                      <option key={divName} value={divName}>
                        {divName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Workflow explanation note */}
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '0.75rem 0.95rem',
                  fontSize: '0.78rem',
                  color: '#0369a1',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start'
                }}>
                  <i className='bx bx-info-circle' style={{ fontSize: '1.1rem', marginTop: '0.05rem', flexShrink: 0 }}></i>
                  <div>
                    A new entry with status <strong>Pending</strong> will be created in Submission Details with Company, HR name, and Designation pre-mapped.
                  </div>
                </div>
              </div>

              {/* Modal Actions: Keep 2 buttons (Create & Copy | Create & Email), No Cancel button */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={handleCreateAndCopyLink}
                  style={{
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    border: '1px solid #0284c7',
                    background: '#eff6ff',
                    color: '#034ea2',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 1px 3px rgba(3, 78, 162, 0.1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className='bx bx-copy' style={{ fontSize: '1.05rem' }}></i>
                  <span>Create & Copy</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateAndEmail}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #034ea2 100%)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 2px 5px rgba(2, 132, 199, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className='bx bx-envelope' style={{ fontSize: '1.05rem' }}></i>
                  <span>Create & Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* EMAIL PREVIEW MODAL */}
    {isEmailPreviewOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1.25rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f0fdf4, #ffffff)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                <i className='bx bx-mail-send'></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Email Preview
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  Review invitation email with direct feedback link before sending
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEmailPreviewOpen(false)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
              title="Close email preview"
            >
              <i className='bx bx-x'></i>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
            {/* Email Metadata Headers */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '70px', color: '#64748b', fontWeight: '700' }}>To:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>
                  {emailPreviewData.toName} &lt;{emailPreviewData.toEmail}&gt;
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '70px', color: '#64748b', fontWeight: '700' }}>From:</span>
                <span style={{ color: '#334155' }}>
                  MantraCare Customer Success &lt;cs@mantracare.com&gt;
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '70px', color: '#64748b', fontWeight: '700' }}>Subject:</span>
                <span style={{ fontWeight: '700', color: '#034ea2' }}>
                  {emailPreviewData.subject}
                </span>
              </div>
            </div>

            {/* Email Message Content */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#1e293b' }}>
                Dear <strong>{emailPreviewData.toName}</strong>,
              </p>

              <p style={{ margin: '0 0 1rem 0', fontSize: '0.86rem', color: '#334155', lineHeight: '1.5' }}>
                We deeply appreciate our partnership with <strong>{emailPreviewData.company}</strong> and remain committed to ensuring exceptional delivery across your corporate wellness and healthcare initiatives.
              </p>

              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.86rem', color: '#334155', lineHeight: '1.5' }}>
                To help us continually elevate service quality and support responsiveness, please take 2-3 minutes to complete our service evaluation questionnaire.
              </p>

              {/* Call to Action Box with Link */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '0.65rem' }}>
                  <a
                    href={emailPreviewData.formLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: 'linear-gradient(135deg, #0284c7 0%, #034ea2 100%)',
                      color: '#ffffff',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <span>Complete Service Evaluation Form</span>
                    <i className='bx bx-open-in-new'></i>
                  </a>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#0369a1', wordBreak: 'break-all' }}>
                  Direct URL: <span style={{ textDecoration: 'underline' }}>{emailPreviewData.formLink}</span>
                </div>
              </div>

              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.84rem', color: '#64748b', lineHeight: '1.5' }}>
                Warm regards,
              </p>
              <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
                Customer Success Team
              </p>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                MantraCare Corporate Health &bull; cs@mantracare.com
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(emailPreviewData.formLink);
                    triggerToast('Form link copied to clipboard!');
                  } catch {}
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className='bx bx-copy'></i>
                <span>Copy Form Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const fullText = `Subject: ${emailPreviewData.subject}\n\n${emailPreviewData.body}`;
                  try {
                    navigator.clipboard.writeText(fullText);
                    triggerToast('Email text copied to clipboard!');
                  } catch {}
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className='bx bx-file'></i>
                <span>Copy Email Text</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Email invitation dispatched to ${emailPreviewData.toEmail}!`);
                  setIsEmailPreviewOpen(false);
                }}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 5px rgba(22, 163, 74, 0.3)'
                }}
              >
                <i className='bx bx-send'></i>
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}



    {/* VIEW DETAILS MODAL */}
    {selectedDetailsItem && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {selectedDetailsItem.id}
                </span>
                {selectedDetailsItem.status === 'Pending' ? (
                  <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                    ⏳ Pending
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                    ✓ Submitted
                  </span>
                )}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                Feedback Submission Details
              </h3>
            </div>
            <button
              onClick={() => setSelectedDetailsItem(null)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <i className='bx bx-x'></i>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>
                  Company (Prefilled)
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  {selectedDetailsItem.clientDetails?.company || 'Company'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>
                  HR Contact Name
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  {selectedDetailsItem.clientDetails?.name || 'HR Partner'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>
                  Designation
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
                  {selectedDetailsItem.clientDetails?.designation || selectedDetailsItem.clientDetails?.hrRole || 'HR'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>
                  Division / Branch
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>
                  {selectedDetailsItem.clientDetails?.selectedDivision || 'Healthcare'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>
                  Created By
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#034ea2' }}>
                  {selectedDetailsItem.createdBy || 'CS Team'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>
                  Created Date
                </span>
                <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  {selectedDetailsItem.formattedDate || new Date(selectedDetailsItem.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Form Link Section */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>
                Clean Form Link (No long parameters)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/feedback-form/${encodeURIComponent(selectedDetailsItem.id)}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '0.78rem',
                    color: '#334155',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => handleCopySingleFormLink(selectedDetailsItem.id, selectedDetailsItem.clientDetails?.company)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #0284c7',
                    background: '#eff6ff',
                    color: '#034ea2',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <i className='bx bx-copy'></i>
                  <span>Copy</span>
                </button>
                <a
                  href={`${window.location.origin}/feedback-form/${encodeURIComponent(selectedDetailsItem.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <i className='bx bx-external-link'></i>
                  <span>Open</span>
                </a>
              </div>
            </div>

            {/* If Submitted, provide button to view evaluation */}
            {selectedDetailsItem.status === 'Submitted' && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#15803d' }}>
                    Evaluation Received
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                    HR has filled and submitted this evaluation report.
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedInspectItem(selectedDetailsItem);
                    setSelectedDetailsItem(null);
                  }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <i className='bx bx-file'></i>
                  <span>View Filled Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#f8fafc'
          }}>
            <button
              onClick={() => setSelectedDetailsItem(null)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* FLOATING TOAST NOTIFICATION */}
    {toastNotification && (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: '#0f172a',
        color: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontSize: '0.85rem',
        fontWeight: '600',
        zIndex: 100000,
        animation: 'fadeIn 0.2s ease-in-out'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#10b981',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem'
        }}>
          <i className='bx bx-check'></i>
        </div>
        <span>{toastNotification}</span>
      </div>
    )}
      </div>
    </div>
  );
}

