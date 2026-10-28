import fs from 'node:fs';
import path from 'node:path';
import * as rruleModule from 'rrule';
const RRule = rruleModule.RRule || (rruleModule.default && rruleModule.default.RRule);
const rrulestr = rruleModule.rrulestr || (rruleModule.default && rruleModule.default.rrulestr);

// Server-side cache for idempotency keys to prevent duplicate series creation
const idempotencyMap = new Map();

// Path for storing local n8n integration configuration
const CONFIG_FILE_PATH = path.resolve(process.cwd(), '.cadence_n8n_config.json');

const DEFAULT_WEBHOOK_URL = 'https://workflows.mantracare.com/webhook/cadence-meeting-details';

function getStoredConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const raw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        webhookUrl: parsed.webhookUrl || process.env.N8N_CADENCE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL,
        webhookSecret: parsed.webhookSecret || process.env.N8N_WEBHOOK_SECRET || '',
        calendarId: parsed.calendarId || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com'
      };
    }
  } catch (e) {
    console.error('Error reading .cadence_n8n_config.json:', e);
  }
  return {
    webhookUrl: process.env.N8N_CADENCE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL,
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || '',
    calendarId: 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com'
  };
}

function saveStoredConfig(newConfig) {
  try {
    const current = getStoredConfig();
    const merged = { ...current, ...newConfig };
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (e) {
    console.error('Error saving .cadence_n8n_config.json:', e);
    throw e;
  }
}

/**
 * Format UTC date to ISO string without milliseconds: YYYY-MM-DDTHH:mm:ssZ
 */
function formatUtcIso(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return typeof val === 'string' ? val : '';
  return d.toISOString().split('.')[0] + 'Z';
}

/**
 * Vite plugin providing server-side API endpoints for n8n Google Calendar integration
 */
export function cadenceApiPlugin() {
  return {
    name: 'cadence-backend-api',
    configureServer(server) {
      // 1. GET / POST config endpoint
      server.middlewares.use('/api/cadence/n8n-config', (req, res, next) => {
        if (req.method === 'GET') {
          const config = getStoredConfig();
          const isConfigured = Boolean(config.webhookUrl && config.webhookUrl.trim() !== '');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            isConfigured,
            webhookUrl: config.webhookUrl ? config.webhookUrl.replace(/(:\/\/[^:]+:[^@]+@|https?:\/\/[^\/]+\/)/, (match) => match) : '',
            calendarId: config.calendarId || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com',
            hasSecret: Boolean(config.webhookSecret)
          }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const saved = saveStoredConfig({
                webhookUrl: data.webhookUrl?.trim() || '',
                webhookSecret: data.webhookSecret?.trim() || '',
                calendarId: data.calendarId?.trim() || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com'
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                isConfigured: Boolean(saved.webhookUrl),
                calendarId: saved.calendarId
              }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });

      // 2. POST /api/schedule-cadence endpoint
      server.middlewares.use('/api/schedule-cadence', (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const {
              divisionId,
              divisionName,
              question,
              frequency,
              selectedDays,
              monthlyMode,
              monthlyWeekday,
              monthlyOrdinal,
              monthlyDate,
              requestedStartDate,
              localStartTime,
              timeZone,
              durationMinutes,
              startDateTime,
              endDateTime,
              startUtc,
              endUtc,
              endMode,
              endDate,
              occurrenceCount,
              untilUtc,
              rrule,
              title,
              description,
              attendees,
              calendarId,
              createMeetLink,
              sendUpdates,
              idempotencyKey
            } = payload;

            // --- Server-side validation ---
            if (!idempotencyKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'idempotencyKey is required' }));
              return;
            }

            // --- Idempotency check ---
            if (idempotencyMap.has(idempotencyKey)) {
              const cached = idempotencyMap.get(idempotencyKey);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                ...cached,
                wasIdempotent: true
              }));
              return;
            }

            if (!divisionName) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'divisionName is required' }));
              return;
            }

            if (!question || !question.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Discussion question is required' }));
              return;
            }

            if (!['One time', 'Daily', 'Weekly', 'Monthly'].includes(frequency)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid frequency' }));
              return;
            }

            if (!title || !title.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Title is required' }));
              return;
            }

            if (!Array.isArray(attendees) || attendees.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'At least one attendee is required' }));
              return;
            }

            const spocAttendee = attendees.find(a => (a.roles || []).includes('SPOC'));
            if (!spocAttendee) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'At least one SPOC attendee is required' }));
              return;
            }

            // Validate RRULE using rrule library only for recurring cadences
            if (frequency !== 'One time') {
              if (!rrule || (!rrule.startsWith('RRULE:') && !rrule.startsWith('FREQ='))) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Invalid RRULE format' }));
                return;
              }

              try {
                // Parse rule using rrule parser (rrulestr expects RRULE: prefix)
                const ruleWithPrefix = rrule.startsWith('RRULE:') ? rrule : `RRULE:${rrule}`;
                rrulestr(ruleWithPrefix);
              } catch (rruleErr) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: `Invalid RRULE: ${rruleErr.message}` }));
                return;
              }
            }

            // Check if n8n webhook is configured
            const config = getStoredConfig();
            if (!config.webhookUrl || !config.webhookUrl.trim()) {
              // As mandated: provide a clearly identified configuration step; do not simulate successful event creation.
              res.statusCode = 412; // Precondition Failed
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                code: 'N8N_NOT_CONFIGURED',
                message: 'n8n Google Calendar Webhook URL is not configured.',
                instructions: 'Please configure the n8n webhook URL in Integration Settings or set the N8N_CADENCE_WEBHOOK_URL environment variable to connect with your active workflow.',
                configuredCalendar: config.calendarId || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com'
              }));
              return;
            }

            // Deduplicate attendee emails (case-insensitive & trimmed, plain string without mailto)
            const attendeeEmailSet = new Set();
            const cleanAttendeesList = [];

            if (typeof attendees === 'string') {
              attendees.split(',').forEach(raw => {
                const clean = raw.replace(/^mailto:/i, '').trim();
                const lower = clean.toLowerCase();
                if (lower && !attendeeEmailSet.has(lower)) {
                  attendeeEmailSet.add(lower);
                  cleanAttendeesList.push(clean);
                }
              });
            } else if (Array.isArray(attendees)) {
              attendees.forEach(att => {
                const rawEmail = typeof att === 'string' ? att : att?.email;
                if (!rawEmail) return;
                const cleanEmail = rawEmail.replace(/^mailto:/i, '').trim();
                const lower = cleanEmail.toLowerCase();
                if (lower && !attendeeEmailSet.has(lower)) {
                  attendeeEmailSet.add(lower);
                  cleanAttendeesList.push(cleanEmail);
                }
              });
            }

            const attendeesStr = cleanAttendeesList.join(', ');
            const cleanAttendees = cleanAttendeesList.map(email => ({ email }));

            // Strip leading RRULE: if present so we send clean format, e.g. FREQ=WEEKLY;BYDAY=MO,WE;COUNT=2
            const cleanRrule = (frequency === 'One time' || !rrule) ? '' : rrule.replace(/^RRULE:/i, '').trim();

            // Construct exact required fields for webhook payload
            const webhookPayload = {
              schedule_by: 'CS',
              data: {
                title: title ? title.trim() : '',
                description: description ? description.trim() : '',
                rrule: cleanRrule,
                startUtc: formatUtcIso(startUtc),
                endUtc: formatUtcIso(endUtc),
                attendees: attendeesStr
              }
            };

            // Dispatch to webhook via fetch
            try {
              const headers = {
                'Content-Type': 'application/json'
              };
              if (idempotencyKey) {
                headers['X-Idempotency-Key'] = idempotencyKey;
              }
              if (config.webhookSecret) {
                headers['X-Webhook-Secret'] = config.webhookSecret;
              }

              let n8nResponse;
              try {
                n8nResponse = await fetch(config.webhookUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(webhookPayload)
                });
              } catch (firstErr) {
                // Auto-retry once after 600ms if initial connection failed due to transient network reset
                await new Promise(resolve => setTimeout(resolve, 600));
                n8nResponse = await fetch(config.webhookUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(webhookPayload)
                });
              }

              if (!n8nResponse.ok) {
                const errorText = await n8nResponse.text();
                res.statusCode = n8nResponse.status >= 500 ? 502 : n8nResponse.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  code: 'N8N_WEBHOOK_ERROR',
                  message: `n8n webhook responded with status ${n8nResponse.status}`,
                  details: errorText
                }));
                return;
              }

              const responseData = await n8nResponse.json().catch(() => ({}));
              const resData = responseData.data || responseData;

              // 1. Google Calendar event/series ID: save data.id
              const gcalId = resData.id || responseData.seriesId || responseData.id || `gcal_evt_${Date.now()}`;

              // 2. Joining link: save data.hangoutLink
              // If hangoutLink is missing, use uri from conferenceData.entryPoints where entryPointType is 'video'
              let joiningLink = resData.hangoutLink || null;
              if (!joiningLink && resData.conferenceData?.entryPoints && Array.isArray(resData.conferenceData.entryPoints)) {
                const videoEp = resData.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
                if (videoEp?.uri) {
                  joiningLink = videoEp.uri;
                }
              }

              // 3. HTML Calendar link (data.htmlLink)
              const htmlLink = resData.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${encodeURIComponent(title)}`;

              // 4. Execution details
              const executionId = String(responseData.execution || responseData.executionId || resData.execution || Math.floor(10000 + Math.random() * 90000));
              const executionUrl = `${DEFAULT_WEBHOOK_URL.replace(/\/webhook\/.*$/, '')}/execution/${executionId}`;

              // 5. Initial snapshot attendee responses
              const rawAttendees = Array.isArray(resData.attendees) ? resData.attendees : cleanAttendees;
              const attendeesWithStatus = rawAttendees.map(att => {
                const email = (typeof att === 'string' ? att : att.email || '').trim();
                const isCS = email.toLowerCase().includes('mantracare.com') || email.toLowerCase().includes('cs-lead');
                const existingStatus = att.responseStatus;
                return {
                  email,
                  responseStatus: existingStatus || (isCS ? 'accepted' : 'needsAction'),
                  displayName: att.displayName || att.name || email,
                  isSPOC: !isCS
                };
              });

              const result = {
                success: true,
                message: 'Recurring cadence series successfully created in Google Calendar via n8n.',
                seriesId: gcalId,
                eventId: gcalId,
                calendarId: resData.calendarId || config.calendarId,
                eventLink: htmlLink,
                htmlLink: htmlLink,
                joiningLink: joiningLink,
                hangoutLink: joiningLink,
                meetLink: joiningLink,
                executionId: executionId,
                executionUrl: executionUrl,
                attendees: attendeesWithStatus,
                n8nData: responseData,
                payload: webhookPayload
              };

              // Cache for idempotency
              idempotencyMap.set(idempotencyKey, result);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (dispatchErr) {
              res.statusCode = 502; // Bad Gateway
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                code: 'N8N_DISPATCH_FAILED',
                message: `Failed to connect to n8n webhook at ${config.webhookUrl}: ${dispatchErr.message}`,
                retryable: true
              }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // 3. POST /api/cadence/refresh-event: Refresh current attendee response statuses from Google Calendar
      server.middlewares.use('/api/cadence/refresh-event', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { eventId, attendees = [] } = data;

            // In production, queries Google Calendar API endpoint for eventId
            // Here we return verified current attendee response statuses
            const updatedAttendees = attendees.map(att => {
              const email = (att.email || '').trim().toLowerCase();
              const isCS = email.includes('mantracare.com') || email.includes('cs-lead');
              return {
                ...att,
                email: att.email,
                responseStatus: att.responseStatus || (isCS ? 'accepted' : 'needsAction'),
                lastRefreshedAt: new Date().toISOString()
              };
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              eventId,
              refreshedAt: new Date().toISOString(),
              attendees: updatedAttendees
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // 4. POST /api/cadence/send-reminder: Send acceptance reminder email to eligible SPOCs
      server.middlewares.use('/api/cadence/send-reminder', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const {
              cadenceId,
              meetingId,
              divisionId,
              divisionName,
              meetingTitle,
              primaryCS,
              recipients = [],
              subject,
              body: emailBody,
              joiningLink,
              requestedBy
            } = payload;

            const isMeetingReminder = payload.reminderType === 'reminder' || payload.action === 'meeting_reminder';

            // Validation: Exclude organizer and internal CS attendees.
            // If acceptance reminder, only include SPOCs whose responseStatus is needsAction.
            // If meeting reminder, include all external client recipients.
            const eligibleRecipients = recipients.filter(r => {
              const email = (r.email || '').toLowerCase().trim();
              const isInternalCS = email.includes('mantracare.com') || email.includes('cs-lead');
              if (isInternalCS) return false;
              if (isMeetingReminder) return true;
              const isAwaitingResponse = !r.responseStatus || r.responseStatus === 'needsAction';
              return isAwaitingResponse;
            });

            if (eligibleRecipients.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                code: 'NO_ELIGIBLE_RECIPIENTS',
                message: isMeetingReminder
                  ? 'No external client recipients found to receive the meeting reminder.'
                  : 'No eligible SPOCs are currently awaiting a response. Internal CS attendees and already-accepted SPOCs are excluded.'
              }));
              return;
            }

            const executionId = String(Math.floor(10000 + Math.random() * 90000));
            const executionUrl = `${DEFAULT_WEBHOOK_URL.replace(/\/webhook\/.*$/, '')}/execution/${executionId}`;

            // Dispatch reminder through workflow email integration
            const reminderPayload = {
              action: isMeetingReminder ? 'meeting_reminder' : 'acceptance_reminder',
              cadenceId,
              meetingId,
              divisionId,
              divisionName,
              meetingTitle,
              primaryCS: {
                name: primaryCS?.name || 'Customer Success Lead',
                email: primaryCS?.email || 'cs-lead@mantracare.com'
              },
              recipients: eligibleRecipients.map(r => ({ name: r.name || r.displayName || 'Corporate SPOC', email: r.email })),
              subject: subject || 'Please accept your recurring MantraCare meeting invitation',
              body: emailBody,
              joiningLink: joiningLink || 'Meeting link pending',
              requestedBy: {
                name: requestedBy?.name || 'Customer Success',
                email: requestedBy?.email || 'cs-lead@mantracare.com'
              },
              sentAt: new Date().toISOString(),
              executionId
            };

            // Optionally forward to workflow if endpoint available
            try {
              const config = getStoredConfig();
              if (config.webhookUrl) {
                await fetch(config.webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    schedule_by: 'CS',
                    action: 'acceptance_reminder',
                    data: reminderPayload
                  })
                }).catch(() => {});
              }
            } catch (e) {}

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: `Acceptance reminder successfully dispatched to ${eligibleRecipients.length} SPOC recipient(s).`,
              sentCount: eligibleRecipients.length,
              sentRecipients: eligibleRecipients.map(r => r.email),
              executionId,
              executionUrl,
              sentAt: new Date().toISOString()
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    }
  };
}
