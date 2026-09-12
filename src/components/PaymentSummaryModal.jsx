import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';

function PaymentSummaryModal({ isOpen, onClose, contractValue, orderId, divisionId, onViewPaymentSchedule, onViewBillingSchedule }) {
  const { showToast } = useGlobal();
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalBillsRaised, setTotalBillsRaised] = useState(0);
  const [billsCount, setBillsCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      try {
        const savedPayments = localStorage.getItem('client_payments');
        if (savedPayments) {
          const payments = JSON.parse(savedPayments);
          const orderPayments = payments.filter(p =>
            String(p.orderId) === String(orderId)
          );
          const sum = orderPayments.reduce((acc, curr) => acc + (Number(curr.totalPaid) || 0), 0);
          setTotalReceived(sum);

          const raisedBills = orderPayments.filter(p => p.status !== 'To be Raised');
          setBillsCount(raisedBills.length);
          const billsSum = raisedBills.reduce((acc, curr) => acc + (Number(curr.amountDueUsd) || 0), 0);
          setTotalBillsRaised(billsSum);
        }
      } catch (e) {
        console.error('Failed to parse client payments', e);
      }
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const contractValNum = Number(contractValue) || 0;
  const paymentDue = Math.max(0, contractValNum - totalReceived);
  const paidPct = contractValNum > 0 ? Math.min(100, (totalReceived / contractValNum) * 100) : 0;

  const Row = ({ icon, label, value, valueColor, noBorder }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: noBorder ? 'none' : '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className={`bx ${icon}`} style={{ fontSize: '1rem', color: valueColor || '#94a3b8' }}></i>
        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{label}</span>
      </div>
      <span style={{ color: valueColor || '#0f172a', fontWeight: '700', fontSize: '0.95rem' }}>{value}</span>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #0ea5e9)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-bar-chart-alt-2'></i> Payment Summary
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Order #{orderId || '—'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '1rem 1.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Payment Progress</span>
            <span style={{ fontWeight: '700', color: paidPct >= 100 ? '#16a34a' : '#0ea5e9' }}>{paidPct.toFixed(1)}%</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${paidPct}%`, background: paidPct >= 100 ? '#16a34a' : 'linear-gradient(90deg, #0ea5e9, #1e40af)', borderRadius: '99px', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        {/* Rows */}
        <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
          <Row icon="bx-file-blank"      label="Total Contract Value"         value={`$${contractValNum.toFixed(2)}`}       valueColor="#1e40af" />
          <Row icon="bx-receipt"         label={`Total Bills Raised (${billsCount})`} value={`$${totalBillsRaised.toFixed(2)}`} valueColor="#0369a1" />
          <Row icon="bx-check-circle"    label="Total Payment Received"       value={`$${totalReceived.toFixed(2)}`}        valueColor="#16a34a" />
          <Row icon="bx-error-circle"    label="Payment Due"                  value={`$${paymentDue.toFixed(2)}`}           valueColor={paymentDue > 0 ? '#ef4444' : '#16a34a'} noBorder />
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <button onClick={onViewPaymentSchedule} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', lineHeight: '1.2' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            <i className='bx bx-calendar' style={{ fontSize: '1rem', color: '#334155' }}></i>
            <div style={{ textAlign: 'center' }}>View Payment<br/>Schedule</div>
          </button>
          <button onClick={() => {
            const targetId = divisionId || orderId || '1';
            const isFilled = localStorage.getItem('onboardingFiled_' + targetId);
            if (!isFilled) {
              showToast('Onboarding form not filled.', 3000, 'error');
            } else {
              onViewBillingSchedule();
            }
          }} style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', lineHeight: '1.2' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
            <i className='bx bx-receipt' style={{ fontSize: '1rem', color: '#334155' }}></i>
            <div style={{ textAlign: 'center' }}>View Billing<br/>Schedule</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummaryModal;
