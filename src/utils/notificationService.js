/**
 * Notification & Activity Service for Accounts Receivable
 * 
 * Strict Anti-Data Leakage Policy:
 * "Never mention full details in the email, no amount should be mentioned, to save data leakage"
 * 
 * Supports:
 * 1. New Invoice Notification (Email to Primary CS & Accounts Team + Participants)
 * 2. Payment Notification (Email to Primary CS & Accounts Team + Participants)
 * 3. Schedule Notification (Email to Primary CS & Accounts Team + Participants)
 * 4. Invoice Edited Notification (Email to Primary CS & Accounts Team + Participants)
 * 5. Comment Added (In-app only, NO email, increments unread notification count)
 */

import { getPrimaryCS } from './roleUtils';

const DEFAULT_ACCOUNTS_EMAIL = 'accounts@mantracare.com';
const DEFAULT_ACCOUNTS_NAME = 'Accounts Team';

// Storage keys
const STORAGE_ACTIVITIES = 'ar_invoice_activities';
const STORAGE_PARTICIPANTS = 'ar_invoice_participants';
const STORAGE_READ_STATE = 'ar_invoice_read_state';
const STORAGE_EMAIL_LOGS = 'ar_email_notifications_log';

/**
 * Get base URL for deep-links
 */
const getBaseAppUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/corporate/payments`;
  }
  return '/corporate/payments';
};

/**
 * Resolve default participants for a payment / invoice
 */
export const getDefaultParticipants = (payment = {}) => {
  const primaryCsName = payment?.csResponsible || getPrimaryCS(payment?.divisionId, payment?.divisionName, payment?.clientName) || 'Karan Hinduja';
  
  // Format CS email (mock / standard format)
  const csEmail = `${primaryCsName.toLowerCase().replace(/[^a-z]/g, '.')}@mantracare.com`;

  return [
    {
      id: 'primary-cs',
      name: primaryCsName,
      email: csEmail,
      role: 'Primary CS',
      isDefault: true
    },
    {
      id: 'accounts-team',
      name: DEFAULT_ACCOUNTS_NAME,
      email: DEFAULT_ACCOUNTS_EMAIL,
      role: 'Accounts & Finance',
      isDefault: true
    }
  ];
};

/**
 * Get all participants subscribed to an invoice
 */
export const getInvoiceParticipants = (invoiceKey, payment = {}) => {
  if (!invoiceKey) return getDefaultParticipants(payment);
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_PARTICIPANTS) || '{}');
    const stored = all[String(invoiceKey)];
    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
  } catch (e) {
    console.error('Failed to load participants', e);
  }
  return getDefaultParticipants(payment);
};

/**
 * Add a participant to an invoice notification list
 */
export const addInvoiceParticipant = (invoiceKey, participant, payment = {}) => {
  if (!invoiceKey || !participant?.email) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_PARTICIPANTS) || '{}');
    const current = all[String(invoiceKey)] || getDefaultParticipants(payment);
    
    // Check if already exists
    const exists = current.some(p => p.email.toLowerCase() === participant.email.toLowerCase());
    if (!exists) {
      const updated = [
        ...current,
        {
          id: participant.id || `custom-${Date.now()}`,
          name: participant.name || participant.email.split('@')[0],
          email: participant.email,
          role: participant.role || 'Participant',
          isDefault: false,
          addedAt: new Date().toISOString()
        }
      ];
      all[String(invoiceKey)] = updated;
      localStorage.setItem(STORAGE_PARTICIPANTS, JSON.stringify(all));
      window.dispatchEvent(new Event('ar_notification_update'));
      return updated;
    }
    return current;
  } catch (e) {
    console.error('Failed to add participant', e);
  }
};

/**
 * Remove an optional participant
 */
export const removeInvoiceParticipant = (invoiceKey, email, payment = {}) => {
  if (!invoiceKey || !email) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_PARTICIPANTS) || '{}');
    const current = all[String(invoiceKey)] || getDefaultParticipants(payment);
    const updated = current.filter(p => p.isDefault || p.email.toLowerCase() !== email.toLowerCase());
    all[String(invoiceKey)] = updated;
    localStorage.setItem(STORAGE_PARTICIPANTS, JSON.stringify(all));
    window.dispatchEvent(new Event('ar_notification_update'));
    return updated;
  } catch (e) {
    console.error('Failed to remove participant', e);
  }
};

/**
 * Get all activities (system notifications + comments) for an invoice
 */
export const getInvoiceActivities = (invoiceKey) => {
  if (!invoiceKey) return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_ACTIVITIES) || '{}');
    return all[String(invoiceKey)] || [];
  } catch (e) {
    console.error('Failed to get invoice activities', e);
    return [];
  }
};

/**
 * Get unread count for an invoice
 */
export const getInvoiceUnreadCount = (invoiceKey) => {
  if (!invoiceKey) return 0;
  try {
    const activities = getInvoiceActivities(invoiceKey);
    const readStore = JSON.parse(localStorage.getItem(STORAGE_READ_STATE) || '{}');
    const lastReadTimestamp = readStore[String(invoiceKey)] || 0;
    
    return activities.filter(a => new Date(a.timestamp).getTime() > lastReadTimestamp).length;
  } catch (e) {
    return 0;
  }
};

/**
 * Mark all activities for an invoice as read
 */
export const markInvoiceActivitiesRead = (invoiceKey) => {
  if (!invoiceKey) return;
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_READ_STATE) || '{}');
    readStore[String(invoiceKey)] = Date.now();
    localStorage.setItem(STORAGE_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark read', e);
  }
};

/**
 * Dispatch an email notification and log it (simulated transactional email dispatch)
 */
const recordEmailDispatch = (type, invoiceKey, recipients, subject, htmlBody, textBody) => {
  try {
    const emailLog = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      invoiceKey: String(invoiceKey),
      type,
      recipients: recipients.map(r => ({ name: r.name, email: r.email, role: r.role })),
      subject,
      htmlBody,
      textBody,
      sentAt: new Date().toISOString(),
      status: 'Delivered'
    };

    const logs = JSON.parse(localStorage.getItem(STORAGE_EMAIL_LOGS) || '[]');
    logs.unshift(emailLog);
    // Keep last 100 email logs
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem(STORAGE_EMAIL_LOGS, JSON.stringify(logs));

    return emailLog;
  } catch (e) {
    console.error('Failed to record email dispatch', e);
    return null;
  }
};

/**
 * Log activity item to invoice activity stream
 */
export const logInvoiceActivity = (invoiceKey, activityData) => {
  if (!invoiceKey) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_ACTIVITIES) || '{}');
    const current = all[String(invoiceKey)] || [];
    
    const newEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...activityData
    };

    all[String(invoiceKey)] = [newEntry, ...current];
    localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(all));
    window.dispatchEvent(new Event('ar_notification_update'));
    return newEntry;
  } catch (e) {
    console.error('Failed to log invoice activity', e);
  }
};

/**
 * Add a user comment (NO email sent, updates unread count)
 */
export const addInvoiceComment = (invoiceKey, commentText, author = 'Customer Success') => {
  if (!invoiceKey || !commentText?.trim()) return;
  return logInvoiceActivity(invoiceKey, {
    type: 'COMMENT_ADDED',
    title: 'New Comment',
    summary: commentText.trim(),
    author,
    emailSent: false
  });
};

/* =========================================================================
   EMAIL TEMPLATES (STRICT ZERO AMOUNT / ANTI-DATA LEAKAGE COMPLIANT)
   ========================================================================= */

/**
 * 1. NEW INVOICE NOTIFICATION TEMPLATE
 * Sent when a new invoice is added/uploaded.
 * NO AMOUNTS MENTIONED.
 */
export const sendNewInvoiceNotification = (payment = {}, extraInfo = {}) => {
  const invoiceKey = payment.id || payment.invoiceNumber || 'INV';
  const participants = getInvoiceParticipants(invoiceKey, payment);
  const invoiceNum = payment.invoiceNumber || extraInfo.invoiceNumber || `INV-${payment.id || 'N/A'}`;
  const clientName = payment.clientName || 'Valued Corporate';
  const billingEntity = payment.clientBillingEntity || payment.billingCompany || 'Corporate Division';
  const invoiceDate = payment.invoiceDate && payment.invoiceDate !== '-' ? payment.invoiceDate : (extraInfo.invoiceDate || new Date().toISOString().split('T')[0]);
  const dueByDate = payment.dueByDate && payment.dueByDate !== '-' ? payment.dueByDate : 'As per agreement';
  const remarks = payment.remarks || extraInfo.remarks || 'Invoice for the period';
  const billFrom = payment.billingCompany || 'MCHI';
  
  const directLink = `${getBaseAppUrl()}?invoiceId=${encodeURIComponent(invoiceNum)}&orderId=${encodeURIComponent(payment.orderId || '')}`;

  const subject = `[Accounts Receivable] New Invoice Issued: ${invoiceNum} - ${clientName}`;

  const textBody = `
