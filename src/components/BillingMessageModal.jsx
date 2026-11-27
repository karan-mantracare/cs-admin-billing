import React, { useState, useEffect, useMemo } from 'react';
import { calculateTaxAdjustments } from '../utils/taxAdjustmentUtils';

// Helper function to convert numeric amount to words
export function numberToWords(num, currency = 'USD') {
  if (num === null || num === undefined || isNaN(num)) return '';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  const fixed = Number(num).toFixed(2);
  const [intPartStr, decPartStr] = fixed.split('.');
  let intPart = parseInt(intPartStr, 10);
  const decPart = parseInt(decPartStr, 10);

  if (intPart === 0 && decPart === 0) return 'Zero';

  let result = '';
  if (intPart >= 1000000000) {
    result += convertGroup(Math.floor(intPart / 1000000000)) + ' Billion ';
    intPart %= 1000000000;
  }
  if (intPart >= 1000000) {
    result += convertGroup(Math.floor(intPart / 1000000)) + ' Million ';
    intPart %= 1000000;
  }
  if (intPart >= 1000) {
    result += convertGroup(Math.floor(intPart / 1000)) + ' Thousand ';
    intPart %= 1000;
  }
  if (intPart > 0) {
    result += convertGroup(intPart) + ' ';
  }
  result = result.trim();

  // Currency names & subunits
  const curr = (currency || 'USD').toUpperCase();
  let currName = curr;
  let subName = 'Cents';

  if (curr === 'USD') { currName = 'US Dollars'; subName = 'Cents'; }
  else if (curr === 'EUR') { currName = 'Euros'; subName = 'Cents'; }
  else if (curr === 'GBP') { currName = 'Pounds'; subName = 'Pence'; }
  else if (curr === 'INR') { currName = 'Rupees'; subName = 'Paise'; }
  else if (curr === 'AED') { currName = 'UAE Dirhams'; subName = 'Fils'; }
  else if (curr === 'AUD') { currName = 'Australian Dollars'; subName = 'Cents'; }
  else if (curr === 'CAD') { currName = 'Canadian Dollars'; subName = 'Cents'; }
  else if (curr === 'SGD') { currName = 'Singapore Dollars'; subName = 'Cents'; }

  if (result) {
    result = `${result} ${currName}`;
  }

  if (decPart > 0) {
    const decWords = convertGroup(decPart);
    result = result ? `${result} and ${decWords} ${subName}` : `${decWords} ${subName}`;
  }

  return (result + ' Only').trim();
}

