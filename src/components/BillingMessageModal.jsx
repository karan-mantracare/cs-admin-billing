import React, { useState, useEffect, useMemo } from 'react';
import { calculateTaxAdjustments } from '../utils/taxAdjustmentUtils';

export function BillingMessageContent({ payment, orderDetails, onCopy, copied, onUpdateRemarks }) {
  // Resolve associated contract from division_contracts
  const contract = useMemo(() => {
    try {
      const contracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
      if (payment?.contractId) {
        const found = contracts.find(c => String(c.id) === String(payment.contractId));
        if (found) return found;
      }
      if (payment?.orderId && payment.orderId !== 'Null') {
        const found = contracts.find(c => String(c.orderId) === String(payment.orderId));
        if (found) return found;
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [payment?.contractId, payment?.orderId]);

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

  const isTaxIncluded = !!(payment?.includingTax !== undefined ? payment.includingTax : (contract?.includingTax !== undefined ? contract.includingTax : billing?.includingTax));
  const taxStatusText = isTaxIncluded ? 'Included in Invoice Value' : 'Excluded';

  // Resolve taxAdjustments list from payment or contract
  const rawTaxAdjustments = useMemo(() => {
    if (payment?.taxAdjustments && Array.isArray(payment.taxAdjustments) && payment.taxAdjustments.length > 0) {
      return payment.taxAdjustments;
    }
    if (contract?.taxAdjustments && Array.isArray(contract.taxAdjustments)) {
      return contract.taxAdjustments;
    }
    return [];
  }, [payment?.taxAdjustments, contract?.taxAdjustments]);

  // Compute Tax, Deduction, Adjustments and WHT based on AR rules
  const calc = useMemo(() => {
    return calculateTaxAdjustments(rawInvoiceVal, rawTaxAdjustments, isTaxIncluded);
  }, [rawInvoiceVal, rawTaxAdjustments, isTaxIncluded]);

  const invoiceValue = `${invoiceCurrency} ${Number(calc.finalAmountDue).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const invoiceDate = payment?.invoiceByDate || contract?.billingDate || '—';
  const dueByDate   = payment?.dueByDate || '—';

  const rawDueDays = contract?.paymentDueDays ?? billing.paymentDueDays ?? payment?.paymentDueDays ?? 15;
  const servicePeriod = `${rawDueDays} days`;

  const billFrom = payment?.billingCompany || contract?.billFrom || billing.billingCompany || 'MCHI';
  const receivingBank = payment?.receivingBankName || contract?.receivingBankName || billing.receivingBank || 'AirWallex';
  const bankDetailsLink = payment?.bankDetailsLink || contract?.bankDetailsLink || billing.bankDetailsLink || null;

  // Remarks handling: payment.remarks -> contract.remarks -> default meaningful remark
  const defaultRemark = `Invoice for ${clientBillingEntity !== '—' ? clientBillingEntity : 'Contract'} - ${invoiceCurrency} ${Number(calc.finalAmountDue).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
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
    const textLines = [
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
      '',
      'Deductions & Adjustments',
      '─────────────────────────────',
      `Tax Status                 : ${taxStatusText}`
    ];

    if (calc.calculatedItems && calc.calculatedItems.length > 0) {
      textLines.push('Type (details) | % | Amount | Currency');
      calc.calculatedItems.forEach(item => {
        const typeStr = `${item.type}${item.details ? ` (${item.details})` : ''}`;
        const pctStr = item.percentage !== undefined && item.percentage !== null && item.percentage !== '' ? `${item.percentage}%` : '—';
        textLines.push(`${typeStr} : ${pctStr} | ${item.formattedImpact} ${invoiceCurrency}`);
      });
      textLines.push(`Final Invoice Amount       : ${invoiceCurrency} ${calc.finalAmountDue.toFixed(2)}`);
      if (calc.totalWht > 0) {
        textLines.push(`Net Payable after WHT      : ${invoiceCurrency} ${calc.netReceivableAfterWht.toFixed(2)}`);
      }
    }

    const text = textLines.filter(l => l !== null).join('\n');

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

      {/* Section 3: Deductions & Adjustments */}
      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' }}>
        <div style={sectionTitleStyle}>
          <i className='bx bx-calculator' style={{ color: '#8b5cf6' }}></i>
          Deductions & Adjustments
        </div>

        {/* Tax Status moved here */}
        <div style={{ ...rowStyle, borderBottom: calc.calculatedItems && calc.calculatedItems.length > 0 ? '1px solid #f1f5f9' : 'none', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
          <span style={labelStyle}>Tax Status</span>
          <span style={{
            ...valueStyle,
            color: isTaxIncluded ? '#059669' : '#64748b',
            background: isTaxIncluded ? '#ecfdf5' : '#f1f5f9',
            border: isTaxIncluded ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
            padding: '0.15rem 0.55rem',
            borderRadius: '4px',
            fontSize: '0.78rem'
          }}>
            {taxStatusText}
          </span>
        </div>

        {/* Values of Deductions and Adjustments */}
        {calc.calculatedItems && calc.calculatedItems.length > 0 ? (
          <div style={{ marginTop: '0.65rem' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.9fr 0.7fr 1.1fr 0.8fr',
              gap: '0.45rem',
              padding: '0.45rem 0.6rem',
              background: '#e2e8f0',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#334155',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              alignItems: 'center'
            }}>
              <div>Type (details)</div>
              <div style={{ textAlign: 'center' }}>%</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
              <div style={{ textAlign: 'right' }}>Currency</div>
            </div>

            {/* Table Rows */}
            {calc.calculatedItems.map((item, idx) => {
              const typeLower = (item.type || '').toLowerCase();
              let typeColor = '#0f172a';
              let amtColor = '#0f172a';

              if (typeLower.includes('adjust')) {
                typeColor = '#0284c7';
                amtColor = '#0284c7';
              } else if (typeLower.includes('deduct')) {
                typeColor = '#7c3aed';
                amtColor = '#7c3aed';
              } else if (typeLower.includes('withhold') || typeLower.includes('wht')) {
                typeColor = '#d97706';
                amtColor = '#d97706';
              } else {
                // Tax
                typeColor = '#059669';
                amtColor = isTaxIncluded ? '#059669' : '#059669';
              }

              return (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.9fr 0.7fr 1.1fr 0.8fr',
                  gap: '0.45rem',
                  padding: '0.5rem 0.6rem',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.82rem',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: '600', color: typeColor }}>{item.type}</span>
                    {item.details && (
                      <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.35rem', fontStyle: 'italic' }}>
                        ({item.details})
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', color: '#334155', fontWeight: '500', fontSize: '0.8rem' }}>
                    {item.percentage !== undefined && item.percentage !== null && item.percentage !== '' ? `${item.percentage}%` : '—'}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: '700', color: amtColor, fontSize: '0.82rem' }}>
                    {item.formattedImpact}
                  </div>
                  <div style={{ textAlign: 'right', color: '#64748b', fontWeight: '500', fontSize: '0.8rem' }}>
                    {invoiceCurrency}
                  </div>
                </div>
              );
            })}

            {/* Summary calculation breakdown */}
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.65rem',
              borderTop: '1px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.78rem',
              color: '#64748b'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Amount Due:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>{invoiceCurrency} {Number(calc.baseAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {calc.totalAdjustments > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                  <span>Total Adjustments:</span>
                  <span style={{ fontWeight: '600' }}>+{invoiceCurrency} {calc.totalAdjustments.toFixed(2)}</span>
                </div>
              )}
              {calc.totalDeductions > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7c3aed' }}>
                  <span>Total Deductions:</span>
                  <span style={{ fontWeight: '600' }}>-{invoiceCurrency} {calc.totalDeductions.toFixed(2)}</span>
                </div>
              )}
              {calc.totalTax > 0 && !isTaxIncluded && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Tax Impact (GST/VAT):</span>
                  <span style={{ fontWeight: '600' }}>+{invoiceCurrency} {calc.totalTax.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#0f172a', fontSize: '0.84rem', marginTop: '0.2rem', paddingTop: '0.35rem', borderTop: '1px solid #e2e8f0' }}>
                <span>Total Invoice Value:</span>
                <span style={{ color: '#10b981' }}>{invoiceCurrency} {calc.finalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {calc.totalWht > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', fontSize: '0.8rem' }}>
                  <span>Net Receivable after WHT (TDS):</span>
                  <span style={{ fontWeight: '700' }}>{invoiceCurrency} {calc.netReceivableAfterWht.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '0.65rem 0.8rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.78rem',
            fontStyle: 'italic',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px dashed #e2e8f0',
            marginTop: '0.5rem'
          }}>
            No deductions or adjustments recorded for this invoice
          </div>
        )}
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

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
