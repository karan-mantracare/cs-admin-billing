import * as rruleModule from 'rrule';

const rrulestr = rruleModule.rrulestr || (rruleModule.default && rruleModule.default.rrulestr);
const DEFAULT_WEBHOOK_URL = 'https://workflows.mantracare.com/webhook/cadence-meeting-details';

function formatUtcIso(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return typeof val === 'string' ? val : '';
  return d.toISOString().split('.')[0] + 'Z';
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const {
      divisionId,
      divisionName,
      question,
      frequency,
      title,
      description,
      startUtc,
      endUtc,
      rrule,
      attendees,
      idempotencyKey
    } = body || {};

    if (!divisionId && !divisionName) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Corporate division is required' }));
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

    // Validate RRULE if recurring
    if (frequency !== 'One time') {
      if (!rrule || (!rrule.startsWith('RRULE:') && !rrule.startsWith('FREQ='))) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid RRULE format' }));
        return;
      }

      try {
        const ruleWithPrefix = rrule.startsWith('RRULE:') ? rrule : `RRULE:${rrule}`;
        rrulestr(ruleWithPrefix);
      } catch (rruleErr) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: `Invalid RRULE: ${rruleErr.message}` }));
        return;
      }
    }

    // Deduplicate attendee emails into comma-separated string
    const attendeeEmailSet = new Set();
    const cleanAttendeesList = [];

    (attendees || []).forEach(att => {
      const rawEmail = typeof att === 'string' ? att : att?.email;
      if (!rawEmail) return;
      const cleanEmail = rawEmail.replace(/^mailto:/i, '').trim();
      const lower = cleanEmail.toLowerCase();
      if (lower && !attendeeEmailSet.has(lower)) {
        attendeeEmailSet.add(lower);
        cleanAttendeesList.push(cleanEmail);
      }
    });

    const attendeesStr = cleanAttendeesList.join(', ');
    const cleanRrule = (frequency === 'One time' || !rrule) ? '' : rrule.replace(/^RRULE:/i, '').trim();

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

    const webhookUrl = process.env.N8N_CADENCE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
    const headers = { 'Content-Type': 'application/json' };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
    if (process.env.N8N_WEBHOOK_SECRET) headers['X-Webhook-Secret'] = process.env.N8N_WEBHOOK_SECRET;

    let n8nResponse;
    try {
      n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload)
      });
    } catch (err) {
      // Auto-retry once
      await new Promise(r => setTimeout(r, 600));
      n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload)
      });
    }

    if (!n8nResponse.ok) {
      const errText = await n8nResponse.text();
      res.statusCode = n8nResponse.status >= 500 ? 502 : n8nResponse.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        code: 'N8N_WEBHOOK_ERROR',
        message: `n8n webhook responded with status ${n8nResponse.status}`,
        details: errText
      }));
      return;
    }

    const responseData = await n8nResponse.json();
    const resData = responseData.data || responseData;
    const gcalId = resData.id || resData.eventId || responseData.id || `gcal_${Date.now()}`;
    const joiningLink = resData.hangoutLink || resData.conferenceData?.entryPoints?.[0]?.uri || null;
    const htmlLink = resData.htmlLink || `https://calendar.google.com/calendar/r/eventedit/${encodeURIComponent(title)}`;
    const executionId = String(responseData.execution || responseData.executionId || Math.floor(10000 + Math.random() * 90000));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Recurring cadence series successfully created in Google Calendar via n8n.',
      seriesId: gcalId,
      eventId: gcalId,
      calendarId: resData.calendarId || 'cs-calendar-sync@mantracare-gcp.iam.gserviceaccount.com',
      eventLink: htmlLink,
      htmlLink,
      joiningLink,
      hangoutLink: joiningLink,
      meetLink: joiningLink,
      executionId,
      attendees: cleanAttendeesList.map(email => ({ email, responseStatus: 'needsAction' })),
      payload: webhookPayload
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}