export function BillingMessageContent({ payment, orderDetails, onCopy, copied, onUpdateRemarks }) {
  // Resolve associated contract from division_contracts
  const contract = useMemo(() => {
    try {
      const contracts = JSON.parse(localStorage.getItem('division_contracts') || '[]');
      if (payment?.contractId) {
        const found = contracts.find(c => String(c.id) === String(payment.contractId));
        if (found) return found;
      }
      if (payment?.contractName) {
        const found = contracts.find(c => 
          (c.companyName && c.companyName.toLowerCase().includes(payment.contractName.toLowerCase())) ||
          (c.name && c.name.toLowerCase().includes(payment.contractName.toLowerCase()))
        );
        if (found) return found;
      }
      if (payment?.clientName) {
        const found = contracts.find(c => 
          (c.companyName && (c.companyName.toLowerCase().includes(payment.clientName.toLowerCase()) || payment.clientName.toLowerCase().includes(c.companyName.toLowerCase()))) ||
          (c.name && (c.name.toLowerCase().includes(payment.clientName.toLowerCase()) || payment.clientName.toLowerCase().includes(c.name.toLowerCase())))
        );
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
  }, [payment?.contractId, payment?.contractName, payment?.clientName, payment?.orderId]);

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

  // Prioritize contract.billFrom from Division Contract, then payment, then billing details
  const billFrom = contract?.billFrom || payment?.billingCompany || billing.billingCompany || 'MCC';
  const receivingBank = contract?.receivingBankName || payment?.receivingBankName || billing.receivingBank || 'AirWallex';
  const bankDetailsLink = contract?.bankDetailsLink || payment?.bankDetailsLink || billing.bankDetailsLink || null;

  // Resolve client address & details
  const clientAddress = payment?.clientAddress 
    || contract?.address 
    || (contract?.companyEntities?.[0]?.address) 
    || billing?.address 
    || '';

  // Bill From address mapping (as in Division Contract / company profile)
  const getBillFromAddress = (company) => {
    const c = (company || '').toUpperCase().trim();
    if (c === 'MCC' || c.includes('MANTRA CARE CORP')) {
      return '1021 E Lincolnway, 7051\nCheyenne, Wyoming 82001\nUnited States';
    }
    if (c === 'MCHI' || c.includes('INTERNATIONAL') || c.includes('MCH INTERNATIONAL')) {
      return '1021 E Lincolnway, 7051\nCheyenne, Wyoming 82001\nUnited States';
    }
    if (c === 'MR UK' || c.includes('UK')) {
      return '71-75 Shelton Street, Covent Garden\nLondon, WC2H 9JQ\nUnited Kingdom';
    }
    if (c === 'MCHPL' || c.includes('INDIA')) {
      return 'Plot No. 14, Sector 44\nGurugram, Haryana 122003\nIndia';
    }
    if (c === 'MRC UAE' || c.includes('UAE') || c.includes('FZCO')) {
      return 'IFZA Business Park, DDP\nDubai Silicon Oasis, Dubai\nUnited Arab Emirates';
    }
    return contract?.companyAddress || contract?.billFromAddress || billing?.companyAddress || '1021 E Lincolnway, 7051\nCheyenne, Wyoming 82001\nUnited States';
  };

  // Full formal name for Bill From entity
  const getBillFromFullName = (company) => {
    // If contract has a designated billFrom, match formal or fallback
    const c = (company || contract?.billFrom || '').toUpperCase().trim();
    if (c === 'MCHI') return 'MCH International LLC';
    if (c === 'MCC') return 'Mantra Care Corp';
    if (c === 'MR UK') return 'Mantra Resources UK Ltd';
    if (c === 'MCHPL') return 'MCH Health Private Limited';
    if (c === 'MRC UAE') return 'Mantra Resources Care FZCO';
    if (contract?.billFrom) return contract.billFrom;
    return company || billFrom || 'MCC';
  };

  // Remarks handling: payment.remarks -> contract.remarks -> default meaningful remark
  const defaultRemark = `Invoice for ${clientBillingEntity !== '—' ? clientBillingEntity : 'Contract'} - ${invoiceCurrency} ${Number(calc.finalAmountDue).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const [remarks, setRemarks] = useState(payment?.remarks || contract?.remarks || defaultRemark);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [localCopied, setLocalCopied] = useState(false);
  const [showDummyInvoice, setShowDummyInvoice] = useState(false);

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
      'Amount Details',
      '─────────────────────────────',
      'Particulars | Details | % | Amount'
    ];

    textLines.push(`Base Amount : — | — | ${Number(calc.baseAmount).toFixed(2)} ${invoiceCurrency}`);

    const taxRows = (calc.calculatedItems || []).filter(item => {
      const t = (item.type || '').toLowerCase();
      return (t.includes('tax') && !t.includes('withhold') && !t.includes('wht')) || t.includes('gst') || t.includes('vat');
    });
    const deductRows = (calc.calculatedItems || []).filter(item => (item.type || '').toLowerCase().includes('deduct'));
    const adjRows = (calc.calculatedItems || []).filter(item => (item.type || '').toLowerCase().includes('adjust'));
    const whtRows = (calc.calculatedItems || []).filter(item => {
      const t = (item.type || '').toLowerCase();
      return t.includes('withhold') || t.includes('wht');
    });

    taxRows.forEach(item => {
      textLines.push(`Tax${item.details ? ` (${item.details})` : ''} : ${Number(item.impactAmount || 0).toFixed(2)} | ${item.percentage ? item.percentage + '%' : '—'} |`);
    });
    deductRows.forEach(item => {
      textLines.push(`Deduction${item.details ? ` (${item.details})` : ''} : -${Math.abs(item.impactAmount || 0).toFixed(2)} | ${item.percentage ? item.percentage + '%' : '—'} |`);
    });
    adjRows.forEach(item => {
      textLines.push(`Adjustments${item.details ? ` (${item.details})` : ''} : ${Number(item.impactAmount || 0).toFixed(2)} | ${item.percentage ? item.percentage + '%' : '—'} |`);
    });

    const netAdj = calc.totalAdjustments - calc.totalDeductions + (isTaxIncluded ? 0 : calc.totalTax);
    const hasAdj = taxRows.length > 0 || deductRows.length > 0 || adjRows.length > 0;
    if (hasAdj) {
      textLines.push(`Total Adjustment : — | — | ${netAdj.toFixed(2)} ${invoiceCurrency}`);
    }

    textLines.push(`Total Invoice Value : — | — | ${calc.finalAmountDue.toFixed(2)} ${invoiceCurrency}`);

    whtRows.forEach(item => {
      textLines.push(`Withholding Tax${item.details ? ` (${item.details})` : ''} : -${Math.abs(item.impactAmount || 0).toFixed(2)} | ${item.percentage ? item.percentage + '%' : '—'} |`);
    });
    if (calc.totalWht > 0) {
      textLines.push(`Net Receivable : — | — | ${calc.netReceivableAfterWht.toFixed(2)} ${invoiceCurrency}`);
    }

    const text = textLines.filter(l => l !== null).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setLocalCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setLocalCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
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

      {/* Section 3: Amount Details */}
      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' }}>
        <div style={sectionTitleStyle}>
          <i className='bx bx-calculator' style={{ color: '#8b5cf6' }}></i>
          Amount Details
        </div>

        {(() => {
          const taxRows = (calc.calculatedItems || []).filter(item => {
            const t = (item.type || '').toLowerCase();
            return (t.includes('tax') && !t.includes('withhold') && !t.includes('wht')) || t.includes('gst') || t.includes('vat');
          });
          const deductRows = (calc.calculatedItems || []).filter(item => (item.type || '').toLowerCase().includes('deduct'));
          const adjRows = (calc.calculatedItems || []).filter(item => (item.type || '').toLowerCase().includes('adjust'));
          const whtRows = (calc.calculatedItems || []).filter(item => {
            const t = (item.type || '').toLowerCase();
            return t.includes('withhold') || t.includes('wht');
          });

          const netAdjustment = calc.totalAdjustments - calc.totalDeductions + (isTaxIncluded ? 0 : calc.totalTax);
          const hasAdj = taxRows.length > 0 || deductRows.length > 0 || adjRows.length > 0;

          const cellBase = {
            padding: '0.5rem 0.75rem',
            borderRight: '1px solid #e2e8f0',
            fontSize: '0.82rem',
            fontVariantNumeric: 'tabular-nums'
          };
          const lastCellBase = {
            padding: '0.5rem 0.75rem',
            fontSize: '0.82rem',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums'
          };

          const gridStyle = {
            display: 'grid',
            gridTemplateColumns: '2fr 1.1fr 0.8fr 1.2fr',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0'
          };

          return (
            <div style={{
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#ffffff',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                ...gridStyle,
                background: '#f8fafc',
                borderBottom: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#334155'
              }}>
                <div style={{ ...cellBase, fontWeight: '700' }}>Particulars</div>
                <div style={{ ...cellBase, fontWeight: '700', textAlign: 'right' }}>Details</div>
                <div style={{ ...cellBase, fontWeight: '700', textAlign: 'center' }}>%</div>
                <div style={{ ...lastCellBase, fontWeight: '700' }}>Amount ({invoiceCurrency})</div>
              </div>

              {/* Base Amount */}
              <div style={{
                ...gridStyle,
                background: '#ffffff',
                color: '#1e293b'
              }}>
                <div style={{ ...cellBase, fontWeight: '600' }}>Base Amount</div>
                <div style={{ ...cellBase, textAlign: 'center', color: '#94a3b8' }}>—</div>
                <div style={{ ...cellBase, textAlign: 'center', color: '#94a3b8' }}>—</div>
                <div style={{ ...lastCellBase, fontWeight: '700', color: '#0f172a' }}>
                  {Number(calc.baseAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Tax Rows */}
              {taxRows.map((item, idx) => (
                <div key={`tax-${idx}`} style={{
                  ...gridStyle,
                  background: '#ffffff',
                  color: '#475569'
                }}>
                  <div style={cellBase}>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>Tax</span>
                    {item.details && <span style={{ color: '#64748b', fontSize: '0.78rem' }}> ({item.details})</span>}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'right', color: '#334155', fontWeight: '500' }}>
                    +{Number(item.impactAmount || 0).toFixed(2)}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'center', color: '#475569', fontWeight: '500' }}>
                    {item.percentage !== undefined && item.percentage !== null && item.percentage !== '' ? `${item.percentage}%` : '—'}
                  </div>
                  <div style={lastCellBase}></div>
                </div>
              ))}

              {/* Deduction Rows */}
              {deductRows.map((item, idx) => (
                <div key={`deduct-${idx}`} style={{
                  ...gridStyle,
                  background: '#ffffff',
                  color: '#475569'
                }}>
                  <div style={cellBase}>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>Deduction</span>
                    {item.details && <span style={{ color: '#64748b', fontSize: '0.78rem' }}> ({item.details})</span>}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'right', color: '#334155', fontWeight: '500' }}>
                    -{Math.abs(item.impactAmount || 0).toFixed(2)}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'center', color: '#475569', fontWeight: '500' }}>
                    {item.percentage !== undefined && item.percentage !== null && item.percentage !== '' ? `${item.percentage}%` : '—'}
                  </div>
                  <div style={lastCellBase}></div>
                </div>
              ))}

              {/* Adjustments Rows */}
              {adjRows.map((item, idx) => (
                <div key={`adj-${idx}`} style={{
                  ...gridStyle,
                  background: '#ffffff',
                  color: '#475569'
                }}>
                  <div style={cellBase}>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>Adjustments</span>
                    {item.details && <span style={{ color: '#64748b', fontSize: '0.78rem' }}> ({item.details})</span>}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'right', color: '#334155', fontWeight: '500' }}>
                    +{Number(item.impactAmount || 0).toFixed(2)}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'center', color: '#475569', fontWeight: '500' }}>
                    {item.percentage !== undefined && item.percentage !== null && item.percentage !== '' ? `${item.percentage}%` : '—'}
                  </div>
                  <div style={lastCellBase}></div>
                </div>
              ))}

              {/* Total Adjustment */}
              {hasAdj && (
                <div style={{
                  ...gridStyle,
                  background: '#ffffff',
                  color: '#475569'
                }}>
                  <div style={{ ...cellBase, fontWeight: '600', color: '#1e293b' }}>Total Adjustment</div>
                  <div style={{ ...cellBase, textAlign: 'center', color: '#94a3b8' }}>—</div>
                  <div style={{ ...cellBase, textAlign: 'center', color: '#94a3b8' }}>—</div>
                  <div style={{ ...lastCellBase, fontWeight: '700', color: '#0f172a' }}>
                    {netAdjustment >= 0 ? `+${Math.abs(netAdjustment).toFixed(2)}` : `-${Math.abs(netAdjustment).toFixed(2)}`}
                  </div>
                </div>
              )}

              {/* Total Invoice Value: (Highlighted green row) */}
              <div style={{
                ...gridStyle,
                background: '#ecfdf5',
                color: '#059669',
                fontWeight: '700'
              }}>
                <div style={{ ...cellBase, borderRight: '1px solid #bbf7d0', color: '#059669', fontWeight: '700' }}>
                  Total Invoice Value:
                </div>
                <div style={{ ...cellBase, borderRight: '1px solid #bbf7d0', textAlign: 'center', color: '#059669' }}>—</div>
                <div style={{ ...cellBase, borderRight: '1px solid #bbf7d0', textAlign: 'center', color: '#059669' }}>—</div>
                <div style={{ ...lastCellBase, fontWeight: '800', color: '#059669', fontSize: '0.9rem' }}>
                  {calc.finalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Withholding Tax Rows */}
              {whtRows.map((item, idx) => (
                <div key={`wht-${idx}`} style={{
                  ...gridStyle,
                  background: '#ffffff',
                  color: '#475569'
                }}>
                  <div style={cellBase}>
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>Withholding Tax</span>
                    {item.details && <span style={{ color: '#64748b', fontSize: '0.78rem' }}> ({item.details})</span>}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'right', color: '#334155', fontWeight: '500' }}>
                    -{Math.abs(item.impactAmount || 0).toFixed(2)}
                  </div>
                  <div style={{ ...cellBase, textAlign: 'center', color: '#475569', fontWeight: '500' }}>
                    {item.percentage !== undefined && item.percentage !== null && item.percentage !== '' ? `${item.percentage}%` : '—'}
                  </div>
                  <div style={lastCellBase}></div>
                </div>
              ))}

              {/* Net Receivable: (Highlighted amber row) */}
              {calc.totalWht > 0 && (
                <div style={{
                  ...gridStyle,
                  background: '#fffbeb',
                  color: '#b45309',
                  borderBottom: 'none',
                  fontWeight: '700'
                }}>
                  <div style={{ ...cellBase, borderRight: '1px solid #fde68a', color: '#b45309', fontWeight: '700' }}>
                    Net Receivable:
                  </div>
                  <div style={{ ...cellBase, borderRight: '1px solid #fde68a', textAlign: 'center', color: '#b45309' }}>—</div>
                  <div style={{ ...cellBase, borderRight: '1px solid #fde68a', textAlign: 'center', color: '#b45309' }}>—</div>
                  <div style={{ ...lastCellBase, fontWeight: '800', color: '#b45309', fontSize: '0.9rem' }}>
                    {calc.netReceivableAfterWht.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
      </div>

      {/* Sticky / Frozen Bottom Bar for View & Copy Message */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={() => setShowDummyInvoice(true)}
          title="View Dummy Invoice Preview"
          style={{
            background: '#ffffff',
            color: '#0284c7',
            border: '1.5px solid #0284c7',
            borderRadius: '6px',
            padding: '0.6rem 1.15rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(2,132,199,0.08)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f0f9ff';
            e.currentTarget.style.borderColor = '#0369a1';
            e.currentTarget.style.color = '#0369a1';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#0284c7';
            e.currentTarget.style.color = '#0284c7';
          }}
        >
          <i className='bx bx-show' style={{ fontSize: '1.05rem' }}></i>
          View (Dummy Invoice)
        </button>

        <button
          onClick={handleCopyMessage}
          style={{
            background: (copied || localCopied) ? '#10b981' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px',
            padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(14,165,233,0.2)'
          }}
        >
          <i className={`bx ${(copied || localCopied) ? 'bx-check' : 'bx-copy'}`}></i>
          {(copied || localCopied) ? 'Copied to Clipboard!' : 'Copy Message'}
        </button>
      </div>

      {/* Dummy Invoice Preview Modal */}
      {showDummyInvoice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setShowDummyInvoice(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className='bx bx-file' style={{ fontSize: '1.3rem' }}></i>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>Dummy Invoice Preview</h3>
                  <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>Generated from current billing details</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDummyInvoice(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Invoice Document Paper Body */}
            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: '#f1f5f9' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '2.5rem 3rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                color: '#0f172a',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                {/* Top Section: Logo & Bill From on Left, "Invoice" and Client Contact Details on Right */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                  {/* Left: Mantra Logo + Bill From Entity & Address */}
                  <div style={{ maxWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#0284c7" fillOpacity="0.15" stroke="#0284c7" strokeWidth="1.8"/>
                        <circle cx="12" cy="10" r="2.5" fill="#1e293b"/>
                        <path d="M7 16c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e3a8a', letterSpacing: '-0.02em' }}>Mantra</span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                      {getBillFromFullName(billFrom)}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                      {getBillFromAddress(billFrom)}
                    </div>
                  </div>

                  {/* Right: "Invoice" Header + Client Contact Details */}
                  <div style={{ textAlign: 'right', maxWidth: '340px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.75rem' }}>
                      Invoice
                    </div>

                    {/* Client Details, Address & Tax Details */}
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.35', marginBottom: '0.35rem' }}>
                      {clientBillingEntity}
                    </div>

                    {clientAddress ? (
                      <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.45', whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>
                        {clientAddress}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.45', whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>
                        Mussafah Building, 01 Abdul Aziz Abdullah{'\n'}
                        Suleiman Saif{'\n'}
                        Abu Dhabi, UAE{'\n'}
                        Abu Dhabi{'\n'}
                        United Arab Emirates
                      </div>
                    )}

                    <div style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: '500' }}>
                      Tax ID: <span style={{ fontWeight: '600' }}>{clientTaxDetails !== '—' ? clientTaxDetails : '104798850400003'}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Title & Number */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>
                    Invoice {payment?.invoiceNumber || payment?.id || 'INV-001'}
                  </h1>
                </div>

                {/* Dates: Invoice Date & Due Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '420px', marginBottom: '2.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e3a8a', marginBottom: '0.35rem' }}>
                      Invoice Date
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>
                      {invoiceDate !== '—' ? invoiceDate : '04/08/2026'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e3a8a', marginBottom: '0.35rem' }}>
                      Due Date
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>
                      {dueByDate !== '—' ? dueByDate : '03/09/2026'}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0f172a' }}>
                        <th style={{ padding: '0.75rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>Description</th>
                        <th style={{ padding: '0.75rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', textAlign: 'center' }}>Quantity</th>
                        <th style={{ padding: '0.75rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '0.75rem 0', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 0 0.4rem 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: '500' }}>
                          Employee Assistance Program
                        </td>
                        <td style={{ padding: '1rem 0 0.4rem 0', fontSize: '0.92rem', color: '#0f172a', textAlign: 'center' }}>
                          1.00 Unit
                        </td>
                        <td style={{ padding: '1rem 0 0.4rem 0', fontSize: '0.92rem', color: '#0f172a', textAlign: 'right', fontWeight: '500' }}>
                          {invoiceCurrency} {Number(calc.baseAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '1rem 0 0.4rem 0', fontSize: '0.92rem', color: '#0f172a', textAlign: 'right', fontWeight: '600' }}>
                          {invoiceCurrency} {Number(calc.baseAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subtext description & payment terms on Left vs Totals / Breakdown on Right */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem', marginBottom: '2.5rem' }}>
                  {/* Left Column: Period info & Payment Terms */}
                  <div style={{ maxWidth: '360px' }}>
                    <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#334155', marginBottom: '1.25rem' }}>
                      Invoice for the period of {servicePeriod ? `${servicePeriod}` : '01-09-2026 to 30-11-2026'}
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#0f172a', marginBottom: '1.5rem' }}>
                      <strong>Payment terms:</strong> {servicePeriod || '30 Days'}
                    </div>
                  </div>

                  {/* Right Column: Tax, Discount, Adjustment & Total */}
                  <div style={{ width: '280px' }}>
                    {/* Tax Row if present */}
                    {calc.totalTax > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#334155' }}>
                        <span>Tax:</span>
                        <span style={{ fontWeight: '500' }}>+{invoiceCurrency} {calc.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* Discount / Deduction Row if present */}
                    {calc.totalDeductions > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#dc2626' }}>
                        <span>Discount:</span>
                        <span style={{ fontWeight: '500' }}>-{invoiceCurrency} {calc.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* Adjustments Row if present */}
                    {calc.totalAdjustments > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#334155' }}>
                        <span>Adjustment:</span>
                        <span style={{ fontWeight: '500' }}>+{invoiceCurrency} {calc.totalAdjustments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* Total Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #0f172a',
                      paddingTop: '0.75rem',
                      marginTop: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#0f172a'
                    }}>
                      <span>Total</span>
                      <span>{invoiceCurrency} {calc.finalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    {/* Amount in Words */}
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#475569', textAlign: 'right', fontStyle: 'italic', lineHeight: '1.4' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b', fontStyle: 'normal' }}>Amount in Words: </span>
                      {numberToWords(calc.finalAmountDue, invoiceCurrency)}
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: '1.25rem' }}>
                  This is a computer-generated dummy invoice for internal tracking &amp; AR validation.
                </div>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDummyInvoice(false)}
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
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
    maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
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
