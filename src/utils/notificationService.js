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
 * Mark an invoice's activities as unread
 */
export const markInvoiceActivitiesUnread = (invoiceKey) => {
  if (!invoiceKey) return;
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_READ_STATE) || '{}');
    readStore[String(invoiceKey)] = 0; // Reset to 0 so all activities count as unread
    localStorage.setItem(STORAGE_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark invoice unread', e);
  }
};

/**
 * Mark all invoices as read
 */
export const markAllInvoicesRead = () => {
  try {
    const list = getARInvoicesWithNotifications();
    const readStore = JSON.parse(localStorage.getItem(STORAGE_READ_STATE) || '{}');
    list.forEach(inv => {
      readStore[String(inv.invoiceKey)] = Date.now();
    });
    localStorage.setItem(STORAGE_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark all invoices read', e);
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
export const addInvoiceComment = (invoiceKey, commentText, author = 'Customer Success', replyTo = null) => {
  if (!invoiceKey || !commentText?.trim()) return;
  return logInvoiceActivity(invoiceKey, {
    type: 'COMMENT_ADDED',
    title: 'New Comment',
    summary: commentText.trim(),
    author,
    emailSent: false,
    reactions: {},
    replyTo: replyTo ? {
      id: replyTo.id,
      author: replyTo.author,
      text: replyTo.text
    } : null
  });
};

/**
 * Toggle a reaction on an invoice activity or comment
 */
export const toggleInvoiceActivityReaction = (invoiceKey, activityId, emoji, userName = 'Karan Hinduja') => {
  if (!invoiceKey || !activityId || !emoji) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_ACTIVITIES) || '{}');
    const list = all[String(invoiceKey)] || [];
    const updated = list.map(item => {
      if (item.id === activityId) {
        const reactions = item.reactions || {};
        const currentUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
        const hasReacted = currentUsers.includes(userName);
        let newUsers;
        if (hasReacted) {
          newUsers = currentUsers.filter(u => u !== userName);
        } else {
          newUsers = [...currentUsers, userName];
        }
        const newReactions = { ...reactions };
        if (newUsers.length > 0) {
          newReactions[emoji] = newUsers;
        } else {
          delete newReactions[emoji];
        }
        return { ...item, reactions: newReactions };
      }
      return item;
    });
    all[String(invoiceKey)] = updated;
    localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(all));
    window.dispatchEvent(new Event('ar_notification_update'));
    return updated;
  } catch (e) {
    console.error('Failed to toggle invoice activity reaction', e);
  }
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
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
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
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #059669; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(5,150,105,0.25);">
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
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #d97706; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(217,119,6,0.25);">
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
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(79,70,229,0.25);">
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

/**
 * Generate preview payload for an email template without sending/logging an email
 */
