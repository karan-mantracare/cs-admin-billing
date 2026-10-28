import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  POPULAR_TIMEZONES,
  DAYS_OF_WEEK,
  MONTHLY_ORDINALS,
  WEEKDAYS_ONLY,
  buildRRuleString,
  computeOccurrences,
  getHumanReadableSummary,
  localToUtc,
  formatUntilUtc
} from '../utils/cadenceRecurrence';
import {
  getAllCorporateDivisions,
  getDivisionOnboardingDetails,
  getAuthenticatedSchedulingUser,
  buildAttendeeList,
  isValidEmail
} from '../utils/cadenceDivisionUtils';
import { createActivityLog } from '../utils/cadenceActivityLogs';

export default function ScheduleCadenceModal({
  isOpen,
  onClose,
  clients = [],
  initialDivisionName = '',
  onSuccess
}) {
  if (!isOpen) return null;

  // 1. Division List from Corporate Records
  const availableDivisions = useMemo(() => getAllCorporateDivisions(clients), [clients]);
  const schedulingUser = useMemo(() => getAuthenticatedSchedulingUser(), []);

  // Selected Division State
  const [selectedDivision, setSelectedDivision] = useState(() => {
    if (initialDivisionName) {
      const match = availableDivisions.find(d => 
        d.divisionName === initialDivisionName || 
        d.label === initialDivisionName || 
        d.id === initialDivisionName
      );
      if (match) return match;
    }
    return availableDivisions[0] || null;
  });

  // Sync selectedDivision when initialDivisionName changes
  useEffect(() => {
    if (initialDivisionName) {
      const match = availableDivisions.find(d => 
        d.divisionName === initialDivisionName || 
        d.label === initialDivisionName || 
        d.id === initialDivisionName
      );
      if (match) {
        setSelectedDivision(match);
      }
    }
  }, [initialDivisionName, availableDivisions]);

  const [divisionSearchTerm, setDivisionSearchTerm] = useState('');
  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const divisionRef = useRef(null);

  // Close division dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (divisionRef.current && !divisionRef.current.contains(e.target)) {
        setIsDivisionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 2. Division Onboarding Details (SPOCs and Primary CS)
  const onboardingDetails = useMemo(() => {
    return getDivisionOnboardingDetails(selectedDivision);
  }, [selectedDivision]);

  // Selected SPOCs (multiselect from division onboarding record)
  const [selectedSpocs, setSelectedSpocs] = useState([]);

  // Reset SPOC selections when selected division changes
  useEffect(() => {
    if (onboardingDetails?.spocs && onboardingDetails.spocs.length > 0) {
      // Default select all available SPOCs from this division's onboarding record
      setSelectedSpocs(onboardingDetails.spocs);
    } else {
      setSelectedSpocs([]);
    }
  }, [selectedDivision, onboardingDetails]);

  // Attendee Management State
  const [customAttendees, setCustomAttendees] = useState([]);
  const [excludedEmails, setExcludedEmails] = useState([]);
  const [showAddAttendee, setShowAddAttendee] = useState(false);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeeRole, setNewAttendeeRole] = useState('SPOC'); // 'SPOC', 'Client Team', 'CS Team', 'Primary CS', 'Guest'
  const [newAttendeeError, setNewAttendeeError] = useState('');

  // Review Confirmation & Submit Attempt State
  const [isDetailsConfirmed, setIsDetailsConfirmed] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isN8nHovered, setIsN8nHovered] = useState(false);

  // Reset custom exclusions, added attendees, confirmation & submit attempt when selected division changes
  useEffect(() => {
    setExcludedEmails([]);
    setCustomAttendees([]);
    setShowAddAttendee(false);
    setIsDetailsConfirmed(false);
    setHasAttemptedSubmit(false);
  }, [selectedDivision]);

  // Handler to add custom attendee or SPOC
  const handleAddAttendee = (e) => {
    e?.preventDefault();
    if (!newAttendeeEmail.trim() || !isValidEmail(newAttendeeEmail.trim())) {
      setNewAttendeeError('Please enter a valid email address.');
      return;
    }
    const cleanEmail = newAttendeeEmail.trim();
    const emailNorm = cleanEmail.toLowerCase();

    // If previously excluded, un-exclude it
    if (excludedEmails.includes(emailNorm)) {
      setExcludedEmails(prev => prev.filter(em => em !== emailNorm));
    }

    // Check if already in attendeesList
    if (attendeesList.some(a => a.email.toLowerCase() === emailNorm)) {
      setNewAttendeeError('This attendee is already in the invitees list.');
      return;
    }

    const assignedName = newAttendeeName.trim() || cleanEmail.split('@')[0];
    const newId = `att_custom_${Date.now()}`;

    if (newAttendeeRole === 'SPOC') {
      const newSpoc = {
        id: newId,
        name: assignedName,
        email: cleanEmail,
        role: 'Division SPOC (Direct)',
        source: 'Added by CS'
      };
      setSelectedSpocs(prev => [...prev, newSpoc]);
    } else {
      const newCustom = {
        id: newId,
        name: assignedName,
        email: cleanEmail,
        role: newAttendeeRole,
        source: 'Added by CS'
      };
      setCustomAttendees(prev => [...prev, newCustom]);
    }

    setNewAttendeeName('');
    setNewAttendeeEmail('');
    setNewAttendeeRole('SPOC');
    setNewAttendeeError('');
    setShowAddAttendee(false);
  };

  // Handler to remove an attendee from the meeting
  const handleRemoveAttendee = (attendee) => {
    const norm = attendee.email.toLowerCase();
    // 1. Remove from selectedSpocs
    setSelectedSpocs(prev => prev.filter(s => s.email.toLowerCase() !== norm));
    // 2. Remove from customAttendees
    setCustomAttendees(prev => prev.filter(c => c.email.toLowerCase() !== norm));
    // 3. Add to excluded list (e.g. for default Primary CS or Scheduling CS)
    setExcludedEmails(prev => [...new Set([...prev, norm])]);
  };

  // Handler to restore an excluded attendee
  const handleRestoreAttendee = (email) => {
    const norm = email.toLowerCase();
    setExcludedEmails(prev => prev.filter(e => e !== norm));
  };

  // 3. Cadence Core Form State
  const [description, setDescription] = useState('');
  const question = description;
  const setQuestion = setDescription;
  const [frequency, setFrequency] = useState('Weekly'); // 'Daily', 'Weekly', 'Monthly'
  const [selectedDays, setSelectedDays] = useState(['MO', 'WE']); // For Daily/Weekly
  const [monthlyMode, setMonthlyMode] = useState('weekday'); // 'weekday' or 'date'
  const [monthlyWeekday, setMonthlyWeekday] = useState('FR');
  const [monthlyOrdinal, setMonthlyOrdinal] = useState('-1'); // Last
  const [monthlyDate, setMonthlyDate] = useState('15');

  // Date, Time, Duration, Timezone
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('11:00');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [tzSearch, setTzSearch] = useState('');
  const [isTzDropdownOpen, setIsTzDropdownOpen] = useState(false);
  const tzRef = useRef(null);

  useEffect(() => {
    function handleClickOutsideTz(e) {
      if (tzRef.current && !tzRef.current.contains(e.target)) {
        setIsTzDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutsideTz);
    return () => document.removeEventListener('mousedown', handleClickOutsideTz);
  }, []);

  // Duration
  const [durationPreset, setDurationPreset] = useState('30'); // '15', '30', '45', '60', 'custom'
  const [customDuration, setCustomDuration] = useState('30');
  const durationMinutes = durationPreset === 'custom' ? (parseInt(customDuration, 10) || 30) : parseInt(durationPreset, 10);

  // Recurrence Ending
  const [endMode, setEndMode] = useState('count'); // 'never', 'on_date', 'count'
  const [endDate, setEndDate] = useState('');
  const [occurrenceCount, setOccurrenceCount] = useState(6);

  // Title Management
  const [title, setTitle] = useState('');
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);

  // Generate dynamic template title
  const computedDefaultTitle = useMemo(() => {
    const divName = selectedDivision?.divisionName || 'Corporate Division';
    return `${divName} <> MantraCare | ${frequency} Cadence`;
  }, [selectedDivision, frequency]);

  // Update title when division or frequency changes UNTIL user manually edits
  useEffect(() => {
    if (!isTitleManuallyEdited) {
      setTitle(computedDefaultTitle);
    }
  }, [computedDefaultTitle, isTitleManuallyEdited]);

  const handleTitleChange = (e) => {
    setIsTitleManuallyEdited(true);
    setTitle(e.target.value);
  };

  const handleResetTitleToDefault = () => {
    setIsTitleManuallyEdited(false);
    setTitle(computedDefaultTitle);
  };

  // Built Calendar Description
  const builtDescription = useMemo(() => {
    let desc = '';
    if (description && description.trim()) {
      desc += `${description.trim()}\n\n`;
    }
    desc += `Scheduled via MantraCare CS Cadence Engine`;
    return desc.trim();
  }, [description]);

  // Meeting Settings
  const [createMeetLink, setCreateMeetLink] = useState(true);

  // Frequency switch logic:
  // "Default Daily to Monday–Friday; default Weekly to no selection."
  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    if (newFreq === 'Daily') {
      setSelectedDays(['MO', 'TU', 'WE', 'TH', 'FR']);
    } else if (newFreq === 'Weekly' || newFreq === 'One time') {
      setSelectedDays([]);
    }
  };

  // Toggle selected days for Daily / Weekly
  const toggleDay = (code) => {
    setSelectedDays(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      }
      return [...prev, code];
    });
  };

  // SPOC Checkbox toggle
  const toggleSpoc = (spoc) => {
    setSelectedSpocs(prev => {
      const exists = prev.some(s => s.email.toLowerCase() === spoc.email.toLowerCase());
      if (exists) {
        return prev.filter(s => s.email.toLowerCase() !== spoc.email.toLowerCase());
      }
      return [...prev, spoc];
    });
  };

  // Attendees deduplication & chips with custom attendees and excluded emails
  const attendeesList = useMemo(() => {
    return buildAttendeeList({
      selectedSpocs,
      primaryCS: onboardingDetails?.primaryCS,
      schedulingUser,
      customAttendees,
      excludedEmails
    });
  }, [selectedSpocs, onboardingDetails, schedulingUser, customAttendees, excludedEmails]);

  // Recurrence & Occurrences Computation
  const recurrenceData = useMemo(() => {
    return computeOccurrences({
      startDate,
      startTime,
      timeZone,
      durationMinutes,
      frequency,
      selectedDays,
      monthlyMode,
      monthlyWeekday,
      monthlyOrdinal,
      monthlyDate,
      endMode,
      endDate,
      occurrenceCount,
      maxResults: 5
    });
  }, [
    startDate,
    startTime,
    timeZone,
    durationMinutes,
    frequency,
    selectedDays,
    monthlyMode,
    monthlyWeekday,
    monthlyOrdinal,
    monthlyDate,
    endMode,
    endDate,
    occurrenceCount
  ]);

  const rruleString = useMemo(() => {
    return buildRRuleString({
      frequency,
      selectedDays,
      monthlyMode,
      monthlyWeekday,
      monthlyOrdinal,
      monthlyDate,
      endMode,
      endDate,
      occurrenceCount,
      timeZone
    });
  }, [
    frequency,
    selectedDays,
    monthlyMode,
    monthlyWeekday,
    monthlyOrdinal,
    monthlyDate,
    endMode,
    endDate,
    occurrenceCount,
    timeZone
  ]);

  const humanReadableRecurrence = useMemo(() => {
    return getHumanReadableSummary({
      frequency,
      selectedDays,
      monthlyMode,
      monthlyWeekday,
      monthlyOrdinal,
      monthlyDate,
      startDate,
      startTime,
      timeZone,
      durationMinutes,
      endMode,
      endDate,
      occurrenceCount
    });
  }, [
    frequency,
    selectedDays,
    monthlyMode,
    monthlyWeekday,
    monthlyOrdinal,
    monthlyDate,
    startDate,
    startTime,
    timeZone,
    durationMinutes,
    endMode,
    endDate,
    occurrenceCount
  ]);


  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedSeries, setConfirmedSeries] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `cadence_req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Integration Configuration Modal (if n8n is unconfigured or needs setup)
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configWebhookUrl, setConfigWebhookUrl] = useState('');
  const [configSecret, setConfigSecret] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configNotice, setConfigNotice] = useState(null);

  // Fetch current config on load
  useEffect(() => {
    fetch('/api/cadence/n8n-config')
      .then(res => res.json())
      .then(data => {
        if (data.webhookUrl) setConfigWebhookUrl(data.webhookUrl);
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigNotice(null);
    try {
      const res = await fetch('/api/cadence/n8n-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: configWebhookUrl, webhookSecret: configSecret })
      });
      const data = await res.json();
      if (data.success) {
        setConfigNotice({ type: 'success', msg: 'n8n Webhook configuration saved! You can now retry event creation.' });
        setTimeout(() => {
          setShowConfigModal(false);
          setSubmitError(null);
        }, 1200);
      } else {
        setConfigNotice({ type: 'error', msg: data.error || 'Failed to save configuration.' });
      }
    } catch (err) {
      setConfigNotice({ type: 'error', msg: err.message });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Detailed field-level errors for highlighting missing data in Red
  const fieldErrors = useMemo(() => {
    const errors = {};
    if (!selectedDivision) {
      errors.division = 'Please select a division.';
    }
    if (!description || !description.trim()) {
      errors.description = 'Meeting description / agenda is required.';
    }
    if ((frequency === 'Daily' || frequency === 'Weekly') && (!selectedDays || selectedDays.length === 0)) {
      errors.days = 'Please select at least one day of the week.';
    }
    if (frequency !== 'One time') {
      if (endMode === 'on_date' && !endDate) {
        errors.endDate = 'Please select an ending date.';
      }
      if (endMode === 'count' && (!occurrenceCount || occurrenceCount < 1)) {
        errors.occurrenceCount = 'Please enter a valid positive occurrence count.';
      }
    }
    const hasSpoc = (attendeesList || []).some(a => a.roles && a.roles.includes('SPOC'));
    if (!hasSpoc) {
      errors.spocs = 'At least one SPOC attendee is required. Click "+ Add Attendee" or select a division SPOC.';
    }
    if (!title || !title.trim()) {
      errors.title = 'Meeting title is required.';
    }
    if (!isDetailsConfirmed) {
      errors.confirmation = 'Please review and confirm the details by checking the confirmation box.';
    }
    if (recurrenceData?.error) {
      errors.recurrence = recurrenceData.error;
    }
    if (!recurrenceData?.firstOccurrence) {
      errors.firstOccurrence = 'Could not calculate eligible occurrences.';
    }
    return errors;
  }, [
    selectedDivision,
    description,
    frequency,
    selectedDays,
    endMode,
    endDate,
    occurrenceCount,
    attendeesList,
    title,
    isDetailsConfirmed,
    recurrenceData
  ]);

  // Overall validation error summary
  const validationError = useMemo(() => {
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length === 0) return null;
    return fieldErrors[errorKeys[0]];
  }, [fieldErrors]);

  // Submission Handler
  const handleCreateRecurringEvent = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (Object.keys(fieldErrors).length > 0) {
      const firstError = Object.values(fieldErrors)[0];
      setSubmitError(firstError);

      // Scroll to the first missing field to show user immediately
      const errorMap = {
        division: 'section-division',
        description: 'section-description',
        days: 'section-days',
        endDate: 'section-end-condition',
        occurrenceCount: 'section-end-condition',
        spocs: 'section-attendees',
        title: 'section-title',
        confirmation: 'section-confirmation'
      };

      for (const [field, elementId] of Object.entries(errorMap)) {
        if (fieldErrors[field]) {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
          }
        }
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const first = recurrenceData.firstOccurrence;
    const untilUtc = endMode === 'on_date' ? formatUntilUtc(endDate, timeZone) : null;

    const payload = {
      divisionId: selectedDivision.divisionId || selectedDivision.id,
      divisionName: selectedDivision.divisionName,
      question: question.trim(),
      frequency,
      selectedDays: (frequency === 'Daily' || frequency === 'Weekly') ? selectedDays : null,
      monthlyMode: frequency === 'Monthly' ? monthlyMode : null,
      monthlyWeekday: (frequency === 'Monthly' && monthlyMode === 'weekday') ? monthlyWeekday : null,
      monthlyOrdinal: (frequency === 'Monthly' && monthlyMode === 'weekday') ? monthlyOrdinal : null,
      monthlyDate: (frequency === 'Monthly' && monthlyMode === 'date') ? Number(monthlyDate) : null,
      requestedStartDate: startDate,
      localStartTime: startTime,
      timeZone,
      durationMinutes,
      startDateTime: first.startDateTime,
      endDateTime: first.endDateTime,
      startUtc: first.startUtc,
      endUtc: first.endUtc,
      endMode: frequency === 'One time' ? null : endMode,
      endDate: (frequency !== 'One time' && endMode === 'on_date') ? endDate : null,
      occurrenceCount: frequency === 'One time' ? 1 : (endMode === 'count' ? Number(occurrenceCount) : null),
      untilUtc: frequency === 'One time' ? null : untilUtc,
      rrule: frequency === 'One time' ? null : rruleString,
      title: title.trim(),
      description: builtDescription,
      attendees: attendeesList,
      calendarId: 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com',
      createMeetLink,
      sendUpdates: 'all',
      idempotencyKey
    };

    try {
      let data = null;
      let isSuccess = false;

      // 1. First attempt to call the backend endpoint /api/schedule-cadence
      try {
        const response = await fetch('/api/schedule-cadence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const resJson = await response.json();
          if (response.ok && resJson.success) {
            data = resJson;
            isSuccess = true;
          } else if (resJson.code === 'N8N_NOT_CONFIGURED') {
            setSubmitError({
              code: 'N8N_NOT_CONFIGURED',
              message: resJson.message,
              instructions: resJson.instructions
            });
            setShowConfigModal(true);
            setIsSubmitting(false);
            return;
          }
        }
      } catch (proxyErr) {
        // Proxy not available or failed on static host
      }

      // 2. Direct CORS fallback if proxy returned non-JSON / failed (e.g. on live Vercel)
      if (!isSuccess) {
        const formatUtcIso = (val) => {
          if (!val) return '';
          const d = new Date(val);
          if (isNaN(d.getTime())) return typeof val === 'string' ? val : '';
          return d.toISOString().split('.')[0] + 'Z';
        };

        const attendeesStr = (attendeesList || []).map(a => a.email).filter(Boolean).join(', ');
        const cleanRrule = (frequency === 'One time' || !rruleString) ? '' : rruleString.replace(/^RRULE:/i, '').trim();

        const webhookPayload = {
          schedule_by: 'CS',
          data: {
            title: title ? title.trim() : '',
            description: builtDescription,
            rrule: cleanRrule,
            startUtc: formatUtcIso(first.startUtc),
            endUtc: formatUtcIso(first.endUtc),
            attendees: attendeesStr
          }
        };

        const webhookUrl = configWebhookUrl || 'https://workflows.mantracare.com/webhook/cadence-meeting-details';
        const headers = {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        };
        if (configSecret) {
          headers['X-Webhook-Secret'] = configSecret;
        }

        let n8nRes;
        try {
          n8nRes = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(webhookPayload)
          });
        } catch (fetchErr) {
          // Auto-retry once on transient network glitch
          await new Promise(r => setTimeout(r, 600));
          n8nRes = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(webhookPayload)
          });
        }

        if (!n8nRes.ok) {
          const errText = await n8nRes.text();
          setSubmitError({
            code: 'N8N_WEBHOOK_ERROR',
            message: `Failed to create event via n8n (${n8nRes.status}): ${errText || 'Connection error'}`
          });
          setIsSubmitting(false);
          return;
        }

        const n8nJson = await n8nRes.json();
        const resData = n8nJson.data || n8nJson;
        data = {
          success: true,
          eventId: resData.id || resData.eventId || n8nJson.id,
          seriesId: resData.id || resData.seriesId || n8nJson.id,
          calendarId: resData.calendarId || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com',
          joiningLink: resData.hangoutLink || resData.conferenceData?.entryPoints?.[0]?.uri || null,
          htmlLink: resData.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${encodeURIComponent(title)}`,
          executionId: String(n8nJson.execution || n8nJson.executionId || Math.floor(10000 + Math.random() * 90000)),
          attendees: Array.isArray(resData.attendees) ? resData.attendees : attendeesList
        };
      }

      // Resolve Google Calendar event ID and joining link
      const gcalSeriesId = data.eventId || data.seriesId || data.id || `gcal_evt_${Date.now()}`;
      const joiningLink = data.joiningLink || data.hangoutLink || data.meetLink || null;
      const htmlLink = data.htmlLink || data.eventLink || `https://calendar.google.com/calendar/r/eventedit/${encodeURIComponent(title)}`;
      const executionId = data.executionId || null;

      // Initial attendee response snapshot
      const initialAttendees = (data.attendees && data.attendees.length > 0)
        ? data.attendees.map(a => {
            const isCS = (a.email || '').toLowerCase().includes('mantracare.com') || (a.email || '').toLowerCase().includes('cs-lead');
            return {
              name: a.displayName || a.name || a.email,
              email: a.email,
              responseStatus: a.responseStatus || (isCS ? 'accepted' : 'needsAction'),
              roles: a.roles || (isCS ? ['Scheduling CS'] : ['SPOC'])
            };
          })
        : attendeesList.map(a => ({
            name: a.name,
            email: a.email,
            roles: a.roles,
            responseStatus: (a.roles && (a.roles.includes('Scheduling CS') || a.roles.includes('Primary CS'))) ? 'accepted' : 'needsAction'
          }));

      // Success confirmed from Calendar / n8n
      const newCadenceRecord = {
        id: `CAD-${Date.now().toString().slice(-4)}`,
        seriesId: gcalSeriesId,
        calendarId: data.calendarId || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com',
        eventLink: htmlLink,
        joiningLink: joiningLink,
        meetLink: joiningLink,
        executionId: executionId,
        clientName: selectedDivision.corporateName,
        divisionName: selectedDivision.divisionName,
        divisionId: selectedDivision.divisionId || selectedDivision.id,
        topic: title.trim(),
        frequency,
        startDate: first.date,
        startTime: first.startTime,
        durationMinutes,
        timeZone,
        rrule: frequency === 'One time' ? null : rruleString,
        question: question.trim(),
        description: builtDescription,
        attendees: initialAttendees,
        clientEmail: selectedSpocs[0]?.email || '',
        csEmail: schedulingUser.email,
        csName: schedulingUser.name,
        status: 'Active',
        createdAt: new Date().toISOString(),
        occurrencesCount: recurrenceData.occurrences.length,
        meetings: recurrenceData.occurrences.map((occ, idx) => ({
          id: `cal_evt_${Date.now()}_${idx + 1}`,
          occurrenceIndex: idx + 1,
          date: occ.date,
          startTime: occ.startTime,
          endTime: occ.endTime,
          meetingId: `meet-${gcalSeriesId}-${idx + 1}`,
          joiningLink: joiningLink,
          meetLink: joiningLink,
          htmlLink: htmlLink,
          status: 'Scheduled',
          clientAccepted: false,
          csAccepted: true,
          calendarSynced: true
        }))
      };

      // Create Activity Log entry for Meeting Creation
      createActivityLog({
        actionType: 'Meeting Creation',
        status: 'Success',
        requestedBy: schedulingUser,
        divisionId: selectedDivision.divisionId || selectedDivision.id,
        divisionName: selectedDivision.divisionName,
        corporateName: selectedDivision.corporateName,
        cadenceId: newCadenceRecord.id,
        meetingTitle: title.trim(),
        calendarEventId: gcalSeriesId,
        executionId: executionId,
        recipients: initialAttendees.map(a => ({ name: a.name || 'SPOC', email: a.email }))
      });

      // Save to localStorage
      try {
        const existingRaw = localStorage.getItem('mc_cs_cadence_logs');
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const updatedList = [newCadenceRecord, ...existingList];
        localStorage.setItem('mc_cs_cadence_logs', JSON.stringify(updatedList));
      } catch (err) {
        console.error('Error saving cadence to localStorage:', err);
      }

      setConfirmedSeries(newCadenceRecord);
      setIsSubmitting(false);

      if (onSuccess) {
        onSuccess(newCadenceRecord);
      }
    } catch (netErr) {
      setSubmitError({
        code: 'NETWORK_ERROR',
        message: `Network error connecting to scheduling service: ${netErr.message}. Inputs preserved for retry.`
      });
      setIsSubmitting(false);
    }
  };

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
        backdropFilter: 'blur(6px)',
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
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #ffffff, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #034ea2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 10px rgba(3, 78, 162, 0.25)'
              }}
            >
              <i className="bx bx-calendar-star"></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.28rem', fontWeight: '800', color: '#0f172a' }}>
                Schedule Cadence
              </h2>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Creates recurring Google Calendar events through n8n with automated invites & meet links
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsN8nHovered(true)}
              onMouseLeave={() => setIsN8nHovered(false)}
            >
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                title="Only for this MVP, in actual this section will not be shown"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className="bx bx-cog" style={{ fontSize: '1rem', color: '#0284c7' }}></i>
                <span>n8n Settings</span>
              </button>

              {isN8nHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.28)',
                    pointerEvents: 'none',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <i className="bx bx-info-circle" style={{ color: '#38bdf8', fontSize: '0.9rem' }}></i>
                  <span>Only for this MVP, in actual this section will not be shown</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <i className="bx bx-x" style={{ fontSize: '1.4rem' }}></i>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div style={{ overflowY: 'auto', padding: '1.5rem 1.75rem', flex: 1 }}>
          {/* CONFIRMATION SUCCESS VIEW */}
          {confirmedSeries ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 1.25rem'
                }}
              >
                <i className="bx bx-check-double"></i>
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                Recurring Cadence Created & Confirmed!
              </h3>
              <p style={{ margin: '0 auto 1.5rem', maxWidth: '520px', fontSize: '0.9rem', color: '#64748b' }}>
                Google Calendar series has been created via n8n. All attendees have been dispatched invitations.
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  maxWidth: '560px',
                  margin: '0 auto 1.5rem',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Series Title:</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{confirmedSeries.topic}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>{confirmedSeries.rrule ? 'Recurrence:' : 'Schedule Type:'}</span>{' '}
                  <strong style={{ color: '#0284c7' }}>{confirmedSeries.rrule || 'One-time meeting'}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Timezone:</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{confirmedSeries.timeZone}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b' }}>Organizing Calendar:</span>{' '}
                  <code style={{ fontSize: '0.78rem' }}>{confirmedSeries.calendarId}</code>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                    Attendee Statuses (Creation Snapshot):
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {confirmedSeries.attendees?.map((a, i) => {
                      const status = a.responseStatus || 'needsAction';
                      const badgeMap = {
                        needsAction: { label: 'Awaiting response', bg: '#fef3c7', color: '#92400e' },
                        accepted: { label: 'Accepted', bg: '#dcfce7', color: '#15803d' },
                        tentative: { label: 'Tentative', bg: '#e0f2fe', color: '#0369a1' },
                        declined: { label: 'Declined', bg: '#fee2e2', color: '#b91c1c' }
                      };
                      const b = badgeMap[status] || badgeMap.needsAction;
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>{a.email}</span>
                          <span style={{ background: b.bg, color: b.color, padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                            {b.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {confirmedSeries.joiningLink ? (
                  <a
                    href={confirmedSeries.joiningLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#15803d',
                      color: 'white',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
                    }}
                  >
                    <i className="bx bx-video" style={{ fontSize: '1.2rem' }}></i>
                    <span>Join meeting</span>
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#f1f5f9',
                      color: '#94a3b8',
                      border: '1px solid #cbd5e1',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'not-allowed'
                    }}
                  >
                    <i className="bx bx-time" style={{ fontSize: '1.2rem' }}></i>
                    <span>Meeting link pending</span>
                  </button>
                )}

                <a
                  href={confirmedSeries.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#0284c7',
                    color: 'white',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <i className="bx bxl-google" style={{ fontSize: '1.2rem' }}></i>
                  <span>Open in Google Calendar</span>
                </a>

                <button
                  onClick={onClose}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '0.75rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateRecurringEvent}>
              {/* SUBMISSION ERROR ALERT */}
              {submitError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <i className="bx bx-error-circle" style={{ color: '#dc2626', fontSize: '1.3rem', marginTop: '0.1rem' }}></i>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#991b1b', fontSize: '0.88rem' }}>
                      {typeof submitError === 'object' ? submitError.code : 'Submission Error'}
                    </div>
                    <div style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      {typeof submitError === 'object' ? submitError.message : submitError}
                    </div>
                    {typeof submitError === 'object' && submitError.code === 'N8N_NOT_CONFIGURED' && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setShowConfigModal(true)}
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Configure n8n Webhook Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 1: CORPORATE DIVISION */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <i className="bx bx-building" style={{ color: '#0284c7', fontSize: '1.1rem' }}></i>
                  <span>1. Corporate Division</span>
                </div>

                {/* Division Searchable Dropdown */}
                <div id="section-division" style={{ marginBottom: '1rem' }} ref={divisionRef}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Corporate Division <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setIsDivisionDropdownOpen(!isDivisionDropdownOpen)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: hasAttemptedSubmit && fieldErrors.division ? '2px solid #ef4444' : '1px solid #cbd5e1',
                        background: hasAttemptedSubmit && fieldErrors.division ? '#fef2f2' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.88rem'
                      }}
                    >
                      <span style={{ fontWeight: '600', color: selectedDivision ? '#0f172a' : (hasAttemptedSubmit && fieldErrors.division ? '#ef4444' : '#94a3b8') }}>
                        {selectedDivision ? selectedDivision.label : 'Select Division...'}
                      </span>
                      <i className={`bx bx-chevron-${isDivisionDropdownOpen ? 'up' : 'down'}`} style={{ color: hasAttemptedSubmit && fieldErrors.division ? '#ef4444' : '#64748b' }}></i>
                    </div>

                    {hasAttemptedSubmit && fieldErrors.division && (
                      <div style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: '700', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className="bx bx-error-circle"></i>
                        <span>{fieldErrors.division}</span>
                      </div>
                    )}

                    {isDivisionDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '4px',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                          zIndex: 100,
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                          <input
                            type="text"
                            placeholder="Search corporate division..."
                            value={divisionSearchTerm}
                            onChange={e => setDivisionSearchTerm(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '0.45rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.82rem',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            autoFocus
                          />
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                          {availableDivisions
                            .filter(d => d.label.toLowerCase().includes(divisionSearchTerm.toLowerCase()))
                            .map((div, i) => (
                              <li
                                key={i}
                                onClick={() => {
                                  setSelectedDivision(div);
                                  setIsDivisionDropdownOpen(false);
                                  setDivisionSearchTerm('');
                                }}
                                style={{
                                  padding: '0.6rem 0.85rem',
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f8fafc',
                                  background: selectedDivision?.divisionId === div.divisionId ? '#e0f2fe' : 'white',
                                  color: selectedDivision?.divisionId === div.divisionId ? '#0369a1' : '#1e293b'
                                }}
                              >
                                {div.label}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Division Onboarding Status & Info Card */}
                {selectedDivision && (
                  <div
                    style={{
                      background: onboardingDetails.hasOnboardingForm ? '#f0fdf4' : '#fffbeb',
                      border: onboardingDetails.hasOnboardingForm ? '1px solid #bbf7d0' : '1px solid #fef3c7',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <i
                        className={`bx ${onboardingDetails.hasOnboardingForm ? 'bx-check-shield' : 'bx-info-circle'}`}
                        style={{
                          color: onboardingDetails.hasOnboardingForm ? '#16a34a' : '#d97706',
                          fontSize: '1.25rem',
                          marginTop: '0.1rem'
                        }}
                      ></i>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: onboardingDetails.hasOnboardingForm ? '#166534' : '#92400e' }}>
                          {onboardingDetails.hasOnboardingForm
                            ? `Division Onboarding Form Active (${selectedDivision.divisionName})`
                            : `Division Onboarding Form Pending (${selectedDivision.divisionName})`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: onboardingDetails.hasOnboardingForm ? '#15803d' : '#b45309', marginTop: '0.1rem' }}>
                          {onboardingDetails.hasOnboardingForm ? (
                            <>
                              SPOCs and Primary CS are loaded strictly from the onboarding form of <strong>{selectedDivision.divisionName}</strong> (referring to the Division, not the Company).
                            </>
                          ) : (
                            <>
                              The onboarding form for division <strong>{selectedDivision.divisionName}</strong> under <em>{selectedDivision.corporateName}</em> has not been submitted yet.
                              <span style={{ display: 'block', fontSize: '0.71rem', color: '#78350f', marginTop: '0.15rem' }}>
                                (System refers specifically to the Onboarding Form of this Division and not the Company).
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <a
                      href={onboardingDetails.onboardingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: onboardingDetails.hasOnboardingForm ? '#16a34a' : '#d97706',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {onboardingDetails.hasOnboardingForm ? 'View Division Form ↗' : 'Fill Division Form ↗'}
                    </a>
                  </div>
                )}
              </div>

              {/* SECTION 2: FREQUENCY */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <i className="bx bx-repeat" style={{ color: '#0284c7', fontSize: '1.1rem' }}></i>
                  <span>2. Frequency & Recurrence Pattern</span>
                </div>

                {/* Frequency Select */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Frequency <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {['One time', 'Daily', 'Weekly', 'Monthly'].map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleFrequencyChange(f)}
                        style={{
                          padding: '0.6rem 0.25rem',
                          borderRadius: '8px',
                          border: frequency === f ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          background: frequency === f ? '#e0f2fe' : '#ffffff',
                          color: frequency === f ? '#0369a1' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* For One time Notice */}
                {frequency === 'One time' && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i className="bx bx-check-circle" style={{ color: '#16a34a', fontSize: '1.2rem', flexShrink: 0 }}></i>
                    <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: '1.4' }}>
                      <strong>One-Time Meeting:</strong> This meeting will occur once on your chosen start date and time. No RRULE recurrence will be created.
                    </div>
                  </div>
                )}

                {/* For Daily and Weekly: Select Days */}
                {(frequency === 'Daily' || frequency === 'Weekly') && (
                  <div
                    id="section-days"
                    style={{
                      marginBottom: '1rem',
                      padding: hasAttemptedSubmit && fieldErrors.days ? '0.75rem' : '0',
                      borderRadius: '8px',
                      border: hasAttemptedSubmit && fieldErrors.days ? '2px solid #ef4444' : 'none',
                      background: hasAttemptedSubmit && fieldErrors.days ? '#fef2f2' : 'transparent'
                    }}
                  >
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: hasAttemptedSubmit && fieldErrors.days ? '#b91c1c' : '#334155', marginBottom: '0.35rem' }}>
                      Select Days <span style={{ color: '#ef4444' }}>*</span>{' '}
                      {frequency === 'Daily' && (
                        <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 'normal' }}>
                          (Occurs on each selected weekday)
                        </span>
                      )}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {DAYS_OF_WEEK.map(d => {
                        const isSelected = selectedDays.includes(d.code);
                        return (
                          <button
                            key={d.code}
                            type="button"
                            onClick={() => toggleDay(d.code)}
                            style={{
                              padding: '0.45rem 0.85rem',
                              borderRadius: '20px',
                              border: isSelected ? '1px solid #0284c7' : (hasAttemptedSubmit && fieldErrors.days ? '1px solid #f87171' : '1px solid #cbd5e1'),
                              background: isSelected ? '#0284c7' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#334155',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {d.short}
                          </button>
                        );
                      })}
                    </div>
                    {selectedDays.length === 0 && (
                      <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className="bx bx-error-circle"></i>
                        <span>{hasAttemptedSubmit && fieldErrors.days ? fieldErrors.days : 'Please select at least one day.'}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* For Monthly: By Weekday vs By Date */}
                {frequency === 'Monthly' && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                      Monthly Scheduling Mode <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="monthlyMode"
                          value="weekday"
                          checked={monthlyMode === 'weekday'}
                          onChange={() => setMonthlyMode('weekday')}
                        />
                        <span>By weekday (e.g. Last Friday)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="monthlyMode"
                          value="date"
                          checked={monthlyMode === 'date'}
                          onChange={() => setMonthlyMode('date')}
                        />
                        <span>By date (e.g. 15th of month)</span>
                      </label>
                    </div>

                    {/* Mode: By weekday */}
                    {monthlyMode === 'weekday' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                            Occurrence Position <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={monthlyOrdinal}
                            onChange={e => setMonthlyOrdinal(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.84rem'
                            }}
                          >
                            {MONTHLY_ORDINALS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                            Weekday (Monday–Friday) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={monthlyWeekday}
                            onChange={e => setMonthlyWeekday(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.84rem'
                            }}
                          >
                            {WEEKDAYS_ONLY.map(w => (
                              <option key={w.code} value={w.code}>{w.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Mode: By date */}
                    {monthlyMode === 'date' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                          Day of the Month (1–31) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                          value={monthlyDate}
                          onChange={e => setMonthlyDate(e.target.value)}
                          style={{
                            width: '100%',
                            maxWidth: '200px',
                            padding: '0.55rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.84rem',
                            marginBottom: '0.5rem'
                          }}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        {['29', '30', '31'].includes(String(monthlyDate)) && (
                          <div
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1e40af',
                              borderRadius: '6px',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.78rem'
                            }}
                          >
                            <i className="bx bx-info-circle"></i> Months with fewer than {monthlyDate} days (such as February, April, etc.) will be skipped. Event dates will not be silently shifted.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3: START DATE, TIME, TIMEZONE & DURATION */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <i className="bx bx-time-five" style={{ color: '#0284c7', fontSize: '1.1rem' }}></i>
                  <span>3. Start Date, Time, Timezone & Duration</span>
                </div>

                {/* Row 1: Start Date | Start Time | Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {/* Start Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                      Start Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                      Start Time <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Duration Presets */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                      Duration <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={durationPreset}
                      onChange={e => setDurationPreset(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes (Default)</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="custom">Custom duration</option>
                    </select>
                    {durationPreset === 'custom' && (
                      <input
                        type="number"
                        min="5"
                        max="480"
                        placeholder="Minutes"
                        value={customDuration}
                        onChange={e => setCustomDuration(e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '0.35rem',
                          padding: '0.45rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Time Zone | First Actual Occurrence */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {/* Timezone Searchable Dropdown */}
                  <div ref={tzRef}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                      Time Zone <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div
                        onClick={() => setIsTzDropdownOpen(!isTzDropdownOpen)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.84rem'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{timeZone}</span>
                        <i className={`bx bx-chevron-${isTzDropdownOpen ? 'up' : 'down'}`} style={{ color: '#64748b' }}></i>
                      </div>

                      {isTzDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            zIndex: 100,
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                            <input
                              type="text"
                              placeholder="Filter timezone..."
                              value={tzSearch}
                              onChange={e => setTzSearch(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              style={{
                                width: '100%',
                                padding: '0.4rem',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.8rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                              autoFocus
                            />
                          </div>
                          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '180px', overflowY: 'auto' }}>
                            {POPULAR_TIMEZONES
                              .filter(t => t.label.toLowerCase().includes(tzSearch.toLowerCase()) || t.value.toLowerCase().includes(tzSearch.toLowerCase()))
                              .map((tz, i) => (
                                <li
                                  key={i}
                                  onClick={() => {
                                    setTimeZone(tz.value);
                                    setIsTzDropdownOpen(false);
                                    setTzSearch('');
                                  }}
                                  style={{
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f8fafc',
                                    background: timeZone === tz.value ? '#e0f2fe' : 'white',
                                    color: timeZone === tz.value ? '#0369a1' : '#1e293b'
                                  }}
                                >
                                  <div style={{ fontWeight: '600' }}>{tz.label}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tz.city}</div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* First Actual Occurrence Display */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                      {frequency === 'One time' ? 'Scheduled Meeting Time' : 'First Actual Occurrence'}
                    </label>
                    {recurrenceData.firstOccurrence ? (
                      <div
                        style={{
                          background: recurrenceData.isPast ? '#fef2f2' : '#f0fdf4',
                          border: `1px solid ${recurrenceData.isPast ? '#fecaca' : '#bbf7d0'}`,
                          borderRadius: '6px',
                          padding: '0.55rem 0.75rem',
                          minHeight: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: recurrenceData.isPast ? '#991b1b' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {recurrenceData.firstOccurrence.displayDate} • {recurrenceData.firstOccurrence.startTime} to {recurrenceData.firstOccurrence.endTime}
                          </div>
                          {recurrenceData.firstOccurrence.crossesMidnight && (
                            <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '600' }}>
                              Crosses midnight to {recurrenceData.firstOccurrence.endDate}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: recurrenceData.isPast ? '#b91c1c' : '#15803d',
                            background: recurrenceData.isPast ? '#fee2e2' : '#dcfce7',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            marginLeft: '0.5rem'
                          }}
                        >
                          {recurrenceData.isPast ? '⚠️ In Past' : '✓ Active'}
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.55rem 0.75rem',
                          minHeight: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.8rem',
                          color: '#64748b',
                          boxSizing: 'border-box'
                        }}
                      >
                        Select frequency and days to calculate
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: RECURRENCE ENDING (Hidden and not required for One time) */}
              {frequency !== 'One time' && (
                <div
                  id="section-end-condition"
                  style={{
                    background: '#ffffff',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: hasAttemptedSubmit && (fieldErrors.endDate || fieldErrors.occurrenceCount) ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <i className="bx bx-stop-circle" style={{ color: '#0284c7', fontSize: '1.1rem' }}></i>
                    <span>4. Recurrence Ending Condition</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer', fontWeight: '600' }}>
                      <input
                        type="radio"
                        name="endMode"
                        value="never"
                        checked={endMode === 'never'}
                        onChange={() => setEndMode('never')}
                      />
                      <span>Never</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer', fontWeight: '600' }}>
                      <input
                        type="radio"
                        name="endMode"
                        value="on_date"
                        checked={endMode === 'on_date'}
                        onChange={() => setEndMode('on_date')}
                      />
                      <span>On date</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer', fontWeight: '600' }}>
                      <input
                        type="radio"
                        name="endMode"
                        value="count"
                        checked={endMode === 'count'}
                        onChange={() => setEndMode('count')}
                      />
                      <span>After a number of occurrences</span>
                    </label>
                  </div>

                  {endMode === 'on_date' && (
                    <div style={{ maxWidth: '240px', marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        End Date <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={e => setEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: hasAttemptedSubmit && fieldErrors.endDate ? '2px solid #ef4444' : '1px solid #cbd5e1',
                          background: hasAttemptedSubmit && fieldErrors.endDate ? '#fef2f2' : 'white',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      {hasAttemptedSubmit && fieldErrors.endDate ? (
                        <div style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: '700', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <i className="bx bx-error-circle"></i>
                          <span>{fieldErrors.endDate}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          All occurrences on this date in {timeZone} will be included.
                        </span>
                      )}
                    </div>
                  )}

                  {endMode === 'count' && (
                    <div style={{ maxWidth: '240px', marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
                        Number of Occurrences (COUNT) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={occurrenceCount}
                        onChange={e => setOccurrenceCount(parseInt(e.target.value, 10) || 1)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: hasAttemptedSubmit && fieldErrors.occurrenceCount ? '2px solid #ef4444' : '1px solid #cbd5e1',
                          background: hasAttemptedSubmit && fieldErrors.occurrenceCount ? '#fef2f2' : 'white',
                          fontSize: '0.84rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      {hasAttemptedSubmit && fieldErrors.occurrenceCount ? (
                        <div style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: '700', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <i className="bx bx-error-circle"></i>
                          <span>{fieldErrors.occurrenceCount}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          The first occurrence counts toward this total.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: ATTENDEE & SPOC MANAGEMENT */}
              <div
                id="section-attendees"
                style={{
                  background: hasAttemptedSubmit && fieldErrors.spocs ? '#fef2f2' : '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: hasAttemptedSubmit && fieldErrors.spocs ? '2px solid #ef4444' : '1px solid #e2e8f0',
                  marginBottom: '1.25rem'
                }}
              >
                {/* Section Header with Quick "+ Add Attendee" Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <i className="bx bx-group" style={{ color: '#0284c7', fontSize: '1.15rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                        5. Attendees & SPOC Management
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Manage division SPOCs, CS team members, and external attendees for Google Calendar.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAttendee(prev => !prev);
                      setNewAttendeeRole('SPOC');
                      setNewAttendeeError('');
                    }}
                    style={{
                      background: showAddAttendee ? '#f1f5f9' : '#0284c7',
                      color: showAddAttendee ? '#334155' : 'white',
                      border: showAddAttendee ? '1px solid #cbd5e1' : 'none',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: showAddAttendee ? 'none' : '0 2px 4px rgba(2, 132, 199, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <i className={`bx ${showAddAttendee ? 'bx-x' : 'bx-user-plus'}`}></i>
                    <span>{showAddAttendee ? 'Close Form' : '+ Add Attendee'}</span>
                  </button>
                </div>

                {hasAttemptedSubmit && fieldErrors.spocs && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #f87171',
                      color: '#991b1b',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      marginBottom: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <i className="bx bx-error-circle" style={{ fontSize: '1.15rem' }}></i>
                    <span>{fieldErrors.spocs}</span>
                  </div>
                )}

                {/* Collapsible / Interactive Add Attendee Form */}
                {showAddAttendee && (
                  <div
                    style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid #38bdf8',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="bx bx-user-plus" style={{ fontSize: '1rem' }}></i>
                        <span>Add Attendee to Recurring Meeting</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Adding role "SPOC" satisfies the client SPOC requirement
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto', gap: '0.6rem', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>
                          Attendee Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Priya Sharma"
                          value={newAttendeeName}
                          onChange={e => {
                            setNewAttendeeName(e.target.value);
                            setNewAttendeeError('');
                          }}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>
                          Email Address <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={newAttendeeEmail}
                          onChange={e => {
                            setNewAttendeeEmail(e.target.value);
                            setNewAttendeeError('');
                          }}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#475569', marginBottom: '0.2rem' }}>
                          Role / Tag
                        </label>
                        <select
                          value={newAttendeeRole}
                          onChange={e => setNewAttendeeRole(e.target.value)}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', background: 'white' }}
                        >
                          <option value="SPOC">SPOC (Client Lead / Decision Maker)</option>
                          <option value="Client Team">Client Team (Member / Observer)</option>
                          <option value="CS Team">CS Team (MantraCare Customer Success)</option>
                          <option value="Primary CS">Primary CS (Division Primary CS)</option>
                          <option value="Guest">Guest / External Partner</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={handleAddAttendee}
                          style={{
                            background: '#0284c7',
                            color: 'white',
                            border: 'none',
                            padding: '0.48rem 0.95rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <i className="bx bx-check"></i>
                          <span>Add to Meeting</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddAttendee(false);
                            setNewAttendeeError('');
                          }}
                          style={{
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '0.48rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    {newAttendeeError && (
                      <div style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '0.45rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <i className="bx bx-error-circle"></i>
                        <span>{newAttendeeError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Division Onboarding SPOCs Selection (if available) */}
                {onboardingDetails.spocs.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', margin: 0 }}>
                        Division Onboarding SPOCs ({selectedDivision?.divisionName})
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Select SPOCs from this division's onboarding record
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                      {onboardingDetails.spocs.map((spoc, i) => {
                        const isChecked = selectedSpocs.some(s => s.email.toLowerCase() === spoc.email.toLowerCase());
                        return (
                          <div
                            key={i}
                            onClick={() => toggleSpoc(spoc)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              background: isChecked ? '#e0f2fe' : 'white',
                              border: isChecked ? '1px solid #0284c7' : '1px solid #cbd5e1',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                                  {spoc.name}
                                </span>
                                <span style={{
                                  fontSize: '0.66rem',
                                  fontWeight: '700',
                                  background: '#dcfce7',
                                  color: '#166534',
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: '4px',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {spoc.role || 'Division SPOC'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {spoc.email}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If No SPOCs in Division Onboarding */}
                {onboardingDetails.spocs.length === 0 && (
                  <div style={{ fontSize: '0.82rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <i className="bx bx-info-circle" style={{ color: '#d97706', fontSize: '1.2rem' }}></i>
                      <strong>No SPOC contacts found in the onboarding record for division "{selectedDivision?.divisionName}".</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '0.65rem' }}>
                      System strictly refers to this Division's onboarding record (Company-level records excluded). You can add an attendee as a SPOC directly below or complete the division form.
                    </div>
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAttendee(true);
                          setNewAttendeeRole('SPOC');
                          setNewAttendeeError('');
                        }}
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <i className="bx bx-user-plus"></i>
                        <span>+ Add SPOC Attendee Now</span>
                      </button>

                      <a
                        href={onboardingDetails.onboardingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'white',
                          border: '1px solid #d97706',
                          color: '#b45309',
                          padding: '0.38rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <span>Fill Division Onboarding Form ↗</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Confirmed Invitees & Attendee Manager Cards */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b' }}>
                        Confirmed Invitees ({attendeesList.length} total, deduplicated)
                      </span>
                      {attendeesList.some(a => a.roles && a.roles.includes('SPOC')) ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', background: '#dcfce7', color: '#166534', padding: '0.1rem 0.45rem', borderRadius: '12px' }}>
                          ✓ SPOC Included
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', background: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.45rem', borderRadius: '12px' }}>
                          ⚠️ At least 1 SPOC required
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAddAttendee(true);
                        setNewAttendeeRole('SPOC');
                        setNewAttendeeError('');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '0.76rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <i className="bx bx-plus-circle"></i>
                      <span>Add Attendee</span>
                    </button>
                  </div>

                  {attendeesList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem' }}>
                      No attendees currently included. Click <strong>"+ Add Attendee"</strong> to add participants.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {attendeesList.map((att) => {
                        const isSpoc = att.roles.includes('SPOC');
                        const isSchedCS = att.roles.includes('Scheduling CS');
                        const isPrimaryCS = att.roles.includes('Primary CS');
                        const initials = (att.name || att.email || 'A')
                          .split(' ')
                          .filter(Boolean)
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || 'U';

                        return (
                          <div
                            key={att.email}
                            style={{
                              background: 'white',
                              border: '1px solid #cbd5e1',
                              borderRadius: '10px',
                              padding: '0.65rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.6rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                            }}
                          >
                            {/* Avatar & Attendee Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden', flex: 1 }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: isSpoc ? '#e0f2fe' : (isSchedCS ? '#fef3c7' : (isPrimaryCS ? '#dcfce7' : '#f1f5f9')),
                                  color: isSpoc ? '#0369a1' : (isSchedCS ? '#92400e' : (isPrimaryCS ? '#166534' : '#475569')),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: '800',
                                  flexShrink: 0
                                }}
                              >
                                {initials}
                              </div>

                              <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {att.name}
                                  </span>
                                  {att.roles.map(r => (
                                    <span
                                      key={r}
                                      style={{
                                        background: r === 'SPOC' ? '#e0f2fe' : (r === 'Scheduling CS' ? '#fef3c7' : (r === 'Primary CS' ? '#dcfce7' : '#f1f5f9')),
                                        color: r === 'SPOC' ? '#0369a1' : (r === 'Scheduling CS' ? '#92400e' : (r === 'Primary CS' ? '#166534' : '#475569')),
                                        padding: '0.08rem 0.35rem',
                                        borderRadius: '4px',
                                        fontSize: '0.65rem',
                                        fontWeight: '700'
                                      }}
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {att.email}
                                </div>
                              </div>
                            </div>

                            {/* Remove / Manage Action */}
                            <button
                              type="button"
                              title={`Remove ${att.name || att.email} from meeting`}
                              onClick={() => handleRemoveAttendee(att)}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#94a3b8',
                                padding: '0.3rem 0.45rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.borderColor = '#fca5a5';
                                e.currentTarget.style.background = '#fef2f2';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color = '#94a3b8';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.background = '#f8fafc';
                              }}
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Restore Bar if any attendee was removed */}
                  {excludedEmails.length > 0 && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '0.4rem 0.65rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span>
                        Excluded from invitees: <strong>{excludedEmails.join(', ')}</strong>
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {excludedEmails.map(em => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => handleRestoreAttendee(em)}
                            style={{
                              background: 'white',
                              border: '1px solid #cbd5e1',
                              color: '#0284c7',
                              borderRadius: '4px',
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.68rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Restore {em.split('@')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 6 & 7: TITLE & DESCRIPTION */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <i className="bx bx-edit" style={{ color: '#0284c7', fontSize: '1.1rem' }}></i>
                  <span>6 & 7. Calendar Event Title & Description</span>
                </div>

                {/* Title */}
                <div id="section-title" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: hasAttemptedSubmit && fieldErrors.title ? '#b91c1c' : '#334155' }}>
                      Event Title (Prefilled with Template) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {isTitleManuallyEdited && (
                      <button
                        type="button"
                        onClick={handleResetTitleToDefault}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <i className="bx bx-reset"></i>
                        <span>Reset to default</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: hasAttemptedSubmit && fieldErrors.title ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: hasAttemptedSubmit && fieldErrors.title ? '#fff5f5' : 'white',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                  />
                  {hasAttemptedSubmit && fieldErrors.title && (
                    <div style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: '700', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="bx bx-error-circle"></i>
                      <span>{fieldErrors.title}</span>
                    </div>
                  )}
                </div>

                {/* Description / Agenda */}
                <div id="section-description" style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: hasAttemptedSubmit && fieldErrors.description ? '#b91c1c' : '#334155', marginBottom: '0.35rem' }}>
                    Event Description / Agenda <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter meeting agenda, objectives, discussion topics, and call links..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: hasAttemptedSubmit && fieldErrors.description ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: hasAttemptedSubmit && fieldErrors.description ? '#fff5f5' : 'white',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                  {hasAttemptedSubmit && fieldErrors.description ? (
                    <div style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: '700', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <i className="bx bx-error-circle"></i>
                      <span>{fieldErrors.description}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Will be included as the Google Calendar event description dispatched to all attendees.
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION 8: MEETING SETTINGS */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <i className="bx bx-slider-alt" style={{ color: '#0284c7', fontSize: '1.1rem' }}></i>
                  <span>8. Meeting Settings & Conferencing</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <input
                      type="checkbox"
                      id="meetToggle"
                      checked={createMeetLink}
                      onChange={e => setCreateMeetLink(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="meetToggle" style={{ fontSize: '0.84rem', fontWeight: '700', color: '#1e293b', cursor: 'pointer' }}>
                      Add video conference link (Google Meet / Teams)
                    </label>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '600' }}>
                    Default Reminders Enabled
                  </span>
                </div>
              </div>

              {/* SECTION 9: PREVIEW & REVIEW */}
              <div
                style={{
                  background: '#f0f9ff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #bae6fd',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#0369a1',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <i className="bx bx-show" style={{ fontSize: '1.1rem' }}></i>
                  <span>9. Schedule Preview (Before Submission)</span>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.45rem' }}>
                  {humanReadableRecurrence}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {recurrenceData.occurrences.map((occ, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'white',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ fontWeight: '700', color: '#0284c7' }}>#{occ.index}: {occ.displayDate}</div>
                      <div style={{ color: '#475569' }}>{occ.startTime} - {occ.endTime}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVIEW CONFIRMATION CHECKBOX */}
              <div
                id="section-confirmation"
                style={{
                  background: hasAttemptedSubmit && fieldErrors.confirmation ? '#fef2f2' : isDetailsConfirmed ? '#f0fdf4' : '#ffffff',
                  padding: '1.1rem 1.25rem',
                  borderRadius: '12px',
                  border: hasAttemptedSubmit && fieldErrors.confirmation ? '2px solid #ef4444' : isDetailsConfirmed ? '2px solid #22c55e' : '1px solid #cbd5e1',
                  marginBottom: '1.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: hasAttemptedSubmit && fieldErrors.confirmation ? '0 0 0 4px rgba(239, 68, 68, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <label
                  htmlFor="reviewConfirmCheckbox"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    id="reviewConfirmCheckbox"
                    checked={isDetailsConfirmed}
                    onChange={e => setIsDetailsConfirmed(e.target.checked)}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      marginTop: '0.15rem',
                      accentColor: '#0284c7',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: '700',
                        color: hasAttemptedSubmit && fieldErrors.confirmation ? '#b91c1c' : '#0f172a'
                      }}
                    >
                      I have reviewed the details and confirm is correct <span style={{ color: '#ef4444' }}>*</span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: hasAttemptedSubmit && fieldErrors.confirmation ? '#dc2626' : '#64748b',
                        marginTop: '0.2rem'
                      }}
                    >
                      Confirms division onboarding SPOCs, frequency schedule, occurrence timeline, and attendee distribution before initiating recurring calendar events via n8n.
                    </div>
                    {hasAttemptedSubmit && fieldErrors.confirmation && (
                      <div
                        style={{
                          color: '#b91c1c',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          marginTop: '0.45rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <i className="bx bx-error-circle" style={{ fontSize: '1rem' }}></i>
                        <span>{fieldErrors.confirmation}</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* ACTION FOOTER */}
              {hasAttemptedSubmit && Object.keys(fieldErrors).length > 0 && (
                <div
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #f87171',
                    borderRadius: '8px',
                    padding: '0.65rem 0.95rem',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#991b1b',
                    fontSize: '0.82rem',
                    fontWeight: '600'
                  }}
                >
                  <i className="bx bx-error-circle" style={{ fontSize: '1.15rem', flexShrink: 0 }}></i>
                  <div>
                    <span>Please review and correct the missing data highlighted in red above ({Object.keys(fieldErrors).length} item{Object.keys(fieldErrors).length > 1 ? 's' : ''} require attention).</span>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #f1f5f9'
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.65rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #0284c7, #034ea2)',
                    color: 'white',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(3, 78, 162, 0.25)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin"></i>
                      <span>Creating Recurring Event via n8n...</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-calendar-plus"></i>
                      <span>Create recurring event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* N8N INTEGRATION CONFIGURATION MODAL */}
      {showConfigModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100000,
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid #cbd5e1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bx bx-slider" style={{ color: '#0284c7', fontSize: '1.4rem' }}></i>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>
                  n8n Integration Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem' }}>
              Provide the HTTP webhook URL for your Google Calendar creation workflow in n8n. Secrets are kept server-side.
            </p>

            {configNotice && (
              <div
                style={{
                  background: configNotice.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: configNotice.type === 'success' ? '#15803d' : '#b91c1c',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}
              >
                {configNotice.msg}
              </div>
            )}

            <form onSubmit={handleSaveConfig}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  n8n Google Calendar Webhook URL <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://workflows.mantracare.com/webhook/cadence-meeting-details"
                  value={configWebhookUrl}
                  onChange={e => setConfigWebhookUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  Webhook Secret (Optional Header X-Webhook-Secret)
                </label>
                <input
                  type="password"
                  placeholder="Optional secret token"
                  value={configSecret}
                  onChange={e => setConfigSecret(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0284c7',
                    color: 'white',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: isSavingConfig ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
