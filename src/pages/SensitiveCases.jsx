import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { getAllCorporateDivisions } from '../utils/cadenceDivisionUtils';
import { PRIMARY_REASONS, URGENCY_LEVELS, getUrgencyBadgeStyle } from '../data/sensitiveCasesData';

// Default initial mock data for Manager Referrals
const INITIAL_MANAGER_REFERRALS = [
  {
    id: 'MR-1041',
    divisionId: 'DIV-101',
    corporate: 'TechCorp Solutions',
    division: 'Engineering',
    managerName: 'Amitabh Sen',
    managerEmail: 'amitabh.s@techcorp.com',
    managerTitle: 'VP of Engineering',
    memberName: 'Rahul Verma',
    employeeId: 'EMP-8821',
    memberEmail: 'rahul.v@techcorp.com',
    memberPhone: '+1 (555) 019-2831',
    primaryReason: 'Performance Decline & Stress',
    urgencyLevel: 'High',
    severity: 'High',
    status: 'In Counseling',
    remarks: 'Employee undergoing sprint velocity rehabilitation',
    isHighestPriority: true,
    referredDate: '2026-11-18',
    assignedClinician: 'Dr. Neha Kapoor (Senior Clinical Psychologist)',
    consentProvided: true,
    notesCount: 3,
    description: 'Noticeable drop in sprint velocity and withdrawal in team meetings over the past 4 weeks. Employee expressed feeling overwhelmed and anxious.',
    timeline: [
      { date: '2026-11-18 10:30', user: 'Amitabh Sen (Manager)', action: 'Referral submitted with employee consent' },
      { date: '2026-11-18 14:15', user: 'Priya Sharma (EAP SPOC)', action: 'Assigned to Dr. Neha Kapoor' },
      { date: '2026-11-19 11:00', user: 'Dr. Neha Kapoor', action: 'Initial intake assessment conducted. 6 therapy sessions recommended.' },
      { date: '2026-11-20 16:30', user: 'Dr. Neha Kapoor', action: 'Session 1 completed. Focus on workplace stress coping mechanisms.' }
    ]
  },
  {
    id: 'MR-1042',
    divisionId: 'DIV-102',
    corporate: 'Nova FinTech Solutions',
    division: 'Product & Design',
    managerName: 'Rohit Kulkarni',
    managerEmail: 'rohit.k@novafintech.com',
    managerTitle: 'Director of Product',
    memberName: 'Ananya Deshmukh',
    employeeId: 'EMP-4310',
    memberEmail: 'ananya.d@novafintech.com',
    memberPhone: '+1 (555) 431-9022',
    primaryReason: 'Severe Burnout & Exhaustion',
    urgencyLevel: 'Critical / Urgent',
    severity: 'Urgent',
    status: 'Assessment Scheduled',
    remarks: 'Panic episodes reported; intake scheduled for Nov 22',
    isHighestPriority: true,
    referredDate: '2026-11-19',
    assignedClinician: 'Dr. Rajesh Nair (Psychiatrist / Lead)',
    consentProvided: true,
    notesCount: 2,
    description: 'Employee broke down during a 1-on-1 performance review. Reports persistent insomnia, panic episodes, and inability to concentrate.',
    timeline: [
      { date: '2026-11-19 16:45', user: 'Rohit Kulkarni (Manager)', action: 'Manager referral submitted marked Urgent' },
      { date: '2026-11-20 09:15', user: 'MantraCare CS Lead', action: 'Clinical triage completed. Expedited intake scheduled for Nov 22.' }
    ]
  },
  {
    id: 'MR-1043',
    divisionId: 'DIV-103',
    corporate: 'Global Health Corp',
    division: 'Customer Operations',
    managerName: 'Pooja Bhatia',
    managerEmail: 'pooja.b@globalhealth.com',
    managerTitle: 'Head of Customer Success',
    memberName: 'Vikram Malhotra',
    employeeId: 'EMP-2905',
    memberEmail: 'vikram.m@globalhealth.com',
    memberPhone: '+1 (555) 782-1144',
    primaryReason: 'Attendance / Absenteeism',
    urgencyLevel: 'Moderate / Medium',
    severity: 'Medium',
    status: 'Contacted',
    remarks: 'Outreach email sent; waiting for employee availability',
    isHighestPriority: false,
    referredDate: '2026-11-17',
    assignedClinician: 'Sunita Rao (Lead Counselor)',
    consentProvided: true,
    notesCount: 1,
    description: 'Multiple unplanned absences and late log-ins over 3 consecutive weeks. Manager had empathetic check-in and employee agreed to EAP consultation.',
    timeline: [
      { date: '2026-11-17 11:20', user: 'Pooja Bhatia (Manager)', action: 'Referral submitted' },
      { date: '2026-11-18 15:00', user: 'Sunita Rao', action: 'Introductory outreach email & WhatsApp sent to employee.' }
    ]
  },
  {
    id: 'MR-1044',
    divisionId: 'DIV-101',
    corporate: 'TechCorp Solutions',
    division: 'Cloud Infrastructure',
    managerName: 'Vikram Joshi',
    managerEmail: 'vikram.j@techcorp.com',
    managerTitle: 'Principal Cloud Architect',
    memberName: 'Sneha Chawla',
    employeeId: 'EMP-7193',
    memberEmail: 'sneha.c@techcorp.com',
    memberPhone: '+1 (555) 912-3301',
    primaryReason: 'Workplace Conflict & Isolation',
    urgencyLevel: 'Routine / Low',
    severity: 'Low',
    status: 'New Referral',
    remarks: 'Requires mediation and interpersonal communication coaching',
    isHighestPriority: false,
    referredDate: '2026-11-20',
    assignedClinician: 'Pending Assignment',
    consentProvided: true,
    notesCount: 0,
    description: 'Interpersonal friction with project leads. Manager requested behavioral coaching and interpersonal communication counseling.',
    timeline: [
      { date: '2026-11-20 14:00', user: 'Vikram Joshi (Manager)', action: 'Referral created and pending clinical allocation' }
    ]
  },
  {
    id: 'MR-1045',
    divisionId: 'DIV-204',
    corporate: 'Apex Logistics',
    division: 'Supply Chain Ops',
    managerName: 'Deepak Saxena',
    managerEmail: 'deepak.s@apexlogistics.com',
    managerTitle: 'VP Logistics',
    memberName: 'Karan Mehra',
    employeeId: 'EMP-1149',
    memberEmail: 'karan.m@apexlogistics.com',
    memberPhone: '+1 (555) 674-8833',
    primaryReason: 'Grief & Personal Loss',
    urgencyLevel: 'Moderate / Medium',
    severity: 'Medium',
    status: 'Closed',
    remarks: '4 sessions completed; employee fully reintegrated',
    isHighestPriority: false,
    referredDate: '2026-10-15',
    assignedClinician: 'Dr. Radhika Iyer',
    consentProvided: true,
    notesCount: 4,
    description: 'Recent personal loss in immediate family. Provided specialized grief counseling support and manager guidance.',
    timeline: [
      { date: '2026-10-15 09:30', user: 'Deepak Saxena', action: 'Referral submitted' },
      { date: '2026-10-16 11:00', user: 'Dr. Radhika Iyer', action: 'In-depth grief support program initiated (4 sessions)' },
      { date: '2026-11-12 17:00', user: 'Dr. Radhika Iyer', action: 'Employee reports stable emotional wellness and successfully resumed full duty. Case closed.' }
    ]
  }
];

