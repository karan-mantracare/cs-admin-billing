const STORAGE_KEY = 'mc_cadence_activity_logs';
const N8N_BASE_URL = 'https://workflows.mantracare.com';

/**
 * Format a UTC ISO timestamp in user's local timezone.
 */
export function formatLogTimestamp(utcIsoStr, timeZone) {
  if (!utcIsoStr) return '—';
  try {
    const d = new Date(utcIsoStr);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || undefined,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d);
  } catch (e) {
    return utcIsoStr;
  }
}

/**
 * Initial mock logs to display historical context if none stored.
 */
const INITIAL_LOGS = [
  {
    id: 'log_init_101',
    actionType: 'Meeting Creation',
    requestedBy: {
      name: 'Karan Hinduja (CS Lead)',
      email: 'cs-lead@mantracare.com'
    },
    requestedOn: '2026-10-25T10:30:00Z',
    status: 'Success',
    divisionId: '1',
    divisionName: 'testt',
    corporateName: 'TechVision Global Inc.',
    cadenceId: 'CAD-1001',
    meetingId: 'cal_evt_1001_1',
    meetingTitle: 'Bi-Weekly CS Review & Health Check',
    calendarEventId: 'cal_series_1001_gcal',
    executionId: '89104',
    executionUrl: `${N8N_BASE_URL}/execution/89104`,
    recipients: [
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@techvision.com' }
    ],
    errorMessage: null
  },
  {
    id: 'log_init_102',
    actionType: 'Acceptance Reminder',
    requestedBy: {
      name: 'Karan Hinduja (CS Lead)',
      email: 'cs-lead@mantracare.com'
    },
    requestedOn: '2026-10-26T14:15:00Z',
    status: 'Success',
    divisionId: '1',
    divisionName: 'testt',
    corporateName: 'TechVision Global Inc.',
    cadenceId: 'CAD-1001',
    meetingId: 'cal_evt_1001_1',
    meetingTitle: 'Bi-Weekly CS Review & Health Check',
    calendarEventId: 'cal_series_1001_gcal',
    executionId: '89155',
    executionUrl: `${N8N_BASE_URL}/execution/89155`,
    recipients: [
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@techvision.com' }
    ],
    errorMessage: null
  }
];

/**
 * Retrieves all activity logs newest first.
 */
export function getActivityLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => new Date(b.requestedOn) - new Date(a.requestedOn));
      }
    }
  } catch (e) {
    console.error('Error reading activity logs from storage:', e);
  }
  return INITIAL_LOGS;
}

/**
 * Creates and appends a new activity log entry.
 */
export function createActivityLog({
  actionType, // 'Meeting Creation' | 'Acceptance Reminder'
  requestedBy, // { name, email }
  status = 'Pending', // 'Pending' | 'In progress' | 'Success' | 'Failed'
  divisionId,
  divisionName,
  corporateName = '',
  cadenceId,
  meetingId = null,
  meetingTitle,
  calendarEventId = null,
  executionId = null,
  recipients = [],
  errorMessage = null
}) {
  const newEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actionType,
    requestedBy: {
      name: requestedBy?.name || 'Authenticated CS',
      email: requestedBy?.email || 'cs-lead@mantracare.com'
    },
    requestedOn: new Date().toISOString(), // Stored in UTC
    status,
    divisionId: String(divisionId || '1'),
    divisionName: divisionName || 'Default Division',
    corporateName: corporateName || '',
    cadenceId: cadenceId || null,
    meetingId: meetingId || null,
    meetingTitle: meetingTitle || 'Cadence Meeting',
    calendarEventId: calendarEventId || null,
    executionId: executionId || null,
    executionUrl: executionId ? `${N8N_BASE_URL}/execution/${executionId}` : null,
    recipients: Array.isArray(recipients) ? recipients : [],
    errorMessage: errorMessage || null
  };

  try {
    const logs = getActivityLogs();
    const updated = [newEntry, ...logs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error writing activity log entry:', e);
  }

  return newEntry;
}

/**
 * Updates an existing activity log entry (e.g. from Pending to Success or Failed).
 */
export function updateActivityLog(logId, updates) {
  try {
    const logs = getActivityLogs();
    const updated = logs.map(entry => {
      if (entry.id === logId) {
        const merged = { ...entry, ...updates };
        if (updates.executionId && !updates.executionUrl) {
          merged.executionUrl = `${N8N_BASE_URL}/execution/${updates.executionId}`;
        }
        return merged;
      }
      return entry;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find(e => e.id === logId);
  } catch (e) {
    console.error('Error updating activity log:', e);
    return null;
  }
}
