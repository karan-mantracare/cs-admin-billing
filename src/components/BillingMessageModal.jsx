import React, { useState, useEffect, useMemo } from 'react';

export function BillingMessageContent({ payment, orderDetails, onCopy, copied, onUpdateRemarks }) {
  // Resolve associated contract from division_contracts
  const contract = useMemo(() => {
    if (!payment?.contractId) return null;
    try {
      const contracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
      return contracts.find(c => String(c.id) === String(payment.contractId)) || null;
    } catch (e) {
      return null;
    }
  }, [payment?.contractId]);

  const billing = orderDetails?.billingDetails || {};

  // --- Client Billing Details ---
  const clientBillingEntity = payment?.clientBillingEntity 
    || contract?.companyName 
    || payment?.billingCompany 
    || billing.billingEntity 
    || '—';

  const clientTaxDetails = payment?.clientTaxDetails 
    || contract?.taxDetails 
    || (contract?.companyEntities?.[0]?.taxDetails) 
    || billing.taxDetails 
    || '—';

  const contractCurrency = contract?.contractCurrency 
    || billing.clientCurrency 
    || payment?.currency 
    || 'EUR';

  const rawContractVal = contract?.contractValue ?? billing.contractValue ?? payment?.contractValue ?? payment?.amountDue;
  const contractValue = rawContractVal
    ? `${contractCurrency} ${Number(rawContractVal).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : '—';

  // --- Current Invoice Details ---
  const rawInvoiceVal = payment?.amountDue ?? contract?.contractValue ?? 0;
  const invoiceCurrency = payment?.currency || contractCurrency || 'EUR';
  const invoiceValue = `${invoiceCurrency} ${Number(rawInvoiceVal).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const invoiceDate = payment?.invoiceByDate || contract?.billingDate || '—';
  const dueByDate   = payment?.dueByDate || '—';

  const rawDueDays = contract?.paymentDueDays ?? billing.paymentDueDays ?? payment?.paymentDueDays ?? 15;
  const servicePeriod = `${rawDueDays} days`;

  const billFrom = payment?.billingCompany || contract?.billFrom || billing.billingCompany || 'MCHI';
  const receivingBank = payment?.receivingBankName || contract?.receivingBankName || billing.receivingBank || 'AirWallex';
  const bankDetailsLink = payment?.bankDetailsLink || contract?.bankDetailsLink || billing.bankDetailsLink || null;

  // Remarks handling: payment.remarks -> contract.remarks -> default meaningful remark
  const defaultRemark = `Invoice for ${clientBillingEntity !== '—' ? clientBillingEntity : 'Contract'} - ${invoiceCurrency} ${Number(rawInvoiceVal).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const [remarks, setRemarks] = useState(payment?.remarks || contract?.remarks || defaultRemark);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [localCopied, setLocalCopied] = useState(false);

  useEffect(() => {
    setRemarks(payment?.remarks || contract?.remarks || defaultRemark);
  }, [payment?.remarks, contract?.remarks, defaultRemark]);

  const sectionTitleStyle = {
    fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
    color: '#64748b', letterSpacing: '0.06em', marginBottom: '0.75rem',
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  };

  const rowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingBottom: '0.6rem', marginBottom: '0.6rem', borderBottom: '1px solid #f1f5f9'
  };

  const labelStyle = { color: '#64748b', fontSize: '0.82rem', flexShrink: 0, width: '45%' };
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

  const handleCopyMessage = () => {
    const text = [
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
      `Remarks                    : ${remarks || '—'}`,
      `Service Period             : ${servicePeriod}`,
      `Bill From / Bank           : ${billFrom} (${receivingBank})`,
      bankDetailsLink ? `Bank Details Link          : ${bankDetailsLink}` : null,
    ].filter(l => l !== null).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setLocalCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setLocalCopied(false), 2000);
    });
  };

  return (
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
        <LastRow label="Contract Value" value={contractValue} valueColor="#0ea5e9" />
      </div>

      {/* Section 2: Invoice Details */}
      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' }}>
        <div style={sectionTitleStyle}>
          <i className='bx bx-receipt' style={{ color: '#10b981' }}></i>
          Current Invoice
        </div>
        <Row label="Invoice Value" value={invoiceValue} valueColor="#10b981" />
        <Row label="Invoice Date" value={invoiceDate} />
        <Row label="Due By Date" value={dueByDate} valueColor="#ef4444" />
        
        {/* Remarks Row with Inline Edit */}
        <div style={rowStyle}>
          <span style={labelStyle}>Remarks</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', flex: 1 }}>
            {isEditingRemarks ? (
              <div style={{ display: 'flex', gap: '0.35rem', width: '100%', justifyContent: 'flex-end' }}>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.82rem',
                    borderRadius: '5px',
                    border: '1px solid #0ea5e9',
                    outline: 'none',
                    width: '75%',
                    color: '#0f172a'
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingRemarks(false);
                    if (onUpdateRemarks) onUpdateRemarks(remarks);
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ ...valueStyle, maxWidth: '240px' }}>{remarks || '—'}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingRemarks(true)}
                  style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  title="Edit Remarks"
                >
                  <i className='bx bx-edit-alt' style={{ fontSize: '1rem' }}></i>
                </button>
              </div>
            )}
          </div>
        </div>

        <Row label="Service Period" value={servicePeriod} />
        <Row label="Bill From / Bank" value={`${billFrom} • ${receivingBank}`} />
        <LastRow label="Bank Details" value={bankDetailsLink ? "View Details" : "—"} href={bankDetailsLink} />
      </div>

      {/* Buttons inside content for copying */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          onClick={handleCopyMessage}
          style={{
            background: (copied || localCopied) ? '#10b981' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px',
            padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease'
          }}
        >
          <i className={`bx ${(copied || localCopied) ? 'bx-check' : 'bx-copy'}`}></i>
          {(copied || localCopied) ? 'Copied to Clipboard!' : 'Copy Message'}
        </button>
      </div>
    </div>
  );
}

function BillingMessageModal({ isOpen, onClose, payment }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && payment?.orderId) {
      try {
        const saved = localStorage.getItem('division_orders');
        if (saved) {
          const orders = JSON.parse(saved);
          const order = Array.isArray(orders) ? orders.find(o => String(o.id) === String(payment.orderId)) : null;
          setOrderDetails(order || null);
        }
      } catch (e) {
        console.error('Failed to load order details', e);
      }
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const billing = orderDetails?.billingDetails || {};
  const clientBillingEntity = payment?.clientBillingEntity || payment?.billingCompany || billing.billingEntity || '—';
  const clientTaxDetails    = billing.taxDetails || '—';
  const contractCurrency    = billing.clientCurrency || payment.currency || '—';
  const contractValue       = billing.contractValue ? `${contractCurrency} ${Number(billing.contractValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—';
  const invoiceValue        = payment.amountDueUsd ? `USD ${Number(payment.amountDueUsd).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—';
  const invoiceDate         = payment.invoiceByDate || '—';
  const dueByDate           = payment.dueByDate || '—';
  const noOfEmployees       = billing.noOfEmployees || orderDetails?.employees || '—';
  const servicePeriod       = billing.paymentDueDays ? `${billing.paymentDueDays} days` : '—';
  const bankDetailsLink     = billing.bankDetailsLink || null;
  const remarks             = payment?.remarks || '—';

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
    `Remarks                    : ${remarks}`,
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
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
        <BillingMessageContent payment={payment} orderDetails={orderDetails} onCopy={handleCopy} copied={copied} />
      </div>
    </div>
  );
}

export default BillingMessageModal;
