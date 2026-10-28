import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { getPrimaryCS } from '../utils/roleUtils';
import { getAuthenticatedSchedulingUser } from '../utils/cadenceDivisionUtils';
import ScheduleCadenceModal from '../components/ScheduleCadenceModal';
import AcceptanceReminderModal from '../components/AcceptanceReminderModal';
import MeetingMomModal from '../components/MeetingMomModal';
import CadenceActivityLogsTab from '../components/CadenceActivityLogsTab';
import { getActivityLogs } from '../utils/cadenceActivityLogs';

// Map Google Calendar attendee responseStatus to human-readable label and UI tokens
const getResponseStatusConfig = (status) => {
  const norm = (status || 'needsAction').toLowerCase();
  switch (norm) {
    case 'accepted':
      return {
        label: 'Accepted',
        bg: '#dcfce7',
        color: '#15803d',
        border: '#86efac',
        icon: 'bx-check-circle'
      };
    case 'tentative':
      return {
        label: 'Tentative',
        bg: '#dbeafe',
        color: '#1e40af',
        border: '#93c5fd',
        icon: 'bx-help-circle'
      };
    case 'declined':
      return {
        label: 'Declined',
        bg: '#fee2e2',
        color: '#b91c1c',
        border: '#fca5a5',
        icon: 'bx-x-circle'
      };
    case 'needsaction':
    default:
      return {
        label: 'Awaiting response',
        bg: '#fef3c7',
        color: '#92400e',
        border: '#fde68a',
        icon: 'bx-time-five'
      };
  }
};

const getMeetingAttendees = (meeting, cadence) => {
  if (meeting?.attendees && meeting.attendees.length > 0) return meeting.attendees;
  if (cadence?.attendees && cadence.attendees.length > 0) return cadence.attendees;
  const list = [];
  if (meeting?.clientEmail || cadence?.clientEmail) {
    const email = meeting?.clientEmail || cadence?.clientEmail;
    list.push({
      email,
      name: meeting?.clientName || cadence?.clientName || 'Client SPOC',
      role: 'SPOC',
      responseStatus: (meeting?.clientAccepted || cadence?.clientAccepted) ? 'accepted' : 'needsAction'
    });
  }
  if (meeting?.csEmail || cadence?.csEmail) {
    const email = meeting?.csEmail || cadence?.csEmail;
    list.push({
      email,
      name: meeting?.csName || cadence?.csName || 'CS Lead',
      role: 'Primary CS',
      responseStatus: 'accepted'
    });
  }
  if (meeting?.participantEmails || cadence?.participantEmails) {
    const extras = meeting?.participantEmails || cadence?.participantEmails || [];
    extras.forEach(email => {
      list.push({
        email,
        name: email.split('@')[0],
        role: 'Participant',
        responseStatus: 'needsAction'
      });
    });
  }
  return list;
};

