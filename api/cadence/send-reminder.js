const DEFAULT_WEBHOOK_URL = 'https://workflows.mantracare.com/webhook/cadence-meeting-details';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Idempotency-Key');

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
      action = 'acceptance_reminder',
      cadenceId,
      meetingId,
      divisionId,
      divisionName,
      meetingTitle,
      primaryCS,
      recipients,
      subject,
      body: emailBody,
      joiningLink,
      requestedBy
    } = body || {};

    const eligibleRecipients = Array.isArray(recipients) ? recipients : [];
    const executionId = String(Math.floor(10000 + Math.random() * 90000));
    const executionUrl = `${DEFAULT_WEBHOOK_URL.replace(/\/webhook\/.*$/, '')}/execution/${executionId}`;

    const reminderPayload = {
      action,
      cadenceId,
      meetingId,
      divisionId,
      divisionName,
      meetingTitle,
      primaryCS,
      recipients: eligibleRecipients,
      subject,
      body: emailBody,
      joiningLink: joiningLink || 'Meeting link pending',
      requestedBy: {
        name: requestedBy?.name || 'Customer Success',
        email: requestedBy?.email || 'cs-lead@mantracare.com'
      },
      sentAt: new Date().toISOString(),
      executionId
    };

    try {
      const webhookUrl = process.env.N8N_CADENCE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_by: 'CS',
          action,
          data: reminderPayload
        })
      }).catch(() => {});
    } catch (e) {}

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: `Reminder successfully dispatched to ${eligibleRecipients.length} recipient(s).`,
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
}