NEW INVOICE ISSUED
────────────────────────────────────────────
A new invoice has been issued and uploaded for ${clientName}.

INVOICE DETAILS (CONFIDENTIAL):
• Client Name           : ${clientName}
• Client Billing Entity : ${billingEntity}
• Invoice ID / Number   : ${invoiceNum}
• Invoice Date          : ${invoiceDate}
• Due By Date           : ${dueByDate}
• Remarks               : ${remarks}
• Bill From Entity      : ${billFrom}

SECURITY & PRIVACY NOTICE:
In compliance with corporate financial confidentiality and data leakage prevention standards, financial figures and amounts are strictly omitted from this notification transmission.

Access the complete invoice and financial schedule via the secure portal:
${directLink}
────────────────────────────────────────────
Delivered to: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
`.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #2563eb; padding: 20px 24px; color: #ffffff;">
    <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.01em;">New Invoice Issued</h2>
    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Accounts Receivable Notification • MantraCare</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin: 0 0 16px; font-size: 0.92rem; color: #334155; line-height: 1.5;">
      A new invoice has been generated and uploaded for <strong>${clientName}</strong>.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #334155;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Client Name:</td>
          <td style="padding: 6px 0; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Billing Entity:</td>
          <td style="padding: 6px 0; font-weight: 600;">${billingEntity}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Invoice ID:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #2563eb;">${invoiceNum}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Invoice Date:</td>
          <td style="padding: 6px 0; font-weight: 500;">${invoiceDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Due By Date:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #dc2626;">${dueByDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Remarks:</td>
          <td style="padding: 6px 0; font-style: italic;">${remarks}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Bill From:</td>
          <td style="padding: 6px 0;">${billFrom}</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #1e40af; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> Financial amounts and payment figures are deliberately omitted from this notification to maintain strict organizational confidentiality.
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
        View Invoice Details in Portal &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>
`.trim();

  // Record dispatch and log activity
  const emailRecord = recordEmailDispatch('NEW_INVOICE', invoiceKey, participants, subject, htmlBody, textBody);
  
  logInvoiceActivity(invoiceKey, {
    type: 'NEW_INVOICE',
    title: 'New Invoice Uploaded',
    summary: `Invoice ${invoiceNum} generated for ${clientName}. Notification dispatched to ${participants.length} participants.`,
    author: payment?.csResponsible || 'System',
    emailSent: true,
    emailDetails: {
      recipients: participants,
      subject,
      htmlBody,
      directLink
    }
  });

  return { subject, participants, directLink, emailRecord };
};