// Helper to generate Google Meet code
const generateMeetCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}-${part3}`;
};

// Helper to format date nicely
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Custom Select Component matching Calendar style
function CustomSelect({ label, options, value, onChange, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = (options || []).filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-group" ref={dropdownRef}>
      {label && <label>{label}</label>}
      <div className={`custom-select ${isOpen ? 'active' : ''}`} id={id}>
        <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
          <span>{value ? value.label : 'Select...'}</span>
          <div className="select-actions">
            {value && value.value !== 'all' && (
              <i className='bx bx-x clear-btn' onClick={(e) => {
                e.stopPropagation();
                onChange({ value: 'all', label: 'All Divisions' });
              }} style={{ display: 'block' }}></i>
            )}
            {(!value || value.value === 'all') && <i className='bx bxs-down-arrow arrow'></i>}
          </div>
        </div>
        {isOpen && (
          <div className="select-dropdown" style={{ display: 'flex' }}>
            <div className="search-box">
              <i className='bx bx-search'></i>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <ul className="options" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, i) => (
                  <li key={i} onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}>
                    {opt.label}
                  </li>
                ))
              ) : (
                <li style={{ padding: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>No divisions found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Initial default seed cadences if none stored
const INITIAL_CADENCES = [
  {
    id: 'CAD-1001',
    clientName: 'TechVision Global Inc.',
    divisionName: 'testt',
    topic: 'Bi-Weekly CS Review & Health Check',
    frequency: 'Weekly',
    intervalWeeks: 2,
    startDate: '2026-11-02',
    startTime: '11:00',
    durationMinutes: 45,
    clientEmail: 'sarah.jenkins@techvision.com',
    participantEmails: ['hr-wellness@techvision.com', 'david.ops@techvision.com'],
    csEmail: 'cs-lead@mantracare.com',
    csName: 'Karan Hinduja (CS Lead)',
    status: 'Active',
    createdAt: '2026-10-25T10:30:00Z',
    notes: 'Review monthly wellness app adoption, trainer session feedback, and upcoming mental health workshops.',
    occurrencesCount: 6,
    meetings: [
      {
        id: 'cal_evt_1001_1',
        occurrenceIndex: 1,
        date: '2026-11-02',
        startTime: '11:00',
        endTime: '11:45',
        meetingId: 'meet-w1001-a',
        meetCode: 'vxt-mnpq-zrt',
        meetLink: 'https://meet.google.com/vxt-mnpq-zrt',
        status: 'Scheduled',
        clientAccepted: true,
        csAccepted: true,
        calendarSynced: true
      },
      {
        id: 'cal_evt_1001_2',
        occurrenceIndex: 2,
        date: '2026-11-16',
        startTime: '11:00',
        endTime: '11:45',
        meetingId: 'meet-w1001-b',
        meetCode: 'kbd-jwqm-lsa',
        meetLink: 'https://meet.google.com/kbd-jwqm-lsa',
        status: 'Scheduled',
        clientAccepted: true,
        csAccepted: true,
        calendarSynced: true
      },
      {
        id: 'cal_evt_1001_3',
        occurrenceIndex: 3,
        date: '2026-11-30',
        startTime: '11:00',
        endTime: '11:45',
        meetingId: 'meet-w1001-c',
        meetCode: 'rtu-pbvc-yhn',
        meetLink: 'https://meet.google.com/rtu-pbvc-yhn',
        status: 'Scheduled',
        clientAccepted: false,
        csAccepted: true,
        calendarSynced: true
      },
      {
        id: 'cal_evt_1001_4',
        occurrenceIndex: 4,
        date: '2026-12-14',
        startTime: '11:00',
        endTime: '11:45',
        meetingId: 'meet-w1001-d',
        meetCode: 'qwe-zxcv-bnm',
        meetLink: 'https://meet.google.com/qwe-zxcv-bnm',
        status: 'Scheduled',
        clientAccepted: false,
        csAccepted: true,
        calendarSynced: true
      }
    ]
  },
  {
    id: 'CAD-1002',
    clientName: 'Apex Health Corp',
    divisionName: 'Corp 2 Div 1',
    topic: 'Monthly Executive Wellness Governance & SLA Review',
    frequency: 'Monthly',
    startDate: '2026-11-05',
    startTime: '15:30',
    durationMinutes: 60,
    clientEmail: 'rajesh.sharma@apexhealth.in',
    participantEmails: ['ananya.vp@apexhealth.in'],
    csEmail: 'cs-operations@mantracare.com',
    csName: 'Priya Mehta (CS SPOC)',
    status: 'Active',
    createdAt: '2026-10-24T14:15:00Z',
    notes: 'Monthly high-level executive review with VP HR on hotline pickup ratio, counselor assignments, and quarterly invoicing.',
    occurrencesCount: 5,
    meetings: [
      {
        id: 'cal_evt_1002_1',
        occurrenceIndex: 1,
        date: '2026-11-05',
        startTime: '15:30',
        endTime: '16:30',
        meetingId: 'meet-m1002-a',
        meetCode: 'hjk-plmo-rty',
        meetLink: 'https://meet.google.com/hjk-plmo-rty',
        status: 'Scheduled',
        clientAccepted: true,
        csAccepted: true,
        calendarSynced: true
      },
      {
        id: 'cal_evt_1002_2',
        occurrenceIndex: 2,
        date: '2026-12-05',
        startTime: '15:30',
        endTime: '16:30',
        meetingId: 'meet-m1002-b',
        meetCode: 'dfg-ghjk-wer',
        meetLink: 'https://meet.google.com/dfg-ghjk-wer',
        status: 'Scheduled',
        clientAccepted: false,
        csAccepted: true,
        calendarSynced: true
      },
      {
        id: 'cal_evt_1002_3',
        occurrenceIndex: 3,
        date: '2027-01-05',
        startTime: '15:30',
        endTime: '16:30',
        meetingId: 'meet-m1002-c',
        meetCode: 'uio-asdf-qaz',
        meetLink: 'https://meet.google.com/uio-asdf-qaz',
        status: 'Scheduled',
        clientAccepted: false,
        csAccepted: true,
        calendarSynced: true
      }
    ]
  },
  {
    id: 'CAD-1003',
    clientName: 'Nova FinTech Solutions',
    divisionName: 'Corp 2 Div 1',
    topic: 'One-Time Onboarding Kickoff & App Rollout Session',
    frequency: 'One time',
    startDate: '2026-10-30',
    startTime: '14:00',
    durationMinutes: 45,
    clientEmail: 'lead.people@novafintech.com',
    participantEmails: ['it-admin@novafintech.com'],
    csEmail: 'cs-lead@mantracare.com',
    csName: 'Karan Hinduja (CS Lead)',
    status: 'Active',
    createdAt: '2026-10-26T09:00:00Z',
    notes: 'Kickoff meeting to finalize corporate email domains, SSO configuration, and employee welcome blast.',
    occurrencesCount: 1,
    meetings: [
      {
        id: 'cal_evt_1003_1',
        occurrenceIndex: 1,
        date: '2026-10-30',
        startTime: '14:00',
        endTime: '14:45',
        meetingId: 'meet-o1003-1',
        meetCode: 'zxc-vbnm-lkj',
        meetLink: 'https://meet.google.com/zxc-vbnm-lkj',
        status: 'Scheduled',
        clientAccepted: true,
        csAccepted: true,
        calendarSynced: true
      }
    ]
  }
];

export default function ClientCadence() {
  const navigate = useNavigate();
  const { clients } = useGlobal();

  // Load Cadences from LocalStorage
  const [cadences, setCadences] = useState(() => {
    try {
      const saved = localStorage.getItem('mc_cs_cadence_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map((c) => {
            let div = c.divisionName;
            if (!div || ['Head Office', 'Corporate Office', 'Main Branch', 'Tech Division', 'HR Division', 'Operations Division'].includes(div)) {
              div = (c.clientName === 'Apex Health Corp' || c.clientName === 'Nova FinTech Solutions') ? 'Corp 2 Div 1' : 'testt';
            }
            return {
              ...c,
              divisionName: div
            };
          });
          try {
            localStorage.setItem('mc_cs_cadence_logs', JSON.stringify(cleaned));
          } catch {}
          return cleaned;
        }
      }
    } catch {}
    return INITIAL_CADENCES;
  });

  // Division Filter State (Like Calendar)
  const [selectedDivision, setSelectedDivision] = useState({ value: 'all', label: 'All Divisions' });

  // List of all Corporate Clients in the system (from /corporate)
  const corporateList = useMemo(() => {
    const map = new Map();
    (clients || []).forEach(c => {
      const name = c.name || c.clientName;
      if (name) map.set(name, c);
    });
    try {
      const savedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      savedClients.forEach(c => {
        const name = c.name || c.clientName;
        if (name && !map.has(name)) map.set(name, c);
      });
    } catch {}
    return Array.from(map.values());
  }, [clients]);

  // Extract all Divisions added under Corporates (matching Calendar & Corporate management)
  const divisionOptions = useMemo(() => {
    const divs = new Set();

    // 1. From Corporate clients in GlobalContext
    (clients || []).forEach(c => {
      if (c.divisionName) divs.add(c.divisionName);
      if (c.divisions && Array.isArray(c.divisions)) {
        c.divisions.forEach(d => {
          if (d.divisionName) divs.add(d.divisionName);
        });
      }
    });

    // 2. From localStorage cs-admin-clients
    try {
      const savedClients = JSON.parse(localStorage.getItem('cs-admin-clients') || '[]');
      savedClients.forEach(c => {
        if (c.divisionName) divs.add(c.divisionName);
        if (c.divisions && Array.isArray(c.divisions)) {
          c.divisions.forEach(d => {
            if (d.divisionName) divs.add(d.divisionName);
          });
        }
      });
    } catch {}

    // 3. From localStorage division_orders
    try {
      const savedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      savedOrders.forEach(o => {
        const oDiv = o.division || o.divisionName;
        if (oDiv) divs.add(oDiv);
      });
    } catch {}

    // 4. From existing cadences (Corporate divisions)
    const bannedDivs = new Set(['Head Office', 'Corporate Office', 'Main Branch', 'Tech Division', 'HR Division', 'Operations Division']);
    cadences.forEach(c => {
      const div = c.divisionName || c.division;
      if (div && !bannedDivs.has(div)) {
        divs.add(div);
      }
    });

    // Fallbacks if no corporate divisions exist yet in system
    if (divs.size === 0) {
      divs.add('Corp 2 Div 1');
      divs.add('testt');
    }

    const sorted = Array.from(divs).sort();
    return [
      { value: 'all', label: 'All Divisions' },
      ...sorted.map(d => ({ value: d, label: d }))
    ];
  }, [clients, cadences]);

  // Active Tab: 'meetings' (Date-Wise Upcoming), 'cadences' (Master Log), 'activity' (Activity & Execution Logs)
  const [activeTab, setActiveTab] = useState('meetings');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('All');
  const [selectedClientFilter, setSelectedClientFilter] = useState('All');
  const [cardFilter, setCardFilter] = useState(null); // 'active_cadences' | 'next_7_days' | 'weekly_recurring' | 'calendar_api'

  // Create Cadence Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccessId, setCopySuccessId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State
  const defaultCs = getPrimaryCS();
  const [formData, setFormData] = useState({
    clientName: '',
    divisionName: '',
    topic: '',
    frequency: 'Weekly', // 'One time', 'Weekly', 'Monthly'
    occurrences: 6, // default number of occurrences
    startDate: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    durationMinutes: 45,
    clientEmail: '',
    participantEmails: '', // comma separated in UI
    csEmail: defaultCs?.email || 'cs-lead@mantracare.com',
    csName: defaultCs?.name || 'Karan Hinduja (CS Lead)',
    notes: ''
  });

  // Divisions belonging to currently selected Corporate in the modal form
  const divisionsForSelectedCorporate = useMemo(() => {
    if (!formData.clientName) {
      return divisionOptions.filter(d => d.value !== 'all').map(d => d.label);
    }
    const matched = corporateList.find(c => (c.name || c.clientName) === formData.clientName);
    const divs = [];
    if (matched) {
      if (matched.divisions && Array.isArray(matched.divisions)) {
        matched.divisions.forEach(d => {
          if (d.divisionName) divs.push(d.divisionName);
        });
      }
      if (matched.divisionName) divs.push(matched.divisionName);
    }
    try {
      const savedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
      savedOrders.forEach(o => {
        if ((o.corporate || o.clientName) === formData.clientName) {
          const od = o.division || o.divisionName;
          if (od) divs.push(od);
        }
      });
    } catch {}

    const unique = Array.from(new Set(divs.filter(Boolean)));
    return unique.length > 0 ? unique : divisionOptions.filter(d => d.value !== 'all').map(d => d.label);
  }, [formData.clientName, corporateList, divisionOptions]);

  // Handler for opening Schedule Modal
  const handleOpenScheduleModal = () => {
    const defaultDiv = (selectedDivision && selectedDivision.value !== 'all')
      ? selectedDivision.label
      : (divisionOptions.find(d => d.value !== 'all')?.label || 'testt');

    setFormData(prev => ({
      ...prev,
      divisionName: defaultDiv
    }));
    setIsModalOpen(true);
  };

  // Handler for changing Corporate in modal
  const handleCorporateChange = (corpName) => {
    const matched = corporateList.find(c => (c.name || c.clientName) === corpName);
    let defaultDiv = formData.divisionName;
    if (matched) {
      defaultDiv = matched.divisionName || matched.divisions?.[0]?.divisionName || defaultDiv;
    }
    setFormData(prev => ({
      ...prev,
      clientName: corpName,
      divisionName: defaultDiv,
      clientEmail: matched?.clientEmail || prev.clientEmail
    }));
  };

  const [formErrors, setFormErrors] = useState({});

  // Acceptance Reminder Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedCadenceForReminder, setSelectedCadenceForReminder] = useState(null);
  const [selectedMeetingForReminder, setSelectedMeetingForReminder] = useState(null);
  const [reminderModalMode, setReminderModalMode] = useState('acceptance'); // 'acceptance' | 'reminder'
  const [refreshingCadenceId, setRefreshingCadenceId] = useState(null);

  // Minutes of Meeting (MOM) Modal State
  const [isMomModalOpen, setIsMomModalOpen] = useState(false);
  const [selectedMeetingForMom, setSelectedMeetingForMom] = useState(null);
  const [momModalInitialMode, setMomModalInitialMode] = useState('complete'); // 'complete' | 'view' | 'edit'
  const [activityLogsCount, setActivityLogsCount] = useState(() => {
    try {
      return getActivityLogs().length;
    } catch {
      return 0;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mc_cs_cadence_logs', JSON.stringify(cadences));
    } catch {}
  }, [cadences]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Refresh latest Google Calendar event attendee response statuses
  const handleRefreshEvent = async (cadenceId, meeting = null) => {
    const targetCadence = cadences.find(c => c.id === cadenceId);
    if (!targetCadence) return;

    setRefreshingCadenceId(cadenceId);
    try {
      const res = await fetch('/api/cadence/refresh-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: targetCadence.gcalEventId || targetCadence.calendarId || targetCadence.id,
          cadenceId: targetCadence.id,
          attendees: targetCadence.attendees || []
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.attendees)) {
        setCadences(prev => prev.map(c => {
          if (c.id === cadenceId) {
            return {
              ...c,
              attendees: data.attendees,
              lastRefreshedAt: new Date().toISOString()
            };
          }
          return c;
        }));
        showNotification(`Refreshed Google Calendar attendee statuses for "${targetCadence.topic}"!`);
      } else {
        showNotification(`Unable to refresh event: ${data.error || 'Server error'}`, 'error');
      }
    } catch (err) {
      showNotification(`Error refreshing Google Calendar: ${err.message}`, 'error');
    } finally {
      setRefreshingCadenceId(null);
    }
  };

  // Open Acceptance Reminder / Meeting Reminder Modal
  const handleOpenReminder = (cadence, meeting = null, mode = 'acceptance') => {
    setSelectedCadenceForReminder(cadence);
    setSelectedMeetingForReminder(meeting);
    setReminderModalMode(mode);
    setIsReminderModalOpen(true);
  };

  // Handler when reminder successfully sent
  const handleReminderSent = (cadenceId, result) => {
    const nowIso = new Date().toISOString();
    setCadences(prev => prev.map(c => {
      if (c.id === cadenceId) {
        return {
          ...c,
          lastReminderSentAt: nowIso
        };
      }
      return c;
    }));
    try {
      setActivityLogsCount(getActivityLogs().length);
    } catch {}
    showNotification(`Acceptance reminder sent to ${result?.recipientCount || 'SPOC'} recipient(s)!`);
  };

  // Helper: calculate end time
  const getEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '11:45';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + Number(durationMinutes);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // Generate Date-Wise Meetings for a new Cadence
  const generateCadenceMeetings = (cadenceId, config) => {
    const meetings = [];
    const baseDate = new Date(config.startDate);
    const count = config.frequency === 'One time' ? 1 : Number(config.occurrences || 6);

    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      if (config.frequency === 'Weekly') {
        d.setDate(baseDate.getDate() + i * 7);
      } else if (config.frequency === 'Monthly') {
        d.setMonth(baseDate.getMonth() + i);
      }
      const dateStr = d.toISOString().split('T')[0];
      const meetCode = generateMeetCode();

      meetings.push({
        id: `cal_evt_${cadenceId.replace('CAD-', '')}_${i + 1}`,
        occurrenceIndex: i + 1,
        date: dateStr,
        startTime: config.startTime,
        endTime: getEndTime(config.startTime, config.durationMinutes),
        meetingId: `meet-cad-${Date.now().toString().slice(-5)}-${i + 1}`,
        meetCode: meetCode,
        meetLink: `https://meet.google.com/${meetCode}`,
        status: 'Scheduled',
        clientAccepted: true,
        csAccepted: true,
        calendarSynced: true
      });
    }

    return meetings;
  };

  // Handle Create Cadence Submit
  const handleCreateCadence = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.clientName.trim()) errors.clientName = 'Client / Corporate name is required.';
    if (!formData.topic.trim()) errors.topic = 'Meeting topic / purpose is required.';
    if (!formData.startDate) errors.startDate = 'Starting date is required.';
    if (!formData.startTime) errors.startTime = 'Meeting time is required.';
    if (!formData.clientEmail.trim()) {
      errors.clientEmail = 'Client email is required for calendar invite.';
    } else if (!formData.clientEmail.includes('@')) {
      errors.clientEmail = 'Enter a valid client email address.';
    }
    if (!formData.csEmail.trim()) {
      errors.csEmail = 'CS email is required.';
    } else if (!formData.csEmail.includes('@')) {
      errors.csEmail = 'Enter a valid CS email address.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsGenerating(true);

    // Simulate Google Calendar API meeting creation & invite dispatch
    setTimeout(() => {
      const newId = 'CAD-' + Math.floor(1000 + Math.random() * 9000);
      const parsedParticipants = formData.participantEmails
        ? formData.participantEmails.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const meetings = generateCadenceMeetings(newId, formData);

      const newCadence = {
        id: newId,
        clientName: formData.clientName.trim(),
        divisionName: formData.divisionName || (selectedDivision.value !== 'all' ? selectedDivision.label : (divisionOptions.find(d => d.value !== 'all')?.label || 'testt')),
        topic: formData.topic.trim(),
        frequency: formData.frequency,
        startDate: formData.startDate,
        startTime: formData.startTime,
        durationMinutes: Number(formData.durationMinutes),
        clientEmail: formData.clientEmail.trim(),
        participantEmails: parsedParticipants,
        csEmail: formData.csEmail.trim(),
        csName: formData.csName.trim() || 'CS SPOC',
        status: 'Active',
        createdAt: new Date().toISOString(),
        notes: formData.notes.trim(),
        occurrencesCount: meetings.length,
        meetings: meetings
      };

      setCadences(prev => [newCadence, ...prev]);
      setIsGenerating(false);
      setIsModalOpen(false);

      // Reset form
      setFormData({
        clientName: '',
        divisionName: selectedDivision.value !== 'all' ? selectedDivision.label : (divisionOptions.find(d => d.value !== 'all')?.label || 'testt'),
        topic: '',
        frequency: 'Weekly',
        occurrences: 6,
        startDate: new Date().toISOString().split('T')[0],
        startTime: '11:00',
        durationMinutes: 45,
        clientEmail: '',
        participantEmails: '',
        csEmail: defaultCs?.email || 'cs-lead@mantracare.com',
        csName: defaultCs?.name || 'Karan Hinduja (CS Lead)',
        notes: ''
      });
      setFormErrors({});

      showNotification(`Cadence created! Google Calendar API scheduled ${meetings.length} meeting(s) with Google Meet links.`);
    }, 600);
  };

  // Filter cadences by Division (Like Calendar)
  const cadencesForDivision = useMemo(() => {
    if (!selectedDivision || selectedDivision.value === 'all') {
      return cadences;
    }
    return cadences.filter(c => {
      const div = c.divisionName || c.division;
      return div === selectedDivision.label || String(c.divisionId) === String(selectedDivision.value);
    });
  }, [cadences, selectedDivision]);

  // Flatten all meetings date-wise across active cadences for selected division
  const allDateWiseMeetings = useMemo(() => {
    const list = [];
    cadencesForDivision.forEach(c => {
      if (c.status === 'Cancelled') return;
      if (c.meetings && Array.isArray(c.meetings)) {
        c.meetings.forEach(m => {
          list.push({
            ...m,
            cadenceId: c.id,
            divisionId: c.divisionId || c.division_id,
            clientName: c.clientName,
            divisionName: c.divisionName || 'Default Division',
            topic: c.topic,
            frequency: c.frequency,
            clientEmail: c.clientEmail,
            participantEmails: c.participantEmails,
            csEmail: c.csEmail,
            csName: c.csName,
            primaryCS: c.primaryCS,
            requestedBy: c.requestedBy,
            scheduledBy: c.scheduledBy,
            joiningLink: m.joiningLink || m.meetLink || c.joiningLink || c.meetLink || null,
            htmlLink: m.htmlLink || c.htmlLink || null,
            gcalEventId: m.gcalEventId || c.gcalEventId || c.calendarId || c.id,
            attendees: m.attendees || c.attendees || [],
            lastReminderSentAt: c.lastReminderSentAt,
            lastRefreshedAt: c.lastRefreshedAt,
            rawCadence: c
          });
        });
      }
    });

    // Sort chronologically by date then startTime
    return list.sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [cadencesForDivision]);

  // Count of upcoming meetings in next 7 days
  const next7DaysMeetingsCount = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);

    return allDateWiseMeetings.filter(m => {
      const meetingDate = new Date(m.date);
      return meetingDate >= now && meetingDate <= end;
    }).length;
  }, [allDateWiseMeetings]);

  // Metric card click handler to filter data accordingly
  const handleCardClick = (type) => {
    if (cardFilter === type) {
      setCardFilter(null);
      if (type === 'weekly_recurring') setFilterFrequency('All');
      return;
    }
    setCardFilter(type);
    if (type === 'active_cadences') {
      setActiveTab('cadences');
    } else if (type === 'next_7_days') {
      setActiveTab('meetings');
    } else if (type === 'weekly_recurring') {
      setFilterFrequency('Weekly');
      setActiveTab('meetings');
    } else if (type === 'calendar_api') {
      setActiveTab('activity');
    }
  };

  // Filtered Date-Wise Meetings
  const filteredMeetings = allDateWiseMeetings.filter(m => {
    if (cardFilter === 'next_7_days') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      const meetingDate = new Date(m.date);
      if (meetingDate < now || meetingDate > end) return false;
    }
    if (cardFilter === 'active_cadences') {
      if (m.rawCadence?.status !== 'Active') return false;
    }
    if (filterFrequency !== 'All' && m.frequency !== filterFrequency) return false;
    if (selectedClientFilter !== 'All' && m.clientName !== selectedClientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = m.clientName?.toLowerCase().includes(q);
      const matchTopic = m.topic?.toLowerCase().includes(q);
      const matchEmail = m.clientEmail?.toLowerCase().includes(q) || m.csEmail?.toLowerCase().includes(q);
      const matchId = m.meetingId?.toLowerCase().includes(q) || m.meetCode?.toLowerCase().includes(q);
      if (!matchClient && !matchTopic && !matchEmail && !matchId) return false;
    }
    return true;
  });

  // Filtered Cadences Master Log
  const filteredCadences = cadencesForDivision.filter(c => {
    if (cardFilter === 'active_cadences' && c.status !== 'Active') return false;
    if (cardFilter === 'weekly_recurring' && c.frequency !== 'Weekly') return false;
    if (cardFilter === 'next_7_days') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      const hasMeetingInNext7Days = (c.meetings || []).some(m => {
        const mDate = new Date(m.date);
        return mDate >= now && mDate <= end;
      });
      if (!hasMeetingInNext7Days) return false;
    }
    if (filterFrequency !== 'All' && c.frequency !== filterFrequency) return false;
    if (selectedClientFilter !== 'All' && c.clientName !== selectedClientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchClient = c.clientName?.toLowerCase().includes(q);
      const matchTopic = c.topic?.toLowerCase().includes(q);
      const matchEmail = c.clientEmail?.toLowerCase().includes(q) || c.csEmail?.toLowerCase().includes(q);
      const matchId = c.id?.toLowerCase().includes(q);
      if (!matchClient && !matchTopic && !matchEmail && !matchId) return false;
    }
    return true;
  });

  // Client names for dropdown filter (Scoped to current division)
  const uniqueClients = Array.from(new Set(cadencesForDivision.map(c => c.clientName).filter(Boolean)));

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopySuccessId(id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  // Mark single meeting as completed or cancelled
  const handleUpdateMeetingStatus = (cadenceId, meetingId, newStatus) => {
    setCadences(prev => prev.map(c => {
      if (c.id !== cadenceId) return c;
      const updatedMeetings = (c.meetings || []).map(m => {
        if (m.id === meetingId) return { ...m, status: newStatus };
        return m;
      });
      return { ...c, meetings: updatedMeetings };
    }));
    showNotification(`Meeting updated to: ${newStatus}`);
  };

  // Open MOM Modal
  const handleOpenMomModal = (meeting, mode = 'complete') => {
    setSelectedMeetingForMom(meeting);
    setMomModalInitialMode(mode);
    setIsMomModalOpen(true);
  };

  // Save MOM and/or complete meeting
  const handleSaveMeetingMom = (momData, markCompleted = false) => {
    if (!selectedMeetingForMom) return;
    const cadenceId = selectedMeetingForMom.cadenceId;
    const meetingId = selectedMeetingForMom.id;

    setCadences(prev => prev.map(c => {
      if (c.id !== cadenceId) return c;
      const updatedMeetings = (c.meetings || []).map(m => {
        if (m.id === meetingId) {
          const updated = { ...m };
          if (markCompleted) updated.status = 'Completed';
          if (momData) {
            updated.mom = momData;
            updated.momUpdatedAt = new Date().toISOString();
          }
          return updated;
        }
        return m;
      });
      return { ...c, meetings: updatedMeetings };
    }));

    if (momData) {
      showNotification('Minutes of Meeting (MOM) saved successfully!');
    } else if (markCompleted) {
      showNotification('Meeting marked as Done (MOM skipped). You can add MOM anytime!');
    }
  };

  // Delete / cancel entire cadence
  const handleDeleteCadence = (cadenceId) => {
    if (!window.confirm('Are you sure you want to cancel this cadence and remove all its Google Calendar meetings?')) return;
    setCadences(prev => prev.filter(c => c.id !== cadenceId));
    showNotification('Cadence cancelled and calendar meetings unscheduled.');
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', color: '#0f172a' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '0.85rem 1.25rem',
          background: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          <i className={notification.type === 'error' ? 'bx bx-error-circle' : 'bx bx-check-circle'} style={{ fontSize: '1.2rem' }}></i>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/cs/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Customer Success</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>Client Cadence Management</span>
        </div>

        {/* CS Access Verified Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#dcfce7',
          color: '#15803d',
          padding: '0.35rem 0.85rem',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: '700',
          border: '1px solid #bbf7d0'
        }}>
          <i className='bx bxs-shield-check'></i>
          <span>CS Access Verified • Dedicated Cadence Engine</span>
        </div>
      </div>

      {/* Top Header & Division Filter Bar (Like Calendar) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.5rem',
        background: '#ffffff',
        padding: '1rem 1.5rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
            <i className='bx bx-buildings'></i>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Operational Scope
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{selectedDivision?.value === 'all' ? 'All Divisions' : selectedDivision?.label}</span>
              {selectedDivision?.value !== 'all' && (
                <span style={{ fontSize: '0.72rem', fontWeight: '700', background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
                  Active Filter
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="filters" style={{ margin: 0 }}>
          <CustomSelect
            label="Division"
            options={divisionOptions}
            value={selectedDivision}
            onChange={(val) => setSelectedDivision(val || { value: 'all', label: 'All Divisions' })}
            id="divisionSelect"
          />
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #034ea2 0%, #002b66 100%)',
        borderRadius: '16px',
        padding: '2.25rem 2.5rem',
        color: 'white',
        boxShadow: '0 12px 28px -6px rgba(3, 78, 162, 0.3)',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: '600',
            marginBottom: '0.85rem',
            letterSpacing: '0.02em'
          }}>
            <i className='bx bx-time-five'></i>
            <span>Google Calendar API & Meet Integration</span>
          </div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.95rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'white' }}>
            Client Cadence & Automated Schedule
          </h1>
          <p style={{ margin: 0, fontSize: '0.96rem', color: '#e0f2fe', lineHeight: '1.55' }}>
            Configure recurring client syncs (One-Time, Weekly, Monthly). Google Calendar API automatically adds clients, CS SPOCs, and participants, provisioning live Google Meet links and logging meetings date-wise.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenScheduleModal}
            style={{
              padding: '0.75rem 1.4rem',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '9px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)',
              transition: 'all 0.15s'
            }}
          >
            <i className='bx bx-plus-circle' style={{ fontSize: '1.15rem' }}></i>
            Schedule New Cadence
          </button>
        </div>
      </div>

      {/* Metric Cards (Clickable Filter Controls) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Card 1: Active Cadences */}
        <div
          onClick={() => handleCardClick('active_cadences')}
          style={{
            background: cardFilter === 'active_cadences' ? '#f0f9ff' : 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            border: cardFilter === 'active_cadences' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            boxShadow: cardFilter === 'active_cadences' ? '0 4px 14px rgba(2, 132, 199, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: cardFilter === 'active_cadences' ? '#0369a1' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Cadences
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <i className='bx bx-git-branch'></i>
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            {cadencesForDivision.filter(c => c.status === 'Active').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <i className='bx bx-check-double'></i> {selectedDivision?.value !== 'all' ? `Scope: ${selectedDivision.label}` : `Across ${uniqueClients.length} corporate clients`}
          </div>
        </div>

        {/* Card 2: Upcoming Meetings (Next 7 days) */}
        <div
          onClick={() => handleCardClick('next_7_days')}
          style={{
            background: cardFilter === 'next_7_days' ? '#f0fdf4' : 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            border: cardFilter === 'next_7_days' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            boxShadow: cardFilter === 'next_7_days' ? '0 4px 14px rgba(22, 163, 74, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: cardFilter === 'next_7_days' ? '#15803d' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Upcoming Meetings
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <i className='bx bx-calendar-event'></i>
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            {next7DaysMeetingsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: cardFilter === 'next_7_days' ? '#166534' : '#64748b', marginTop: '0.3rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <i className='bx bx-time'></i> Next 7 days
          </div>
        </div>

        {/* Card 3: Weekly Recurring */}
        <div
          onClick={() => handleCardClick('weekly_recurring')}
          style={{
            background: cardFilter === 'weekly_recurring' ? '#fffbeb' : 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            border: cardFilter === 'weekly_recurring' ? '2px solid #d97706' : '1px solid #e2e8f0',
            boxShadow: cardFilter === 'weekly_recurring' ? '0 4px 14px rgba(217, 119, 6, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: cardFilter === 'weekly_recurring' ? '#92400e' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Weekly Recurring
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <i className='bx bx-sync'></i>
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            {cadencesForDivision.filter(c => c.frequency === 'Weekly').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: cardFilter === 'weekly_recurring' ? '#92400e' : '#64748b', marginTop: '0.3rem' }}>
            Bi-weekly & weekly review cadences
          </div>
        </div>

        {/* Card 4: Calendar API Status */}
        <div
          onClick={() => handleCardClick('calendar_api')}
          style={{
            background: cardFilter === 'calendar_api' ? '#eef2ff' : 'white',
            borderRadius: '12px',
            padding: '1.25rem',
            border: cardFilter === 'calendar_api' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
            boxShadow: cardFilter === 'calendar_api' ? '0 4px 14px rgba(79, 70, 229, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: cardFilter === 'calendar_api' ? '#3730a3' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Calendar API Status
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <i className='bx bxl-google'></i>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>Connected</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
            OAuth: cs-ops@mantracare.com
          </div>
        </div>
      </div>

      {/* Active Filter Bar if any card filter selected */}
      {cardFilter && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.55rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', color: '#0369a1', fontWeight: '600' }}>
            <i className='bx bx-filter-alt'></i>
            <span>
              Active Filter: <strong>{
                cardFilter === 'next_7_days' ? 'Upcoming Meetings in Next 7 Days' :
                cardFilter === 'active_cadences' ? 'Active Cadences' :
                cardFilter === 'weekly_recurring' ? 'Weekly Recurring Cadences' :
                'Calendar API Audit Logs'
              }</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setCardFilter(null);
              setFilterFrequency('All');
            }}
            style={{
              background: 'white',
              border: '1px solid #7dd3fc',
              color: '#0284c7',
              borderRadius: '6px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Main Tab Bar & Controls */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('meetings')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'meetings' ? '#034ea2' : '#f8fafc',
                color: activeTab === 'meetings' ? 'white' : '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s'
              }}
            >
              <i className='bx bx-calendar'></i>
              <span>Date-Wise Meetings Timeline</span>
              <span style={{
                background: activeTab === 'meetings' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'meetings' ? 'white' : '#475569',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontSize: '0.75rem'
              }}>
                {allDateWiseMeetings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('cadences')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'cadences' ? '#034ea2' : '#f8fafc',
                color: activeTab === 'cadences' ? 'white' : '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s'
              }}
            >
              <i className='bx bx-list-check'></i>
              <span>Cadence Master Logs</span>
              <span style={{
                background: activeTab === 'cadences' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'cadences' ? 'white' : '#475569',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontSize: '0.75rem'
              }}>
                {cadencesForDivision.length}
              </span>
            </button>



            <button
              onClick={() => setActiveTab('activity')}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'activity' ? '#034ea2' : '#f8fafc',
                color: activeTab === 'activity' ? 'white' : '#475569',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s'
              }}
            >
              <i className='bx bx-history'></i>
              <span>Activity & Execution Logs</span>
              <span style={{
                background: activeTab === 'activity' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'activity' ? 'white' : '#475569',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontSize: '0.75rem'
              }}>
                {activityLogsCount}
              </span>
            </button>
          </div>

          {/* Quick Schedule Button */}
          <button
            onClick={handleOpenScheduleModal}
            style={{
              padding: '0.55rem 1.1rem',
              background: '#0284c7',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <i className='bx bx-calendar-plus'></i>
            <span>Take Schedule from CS</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
              <input
                type="text"
                placeholder="Search by client, meeting topic, email, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filter by Client */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Client:</label>
              <select
                value={selectedClientFilter}
                onChange={e => setSelectedClientFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: 'white',
                  color: '#0f172a'
                }}
              >
                <option value="All">All Clients ({uniqueClients.length})</option>
                {uniqueClients.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by Frequency */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>Frequency:</label>
              <select
                value={filterFrequency}
                onChange={e => setFilterFrequency(e.target.value)}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  background: 'white',
                  color: '#0f172a'
                }}
              >
                <option value="All">All Frequencies</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="One time">One time</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB 1: Date-Wise Upcoming Meetings Timeline */}
        {activeTab === 'meetings' && (
          <div>
            {filteredMeetings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                <i className='bx bx-calendar-x' style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '0.5rem' }}></i>
                <p style={{ margin: 0, fontWeight: '600' }}>
                  {cardFilter === 'next_7_days' ? 'No meetings scheduled in the next 7 days.' : 'No scheduled meetings match your search.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {cardFilter && (
                    <button
                      onClick={() => {
                        setCardFilter(null);
                        setFilterFrequency('All');
                      }}
                      style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '0.5rem 1rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Schedule First Cadence
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredMeetings.map((meeting) => {
                  const isPast = new Date(meeting.date) < new Date(new Date().setHours(0,0,0,0));
                  const defaultSchedulingUser = getAuthenticatedSchedulingUser();
                  const resolvedPrimaryCsName = meeting.primaryCS?.name || 
                    meeting.rawCadence?.primaryCS?.name || 
                    getPrimaryCS(meeting.rawCadence?.divisionId || meeting.divisionId, meeting.divisionName, meeting.clientName) || 
                    meeting.csName?.replace(/\s*\([^)]*\)/, '') || 
                    'Karan Hinduja';

                  const resolvedScheduledByName = meeting.scheduledByName || 
                    meeting.rawCadence?.scheduledByName || 
                    meeting.rawCadence?.requestedBy?.name || 
                    meeting.rawCadence?.scheduledBy || 
                    meeting.csName?.replace(/\s*\([^)]*\)/, '') || 
                    defaultSchedulingUser.name || 
                    'Karan Hinduja';

                  return (
                    <div
                      key={meeting.id}
                      style={{
                        padding: '1.2rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: isPast ? '#f8fafc' : '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1.2rem',
                        transition: 'box-shadow 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      {/* Date Block */}
                      <div style={{
                        minWidth: '85px',
                        flexShrink: 0,
                        textAlign: 'center',
                        padding: '0.65rem 0.5rem',
                        borderRadius: '10px',
                        background: isPast ? '#e2e8f0' : '#eff6ff',
                        color: isPast ? '#64748b' : '#0369a1',
                        border: isPast ? '1px solid #cbd5e1' : '1px solid #bfdbfe'
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase' }}>
                          {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: '1.45rem', fontWeight: '900', lineHeight: '1.1' }}>
                          {new Date(meeting.date).getDate()}
                        </div>
                        <div style={{ fontSize: '0.68rem', fontWeight: '700' }}>
                          {new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>

                      {/* Details & Actions */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                            {meeting.topic}
                          </span>
                          <span style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            background: meeting.frequency === 'Weekly' ? '#dbeafe' : meeting.frequency === 'Monthly' ? '#fef3c7' : '#e0e7ff',
                            color: meeting.frequency === 'Weekly' ? '#1e40af' : meeting.frequency === 'Monthly' ? '#92400e' : '#3730a3'
                          }}>
                            {meeting.frequency} (Occurrence #{meeting.occurrenceIndex})
                          </span>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            background: meeting.status === 'Completed' ? '#dcfce7' : meeting.status === 'Cancelled' ? '#fee2e2' : '#f0fdf4',
                            color: meeting.status === 'Completed' ? '#15803d' : meeting.status === 'Cancelled' ? '#b91c1c' : '#16a34a',
                            border: '1px solid #bbf7d0'
                          }}>
                            {meeting.status}
                          </span>
                          {meeting.status === 'Completed' && (
                            meeting.mom ? (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <i className='bx bx-check-circle'></i> MOM Added
                              </span>
                            ) : (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                background: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <i className='bx bx-time'></i> MOM Pending
                              </span>
                            )
                          )}
                        </div>

                        {/* Metadata row: Corporate, Division, Time, Primary CS Name, Scheduled by */}
                        <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '600', color: '#0284c7' }}>
                            <i className='bx bx-buildings'></i> {meeting.clientName}
                          </span>
                          {meeting.divisionName && (
                            <span style={{ background: '#eff6ff', color: '#034ea2', padding: '0.12rem 0.5rem', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '700', border: '1px solid #bfdbfe' }}>
                              <i className='bx bx-git-branch' style={{ marginRight: '0.2rem' }}></i>{meeting.divisionName}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            <i className='bx bx-time'></i> {meeting.startTime} - {meeting.endTime}
                          </span>
                          <span>•</span>
                          <span>
                            <i className='bx bx-user-check' style={{ color: '#0284c7' }}></i> Primary CS: <strong>{resolvedPrimaryCsName}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            <i className='bx bx-user' style={{ color: '#475569' }}></i> Scheduled by: <strong>{resolvedScheduledByName}</strong>
                          </span>
                        </div>

                        {/* Action buttons row: Join Meeting, Copy Meeting link, Send Acceptance Email, Mark Done */}
                        <div style={{ marginTop: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {/* Join Meeting OR Meeting Link Pending */}
                          {meeting.joiningLink ? (
                            <a
                              href={meeting.joiningLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '0.45rem 0.9rem',
                                background: '#15803d',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)'
                              }}
                            >
                              <i className='bx bx-video' style={{ fontSize: '1rem' }}></i>
                              <span>Join meeting</span>
                            </a>
                          ) : (
                            <button
                              disabled
                              title="Meeting video conference link has not yet been generated"
                              style={{
                                padding: '0.45rem 0.9rem',
                                background: '#f1f5f9',
                                color: '#64748b',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'not-allowed'
                              }}
                            >
                              <i className='bx bx-time' style={{ fontSize: '0.95rem' }}></i>
                              <span>Meeting link pending</span>
                            </button>
                          )}

                          {/* Copy Meeting Link */}
                          <button
                            onClick={() => handleCopy(meeting.joiningLink || meeting.meetLink, meeting.id)}
                            title="Copy Meeting Link"
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              color: copySuccessId === meeting.id ? '#16a34a' : '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: '600'
                            }}
                          >
                            <i className={copySuccessId === meeting.id ? 'bx bx-check' : 'bx bx-copy'}></i>
                            <span>{copySuccessId === meeting.id ? 'Copied!' : 'Copy Meeting link'}</span>
                          </button>

                          {/* Send Acceptance Email */}
                          <button
                            onClick={() => handleOpenReminder(meeting.rawCadence, meeting, 'acceptance')}
                            title="Send acceptance reminder to SPOCs awaiting response"
                            style={{
                              padding: '0.45rem 0.9rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#d97706',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                            }}
                          >
                            <i className='bx bx-mail-send'></i>
                            <span>Send Acceptance Email</span>
                          </button>

                          {/* Send Reminder Email */}
                          <button
                            onClick={() => handleOpenReminder(meeting.rawCadence, meeting, 'reminder')}
                            title="Send meeting reminder email to attendees"
                            style={{
                              padding: '0.45rem 0.9rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#0284c7',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                            }}
                          >
                            <i className='bx bx-bell'></i>
                            <span>Send Reminder Email</span>
                          </button>

                          {/* Mark Done */}
                          {meeting.status === 'Scheduled' && (
                            <button
                              onClick={() => handleOpenMomModal(meeting, 'complete')}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid #bbf7d0',
                                background: '#f0fdf4',
                                color: '#15803d',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                boxShadow: '0 1px 4px rgba(22, 163, 74, 0.12)'
                              }}
                            >
                              <i className='bx bx-check'></i>
                              <span>Mark Done</span>
                            </button>
                          )}

                          {/* When Completed: View MOM OR Add MOM */}
                          {meeting.status === 'Completed' && (
                            meeting.mom ? (
                              <button
                                onClick={() => handleOpenMomModal(meeting, 'view')}
                                title="View Minutes of Meeting (MOM)"
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid #bfdbfe',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontSize: '0.82rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <i className='bx bx-file'></i>
                                <span>View MOM</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenMomModal(meeting, 'edit')}
                                title="Add Minutes of Meeting (MOM)"
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  borderRadius: '8px',
                                  border: '1px solid #fde68a',
                                  background: '#fffbeb',
                                  color: '#b45309',
                                  fontSize: '0.82rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <i className='bx bx-plus-circle'></i>
                                <span>Add MOM</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Cadence Master Logs */}
        {activeTab === 'cadences' && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem' }}>Cadence ID</th>
                    <th style={{ padding: '0.75rem' }}>Corporate Client</th>
                    <th style={{ padding: '0.75rem' }}>Division</th>
                    <th style={{ padding: '0.75rem' }}>Meeting Topic</th>
                    <th style={{ padding: '0.75rem' }}>Frequency</th>
                    <th style={{ padding: '0.75rem' }}>Meeting Links</th>
                    <th style={{ padding: '0.75rem' }}>Attendee Responses</th>
                    <th style={{ padding: '0.75rem' }}>CS SPOC</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCadences.map((cadence) => {
                    const joiningLink = cadence.joiningLink || cadence.meetLink || cadence.meetings?.[0]?.joiningLink || cadence.meetings?.[0]?.meetLink;
                    const calendarHtmlLink = cadence.htmlLink || cadence.meetings?.[0]?.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${cadence.gcalEventId || cadence.calendarId || cadence.id}`;
                    const attendeesList = getMeetingAttendees(cadence.meetings?.[0], cadence);

                    return (
                      <tr key={cadence.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '700', color: '#034ea2' }}>
                          {cadence.id}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: '700', color: '#0f172a' }}>
                          {cadence.clientName}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '700', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            {cadence.divisionName || 'Default Division'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#334155', maxWidth: '220px' }}>
                          <div style={{ fontWeight: '600' }}>{cadence.topic}</div>
                          {cadence.notes && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cadence.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: cadence.frequency === 'Weekly' ? '#dbeafe' : cadence.frequency === 'Monthly' ? '#fef3c7' : '#e0e7ff',
                            color: cadence.frequency === 'Weekly' ? '#1e40af' : cadence.frequency === 'Monthly' ? '#92400e' : '#3730a3'
                          }}>
                            {cadence.frequency}
                          </span>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {cadence.meetings?.length || 0} scheduled
                          </div>
                        </td>

                        {/* Meeting Links: Join meeting & Open in Google Calendar */}
                        <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {joiningLink ? (
                              <a
                                href={joiningLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  color: '#15803d',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  background: '#dcfce7',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  width: 'fit-content'
                                }}
                              >
                                <i className='bx bx-video'></i>
                                Join meeting
                              </a>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  color: '#64748b',
                                  fontSize: '0.74rem',
                                  background: '#f1f5f9',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  width: 'fit-content'
                                }}
                                title="Meeting video conference link pending"
                              >
                                <i className='bx bx-time'></i>
                                Meeting link pending
                              </span>
                            )}

                            <a
                              href={calendarHtmlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: '#1a73e8',
                                fontWeight: '700',
                                textDecoration: 'none',
                                fontSize: '0.74rem',
                                background: '#eff6ff',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                width: 'fit-content'
                              }}
                            >
                              <i className='bx bxl-google'></i>
                              Open in Calendar
                            </a>
                          </div>
                        </td>

                        {/* Attendee Responses */}
                        <td style={{ padding: '0.75rem', minWidth: '180px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {attendeesList.map((att, attIdx) => {
                              const cfg = getResponseStatusConfig(att.responseStatus);
                              return (
                                <div key={attIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', fontSize: '0.72rem' }}>
                                  <span style={{ color: '#334155', fontWeight: '500', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={att.email}>
                                    {att.email}
                                  </span>
                                  <span style={{ background: cfg.bg, color: cfg.color, padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.67rem', whiteSpace: 'nowrap' }}>
                                    {cfg.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem', color: '#475569' }}>
                          <div style={{ fontWeight: '600' }}>{cadence.csName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{cadence.csEmail}</div>
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            background: '#dcfce7',
                            color: '#15803d'
                          }}>
                            {cadence.status}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleRefreshEvent(cadence.id)}
                              disabled={refreshingCadenceId === cadence.id}
                              title="Fetch latest attendee responses from Google Calendar"
                              style={{
                                padding: '0.35rem 0.55rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#475569',
                                cursor: refreshingCadenceId === cadence.id ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              <i className={`bx bx-refresh ${refreshingCadenceId === cadence.id ? 'bx-spin' : ''}`}></i>
                            </button>

                            <button
                              onClick={() => handleOpenReminder(cadence, null, 'acceptance')}
                              title="Send acceptance reminder to SPOCs awaiting response"
                              style={{
                                padding: '0.35rem 0.55rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#d97706',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              <i className='bx bx-mail-send'></i>
                            </button>

                            <button
                              onClick={() => handleOpenReminder(cadence, null, 'reminder')}
                              title="Send meeting reminder email to participants"
                              style={{
                                padding: '0.35rem 0.55rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#0284c7',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              <i className='bx bx-bell'></i>
                            </button>

                            <button
                              onClick={() => handleDeleteCadence(cadence.id)}
                              title="Cancel Cadence"
                              style={{
                                padding: '0.35rem 0.55rem',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              <i className='bx bx-trash'></i>
                            </button>
                          </div>
                          {cadence.lastReminderSentAt && (
                            <div style={{ fontSize: '0.68rem', color: '#92400e', marginTop: '0.25rem' }}>
                              Reminder: {new Date(cadence.lastReminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* TAB 4: Cadence Activity & Execution Audit Logs */}
        {activeTab === 'activity' && (
          <CadenceActivityLogsTab selectedDivision={selectedDivision} />
        )}
      </div>

      {/* SCHEDULE CADENCE FORM MODAL */}
      <ScheduleCadenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
        initialDivisionName={selectedDivision && selectedDivision.value !== 'all' ? selectedDivision.label : ''}
        onSuccess={(newCadence) => {
          setCadences(prev => [newCadence, ...prev]);
          try {
            setActivityLogsCount(getActivityLogs().length);
          } catch {}
          showNotification(`Recurring Cadence "${newCadence.topic}" successfully scheduled & synced with Google Calendar!`);
        }}
      />

      {/* ACCEPTANCE & MEETING REMINDER MODAL */}
      <AcceptanceReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedCadenceForReminder(null);
          setSelectedMeetingForReminder(null);
        }}
        cadence={selectedCadenceForReminder}
        meeting={selectedMeetingForReminder}
        mode={reminderModalMode}
        onReminderSent={handleReminderSent}
      />

      {/* MINUTES OF MEETING (MOM) MODAL */}
      <MeetingMomModal
        isOpen={isMomModalOpen}
        onClose={() => {
          setIsMomModalOpen(false);
          setSelectedMeetingForMom(null);
        }}
        meeting={selectedMeetingForMom}
        cadence={selectedMeetingForMom?.rawCadence}
        initialMode={momModalInitialMode}
        onSave={handleSaveMeetingMom}
      />
    </main>
  );
}
