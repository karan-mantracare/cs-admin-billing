import React, { useState, useEffect } from 'react';

function BillingMessageModal({ isOpen, onClose, payment }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && payment?.orderId) {
      try {
        const saved = localStorage.getItem('division_orders');
        if (saved) {
          const orders = JSON.parse(saved);
          const order = orders.find(o => String(o.id) === String(payment.orderId));
          setOrderDetails(order || null);
        }
      } catch (e) {
        console.error('Failed to load order details', e);
      }
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const billing = orderDetails?.billingDetails || {};

  // --- Fields ---
  const clientBillingEntity = billing.billingEntity || payment.billingCompany || '—';
  const clientTaxDetails    = billing.taxDetails || '—';
  const contractCurrency    = billing.clientCurrency || payment.currency || '—';
  const contractValue       = billing.contractValue
    ? `${contractCurrency} ${Number(billing.contractValue).toLocaleString()}`
    : '—';
  const invoiceValue        = payment.amountDueUsd
    ? `USD ${payment.amountDueUsd.toLocaleString()}`
    : '—';
  const invoiceDate         = payment.invoiceByDate || '—';
  const dueByDate           = payment.dueByDate || '—';
  const noOfEmployees       = billing.noOfEmployees || orderDetails?.employees || '—';
  const servicePeriod       = billing.paymentDueDays
    ? `${billing.paymentDueDays} days`
    : '—';
  const bankDetailsLink     = billing.bankDetailsLink || null;
  const serviceDescription  = `EAP Service offered for ${noOfEmployees} employees`;

  // Build the full message text for clipboard copy
  const messageText = [
    'Billing Message',
    '─────────────────────────────',
    `Client Billing Entity Name : ${clientBillingEntity}`,
    `Client Tax Details         : ${clientTaxDetails}`,
    `Contract Billing Currency  : ${contractCurrency}`,
    `Contract Value             : ${contractValue}`,
    '',
    'Current Invoice',
    '─────────────────────────────',
    `Invoice Value              : ${invoiceValue}`,
    `Invoice Date               : ${invoiceDate}`,
    `Due By Date                : ${dueByDate}`,
    `Service Description        : ${serviceDescription}`,
    `Service Period             : ${servicePeriod}`,
    bankDetailsLink ? `Bank Details Link          : ${bankDetailsLink}` : null,
  ].filter(l => l !== null).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '1rem'
  };

  const modalStyle = {
    background: 'white', borderRadius: '12px', width: '100%', maxWidth: '560px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
  };

  const sectionTitleStyle = {
    fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
    color: '#64748b', letterSpacing: '0.06em', marginBottom: '0.75rem',
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  };

  const rowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingBottom: '0.6rem', marginBottom: '0.6rem', borderBottom: '1px solid #f1f5f9'
  };

  const labelStyle = { color: '#64748b', fontSize: '0.82rem', flexShrink: 0, width: '50%' };
  const valueStyle = { color: '#0f172a', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right', wordBreak: 'break-word' };

  const Row = ({ label, value, valueColor }) => (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <span style={{ ...valueStyle, color: valueColor || '#0f172a' }}>{value || '—'}</span>
    </div>
  );

  const LastRow = ({ label, value, valueColor, href }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={labelStyle}>{label}</span>
      {href
        ? <a href={href} target="_blank" rel="noreferrer" style={{ ...valueStyle, color: '#0ea5e9', textDecoration: 'none', wordBreak: 'break-all' }}>
            <i className='bx bx-link-external' style={{ marginRight: '0.3rem' }}></i>
            {value}
          </a>
        : <span style={{ ...valueStyle, color: valueColor || '#0f172a' }}>{value || '—'}</span>
      }
    </div>
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700' }}>
              <i className='bx bx-envelope' style={{ marginRight: '0.5rem' }}></i>
              Billing Message
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
              Share with your accounts team to raise the invoice
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '62vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Section 1: Client Billing */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={sectionTitleStyle}>
              <i className='bx bx-building' style={{ color: '#0ea5e9' }}></i>
              Client Billing Details
            </div>
            <Row label="Client Billing Entity Name" value={clientBillingEntity} />
            <Row label="Client Tax Details" value={clientTaxDetails} />
            <Row label="Contract Billing Currency" value={contractCurrency} />
            <LastRow label="Contract Value" value={contractValue} valueColor="#0284c7" />
          </div>

          {/* Section 2: Current Invoice */}
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' }}>
            <div style={sectionTitleStyle}>
              <i className='bx bx-receipt' style={{ color: '#10b981' }}></i>
              Current Invoice
            </div>
            <Row label="Invoice Value" value={invoiceValue} valueColor="#10b981" />
            <Row label="Invoice Date" value={invoiceDate} />
            <Row label="Due By Date" value={dueByDate} valueColor="#ef4444" />
            <Row label="Service Description" value={serviceDescription} />
            <LastRow label="Service Period" value={servicePeriod} />
          </div>

          {/* Section 3: Bank Details (Optional) */}
          {bankDetailsLink && (
            <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '1rem', border: '1px solid #fde68a' }}>
              <div style={{ ...sectionTitleStyle, color: '#92400e' }}>
                <i className='bx bx-bank' style={{ color: '#f59e0b' }}></i>
                Bank Details <span style={{ fontWeight: '400', textTransform: 'none', fontSize: '0.7rem' }}>(Optional)</span>
              </div>
              <LastRow label="Bank Details Link" value={bankDetailsLink} href={bankDetailsLink} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc' }}>
          <button
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.5rem 1.25rem',
              background: copied ? '#10b981' : '#0ea5e9',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'background 0.3s'
            }}
          >
            <i className={`bx ${copied ? 'bx-check' : 'bx-copy'}`}></i>
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillingMessageModal;
