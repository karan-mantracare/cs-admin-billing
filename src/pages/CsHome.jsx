import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { getAllCorporateDivisions } from '../utils/cadenceDivisionUtils';
import { PRIMARY_REASONS, URGENCY_LEVELS } from '../data/sensitiveCasesData';

export default function CsHome() {
  const navigate = useNavigate();
  const { clients } = useGlobal();

  // Get logged-in user details
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('logged_in_user');
      if (stored) return JSON.parse(stored);
    } catch { }
    return { name: 'Karan', company: 'TechCorp Solutions' };
  });

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Karan';
  const userCompany = currentUser?.company || localStorage.getItem('selected_company') || 'TechCorp Solutions';

  // Accordion state for FAQs (open item ID: 1..8 or null)
  const [openFaq, setOpenFaq] = useState(null);

  // Video tutorial modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Toast message state
  const [toastMessage, setToastMessage] = useState(null);

  // Division selection modal state for Manager Referral Link
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');

  // Report for Sensitive Cases modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    source: 'Hotline Call', // 'Hotline Call' | '1 on 1 Session'
    date: new Date().toISOString().split('T')[0],
    callerName: '',
    divisionId: '',
    callTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    callerNumber: '',
    answeredBy: 'Self', // 'Self' | 'Other'
    answeredByName: '',
    primaryReason: '',
    urgencyLevel: '',
    remarks: ''
  });
  const [reportErrors, setReportErrors] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Extract divisions mapped to the active company / user
  const mappedDivisions = useMemo(() => {
    const all = getAllCorporateDivisions(clients);
    const matched = all.filter(d =>
      (d.corporateName && d.corporateName.toLowerCase() === userCompany.toLowerCase()) ||
      (d.clientName && d.clientName.toLowerCase() === userCompany.toLowerCase())
    );
    if (matched.length > 0) {
      return matched.map((m, idx) => ({
        id: m.divisionId || m.id || `DIV-${101 + idx}`,
        name: m.divisionName || m.name || `Division ${idx + 1}`,
        corporate: m.corporateName || userCompany
      }));
    }
    // Default fallback divisions for the company
    return [
      { id: 'DIV-101', name: 'Engineering & Technology', corporate: userCompany },
      { id: 'DIV-102', name: 'Global Operations & Support', corporate: userCompany },
      { id: 'DIV-103', name: 'Sales & Product Strategy', corporate: userCompany }
    ];
  }, [clients, userCompany]);

  // Handle Manager Referral button click (Copy Referral Link)
  const handleCopyReferralLinkClick = () => {
    if (mappedDivisions.length === 1) {
      // Auto select if only 1 division mapped
      const singleDiv = mappedDivisions[0];
      const link = `${window.location.origin}/referral-form?divisionId=${encodeURIComponent(singleDiv.id)}`;
      navigator.clipboard.writeText(link);
      showToast(`Manager Referral link for ${singleDiv.name} (${singleDiv.id}) copied to clipboard!`);
    } else {
      // Multiple divisions mapped: ask user to select division
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

  // Handle Report Sensitive Case Submission
  const handleReportSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!reportForm.date) errs.date = 'Date is required';
    if (!reportForm.callerName.trim()) errs.callerName = 'Caller Name is required';
    const activeDivId = reportForm.divisionId || mappedDivisions[0]?.id;
    if (!activeDivId) errs.divisionId = 'Please select a Division';
    if (!reportForm.callTime.trim()) errs.callTime = 'Call Time is required';
    if (reportForm.source !== '1 on 1 Session' && !reportForm.callerNumber.trim()) {
      errs.callerNumber = 'Caller Number is required';
    }
    if (reportForm.answeredBy === 'Other' && !reportForm.answeredByName.trim()) {
      errs.answeredByName = 'Name is required when "Other" is selected';
    }
    if (!reportForm.primaryReason) errs.primaryReason = 'Please select a Primary Reason';
    if (!reportForm.urgencyLevel) errs.urgencyLevel = 'Please select an Urgency Level';

    // When "Other" is selected, remarks is mandatory
    if (reportForm.primaryReason === 'Other' && !reportForm.remarks.trim()) {
      errs.remarks = 'Remarks are mandatory when "Other" is selected as Primary Reason';
    }

    if (Object.keys(errs).length > 0) {
      setReportErrors(errs);
      return;
    }

    const divisionObj = mappedDivisions.find(d => d.id === activeDivId) || mappedDivisions[0];
    const newCaseId = `SC-${Math.floor(1000 + Math.random() * 9000)}`;
    const staffName = reportForm.answeredBy === 'Self' ? (currentUser?.name || 'Karan') : reportForm.answeredByName.trim();

    const newCaseRecord = {
      id: newCaseId,
      caseId: newCaseId,
      source: reportForm.source,
      date: reportForm.date,
      reportedAt: `${reportForm.date} ${reportForm.callTime}`,
      callerName: reportForm.callerName.trim(),
      callerNumber: reportForm.source === '1 on 1 Session' ? 'N/A (1 on 1 Session)' : reportForm.callerNumber.trim(),
      callTime: reportForm.callTime.trim(),
      divisionId: divisionObj?.id || activeDivId,
      divisionName: divisionObj?.name || activeDivId,
      corporate: divisionObj?.corporate || userCompany,
      location: divisionObj?.location || 'Corporate Office',
      answeredBy: staffName,
      answeredByType: reportForm.answeredBy,
      primaryReason: reportForm.primaryReason,
      criticalCategory: reportForm.primaryReason,
      urgencyLevel: reportForm.urgencyLevel,
      riskLevel: reportForm.urgencyLevel,
      remarks: reportForm.remarks.trim(),
      summary: reportForm.remarks.trim() || `Inbound sensitive case (${reportForm.source}) from ${reportForm.callerName.trim()} regarding ${reportForm.primaryReason} (${reportForm.urgencyLevel} priority). Answered by ${staffName}.`,
      status: reportForm.urgencyLevel === 'Emergency' ? 'Immediate Action Required' : (reportForm.urgencyLevel === 'Severe' ? 'Intervention Ongoing' : 'New Report'),
      triggerSource: reportForm.source,
      assignedCrisisLead: 'MantraCare Crisis Team',
      timeline: [
        {
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: staffName,
          action: `Incident recorded via ${reportForm.source} under Division ${divisionObj?.name || activeDivId}.`
        }
      ]
    };

    try {
      const existing = JSON.parse(localStorage.getItem('sensitive_cases_critical') || '[]');
      localStorage.setItem('sensitive_cases_critical', JSON.stringify([newCaseRecord, ...existing]));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('critical-cases-updated'));
    } catch (err) {
      console.error('Error saving sensitive case:', err);
    }

    setIsReportModalOpen(false);
    showToast(`Sensitive Case ${newCaseId} successfully logged and sent to Admin!`);

    // Reset form
    setReportForm({
      date: new Date().toISOString().split('T')[0],
      callerName: '',
      divisionId: mappedDivisions[0]?.id || '',
      callTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      callerNumber: '',
      answeredBy: 'Self',
      answeredByName: '',
      primaryReason: '',
      urgencyLevel: '',
      remarks: ''
    });
    setReportErrors({});
  };

  // 6 Quick Link Shortcuts
  const quickLinks = [
    {
      id: 'add-employees',
      title: 'Add Employees',
      desc: 'Invite or upload your team to the program',
      icon: 'bx-user-plus',
      iconColor: '#9333ea',
      iconBg: '#faf5ff',
      onClick: () => navigate('/users')
    },
    {
      id: 'monthly-report',
      title: 'Monthly Report',
      desc: 'Download engagement and utilization reports',
      icon: 'bx-bar-chart-alt-2',
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      onClick: () => {
        showToast('Generating Monthly Corporate Utilization Report (PDF/Excel)...');
      }
    },
    {
      id: 'schedule-activity',
      title: 'Schedule Activity',
      desc: 'Plan webinars, events, and wellness activities',
      icon: 'bx-calendar-event',
      iconColor: '#e11d48',
      iconBg: '#ffe4e6',
      onClick: () => navigate('/calendar')
    },
    {
      id: 'program-overview',
      title: 'Program Overview',
      desc: 'View signups, demographics, and engagement',
      icon: 'bx-search',
      iconColor: '#0d9488',
      iconBg: '#ccfbf1',
      onClick: () => navigate('/cs/summary/overview')
    },
    {
      id: 'service-utilization',
      title: 'Service Utilization',
      desc: 'Track usage across services and departments',
      icon: 'bx-line-chart',
      iconColor: '#4f46e5',
      iconBg: '#e0e7ff',
      onClick: () => navigate('/cs/summary/service')
    },
    {
      id: 'feedback',
      title: 'Feedback',
      desc: 'Review employee feedback and satisfaction',
      icon: 'bx-message-square-dots',
      iconColor: '#d97706',
      iconBg: '#fef3c7',
      onClick: () => navigate('/cs/feedback')
    }
  ];

  // 8 FAQs from user screenshots
  const faqs = [
    {
      id: 1,
      num: '01',
      question: 'Where can I find the Invite Code?',
      answer: 'You can find your company’s unique invite code under the Employees > Invites section of the dashboard navigation. It is also included in your initial corporate welcome email from MantraCare. Employees enter this code during signup to unlock your subsidized wellness benefits.'
    },
    {
      id: 2,
      num: '02',
      question: 'How can my employees signup for the program?',
      answer: 'Employees can download the official MantraCare application on iOS (App Store) or Android (Google Play Store), or visit the web portal at cs.mantracare.com/signup. They simply input their official corporate email address and company invite code (or sign in seamlessly with corporate SSO if activated).'
    },
    {
      id: 3,
      num: '03',
      question: 'How do I send emails to the employees?',
      answer: 'Go to Employees > Invites and select "Send Invite Broadcast". You can dispatch automated onboarding emails with single-click magic login links, send targeted follow-up reminders to unregistered staff, or download HTML email templates for your internal HR distribution lists.'
    },
    {
      id: 4,
      num: '04',
      question: 'How to add or remove employees from Invites?',
      answer: 'To invite new employees, click the "Add Employees" quick link above or navigate to Employees > Add. You can enter individuals manually or upload a bulk CSV/Excel roster. To remove an invite, locate the pending record and click "Revoke Invitation".'
    },
    {
      id: 5,
      num: '05',
      question: 'How to remove/delete employees from Signups?',
      answer: 'Navigate to Employees > Active Signups. Locate the departed employee, click the action menu (three dots), and select "Deactivate Employee". This revokes their active wellness benefits while safely preserving historical anonymized utilization data for compliance.'
    },
    {
      id: 6,
      num: '06',
      question: 'How to creates Group Chat of employees?',
      answer: 'In the dashboard, open Engagement > Group Circles. Click "Create New Group Chat", select the focus area (e.g., Stress Relief, Fitness Challenge, Mindfulness Cohort), specify target departments, and assign a verified MantraCare wellness expert or psychologist.'
    },
    {
      id: 7,
      num: '07',
      question: 'How to Track Service-Based Utilization?',
      answer: 'Click "Service Utilization" in the Quick Links above or navigate to Summary > Service. You can inspect granular analytics across 1-on-1 therapy consultations, webinar attendees, wellness assessments, and fitness sessions broken down by department, role, and month.'
    },
    {
      id: 8,
      num: '08',
      question: 'Where can I find Signup Breakdown?',
      answer: 'Visit Summary > Program Overview or Employees > Analytics. Here you can explore real-time signup penetration rates, department-by-department adoption percentages, active monthly app users, and registration growth over time.'
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(prev => prev === id ? null : id);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>

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

      {/* Main Content Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.75rem 2rem' }}>

        {/* Top Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #01437d 0%, #026bb4 50%, #0284c7 100%)',
          borderRadius: '16px',
          padding: '2.5rem 3rem',
          color: 'white',
          boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.22)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Decorative circles */}
          <div style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            right: '180px',
            bottom: '-60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.74rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#bae6fd',
              marginBottom: '0.65rem'
            }}>
              Client Dashboard
            </span>

            <h1 style={{
              margin: '0 0 0.65rem 0',
              fontSize: '2.1rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              color: 'white',
              lineHeight: 1.2
            }}>
              Welcome back, {userName}
            </h1>

            <p style={{
              margin: 0,
              fontSize: '0.98rem',
              color: '#e0f2fe',
              lineHeight: 1.55,
              fontWeight: '400'
            }}>
              Your Mantra employee wellness hub — manage invites, track utilization, and keep your program running smoothly.
            </p>
          </div>
        </div>

        {/* Section 1: SHORTCUTS / Quick Links */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284c7',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                Shortcuts
              </span>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
                Quick Links
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Jump straight to the tools you use most.
              </p>
            </div>

            {/* 2 Icons Opposite Quick Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* 1. Manager Referral (Copies Referral Link) */}
              <button
                type="button"
                onClick={handleCopyReferralLinkClick}
                title="Copy Manager Referral Link"
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

              {/* 2. Report for Sensitive Cases Button */}
              <button
                type="button"
                onClick={() => {
                  setReportForm({
                    source: 'Hotline Call',
                    date: new Date().toISOString().split('T')[0],
                    callerName: '',
                    divisionId: mappedDivisions[0]?.id || '',
                    callTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                    callerNumber: '',
                    answeredBy: 'Self',
                    answeredByName: '',
                    primaryReason: '',
                    urgencyLevel: '',
                    remarks: ''
                  });
                  setReportErrors({});
                  setIsReportModalOpen(true);
                }}
                title="Report for Sensitive Cases"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.95rem',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                <i className='bx bx-shield-plus' style={{ fontSize: '1.15rem' }}></i>
                <span>Report for Sensitive Cases</span>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {quickLinks.map(card => (
              <div
                key={card.id}
                onClick={card.onClick}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  padding: '1.5rem 1.65rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem'
                }}>
                  <i className={`bx ${card.icon}`}></i>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.02rem', fontWeight: '700', color: '#0f172a' }}>
                    {card.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: ONBOARDING / Getting Started with the Dashboard */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0284c7',
              display: 'block',
              marginBottom: '0.2rem'
            }}>
              Onboarding
            </span>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
              Getting Started with the Dashboard
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              Learn how to navigate and maximize your dashboard.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr'
          }}>
            {/* Left Content */}
            <div style={{ padding: '2.25rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
                This comprehensive tutorial walks you through all the key features of your dashboard — from managing employee records to generating reports and tracking performance metrics.
              </p>

              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>
                  Manage employee invites and signups
                </li>
                <li style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>
                  Schedule engagement activities and webinars
                </li>
                <li style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500' }}>
                  Monitor utilization and program ROI
                </li>
              </ul>
            </div>

            {/* Right Video Preview Graphic */}
            <div
              onClick={() => setIsVideoModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '220px',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              {/* Top Right MantraCare branding */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.95)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#0284c7',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
              }}>
                <i className='bx bx-heart-circle'></i>
                <span>MantraCare</span>
              </div>

              {/* Faint Background greeting graphic */}
              <div style={{
                position: 'absolute',
                left: '2rem',
                color: 'rgba(255,255,255,0.22)',
                fontSize: '4.5rem',
                fontWeight: '800',
                letterSpacing: '-0.04em',
                userSelect: 'none'
              }}>
                Hello
              </div>

              {/* Centered Play Button */}
              <div style={{
                width: '64px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                transition: 'all 0.2s ease',
                zIndex: 2
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.background = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                }}
              >
                <i className='bx bx-play' style={{ marginLeft: '3px' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: SUPPORT / Frequently Asked Questions */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '2.5rem', alignItems: 'flex-start' }}>

            {/* Left FAQ Intro */}
            <div>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284c7',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                Support
              </span>
              <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
                Frequently Asked Questions
              </h2>
              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                Quick answers to common questions about managing your employee wellness program.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                8 topics &bull; Click any question to expand
              </div>
            </div>

            {/* Right Accordion List (01 through 08) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {faqs.map(faq => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      background: 'white',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      onClick={() => toggleFaq(faq.id)}
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: '1rem',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span style={{
                          background: isOpen ? '#0284c7' : '#e0f2fe',
                          color: isOpen ? 'white' : '#0369a1',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          borderRadius: '6px',
                          padding: '0.25rem 0.55rem',
                          minWidth: '22px',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}>
                          {faq.num}
                        </span>
                        <span style={{
                          fontSize: '0.92rem',
                          fontWeight: '600',
                          color: isOpen ? '#0284c7' : '#0f172a',
                          transition: 'color 0.15s ease'
                        }}>
                          {faq.question}
                        </span>
                      </div>

                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <i className='bx bx-chevron-down'></i>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{
                        padding: '0 1.25rem 1.15rem 3.4rem',
                        fontSize: '0.86rem',
                        color: '#475569',
                        lineHeight: 1.6,
                        borderTop: '1px solid #f8fafc'
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

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
                Your organization has multiple active corporate divisions. Select the division to map this referral link to:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                {mappedDivisions.map(div => {
                  const isSelected = selectedDivisionId === div.id;
                  return (
                    <div
                      key={div.id}
                      onClick={() => setSelectedDivisionId(div.id)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: isSelected ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: isSelected ? '#0284c7' : '#0f172a', fontSize: '0.92rem' }}>
                          {div.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Division ID: <strong style={{ color: '#0369a1' }}>{div.id}</strong> &bull; {div.corporate}
                        </div>
                      </div>
                      <i className={`bx ${isSelected ? 'bxs-check-circle text-blue' : 'bx-circle'}`} style={{ fontSize: '1.3rem', color: isSelected ? '#0284c7' : '#94a3b8' }}></i>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
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

      {/* MODAL: Report for Sensitive Cases */}
      {isReportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#dc2626',
              color: 'white',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>
                  <i className='bx bx-shield-plus'></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                    Report for Sensitive Cases
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#fee2e2' }}>
                    Log an urgent clinical crisis, inbound helpline call, or employee risk concern.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleReportSubmit} style={{ padding: '1.5rem' }}>

              {/* Top Row: Source Selection Radio */}
              <div style={{
                marginBottom: '1.15rem',
                padding: '0.85rem 1rem',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.45rem' }}>
                  Source <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: reportForm.source === 'Hotline Call' ? '700' : '500',
                    color: reportForm.source === 'Hotline Call' ? '#dc2626' : '#475569'
                  }}>
                    <input
                      type="radio"
                      name="sensitiveCaseSource"
                      value="Hotline Call"
                      checked={reportForm.source === 'Hotline Call'}
                      onChange={() => setReportForm({ ...reportForm, source: 'Hotline Call' })}
                      style={{ accentColor: '#dc2626', width: '17px', height: '17px', cursor: 'pointer' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className='bx bx-phone-call'></i>
                      <span>Hotline Call</span>
                    </span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: reportForm.source === '1 on 1 Session' ? '700' : '500',
                    color: reportForm.source === '1 on 1 Session' ? '#0284c7' : '#475569'
                  }}>
                    <input
                      type="radio"
                      name="sensitiveCaseSource"
                      value="1 on 1 Session"
                      checked={reportForm.source === '1 on 1 Session'}
                      onChange={() => setReportForm({ ...reportForm, source: '1 on 1 Session', callerNumber: '' })}
                      style={{ accentColor: '#0284c7', width: '17px', height: '17px', cursor: 'pointer' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className='bx bx-user-voice'></i>
                      <span>1 on 1 Session</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 1: Date & Call Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Date <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: reportErrors.date ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                  {reportErrors.date && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.date}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Call Time <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={reportForm.callTime}
                    onChange={(e) => setReportForm({ ...reportForm, callTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: reportErrors.callTime ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                  {reportErrors.callTime && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.callTime}</span>}
                </div>
              </div>

              {/* Row 2: Caller Name & Caller Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Caller Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe / Manager"
                    value={reportForm.callerName}
                    onChange={(e) => setReportForm({ ...reportForm, callerName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: reportErrors.callerName ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                  {reportErrors.callerName && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.callerName}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Caller Number {reportForm.source === '1 on 1 Session' ? (
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>(Disabled for 1 on 1 Session)</span>
                    ) : (
                      <span style={{ color: '#dc2626' }}>*</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    disabled={reportForm.source === '1 on 1 Session'}
                    placeholder={reportForm.source === '1 on 1 Session' ? "Disabled (1 on 1 Session)" : "e.g. +91 98765 43210"}
                    value={reportForm.source === '1 on 1 Session' ? '' : reportForm.callerNumber}
                    onChange={(e) => setReportForm({ ...reportForm, callerNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: reportErrors.callerNumber ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: reportForm.source === '1 on 1 Session' ? '#94a3b8' : '#0f172a',
                      background: reportForm.source === '1 on 1 Session' ? '#f1f5f9' : 'white',
                      cursor: reportForm.source === '1 on 1 Session' ? 'not-allowed' : 'text',
                      boxSizing: 'border-box'
                    }}
                  />
                  {reportErrors.callerNumber && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.callerNumber}</span>}
                </div>
              </div>

              {/* Row 3: Division (Select from dropdown) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Division <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={reportForm.divisionId || mappedDivisions[0]?.id || ''}
                  onChange={(e) => setReportForm({ ...reportForm, divisionId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: reportErrors.divisionId ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#0f172a',
                    background: 'white',
                    boxSizing: 'border-box'
                  }}
                >
                  {mappedDivisions.map(div => (
                    <option key={div.id} value={div.id}>
                      {div.id} — {div.name} ({div.corporate})
                    </option>
                  ))}
                </select>
                {reportErrors.divisionId && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.divisionId}</span>}
              </div>

              {/* Row 4: Answered By (Self / Other) */}
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Answered By <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: reportForm.answeredBy === 'Other' ? '0.75rem' : '0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                    <input
                      type="radio"
                      name="answeredBy"
                      value="Self"
                      checked={reportForm.answeredBy === 'Self'}
                      onChange={() => setReportForm({ ...reportForm, answeredBy: 'Self', answeredByName: '' })}
                      style={{ accentColor: '#dc2626' }}
                    />
                    <span>Self ({userName})</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                    <input
                      type="radio"
                      name="answeredBy"
                      value="Other"
                      checked={reportForm.answeredBy === 'Other'}
                      onChange={() => setReportForm({ ...reportForm, answeredBy: 'Other' })}
                      style={{ accentColor: '#dc2626' }}
                    />
                    <span>Other Staff Member</span>
                  </label>
                </div>

                {reportForm.answeredBy === 'Other' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                      Staff Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter staff member's full name"
                      value={reportForm.answeredByName}
                      onChange={(e) => setReportForm({ ...reportForm, answeredByName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: reportErrors.answeredByName ? '1px solid #dc2626' : '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                    {reportErrors.answeredByName && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.answeredByName}</span>}
                  </div>
                )}
              </div>

              {/* Row 5: Primary Reason & Urgency Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Primary Reason <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={reportForm.primaryReason}
                    onChange={(e) => setReportForm({ ...reportForm, primaryReason: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: reportErrors.primaryReason ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: reportForm.primaryReason ? '#0f172a' : '#64748b',
                      background: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="" disabled>Please select one</option>
                    {PRIMARY_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {reportErrors.primaryReason && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.primaryReason}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                    Urgency Level <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={reportForm.urgencyLevel}
                    onChange={(e) => setReportForm({ ...reportForm, urgencyLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: reportErrors.urgencyLevel ? '1px solid #dc2626' : '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: reportForm.urgencyLevel ? '#0f172a' : '#64748b',
                      background: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="" disabled>Please select one</option>
                    {URGENCY_LEVELS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {reportErrors.urgencyLevel && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.urgencyLevel}</span>}
                </div>
              </div>

              {/* Row 6: Remarks (Optional, but Mandatory if 'Other' is selected) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                  <span>
                    Remarks {reportForm.primaryReason === 'Other' ? (
                      <span style={{ color: '#dc2626' }}>* (Mandatory when "Other" is selected)</span>
                    ) : (
                      <span style={{ color: '#64748b', fontWeight: '400' }}>(Optional)</span>
                    )}
                  </span>
                </label>
                <textarea
                  rows="3"
                  placeholder={reportForm.primaryReason === 'Other' ? "Please specify details for 'Other' reason (Mandatory)..." : "Add any observations, background context, or immediate actions taken..."}
                  value={reportForm.remarks}
                  onChange={(e) => setReportForm({ ...reportForm, remarks: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: reportErrors.remarks ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                {reportErrors.remarks && <span style={{ fontSize: '0.72rem', color: '#dc2626', display: 'block', marginTop: '0.2rem' }}>{reportErrors.remarks}</span>}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
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
                  type="submit"
                  style={{
                    padding: '0.6rem 1.4rem',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(220,38,38,0.3)'
                  }}
                >
                  <i className='bx bx-send'></i>
                  <span>Submit Sensitive Case</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Video Walkthrough Tutorial Modal */}
      {isVideoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '92%',
            maxWidth: '720px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)'
          }}>
            <div style={{
              background: '#0f172a',
              color: 'white',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
                <i className='bx bx-play-circle' style={{ color: '#0ea5e9', fontSize: '1.3rem' }}></i>
                <span>MantraCare Client Dashboard Video Tutorial</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.75rem', textAlign: 'center', background: '#0284c7', color: 'white' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <i className='bx bx-movie-play' style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '800' }}>
                Welcome to MantraCare Corporate Hub
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e0f2fe', maxWidth: '480px', marginInline: 'auto', lineHeight: 1.5 }}>
                Watch this 3-minute onboarding video to learn how to add team members, review wellness schedules, download monthly utilization data, and access feedback surveys.
              </p>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Duration: 3m 45s &bull; High Definition 1080p
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