/**
 * 2. PAYMENT RECORDED NOTIFICATION TEMPLATE
 * Sent when a payment is added.
 * NO AMOUNTS MENTIONED.
 */
export const sendPaymentNotification = (payment = {}, paymentRecord = {}) => {
  const invoiceKey = payment.id || payment.invoiceNumber || 'INV';
  const participants = getInvoiceParticipants(invoiceKey, payment);
  const invoiceNum = payment.invoiceNumber || `INV-${payment.id || 'N/A'}`;
  const clientName = payment.clientName || 'Valued Corporate';
  const paymentDate = paymentRecord.paymentDate || new Date().toISOString().split('T')[0];
  const receivedBank = paymentRecord.receivedBank || payment.billingCompany || 'Designated Corporate Account';
  
  const directLink = `${getBaseAppUrl()}?type=received&invoiceId=${encodeURIComponent(invoiceNum)}&orderId=${encodeURIComponent(payment.orderId || '')}`;

  const subject = `[Payment Update] Payment Received: Invoice ${invoiceNum} - ${clientName}`;

  const textBody = `
PAYMENT RECORDED
────────────────────────────────────────────
A payment has been successfully recorded for ${clientName} against invoice ${invoiceNum}.

PAYMENT DETAILS:
• Client Name       : ${clientName}
• Invoice Reference : ${invoiceNum}
• Payment Date      : ${paymentDate}
• Receiving Bank    : ${receivedBank}
• Status            : Payment Processed

SECURITY & PRIVACY NOTICE:
Exact payment and balance figures are excluded from email transmissions to prevent sensitive financial leakage.

Review payment confirmation and reconciled ledgers on the portal:
${directLink}
────────────────────────────────────────────
Delivered to: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
`.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #059669; padding: 20px 24px; color: #ffffff;">
    <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Payment Recorded</h2>
    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Accounts Receivable • MantraCare</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin: 0 0 16px; font-size: 0.92rem; color: #334155; line-height: 1.5;">
      A payment transaction has been confirmed and recorded for <strong>${clientName}</strong>.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #334155;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Client Name:</td>
          <td style="padding: 6px 0; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #059669;">${invoiceNum}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Payment Date:</td>
          <td style="padding: 6px 0; font-weight: 500;">${paymentDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Receiving Bank:</td>
          <td style="padding: 6px 0; font-weight: 500;">${receivedBank}</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #065f46; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> Exact transaction figures are omitted from this message to safeguard corporate banking privacy.
    </div>

    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" style="background: #059669; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(5,150,105,0.25);">
        View Payment Records &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>
`.trim();

  const emailRecord = recordEmailDispatch('PAYMENT_ADDED', invoiceKey, participants, subject, htmlBody, textBody);

  logInvoiceActivity(invoiceKey, {
    type: 'PAYMENT_ADDED',
    title: 'Payment Recorded',
    summary: `Payment recorded against ${invoiceNum} on ${paymentDate}. Notification dispatched to ${participants.length} participants.`,
    author: paymentRecord.enteredBy || 'Finance Team',
    emailSent: true,
    emailDetails: {
      recipients: participants,
      subject,
      htmlBody,
      directLink
    }
  });

  return { subject, participants, directLink, emailRecord };
};

/**
 * 3. SCHEDULE CREATED NOTIFICATION TEMPLATE
 * Sent when a billing schedule is generated.
 * NO AMOUNTS MENTIONED.
 */
export const sendScheduleNotification = (scheduleData = {}) => {
  const clientName = scheduleData.clientName || 'Corporate Client';
  const orderId = scheduleData.orderId || '';
  const invoiceKey = scheduleData.firstInvoiceId || orderId || `SCH-${Date.now()}`;
  const participants = getInvoiceParticipants(invoiceKey, { clientName, csResponsible: scheduleData.csResponsible });
  const count = scheduleData.totalInstallments || scheduleData.invoicesCount || 'Multiple';
  const frequency = scheduleData.frequency || 'Scheduled Cadence';
  const startDate = scheduleData.startDate || new Date().toISOString().split('T')[0];

  const directLink = `${getBaseAppUrl()}?orderId=${encodeURIComponent(orderId)}`;

  const subject = `[Billing Schedule] Schedule Configured: ${clientName}`;

  const textBody = `
NEW BILLING SCHEDULE CREATED
────────────────────────────────────────────
A new invoice and payment schedule has been configured for ${clientName}.

SCHEDULE SUMMARY:
• Client Name       : ${clientName}
• Order Reference   : ${orderId || 'Direct Schedule'}
• Installments      : ${count} terms generated
• Cadence           : ${frequency}
• Commencement Date : ${startDate}

SECURITY & PRIVACY NOTICE:
Installment valuations and contract totals are intentionally excluded from notifications to protect commercial terms.

View and manage the schedule directly in Accounts Receivable:
${directLink}
────────────────────────────────────────────
Delivered to: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
`.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #d97706; padding: 20px 24px; color: #ffffff;">
    <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Billing Schedule Created</h2>
    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Accounts Receivable • MantraCare</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin: 0 0 16px; font-size: 0.92rem; color: #334155; line-height: 1.5;">
      A new milestone billing schedule has been finalized for <strong>${clientName}</strong>.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #334155;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Client Name:</td>
          <td style="padding: 6px 0; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Order Reference:</td>
          <td style="padding: 6px 0; font-weight: 600;">${orderId || 'Active Contract'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Installments:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #d97706;">${count} terms scheduled</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Billing Cadence:</td>
          <td style="padding: 6px 0;">${frequency}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Start Date:</td>
          <td style="padding: 6px 0;">${startDate}</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #92400e; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> Detailed contract values and milestone amounts are omitted from email notices to safeguard commercial confidentiality.
    </div>

    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" style="background: #d97706; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(217,119,6,0.25);">
        View Billing Schedule &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>
`.trim();

  const emailRecord = recordEmailDispatch('SCHEDULE_CREATED', invoiceKey, participants, subject, htmlBody, textBody);

  logInvoiceActivity(invoiceKey, {
    type: 'SCHEDULE_CREATED',
    title: 'Billing Schedule Created',
    summary: `Schedule of ${count} installments created for ${clientName}. Notification sent to ${participants.length} participants.`,
    author: scheduleData.csResponsible || 'CS Admin',
    emailSent: true,
    emailDetails: {
      recipients: participants,
      subject,
      htmlBody,
      directLink
    }
  });

  return { subject, participants, directLink, emailRecord };
};

/**
 * 4. INVOICE EDITED NOTIFICATION TEMPLATE
 * Sent when an invoice's details are modified.
 * NO AMOUNTS MENTIONED.
 */
export const sendInvoiceEditedNotification = (payment = {}, modifiedFields = 'Dates or remarks updated') => {
  const invoiceKey = payment.id || payment.invoiceNumber || 'INV';
  const participants = getInvoiceParticipants(invoiceKey, payment);
  const invoiceNum = payment.invoiceNumber || `INV-${payment.id || 'N/A'}`;
  const clientName = payment.clientName || 'Corporate Client';

  const directLink = `${getBaseAppUrl()}?invoiceId=${encodeURIComponent(invoiceNum)}&orderId=${encodeURIComponent(payment.orderId || '')}`;

  const subject = `[Invoice Modified] Details Updated: ${invoiceNum} - ${clientName}`;

  const textBody = `
INVOICE DETAILS MODIFIED
────────────────────────────────────────────
Invoice details for ${invoiceNum} of ${clientName} have been modified.

UPDATE SUMMARY:
• Client Name       : ${clientName}
• Invoice Reference : ${invoiceNum}
• Update Details    : ${modifiedFields}
• Timestamp         : ${new Date().toLocaleString()}

SECURITY & PRIVACY NOTICE:
Updated amount figures are excluded from email updates to protect sensitive corporate financial data.

Review the updated invoice and changelog on the portal:
${directLink}
────────────────────────────────────────────
Delivered to: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
`.trim();

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #4f46e5; padding: 20px 24px; color: #ffffff;">
    <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700;">Invoice Details Modified</h2>
    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Accounts Receivable • MantraCare</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin: 0 0 16px; font-size: 0.92rem; color: #334155; line-height: 1.5;">
      Invoice details for <strong>${invoiceNum}</strong> of <strong>${clientName}</strong> were recently edited.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #334155;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Client Name:</td>
          <td style="padding: 6px 0; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Invoice Reference:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #4f46e5;">${invoiceNum}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Modification Note:</td>
          <td style="padding: 6px 0; font-style: italic;">${modifiedFields}</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #eef2ff; border-left: 4px solid #6366f1; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #3730a3; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> In compliance with security policies, financial balances and monetary amounts are strictly omitted from email transmissions.
    </div>

    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(79,70,229,0.25);">
        View Updated Invoice &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>
`.trim();

  const emailRecord = recordEmailDispatch('INVOICE_EDITED', invoiceKey, participants, subject, htmlBody, textBody);

  logInvoiceActivity(invoiceKey, {
    type: 'INVOICE_EDITED',
    title: 'Invoice Details Edited',
    summary: `Invoice ${invoiceNum} was modified (${modifiedFields}). Notification sent to ${participants.length} participants.`,
    author: payment?.csResponsible || 'CS Admin',
    emailSent: true,
    emailDetails: {
      recipients: participants,
      subject,
      htmlBody,
      directLink
    }
  });

  return { subject, participants, directLink, emailRecord };
};