// Default initial mock data for Critical Cases
const INITIAL_CRITICAL_CASES = [
  {
    id: 'CRIT-801',
    corporate: 'TechCorp Solutions',
    location: 'Bangalore, India',
    employeeAlias: 'Confidential EMP-9182',
    employeeDepartment: 'Security Engineering',
    triggerSource: '24/7 Crisis Hotline',
    criticalCategory: 'Suicidal Ideation / Immediate Risk',
    riskLevel: 'Critical / SOS',
    escalationProtocol: 'Level 3 - Crisis Clinician & Emergency Contact',
    assignedCrisisLead: 'Dr. Sameer Khan (Lead Crisis Specialist)',
    reportedAt: '2026-11-21 02:40',
    responseTimeMinutes: 6,
    status: 'Intervention Ongoing',
    emergencyContactNotified: true,
    hospitalizationNeeded: false,
    summary: 'Employee called the 24/7 MantraCare SOS hotline at 2:40 AM expressing acute hopelessness and active self-harm intent. Crisis psychologist intervened immediately.',
    timeline: [
      { date: '2026-11-21 02:40', user: 'System (SOS Alert)', action: 'Inbound emergency call detected on 24/7 crisis queue.' },
      { date: '2026-11-21 02:46', user: 'Dr. Sameer Khan', action: 'Clinician engaged. De-escalation protocol initiated. Verbal safety contract secured.' },
      { date: '2026-11-21 03:20', user: 'Dr. Sameer Khan', action: 'Family designated emergency contact contacted with consent. Employee accompanied home.' },
      { date: '2026-11-21 08:30', user: 'Dr. Sameer Khan', action: 'Morning wellness verification completed. Daily psychiatric check-ins scheduled.' }
    ]
  },
  {
    id: 'CRIT-802',
    corporate: 'Nova FinTech Solutions',
    location: 'Mumbai, India',
    employeeAlias: 'Confidential EMP-3329',
    employeeDepartment: 'Trading Desk',
    triggerSource: 'Therapist SOS Escalation',
    criticalCategory: 'Acute Psychotic Breakdown & Panic',
    riskLevel: 'Critical / SOS',
    escalationProtocol: 'Level 2 - Clinical Lead & Corporate HR SPOC',
    assignedCrisisLead: 'Dr. Radhika Iyer (Chief Clinical Officer)',
    reportedAt: '2026-11-20 18:15',
    responseTimeMinutes: 9,
    status: 'Stabilized & Monitored',
    emergencyContactNotified: true,
    hospitalizationNeeded: false,
    summary: 'During a virtual session, therapist detected severe dissociation, acute hyperventilation, and disoriented speech. Session transitioned to emergency protocol.',
    timeline: [
      { date: '2026-11-20 18:15', user: 'Ananya Sen (Counselor)', action: 'Triggered red flag alert during active session.' },
      { date: '2026-11-20 18:24', user: 'Dr. Radhika Iyer', action: 'Supervising psychiatrist joined call. Acute grounding techniques administered.' },
      { date: '2026-11-20 19:40', user: 'Dr. Radhika Iyer', action: 'Employee stabilized. Spoke with spouse. Medical leave advice provided.' }
    ]
  },
  {
    id: 'CRIT-803',
    corporate: 'Global Health Corp',
    location: 'Delhi NCR, India',
    employeeAlias: 'Confidential EMP-6611',
    employeeDepartment: 'Medical Billing Operations',
    triggerSource: 'Manager Emergency Alert',
    criticalCategory: 'Domestic Violence & Safety Threat',
    riskLevel: 'Severe',
    escalationProtocol: 'Level 2 - Crisis Counseling & Legal/Safe Space Support',
    assignedCrisisLead: 'Sunita Rao (Senior Trauma Specialist)',
    reportedAt: '2026-11-19 14:10',
    responseTimeMinutes: 12,
    status: 'Stabilized & Monitored',
    emergencyContactNotified: false,
    hospitalizationNeeded: false,
    summary: 'Employee reached out in distress regarding domestic physical safety threat. Requested confidential emergency shelter guidance and trauma counseling.',
    timeline: [
      { date: '2026-11-19 14:10', user: 'HR Business Partner', action: 'Emergency referral raised to MantraCare Crisis Team.' },
      { date: '2026-11-19 14:22', user: 'Sunita Rao', action: 'Safety audit conducted. Connected with partnered female shelter support.' },
      { date: '2026-11-20 10:00', user: 'Sunita Rao', action: 'Follow-up safety check in: employee in secure environment.' }
    ]
  },
  {
    id: 'CRIT-804',
    corporate: 'Apex Logistics',
    location: 'Singapore Hub',
    employeeAlias: 'Confidential EMP-1094',
    employeeDepartment: 'Fleet Operations',
    triggerSource: 'Assessment High Risk Score',
    criticalCategory: 'Severe Depression & Substance Dependency Risk',
    riskLevel: 'High',
    escalationProtocol: 'Level 1 - Urgent Specialized Clinical Assessment',
    assignedCrisisLead: 'Dr. Neha Kapoor',
    reportedAt: '2026-11-18 09:30',
    responseTimeMinutes: 14,
    status: 'Resolved',
    emergencyContactNotified: false,
    hospitalizationNeeded: false,
    summary: 'Standard PHQ-9 and GAD-7 screening showed red-flag scores on Item 9. Immediate clinical review triggered.',
    timeline: [
      { date: '2026-11-18 09:30', user: 'Assessment Engine', action: 'Automated threshold trigger: PHQ-9 score > 22.' },
      { date: '2026-11-18 09:44', user: 'Dr. Neha Kapoor', action: 'Direct outreach performed. Full clinical risk assessment determined low imminent self-harm risk.' },
      { date: '2026-11-20 16:00', user: 'Dr. Neha Kapoor', action: 'Enrolled in 12-week comprehensive clinical wellness recovery track. Crisis stepping down.' }
    ]
  }
];