export const getEmailTemplatePreview = (templateType, payment = {}) => {
  const invoiceNum = payment.invoiceNumber || (payment.invoiceLink ? payment.invoiceLink.split('/').pop() : `INV-${payment.id || '2026-001'}`);
  const clientName = payment.clientName || 'Corporate Client';
  const billingEntity = payment.clientBillingEntity || payment.billingCompany || 'Corporate Division';
  const invoiceDate = payment.invoiceDate && payment.invoiceDate !== '-' ? payment.invoiceDate : new Date().toISOString().split('T')[0];
  const dueByDate = payment.dueByDate && payment.dueByDate !== '-' ? payment.dueByDate : '15 days from issue';
  const remarks = payment.remarks || 'Invoice for the period of services rendered';
  const billFrom = payment.billingCompany || 'MCHI (MantraCare Health Inc)';
  const participants = getInvoiceParticipants(payment.id || 'INV', payment);

  if (templateType === 'NEW_INVOICE') {
    const directLink = `${getBaseAppUrl()}?invoiceId=${encodeURIComponent(invoiceNum)}&orderId=${encodeURIComponent(payment.orderId || '')}`;
    const subject = `[Accounts Receivable] New Invoice Issued: ${invoiceNum} - ${clientName}`;
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
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
        View Invoice Details in Portal &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>`.trim();

    return {
      templateTitle: '1. New Invoice Template',
      subject,
      htmlBody,
      directLink
    };
  }

  if (templateType === 'PAYMENT') {
    const directLink = `${getBaseAppUrl()}?type=received&invoiceId=${encodeURIComponent(invoiceNum)}&orderId=${encodeURIComponent(payment.orderId || '')}`;
    const subject = `[Payment Update] Payment Received: Invoice ${invoiceNum} - ${clientName}`;
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
          <td style="padding: 6px 0; font-weight: 500;">${new Date().toISOString().split('T')[0]}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Receiving Bank:</td>
          <td style="padding: 6px 0; font-weight: 500;">${billFrom}</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #065f46; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> Exact transaction figures are omitted from this message to safeguard corporate banking privacy.
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #059669; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(5,150,105,0.25);">
        View Payment Records in Portal &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>`.trim();

    return {
      templateTitle: '2. Payment Template',
      subject,
      htmlBody,
      directLink
    };
  }

  if (templateType === 'SCHEDULE') {
    const directLink = `${getBaseAppUrl()}?orderId=${encodeURIComponent(payment.orderId || '')}`;
    const subject = `[Billing Schedule] Schedule Configured: ${clientName}`;
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
          <td style="padding: 6px 0; font-weight: 600;">${payment.orderId || 'ORD-2026-X'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Installments:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #d97706;">Milestone Schedule Configured</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Billing Cadence:</td>
          <td style="padding: 6px 0;">Monthly / Milestone Terms</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #92400e; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> Detailed contract values and milestone amounts are omitted from email notices to safeguard commercial confidentiality.
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #d97706; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(217,119,6,0.25);">
        View Billing Schedule in Portal &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>`.trim();

    return {
      templateTitle: '3. Schedule Template',
      subject,
      htmlBody,
      directLink
    };
  }

  // INVOICE_EDITED
  const directLink = `${getBaseAppUrl()}?invoiceId=${encodeURIComponent(invoiceNum)}&orderId=${encodeURIComponent(payment.orderId || '')}`;
  const subject = `[Invoice Modified] Details Updated: ${invoiceNum} - ${clientName}`;
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
          <td style="padding: 6px 0; font-style: italic;">Due dates, billing entity, or remarks were updated</td>
        </tr>
      </table>
    </div>

    <!-- Data Privacy Alert Banner -->
    <div style="background: #eef2ff; border-left: 4px solid #6366f1; padding: 10px 14px; border-radius: 4px; font-size: 0.78rem; color: #3730a3; margin-bottom: 22px; line-height: 1.4;">
      <strong>Data Leakage Prevention:</strong> In compliance with security policies, financial balances and monetary amounts are strictly omitted from email transmissions.
    </div>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin: 24px 0 16px;">
      <a href="${directLink}" target="_blank" rel="noopener noreferrer" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; display: inline-block; box-shadow: 0 2px 4px rgba(79,70,229,0.25);">
        View Updated Invoice in Portal &rarr;
      </a>
    </div>
  </div>
  <div style="background: #f1f5f9; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
    Delivered to notification participants: ${participants.map(p => `${p.name} (${p.email})`).join(', ')}
  </div>
</div>`.trim();

  return {
    templateTitle: '4. Invoice Edited Template',
    subject,
    htmlBody,
    directLink
  };
};

/* =========================================================================
   GENERAL NOTIFICATIONS & OTHER USER COMMENTS (NO EMAILS DISPATCHED)
   ========================================================================= */

const STORAGE_GENERAL_NOTIFICATIONS = 'general_notifications';
const STORAGE_GENERAL_READ_STATE = 'general_notifications_read_state';
const STORAGE_OTHER_USERS_COMMENTS = 'other_users_comments';
const STORAGE_OTHER_USERS_READ_STATE = 'other_users_read_state';

const SEED_GENERAL_NOTIFICATIONS = [
  {
    id: 'gen-1',
    title: 'Q4 Corporate Billing Schedule Policies Activated',
    message: 'All corporate client contracts transitioning to milestone-based schedules must follow the new anti-data leakage guidelines. Invoices should exclude tax inclusion and adhere to the 4 standardized status updates: To be raised, Payment pending, Partial, and Received.',
    category: 'Billing Policy',
    priority: 'High',
    sender: 'Admin Panel',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gen-2',
    title: 'Anti-Data Leakage Security Standard in Effect',
    message: 'Automated email notifications to clients and CS managers now enforce zero-amount disclosure. Complete financial figures must only be accessed through the authenticated portal.',
    category: 'Security',
    priority: 'Critical',
    sender: 'Security & Compliance',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'gen-3',
    title: 'Scheduled System Maintenance Window',
    message: 'Scheduled server maintenance on Saturday from 02:00 AM to 04:00 AM UTC. Billing services and report exports will experience brief intermittent downtime.',
    category: 'System Notice',
    priority: 'Normal',
    sender: 'DevOps / IT',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Format message timestamp into WhatsApp HH:MM format (e.g. "7:43 pm", no seconds)
 */
export const formatMessageTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
};

/**
 * Format message date into WhatsApp date category ("Today", "Yesterday", or "D/M/YYYY")
 */
export const getMessageDateCategory = (isoString) => {
  if (!isoString) return 'Today';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Today';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export const OTHER_USERS_DIRECTORY = [
  { id: 'ananya', name: 'Ananya Patel', role: 'Finance Operations', email: 'ananya@mantracare.com', avatar: 'A', department: 'Finance' },
  { id: 'vikram', name: 'Vikram Malhotra', role: 'Billing Specialist', email: 'vikram@mantracare.com', avatar: 'V', department: 'Accounts' },
  { id: 'karan', name: 'Karan Hinduja', role: 'Accounts & CS Admin', email: 'karan@mantracare.com', avatar: 'K', department: 'Management' },
  { id: 'priya', name: 'Priya Sharma', role: 'CS Lead', email: 'priya.sharma@mantracare.com', avatar: 'P', department: 'Customer Success' },
  { id: 'rahul', name: 'Rahul Verma', role: 'Operations Manager', email: 'rahul.verma@mantracare.com', avatar: 'R', department: 'Operations' }
];

const SEED_OTHER_USER_COMMENTS = {
  ananya: [
    {
      id: 'comm-a0',
      senderId: 'ananya',
      senderName: 'Ananya Patel',
      role: 'Finance Operations',
      text: 'Hi Karan, let us know once the October invoices are generated so we can initiate client follow-up.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 3 * 3600 * 1000).toISOString()
    },
    {
      id: 'comm-a0-reply',
      senderId: 'currentUser',
      senderName: 'You',
      role: 'Customer Success',
      text: 'Working on these now, will be ready shortly.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 3600 * 1000).toISOString(),
      reactions: { '👍': ['Ananya Patel'] }
    },
    {
      id: 'comm-a1',
      senderId: 'ananya',
      senderName: 'Ananya Patel',
      role: 'Finance Operations',
      text: 'Please ensure all withholding tax certificates for October invoices are uploaded to the billing repository.',
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'comm-a2',
      senderId: 'currentUser',
      senderName: 'You',
      role: 'Customer Success',
      text: 'Noted Ananya, will have the CS team collect them from client finance teams.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      reactions: { '👍': ['Ananya Patel'], '❤️': ['Karan Hinduja'] }
    },
    {
      id: 'comm-a3',
      senderId: 'ananya',
      senderName: 'Ananya Patel',
      role: 'Finance Operations',
      text: 'Great, thanks! We also need the signed schedule for Nova FinTech once approved.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ],
  vikram: [
    {
      id: 'comm-v0',
      senderId: 'vikram',
      senderName: 'Vikram Malhotra',
      role: 'Billing Specialist',
      text: 'Checked the bank statement for last week.',
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'comm-v1',
      senderId: 'vikram',
      senderName: 'Vikram Malhotra',
      role: 'Billing Specialist',
      text: 'Invoice INV_2026_00220 payment has been confirmed via bank wire. Status updated to Partial on the ledger.',
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      reactions: { '✅': ['Karan Hinduja'] }
    }
  ],
  karan: [
    {
      id: 'comm-k1',
      senderId: 'karan',
      senderName: 'Karan Hinduja',
      role: 'Accounts & CS Admin',
      text: 'Please review the updated billing message template for European clients. Tax status has been excluded as discussed.',
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    }
  ]
};

/**
 * Get General Notifications list
 */
export const getGeneralNotifications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_GENERAL_NOTIFICATIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Initialize with seed data
    localStorage.setItem(STORAGE_GENERAL_NOTIFICATIONS, JSON.stringify(SEED_GENERAL_NOTIFICATIONS));
    return SEED_GENERAL_NOTIFICATIONS;
  } catch (e) {
    console.error('Failed to get general notifications', e);
    return SEED_GENERAL_NOTIFICATIONS;
  }
};

/**
 * Add a new General Notification from Admin Panel
 * (No email sent)
 */
export const addGeneralNotification = ({ title, message, category = 'General', priority = 'Normal', sender = 'Admin Panel' }) => {
  if (!title || !message) return null;
  try {
    const list = getGeneralNotifications();
    const newNotif = {
      id: `gen-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      category,
      priority,
      sender,
      timestamp: new Date().toISOString()
    };
    const updated = [newNotif, ...list];
    localStorage.setItem(STORAGE_GENERAL_NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event('ar_notification_update'));
    return newNotif;
  } catch (e) {
    console.error('Failed to add general notification', e);
    return null;
  }
};

/**
 * Check if a general notification is unread
 */
export const isGeneralNotificationUnread = (notifId, timestamp) => {
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_GENERAL_READ_STATE) || '{}');
    if (readStore[String(notifId)]) return false;
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Mark a single general notification as read
 */
export const markGeneralNotificationRead = (notifId) => {
  if (!notifId) return;
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_GENERAL_READ_STATE) || '{}');
    readStore[String(notifId)] = Date.now();
    localStorage.setItem(STORAGE_GENERAL_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark general notification read', e);
  }
};

/**
 * Mark a single general notification as unread
 */
export const markGeneralNotificationUnread = (notifId) => {
  if (!notifId) return;
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_GENERAL_READ_STATE) || '{}');
    delete readStore[String(notifId)];
    localStorage.setItem(STORAGE_GENERAL_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark general notification unread', e);
  }
};

/**
 * Mark all general notifications as read
 */
export const markAllGeneralNotificationsRead = () => {
  try {
    const list = getGeneralNotifications();
    const readStore = JSON.parse(localStorage.getItem(STORAGE_GENERAL_READ_STATE) || '{}');
    list.forEach(n => {
      readStore[String(n.id)] = Date.now();
    });
    localStorage.setItem(STORAGE_GENERAL_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark all general notifications read', e);
  }
};

/**
 * Get total unread count for General Notifications
 */
export const getGeneralUnreadCount = () => {
  try {
    const list = getGeneralNotifications();
    const readStore = JSON.parse(localStorage.getItem(STORAGE_GENERAL_READ_STATE) || '{}');
    return list.filter(n => !readStore[String(n.id)]).length;
  } catch (e) {
    return 0;
  }
};

/**
 * Get Other Users list with last message snippet and unread count
 */
export const getOtherUsersWithStats = () => {
  try {
    const commentsStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_COMMENTS) || '{}');
    const readStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_READ_STATE) || '{}');

    // Ensure seed data loaded if empty
    let allComments = commentsStore;
    if (Object.keys(commentsStore).length === 0) {
      allComments = SEED_OTHER_USER_COMMENTS;
      localStorage.setItem(STORAGE_OTHER_USERS_COMMENTS, JSON.stringify(SEED_OTHER_USER_COMMENTS));
    }

    return OTHER_USERS_DIRECTORY.map(user => {
      const thread = allComments[user.id] || [];
      const lastMsg = thread.length > 0 ? thread[thread.length - 1] : null;
      const lastReadTime = readStore[user.id] || 0;

      const unreadCount = thread.filter(m => m.senderId !== 'currentUser' && new Date(m.timestamp).getTime() > lastReadTime).length;

      return {
        ...user,
        lastMessage: lastMsg ? lastMsg.text : 'No comments yet',
        lastMessageTime: lastMsg ? lastMsg.timestamp : null,
        unreadCount
      };
    });
  } catch (e) {
    console.error('Failed to get other users with stats', e);
    return OTHER_USERS_DIRECTORY.map(u => ({ ...u, lastMessage: 'No comments yet', unreadCount: 0 }));
  }
};

/**
 * Get comments thread with a specific user
 */
export const getUserCommentsThread = (userId) => {
  if (!userId) return [];
  try {
    const commentsStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_COMMENTS) || '{}');
    if (commentsStore[userId]) return commentsStore[userId];

    if (SEED_OTHER_USER_COMMENTS[userId]) {
      commentsStore[userId] = SEED_OTHER_USER_COMMENTS[userId];
      localStorage.setItem(STORAGE_OTHER_USERS_COMMENTS, JSON.stringify(commentsStore));
      return SEED_OTHER_USER_COMMENTS[userId];
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Post a comment in a user's thread
 * (No email sent, in-app only)
 */
export const postUserComment = (userId, text, authorName = 'You', role = 'Customer Success', replyTo = null) => {
  if (!userId || !text?.trim()) return null;
  try {
    const commentsStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_COMMENTS) || '{}');
    const currentThread = commentsStore[userId] || (SEED_OTHER_USER_COMMENTS[userId] ? [...SEED_OTHER_USER_COMMENTS[userId]] : []);

    const newComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: 'currentUser',
      senderName: authorName,
      role,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      reactions: {},
      replyTo: replyTo ? {
        id: replyTo.id,
        author: replyTo.author,
        text: replyTo.text
      } : null
    };

    const updatedThread = [...currentThread, newComment];
    commentsStore[userId] = updatedThread;
    localStorage.setItem(STORAGE_OTHER_USERS_COMMENTS, JSON.stringify(commentsStore));
    window.dispatchEvent(new Event('ar_notification_update'));
    return newComment;
  } catch (e) {
    console.error('Failed to post user comment', e);
    return null;
  }
};

/**
 * Toggle reaction on a user thread comment
 */
export const toggleUserCommentReaction = (userId, commentId, emoji, userName = 'Karan Hinduja') => {
  if (!userId || !commentId || !emoji) return;
  try {
    const commentsStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_COMMENTS) || '{}');
    const thread = commentsStore[userId] || (SEED_OTHER_USER_COMMENTS[userId] ? [...SEED_OTHER_USER_COMMENTS[userId]] : []);
    const updated = thread.map(item => {
      if (item.id === commentId) {
        const reactions = item.reactions || {};
        const currentUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
        const hasReacted = currentUsers.includes(userName);
        let newUsers;
        if (hasReacted) {
          newUsers = currentUsers.filter(u => u !== userName);
        } else {
          newUsers = [...currentUsers, userName];
        }
        const newReactions = { ...reactions };
        if (newUsers.length > 0) {
          newReactions[emoji] = newUsers;
        } else {
          delete newReactions[emoji];
        }
        return { ...item, reactions: newReactions };
      }
      return item;
    });
    commentsStore[userId] = updated;
    localStorage.setItem(STORAGE_OTHER_USERS_COMMENTS, JSON.stringify(commentsStore));
    window.dispatchEvent(new Event('ar_notification_update'));
    return updated;
  } catch (e) {
    console.error('Failed to toggle user comment reaction', e);
  }
};

/**
 * Mark a user's comment thread as read
 */
export const markUserThreadRead = (userId) => {
  if (!userId) return;
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_READ_STATE) || '{}');
    readStore[userId] = Date.now();
    localStorage.setItem(STORAGE_OTHER_USERS_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark user thread read', e);
  }
};

/**
 * Mark a user's comment thread as unread
 */
export const markUserThreadUnread = (userId) => {
  if (!userId) return;
  try {
    const readStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_READ_STATE) || '{}');
    readStore[userId] = 0; // Reset to 0 so all comments from this user count as unread
    localStorage.setItem(STORAGE_OTHER_USERS_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark user thread unread', e);
  }
};

/**
 * Mark all user comment threads as read
 */
export const markAllUserThreadsRead = () => {
  try {
    const users = getOtherUsersWithStats();
    const readStore = JSON.parse(localStorage.getItem(STORAGE_OTHER_USERS_READ_STATE) || '{}');
    users.forEach(u => {
      readStore[u.id] = Date.now();
    });
    localStorage.setItem(STORAGE_OTHER_USERS_READ_STATE, JSON.stringify(readStore));
    window.dispatchEvent(new Event('ar_notification_update'));
  } catch (e) {
    console.error('Failed to mark all user threads read', e);
  }
};

/**
 * Get total unread count across all other user comment threads
 */
export const getOtherUsersTotalUnreadCount = () => {
  try {
    const users = getOtherUsersWithStats();
    return users.reduce((sum, u) => sum + (u.unreadCount || 0), 0);
  } catch (e) {
    return 0;
  }
};

/**
 * Get all Accounts Receivable Invoices with notification stats
 */
export const getARInvoicesWithNotifications = () => {
  try {
    const payments = JSON.parse(localStorage.getItem('client_payments') || '[]');
    const activitiesStore = JSON.parse(localStorage.getItem(STORAGE_ACTIVITIES) || '{}');
    const readStore = JSON.parse(localStorage.getItem(STORAGE_READ_STATE) || '{}');

    // Group activities by invoice key
    const result = [];
    const processedKeys = new Set();

    // First process all registered payments
    payments.forEach(p => {
      const key = String(p.id);
      processedKeys.add(key);
      const acts = activitiesStore[key] || [];
      const lastRead = readStore[key] || 0;
      const unreadCount = acts.filter(a => new Date(a.timestamp).getTime() > lastRead).length;
      const lastAct = acts.length > 0 ? acts[0] : null;

      result.push({
        id: p.id,
        invoiceKey: key,
        invoiceNumber: p.invoiceNumber || (p.invoiceLink ? p.invoiceLink.split('/').pop() : `INV-${p.id}`),
        clientName: p.clientName || 'Corporate Client',
        billingCompany: p.billingCompany || 'MCHI',
        status: p.status || 'To be raised',
        invoiceDate: p.invoiceDate || '-',
        dueByDate: p.dueByDate || '-',
        dueAmount: p.dueAmount || 0,
        currency: p.currency || 'USD',
        activityCount: acts.length,
        unreadCount,
        lastActivity: lastAct,
        orderId: p.orderId || ''
      });
    });

    // Also include any invoice keys in activitiesStore not in client_payments
    Object.keys(activitiesStore).forEach(key => {
      if (!processedKeys.has(key)) {
        const acts = activitiesStore[key] || [];
        const lastRead = readStore[key] || 0;
        const unreadCount = acts.filter(a => new Date(a.timestamp).getTime() > lastRead).length;
        const lastAct = acts.length > 0 ? acts[0] : null;

        result.push({
          id: key,
          invoiceKey: key,
          invoiceNumber: key.startsWith('INV') ? key : `INV-${key}`,
          clientName: acts[0]?.clientName || 'Corporate Client',
          billingCompany: 'MCHI',
          status: 'Active',
          invoiceDate: '-',
          dueByDate: '-',
          dueAmount: 0,
          currency: 'USD',
          activityCount: acts.length,
          unreadCount,
          lastActivity: lastAct,
          orderId: ''
        });
      }
    });

    // Sort by unread first, then by last activity timestamp
    result.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }
      const timeA = a.lastActivity ? new Date(a.lastActivity.timestamp).getTime() : 0;
      const timeB = b.lastActivity ? new Date(b.lastActivity.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  } catch (e) {
    console.error('Failed to get AR invoices with notifications', e);
    return [];
  }
};

/**
 * Total unread count for Accounts Receivable
 */
export const getARTotalUnreadCount = () => {
  try {
    const list = getARInvoicesWithNotifications();
    return list.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
  } catch (e) {
    return 0;
  }
};

/**
 * Global combined unread count (AR + General + Other Users)
 */
export const getGlobalUnreadNotificationCount = () => {
  return getARTotalUnreadCount() + getGeneralUnreadCount() + getOtherUsersTotalUnreadCount();
};
