import React, { useState, useEffect } from 'react';

function PaymentSummaryModal({ isOpen, onClose, contractValue, orderId }) {
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
        console.error("Failed to parse client payments", e);
      }
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;
  
  const contractValNum = Number(contractValue) || 0;
  const paymentDue = Math.max(0, contractValNum - totalReceived);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '8px', width: '90%', maxWidth: '450px',
        padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Payment Summary</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontWeight: '500' }}>Total Contract Value</span>
            <span style={{ color: '#0f172a', fontWeight: '600' }}>${contractValNum.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontWeight: '500' }}>Total Bills Raised ({billsCount})</span>
            <span style={{ color: '#0f172a', fontWeight: '600' }}>${totalBillsRaised.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontWeight: '500' }}>Total Payment Received</span>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>${totalReceived.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontWeight: '500' }}>Payment Due</span>
            <span style={{ color: paymentDue > 0 ? '#ef4444' : '#16a34a', fontWeight: '600' }}>${paymentDue.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummaryModal;