export default function SensitiveCases() {
  const { clients } = useGlobal();

  // Active Tab: 'referrals' (Manager Referral) or 'critical' (Critical cases)
  const [activeTab, setActiveTab] = useState('referrals');

  // Persistence for Manager Referrals
  const [managerReferrals, setManagerReferrals] = useState(() => {
    try {
      const saved = localStorage.getItem('sensitive_cases_manager_referrals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MANAGER_REFERRALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sensitive_cases_manager_referrals', JSON.stringify(managerReferrals));
    } catch {}
  }, [managerReferrals]);

  // Listen for storage events so external referrals immediately show up
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('sensitive_cases_manager_referrals');
        if (saved) setManagerReferrals(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('referrals-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('referrals-updated', handleStorageUpdate);
    };
  }, []);

  // Persistence for Critical Cases
  const [criticalCases, setCriticalCases] = useState(() => {
    try {
      const saved = localStorage.getItem('sensitive_cases_critical');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CRITICAL_CASES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sensitive_cases_critical', JSON.stringify(criticalCases));
    } catch {}
  }, [criticalCases]);

  // Listen for storage events so CS Dashboard reported sensitive cases immediately show up
  useEffect(() => {
    const handleCriticalUpdate = () => {
      try {
        const saved = localStorage.getItem('sensitive_cases_critical');
        if (saved) setCriticalCases(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleCriticalUpdate);
    window.addEventListener('critical-cases-updated', handleCriticalUpdate);
    return () => {
      window.removeEventListener('storage', handleCriticalUpdate);
      window.removeEventListener('critical-cases-updated', handleCriticalUpdate);
    };
  }, []);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [corporateFilter, setCorporateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [isReportCriticalOpen, setIsReportCriticalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState(null); // { type: 'referral' | 'critical', data: Object }
  const [isFormDetailsExpanded, setIsFormDetailsExpanded] = useState(false); // Collapse mode by default
  const [newNoteText, setNewNoteText] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Division mapping for Manager Referral Link
  const mappedDivisions = useMemo(() => {
    const all = getAllCorporateDivisions(clients);
    if (corporateFilter && corporateFilter !== 'All') {
      const filtered = all.filter(d => 
        (d.corporateName && d.corporateName.toLowerCase() === corporateFilter.toLowerCase()) ||
        (d.clientName && d.clientName.toLowerCase() === corporateFilter.toLowerCase())
      );
      if (filtered.length > 0) {
        return filtered.map((m, idx) => ({
          id: m.divisionId || m.id || `DIV-${101 + idx}`,
          name: m.divisionName || m.name || `Division ${idx + 1}`,
          corporate: m.corporateName || corporateFilter
        }));
      }
    }
    if (all.length > 0) {
      return all.map((m, idx) => ({
        id: m.divisionId || m.id || `DIV-${101 + idx}`,
        name: m.divisionName || m.name || `Division ${idx + 1}`,
        corporate: m.corporateName || 'Corporate Client'
      }));
    }
    return [
      { id: 'DIV-101', name: 'Engineering & Technology', corporate: 'TechCorp Solutions' },
      { id: 'DIV-102', name: 'Global Operations & Support', corporate: 'TechCorp Solutions' },
      { id: 'DIV-103', name: 'Sales & Product Strategy', corporate: 'TechCorp Solutions' }
    ];
  }, [clients, corporateFilter]);

  // Handle Manager Referral button click (Copy Referral Link)
  const handleCopyReferralLinkClick = () => {
    if (mappedDivisions.length === 1) {
      const singleDiv = mappedDivisions[0];
      const link = `${window.location.origin}/referral-form?divisionId=${encodeURIComponent(singleDiv.id)}`;
      navigator.clipboard.writeText(link);
      showToast(`Manager Referral link for ${singleDiv.name} (${singleDiv.id}) copied to clipboard!`);
    } else {
      setSelectedDivisionId(mappedDivisions[0]?.id || '');
      setIsDivisionModalOpen(true);
    }
  };

  // Confirm division choice in modal
  const handleConfirmDivisionAction = () => {
    const chosenDiv = mappedDivisions.find(d => d.id === selectedDivisionId) || mappedDivisions[0];
    const link = `${window.location.origin}/referral-form?divisionId=${encodeURIComponent(chosenDiv.id)}`;
    navigator.clipboard.writeText(link);
    showToast(`Manager Referral link for ${chosenDiv.name} (${chosenDiv.id}) copied to clipboard!`);
    setIsDivisionModalOpen(false);
  };

  // Editable remarks state
  const [editingRemarksId, setEditingRemarksId] = useState(null);
  const [editingRemarksVal, setEditingRemarksVal] = useState('');

  const handleSaveRemarks = (caseId) => {
    setManagerReferrals(prev => prev.map(item => {
      if (item.id === caseId) {
        return { ...item, remarks: editingRemarksVal.trim() };
      }
      return item;
    }));
    setEditingRemarksId(null);
  };

  // Toggle Highest Priority
  const handleToggleHighestPriority = (caseId) => {
    setManagerReferrals(prev => prev.map(item => {
      if (item.id === caseId) {
        return { ...item, isHighestPriority: !item.isHighestPriority };
      }
      return item;
    }));
  };

  // Extract all distinct corporate clients
  const availableCorporates = useMemo(() => {
    const set = new Set();
    if (Array.isArray(clients)) {
      clients.forEach(c => {
        const name = c.name || c.companyName || c.clientName;
        if (name && name.trim()) set.add(name.trim());
      });
    }
    managerReferrals.forEach(r => r.corporate && set.add(r.corporate));
    criticalCases.forEach(c => c.corporate && set.add(c.corporate));
    return Array.from(set);
  }, [clients, managerReferrals, criticalCases]);

  // Filtered Manager Referrals
  const filteredReferrals = useMemo(() => {
    return managerReferrals.filter(item => {
      if (corporateFilter !== 'All' && item.corporate !== corporateFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (severityFilter !== 'All') {
        const itemUrg = (item.urgencyLevel || item.severity || '').toLowerCase();
        const filt = severityFilter.toLowerCase();
        const matches =
          itemUrg === filt ||
          (filt === 'emergency' && (itemUrg.includes('emergency') || itemUrg.includes('urgent') || itemUrg.includes('sos'))) ||
          (filt === 'severe' && itemUrg.includes('severe')) ||
          (filt === 'high' && itemUrg.includes('high')) ||
          (filt === 'normal' && (itemUrg.includes('normal') || itemUrg.includes('low') || itemUrg.includes('routine')));
        if (!matches) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const manager = (item.managerName || item.referringManager || '').toLowerCase();
        const member = (item.memberName || item.employeeName || '').toLowerCase();
        const reason = (item.primaryReason || item.category || '').toLowerCase();
        const divId = (item.divisionId || '').toLowerCase();
        const remarks = (item.remarks || '').toLowerCase();

        const match =
          item.id.toLowerCase().includes(q) ||
          member.includes(q) ||
          manager.includes(q) ||
          reason.includes(q) ||
          divId.includes(q) ||
          remarks.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [managerReferrals, corporateFilter, statusFilter, severityFilter, searchQuery]);

  // Filtered Critical Cases
  const filteredCriticalCases = useMemo(() => {
    return criticalCases.filter(item => {
      if (corporateFilter !== 'All' && item.corporate !== corporateFilter) return false;
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;
      if (severityFilter !== 'All') {
        const itemUrg = (item.riskLevel || item.urgencyLevel || '').toLowerCase();
        const filt = severityFilter.toLowerCase();
        const matches =
          itemUrg === filt ||
          (filt === 'emergency' && (itemUrg.includes('emergency') || itemUrg.includes('urgent') || itemUrg.includes('sos'))) ||
          (filt === 'severe' && itemUrg.includes('severe')) ||
          (filt === 'high' && itemUrg.includes('high')) ||
          (filt === 'normal' && (itemUrg.includes('normal') || itemUrg.includes('low') || itemUrg.includes('routine')));
        if (!matches) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          (item.employeeAlias || item.callerName || '').toLowerCase().includes(q) ||
          item.corporate.toLowerCase().includes(q) ||
          (item.triggerSource || '').toLowerCase().includes(q) ||
          (item.criticalCategory || item.primaryReason || '').toLowerCase().includes(q) ||
          (item.assignedCrisisLead || item.answeredBy || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [criticalCases, corporateFilter, statusFilter, severityFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalRef = managerReferrals.length;
    const activeRef = managerReferrals.filter(r => r.status !== 'Closed').length;
    const highestPriorityCount = managerReferrals.filter(r => r.isHighestPriority).length;

    const totalCrit = criticalCases.length;
    const activeCrit = criticalCases.filter(c => c.status === 'Immediate Action Required' || c.status === 'Intervention Ongoing').length;
    const sosCount = criticalCases.filter(c => c.riskLevel.includes('SOS')).length;

    return { totalRef, activeRef, highestPriorityCount, totalCrit, activeCrit, sosCount };
  }, [managerReferrals, criticalCases]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setStatusFilter('All');
    setSeverityFilter('All');
  }, [activeTab]);

  // Add Note to current case
  const handleAddNote = () => {
    if (!newNoteText.trim() || !viewingCase) return;
    const newTimelineEntry = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Priya Sharma (EAP Lead)',
      action: newNoteText.trim()
    };

    if (viewingCase.type === 'referral') {
      setManagerReferrals(prev => prev.map(item => {
        if (item.id === viewingCase.data.id) {
          const updated = {
            ...item,
            notesCount: (item.notesCount || 0) + 1,
            timeline: [newTimelineEntry, ...(item.timeline || [])]
          };
          setViewingCase({ type: 'referral', data: updated });
          return updated;
        }
        return item;
      }));
    } else {
      setCriticalCases(prev => prev.map(item => {
        if (item.id === viewingCase.data.id) {
          const updated = {
            ...item,
            timeline: [newTimelineEntry, ...(item.timeline || [])]
          };
          setViewingCase({ type: 'critical', data: updated });
          return updated;
        }
        return item;
      }));
    }
    setNewNoteText('');
  };

  // Change Case Status
  const handleUpdateCaseStatus = (caseId, newStatus, isCritical) => {
    if (isCritical) {
      setCriticalCases(prev => prev.map(item => {
        if (item.id === caseId) {
          const updated = {
            ...item,
            status: newStatus,
            timeline: [
              {
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                user: 'Priya Sharma',
                action: `Status updated to "${newStatus}"`
              },
              ...(item.timeline || [])
            ]
          };
          if (viewingCase?.data?.id === caseId) setViewingCase({ type: 'critical', data: updated });
          return updated;
        }
        return item;
      }));
    } else {
      setManagerReferrals(prev => prev.map(item => {
        if (item.id === caseId) {
          const updated = {
            ...item,
            status: newStatus,
            timeline: [
              {
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                user: 'Priya Sharma',
                action: `Status updated to "${newStatus}"`
              },
              ...(item.timeline || [])
            ]
          };
          if (viewingCase?.data?.id === caseId) setViewingCase({ type: 'referral', data: updated });
          return updated;
        }
        return item;
      }));
    }
  };



  // Form State for Report Critical Case
  const [newCriticalForm, setNewCriticalForm] = useState({
    corporate: 'TechCorp Solutions',
    location: 'Bangalore, India',
    employeeAlias: '',
    employeeDepartment: 'Engineering',
    triggerSource: '24/7 Crisis Hotline',
    criticalCategory: PRIMARY_REASONS[0],
    riskLevel: 'Emergency',
    escalationProtocol: 'Level 3 - Crisis Clinician & Emergency Contact',
    assignedCrisisLead: 'Dr. Sameer Khan (Lead Crisis Specialist)',
    summary: '',
    emergencyContactNotified: false
  });

  const handleCreateCriticalCase = (e) => {
    e.preventDefault();
    if (!newCriticalForm.employeeAlias || !newCriticalForm.summary) {
      alert('Please provide Employee Identifier and Brief Description.');
      return;
    }

    if (newCriticalForm.criticalCategory === 'Other' && !newCriticalForm.summary.trim()) {
      alert('Remarks / Summary are mandatory when "Other" is selected as Critical Risk Category.');
      return;
    }

    const newId = `CRIT-${Math.floor(100 + Math.random() * 900)}`;
    const newEntry = {
      ...newCriticalForm,
      id: newId,
      status: 'Immediate Action Required',
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responseTimeMinutes: 1,
      timeline: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: 'System Emergency Log',
          action: `Critical case registered. Protocol initiated: ${newCriticalForm.escalationProtocol}`
        }
      ]
    };

    setCriticalCases(prev => [newEntry, ...prev]);
    setIsReportCriticalOpen(false);
    setNewCriticalForm({
      corporate: 'TechCorp Solutions',
      location: 'Bangalore, India',
      employeeAlias: '',
      employeeDepartment: 'Engineering',
      triggerSource: '24/7 Crisis Hotline',
      criticalCategory: 'Suicidal Ideation / Immediate Risk',
      riskLevel: 'Critical / SOS',
      escalationProtocol: 'Level 3 - Crisis Clinician & Emergency Contact',
      assignedCrisisLead: 'Dr. Sameer Khan (Lead Crisis Specialist)',
      summary: '',
      emergencyContactNotified: false
    });
  };

  return (
    <div className="page-container" style={{ padding: '1.5rem 2rem', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          background: '#0f172a',
          color: 'white',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.88rem',
          fontWeight: '500',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <i className='bx bx-check-circle' style={{ color: '#10b981', fontSize: '1.3rem' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)' }}>
              <i className='bx bx-shield-quarter'></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Sensitive Cases
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Confidential corporate EAP care: Manager Referrals &amp; High-Risk Critical Crisis Interventions
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {activeTab === 'referrals' ? (
            <button
              type="button"
              onClick={handleCopyReferralLinkClick}
              title="Copy Manager Referral Form link mapped to a corporate division"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0369a1',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
            >
              <i className='bx bx-user-voice' style={{ fontSize: '1.15rem', color: '#0284c7' }}></i>
              <span>Manager Referral</span>
            </button>
          ) : (
            <button
              onClick={() => setIsReportCriticalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <i className='bx bx-error-circle' style={{ fontSize: '1.1rem' }}></i>
              <span>Report Critical Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Manager Referrals</span>
            <i className='bx bx-user-voice' style={{ fontSize: '1.25rem', color: '#0284c7' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.3rem' }}>
            {metrics.totalRef}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginTop: '0.2rem' }}>
            {metrics.activeRef} Active &bull; {metrics.highestPriorityCount} Highest Priority
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Critical Cases</span>
            <i className='bx bx-alarm-exclamation' style={{ fontSize: '1.25rem', color: '#dc2626' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626', marginTop: '0.3rem' }}>
            {metrics.totalCrit}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: '600', marginTop: '0.2rem' }}>
            {metrics.activeCrit} In Triage &bull; {metrics.sosCount} SOS Active
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Emergency Response SLA</span>
            <i className='bx bx-stopwatch' style={{ fontSize: '1.25rem', color: '#10b981' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '0.3rem' }}>
            7.8 mins
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Target: &lt; 15 mins (100% compliant)
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', padding: '1rem 1.15rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Confidentiality Status</span>
            <i className='bx bx-lock-alt' style={{ fontSize: '1.25rem', color: '#8b5cf6' }}></i>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', marginTop: '0.3rem' }}>
            HIPAA / EAP
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
            Zero Employee Health Data Leaks
          </div>
        </div>
      </div>

      {/* Main Card with Tabs */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        
        {/* Navigation Tabs Header */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e2e8f0', padding: '0 1.25rem', background: '#fafbfc' }}>
          <button
            onClick={() => setActiveTab('referrals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'referrals' ? '3px solid #0284c7' : '3px solid transparent',
              color: activeTab === 'referrals' ? '#0284c7' : '#64748b',
              fontWeight: activeTab === 'referrals' ? '700' : '600',
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <i className='bx bx-user-voice' style={{ fontSize: '1.15rem' }}></i>
            <span>Manager Referral</span>
            <span style={{
              background: activeTab === 'referrals' ? '#0284c7' : '#e2e8f0',
              color: activeTab === 'referrals' ? 'white' : '#475569',
              borderRadius: '20px',
              padding: '0.12rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              {filteredReferrals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('critical')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'critical' ? '3px solid #dc2626' : '3px solid transparent',
              color: activeTab === 'critical' ? '#dc2626' : '#64748b',
              fontWeight: activeTab === 'critical' ? '700' : '600',
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <i className='bx bx-error-circle' style={{ fontSize: '1.15rem' }}></i>
            <span>Critical cases</span>
            <span style={{
              background: activeTab === 'critical' ? '#dc2626' : '#fee2e2',
              color: activeTab === 'critical' ? 'white' : '#b91c1c',
              borderRadius: '20px',
              padding: '0.12rem 0.55rem',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              {filteredCriticalCases.length}
            </span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '240px', maxWidth: '380px', position: 'relative' }}>
            <i className='bx bx-search' style={{ position: 'absolute', left: '0.75rem', color: '#94a3b8', fontSize: '1.1rem' }}></i>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'referrals' ? 'member, manager, division, reason...' : 'case ID, trigger, risk level...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Corporate Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Corporate:</span>
              <select
                value={corporateFilter}
                onChange={(e) => setCorporateFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#334155',
                  outline: 'none'
                }}
              >
                <option value="All">All Corporates</option>
                {availableCorporates.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#334155',
                  outline: 'none'
                }}
              >
                <option value="All">All Statuses</option>
                {activeTab === 'referrals' ? (
                  <>
                    <option value="New Referral">New Referral</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Assessment Scheduled">Assessment Scheduled</option>
                    <option value="In Counseling">In Counseling</option>
                    <option value="Closed">Closed</option>
                  </>
                ) : (
                  <>
                    <option value="Immediate Action Required">Immediate Action Required</option>
                    <option value="Intervention Ongoing">Intervention Ongoing</option>
                    <option value="Stabilized &amp; Monitored">Stabilized &amp; Monitored</option>
                    <option value="Resolved">Resolved</option>
                  </>
                )}
              </select>
            </div>

            {/* Severity / Risk Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                {activeTab === 'referrals' ? 'Urgency:' : 'Risk Level:'}
              </span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#334155',
                  outline: 'none'
                }}
              >
                <option value="All">All Levels</option>
                <option value="Emergency">Emergency</option>
                <option value="Severe">Severe</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            {(corporateFilter !== 'All' || statusFilter !== 'All' || severityFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setCorporateFilter('All');
                  setStatusFilter('All');
                  setSeverityFilter('All');
                  setSearchQuery('');
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  borderRadius: '6px',
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tab 1 Content: Manager Referral Table */}
        {activeTab === 'referrals' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.8rem 1rem', width: '50px' }}>S. NO.</th>
                  <th style={{ padding: '0.8rem 1rem' }}>DIVISION ID</th>
                  <th style={{ padding: '0.8rem 1rem' }}>MANAGER NAME</th>
                  <th style={{ padding: '0.8rem 1rem' }}>MEMBER NAME</th>
                  <th style={{ padding: '0.8rem 1rem' }}>PRIMARY REASON</th>
                  <th style={{ padding: '0.8rem 1rem' }}>URGENCY LEVEL</th>
                  <th style={{ padding: '0.8rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.8rem 1rem', minWidth: '170px' }}>REMARKS</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>ACTION</th>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>HIGHEST PRIORITY</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: row.isHighestPriority ? '#fffbeb' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* S. No. */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#64748b' }}>
                      {idx + 1}
                    </td>

                    {/* Division ID (Hyperlinked to Division) */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Link
                        to={`/corporate/division/edit?id=${encodeURIComponent(row.divisionId || 'DIV-101')}`}
                        style={{
                          color: '#0284c7',
                          fontWeight: '700',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title={`Go to Division: ${row.divisionId || 'DIV-101'}`}
                      >
                        <span>{row.divisionId || 'DIV-101'}</span>
                        <i className='bx bx-link-external' style={{ fontSize: '0.8rem' }}></i>
                      </Link>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {row.corporate || 'TechCorp Solutions'}
                      </div>
                    </td>

                    {/* Manager Name */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {row.managerName || row.referringManager}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {row.managerEmail || row.managerTitle}
                      </div>
                    </td>

                    {/* Member Name */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>
                        {row.memberName || row.employeeName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {row.employeeId ? `ID: ${row.employeeId}` : (row.memberEmail || '')}
                      </div>
                    </td>

                    {/* Primary Reason */}
                    <td style={{ padding: '0.85rem 1rem', maxWidth: '220px' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        borderRadius: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {row.primaryReason || row.category}
                      </span>
                    </td>

                    {/* Urgency Level */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {(() => {
                        const style = getUrgencyBadgeStyle(row.urgencyLevel || row.severity);
                        return (
                          <span style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            background: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`
                          }}>
                            {row.urgencyLevel || row.severity}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Status (Dropdown) */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={row.status}
                        onChange={(e) => handleUpdateCaseStatus(row.id, e.target.value, false)}
                        style={{
                          padding: '0.3rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          border: '1px solid #cbd5e1',
                          background:
                            row.status === 'In Counseling' ? '#f0fdf4' :
                            row.status === 'Assessment Scheduled' ? '#eff6ff' :
                            row.status === 'Closed' ? '#f8fafc' : '#fffbeb',
                          color:
                            row.status === 'In Counseling' ? '#15803d' :
                            row.status === 'Assessment Scheduled' ? '#1d4ed8' :
                            row.status === 'Closed' ? '#64748b' : '#b45309',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="New Referral">New Referral</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Assessment Scheduled">Assessment Scheduled</option>
                        <option value="In Counseling">In Counseling</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Remarks (Editable) */}
                    <td style={{ padding: '0.85rem 1rem', minWidth: '170px' }}>
                      {editingRemarksId === row.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input
                            type="text"
                            autoFocus
                            value={editingRemarksVal}
                            onChange={(e) => setEditingRemarksVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRemarks(row.id);
                              if (e.key === 'Escape') setEditingRemarksId(null);
                            }}
                            placeholder="Add remarks..."
                            style={{
                              padding: '0.3rem 0.5rem',
                              fontSize: '0.8rem',
                              borderRadius: '4px',
                              border: '1px solid #0284c7',
                              outline: 'none',
                              width: '100%',
                              color: '#0f172a'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRemarks(row.id)}
                            style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '4px', padding: '0.3rem 0.45rem', cursor: 'pointer' }}
                            title="Save"
                          >
                            <i className='bx bx-check'></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRemarksId(null)}
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.3rem 0.45rem', cursor: 'pointer' }}
                            title="Cancel"
                          >
                            <i className='bx bx-x'></i>
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingRemarksId(row.id);
                            setEditingRemarksVal(row.remarks || '');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            padding: '0.2rem 0.35rem',
                            borderRadius: '4px',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          title="Click to edit Remarks"
                        >
                          <span style={{ fontSize: '0.8rem', color: row.remarks ? '#334155' : '#94a3b8', fontStyle: row.remarks ? 'normal' : 'italic' }}>
                            {row.remarks || 'Add remarks...'}
                          </span>
                          <i className='bx bx-pencil' style={{ color: '#94a3b8', fontSize: '0.85rem', flexShrink: 0 }}></i>
                        </div>
                      )}
                    </td>

                    {/* Action (View Icon) */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setViewingCase({ type: 'referral', data: row });
                          setIsFormDetailsExpanded(false);
                        }}
                        style={{
                          background: '#f0f9ff',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          transition: 'all 0.15s ease'
                        }}
                        title="View Case Details"
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = '#7dd3fc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
                      >
                        <i className='bx bx-show'></i>
                      </button>
                    </td>

                    {/* Check Box (Mark as Highest Priority) */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Toggle Highest Priority">
                        <input
                          type="checkbox"
                          checked={!!row.isHighestPriority}
                          onChange={() => handleToggleHighestPriority(row.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#dc2626',
                            cursor: 'pointer'
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
                {filteredReferrals.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <i className='bx bx-search' style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                      No manager referrals found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2 Content: Critical Cases Table */}
        {activeTab === 'critical' && (
          <div>
            {/* Emergency Alert Banner */}
            <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#991b1b', fontSize: '0.84rem', fontWeight: '600' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626', display: 'inline-block', boxShadow: '0 0 0 4px rgba(220,38,38,0.2)' }}></span>
                <span>Active Clinical Crisis Management Protocol &bull; 24/7 Rapid Emergency Response Active</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7f1d1d', background: '#fee2e2', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: '700' }}>
                Crisis Hotline: 1800-MANTRA-SOS
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.8rem 1rem' }}>CASE ID</th>
                    <th style={{ padding: '0.8rem 1rem' }}>CORPORATE &amp; LOCATION</th>
                    <th style={{ padding: '0.8rem 1rem' }}>CONFIDENTIAL IDENTIFIER</th>
                    <th style={{ padding: '0.8rem 1rem' }}>TRIGGER / SOURCE</th>
                    <th style={{ padding: '0.8rem 1rem' }}>CRITICAL RISK CATEGORY</th>
                    <th style={{ padding: '0.8rem 1rem' }}>RISK LEVEL</th>
                    <th style={{ padding: '0.8rem 1rem' }}>ASSIGNED CRISIS LEAD</th>
                    <th style={{ padding: '0.8rem 1rem' }}>STATUS</th>
                    <th style={{ padding: '0.8rem 1rem' }}>REPORTED AT</th>
                    <th style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCriticalCases.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: row.riskLevel.includes('SOS') ? '#fffdfd' : 'transparent' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#dc2626' }}>
                        {row.id}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{row.corporate}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.location}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{row.employeeAlias || row.callerName || 'Confidential'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{row.employeeDepartment || row.divisionName || row.divisionId || ''}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <i className='bx bx-bell' style={{ color: '#ef4444' }}></i>
                          {row.triggerSource || (row.answeredBy ? `Inbound (${row.answeredBy})` : 'Crisis Alert')}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', maxWidth: '240px' }}>
                        <span style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '4px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          display: 'inline-block'
                        }}>
                          {row.criticalCategory || row.primaryReason}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {(() => {
                          const style = getUrgencyBadgeStyle(row.riskLevel || row.urgencyLevel);
                          return (
                            <span style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '12px',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              background: style.bg,
                              color: style.color,
                              border: `1px solid ${style.border}`
                            }}>
                              {row.riskLevel || row.urgencyLevel}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', fontSize: '0.8rem', fontWeight: '500' }}>
                        {row.assignedCrisisLead || (row.answeredBy ? `Staff: ${row.answeredBy}` : 'Crisis Team')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <select
                          value={row.status}
                          onChange={(e) => handleUpdateCaseStatus(row.id, e.target.value, true)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: '600',
                            border: '1px solid #cbd5e1',
                            background:
                              row.status === 'Immediate Action Required' ? '#fee2e2' :
                              row.status === 'Intervention Ongoing' ? '#fef3c7' :
                              row.status === 'Stabilized & Monitored' ? '#eff6ff' : '#f0fdf4',
                            color:
                              row.status === 'Immediate Action Required' ? '#b91c1c' :
                              row.status === 'Intervention Ongoing' ? '#b45309' :
                              row.status === 'Stabilized & Monitored' ? '#1d4ed8' : '#15803d',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Immediate Action Required">Immediate Action Required</option>
                          <option value="Intervention Ongoing">Intervention Ongoing</option>
                          <option value="Stabilized & Monitored">Stabilized &amp; Monitored</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                        <div>{row.reportedAt}</div>
                        <div style={{ color: '#059669', fontWeight: '600', fontSize: '0.72rem' }}>SLA: {row.responseTimeMinutes}m</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setViewingCase({ type: 'critical', data: row });
                            setIsFormDetailsExpanded(false);
                          }}
                          style={{
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <i className='bx bx-pulse'></i>
                          <span>Crisis Log</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCriticalCases.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <i className='bx bx-check-circle' style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', color: '#10b981' }}></i>
                        No critical cases currently match the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: View Case Details & Clinical Timeline */}
      {viewingCase && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '92%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: viewingCase.type === 'critical' ? 'linear-gradient(135deg, #b91c1c, #dc2626)' : 'linear-gradient(135deg, #0284c7, #0369a1)',
              padding: '1rem 1.25rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                  {viewingCase.type === 'critical' ? 'Confidential Critical Case Record' : 'Manager Referral Details'}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                  {viewingCase.data.id} &bull; {viewingCase.data.corporate}
                </h2>
              </div>
              <button
                onClick={() => setViewingCase(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              {/* Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    {viewingCase.type === 'critical' ? 'Employee Identifier' : 'Member Name'}
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                    {viewingCase.type === 'critical' ? viewingCase.data.employeeAlias : `${viewingCase.data.memberName || viewingCase.data.employeeName} (${viewingCase.data.employeeId || 'N/A'})`}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    {viewingCase.type === 'critical' ? 'Risk Level' : 'Urgency Level'}
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: viewingCase.type === 'critical' ? '#dc2626' : '#0284c7' }}>
                    {viewingCase.type === 'critical' ? viewingCase.data.riskLevel : (viewingCase.data.urgencyLevel || viewingCase.data.severity)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    {viewingCase.type === 'critical' ? 'Corporate & Location' : 'Division ID'}
                  </span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                    {viewingCase.type === 'critical' ? `${viewingCase.data.corporate} • ${viewingCase.data.location}` : (viewingCase.data.divisionId || 'DIV-101')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Status</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                    {viewingCase.data.status}
                  </div>
                </div>
              </div>

              {/* Collapsible Complete Form Details Card (Starts in Collapse mode) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                {/* Collapsible Header */}
                <div
                  onClick={() => setIsFormDetailsExpanded(!isFormDetailsExpanded)}
                  style={{
                    padding: '0.85rem 1rem',
                    background: isFormDetailsExpanded ? '#f8fafc' : '#ffffff',
                    borderBottom: isFormDetailsExpanded ? '1px solid #e2e8f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (!isFormDetailsExpanded) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isFormDetailsExpanded) e.currentTarget.style.background = '#ffffff'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: viewingCase.type === 'critical' ? '#fee2e2' : '#e0f2fe',
                      color: viewingCase.type === 'critical' ? '#dc2626' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      <i className='bx bx-file-blank'></i>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                        Complete Form Details
                      </span>
                      <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        color: isFormDetailsExpanded ? '#0284c7' : '#64748b',
                        background: isFormDetailsExpanded ? '#e0f2fe' : '#f1f5f9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px'
                      }}>
                        {isFormDetailsExpanded ? 'Expanded' : 'Collapse mode'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: viewingCase.type === 'critical' ? '#dc2626' : '#0284c7', fontSize: '0.82rem', fontWeight: '700' }}>
                    <span>{isFormDetailsExpanded ? 'Collapse' : 'Expand Form Details'}</span>
                    <i className={`bx ${isFormDetailsExpanded ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem' }}></i>
                  </div>
                </div>

                {/* Form Details Body - Rendered when expanded */}
                {isFormDetailsExpanded && (
                  <div style={{ padding: '1.25rem', background: '#fafbfc' }}>
                    {viewingCase.type === 'referral' ? (
                      /* Complete Manager Referral Form Details */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* 1. Manager Information */}
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className='bx bx-user-check'></i>
                            <span>1. Manager Information</span>
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Full Name</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.managerName || viewingCase.data.referringManager || 'Jane Doe'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Email Address</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.managerEmail || 'manager@company.com'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Division ID</span>
                              <strong style={{ color: '#0284c7' }}>{viewingCase.data.divisionId || 'DIV-101'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* 2. Team Member Profile */}
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className='bx bx-id-card'></i>
                            <span>2. Team Member Profile</span>
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Full Name</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.memberName || viewingCase.data.employeeName || 'John Smith'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Phone Number</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.memberPhone || '+1 (555) 019-2831'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Email Address</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.memberEmail || 'member@company.com'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Employee ID</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.employeeId || 'N/A'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* 3. Support Needs */}
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className='bx bx-heart'></i>
                            <span>3. Support Needs &amp; Remarks</span>
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.84rem', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Primary Reason</span>
                              <span style={{ display: 'inline-block', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', color: '#334155' }}>
                                {viewingCase.data.primaryReason || viewingCase.data.category || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Urgency Level</span>
                              <strong style={{ color: '#0284c7' }}>{viewingCase.data.urgencyLevel || viewingCase.data.severity || 'Normal'}</strong>
                            </div>
                          </div>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Remarks</span>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                              {viewingCase.data.remarks || viewingCase.data.description || 'No additional remarks provided.'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#059669', fontWeight: '600' }}>
                            <i className='bx bxs-check-circle' style={{ fontSize: '1.1rem' }}></i>
                            <span>Manager Consent &amp; Acknowledgment: Confirmed (Employee consented to confidential contact)</span>
                          </div>
                        </div>

                      </div>
                    ) : (
                      /* Complete Critical Case Report Form Details */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* Inbound Call & Intake Info */}
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className='bx bx-phone-call'></i>
                            <span>Call &amp; Intake Details</span>
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Date</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.date || viewingCase.data.reportedAt?.split(' ')[0] || '2026-11-21'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Call Time</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.callTime || viewingCase.data.reportedAt?.split(' ')[1] || '10:30 AM'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Caller Name</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.callerName || viewingCase.data.employeeAlias || 'Confidential'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Caller Number</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.callerNumber || '+91 98765 43210'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Division</span>
                              <strong style={{ color: '#dc2626' }}>{viewingCase.data.divisionName || viewingCase.data.divisionId || viewingCase.data.employeeDepartment || 'Corporate'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Answered By</span>
                              <strong style={{ color: '#0f172a' }}>{viewingCase.data.answeredBy || viewingCase.data.assignedCrisisLead || 'Self'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Risk Assessment */}
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.76rem', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <i className='bx bx-shield-plus'></i>
                            <span>Clinical Risk &amp; Assessment Details</span>
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.84rem', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Primary Reason / Category</span>
                              <span style={{ display: 'inline-block', background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700', color: '#991b1b' }}>
                                {viewingCase.data.primaryReason || viewingCase.data.criticalCategory || 'Emergency Incident'}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Urgency Level</span>
                              <strong style={{ color: '#dc2626' }}>{viewingCase.data.urgencyLevel || viewingCase.data.riskLevel || 'Severe'}</strong>
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Remarks / Incident Notes</span>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', background: '#f8fafc', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                              {viewingCase.data.remarks || viewingCase.data.summary || 'Immediate crisis support initiated.'}
                            </p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>



              {/* Case Action / Timeline Log */}
              <div>
                <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.85rem', color: '#334155', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className='bx bx-history'></i>
                  <span>Clinical Activity &amp; Intervention Timeline</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                  {(viewingCase.data.timeline || []).map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid #0284c7' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', paddingTop: '0.1rem' }}>
                        {t.date}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1e293b' }}>{t.user}</div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.15rem' }}>{t.action}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Clinical Note */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Log a new clinical update or status note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleAddNote}
                    style={{
                      padding: '0.55rem 1rem',
                      background: '#0284c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setViewingCase(null)}
                style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Select Division for Manager Referral */}
      {isDivisionModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            width: '90%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              color: 'white',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '700', fontSize: '0.98rem' }}>
                <i className='bx bx-shield-quarter'></i>
                <span>Select Division for Manager Referral Link</span>
              </div>
              <button
                onClick={() => setIsDivisionModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Select the corporate division to map this manager referral link to:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {mappedDivisions.map(div => {
                  const isSelected = selectedDivisionId === div.id;
                  return (
                    <div
                      key={div.id}
                      onClick={() => setSelectedDivisionId(div.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0f9ff' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? '#0369a1' : '#1e293b' }}>
                          {div.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Division ID: <strong style={{ color: '#0284c7' }}>{div.id}</strong> {div.corporate ? `• ${div.corporate}` : ''}
                        </div>
                      </div>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid #0284c7' : '2px solid #cbd5e1',
                        background: 'white'
                      }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsDivisionModalOpen(false)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDivisionAction}
                  style={{
                    padding: '0.55rem 1.35rem',
                    background: '#0284c7',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <i className='bx bx-copy'></i>
                  <span>Copy Manager Referral Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Report Critical Case Form */}
      {isReportCriticalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '92%',
            maxWidth: '620px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div style={{ background: 'linear-gradient(135deg, #b91c1c, #dc2626)', padding: '1rem 1.25rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className='bx bx-alarm-exclamation'></i> Report High-Risk Critical Crisis
              </h2>
              <button onClick={() => setIsReportCriticalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateCriticalCase} style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Corporate Client *</label>
                  <select
                    value={newCriticalForm.corporate}
                    onChange={(e) => setNewCriticalForm({ ...newCriticalForm, corporate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    {availableCorporates.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Office Location / City</label>
                  <input
                    type="text"
                    value={newCriticalForm.location}
                    onChange={(e) => setNewCriticalForm({ ...newCriticalForm, location: e.target.value })}
                    placeholder="e.g. Bangalore, Singapore, Remote"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Confidential Identifier / Name *</label>
                  <input
                    type="text"
                    required
                    value={newCriticalForm.employeeAlias}
                    onChange={(e) => setNewCriticalForm({ ...newCriticalForm, employeeAlias: e.target.value })}
                    placeholder="e.g. Confidential EMP-9041 or Name"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Department / Division</label>
                  <input
                    type="text"
                    value={newCriticalForm.employeeDepartment}
                    onChange={(e) => setNewCriticalForm({ ...newCriticalForm, employeeDepartment: e.target.value })}
                    placeholder="e.g. Security, Engineering"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Trigger Source</label>
                  <select
                    value={newCriticalForm.triggerSource}
                    onChange={(e) => setNewCriticalForm({ ...newCriticalForm, triggerSource: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="24/7 Crisis Hotline">24/7 Crisis Hotline</option>
                    <option value="Therapist SOS Escalation">Therapist SOS Escalation</option>
                    <option value="Manager Emergency Alert">Manager Emergency Alert</option>
                    <option value="Assessment High Risk Score">Assessment High Risk Score</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Urgency / Risk Level *</label>
                  <select
                    value={newCriticalForm.riskLevel}
                    onChange={(e) => setNewCriticalForm({ ...newCriticalForm, riskLevel: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', color: '#dc2626' }}
                  >
                    {URGENCY_LEVELS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Primary Reason / Critical Category</label>
                <select
                  value={newCriticalForm.criticalCategory}
                  onChange={(e) => setNewCriticalForm({ ...newCriticalForm, criticalCategory: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  {PRIMARY_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Immediate Incident Summary &amp; Threat Context {newCriticalForm.criticalCategory === 'Other' ? (
                    <span style={{ color: '#dc2626' }}>* (Mandatory when "Other" is selected)</span>
                  ) : '*'}
                </label>
                <textarea
                  rows="3"
                  required
                  value={newCriticalForm.summary}
                  onChange={(e) => setNewCriticalForm({ ...newCriticalForm, summary: e.target.value })}
                  placeholder={newCriticalForm.criticalCategory === 'Other' ? "Please specify details for 'Other' category (Mandatory)..." : "Describe immediate danger, caller statements, and current location/status..."}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsReportCriticalOpen(false)}
                  style={{ padding: '0.55rem 1.15rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.35rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Trigger Emergency Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
