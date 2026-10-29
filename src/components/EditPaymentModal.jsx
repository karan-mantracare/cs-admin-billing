import React, { useState, useEffect } from 'react';

function EditPaymentModal({ isOpen, onClose, payment, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    clientName: '',
    orderId: '',
    invoiceByDate: '',
    dueByDate: '',
    amountDue: '',
    amountDueUsd: '',
    status: '',
    currency: 'USD',
    billingCompany: '',
    clientBillingEntity: '',
    remarks: ''
  });

  const [divisionOrders, setDivisionOrders] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      try {
        const savedOrders = JSON.parse(localStorage.getItem('division_orders') || '[]');
        setDivisionOrders(savedOrders);
        
        const clients = [...new Set(savedOrders.map(o => o.corporate || o.clientName).filter(Boolean))];
        setUniqueClients(clients);
      } catch (e) {
        console.error("Failed to load orders", e);
      }
    }
  }, [isOpen]);

  const isOriginalOrderNull = !payment?.orderId || payment.orderId === 'Null' || payment.orderId === 'null';

  useEffect(() => {
    if (isOpen && payment) {
      let initialRate = 1;
      if (payment.amountDueUsd && payment.amountDue && Number(payment.amountDue) > 0) {
        initialRate = Number(payment.amountDueUsd) / Number(payment.amountDue);
      }
      setExchangeRate(initialRate);

      const isNull = !payment.orderId || payment.orderId === 'Null' || payment.orderId === 'null';

      setFormData({
        clientName: payment.clientName || payment.corporate || '',
        orderId: isNull ? 'Null' : String(payment.orderId),
        invoiceByDate: payment.invoiceByDate || '',
        dueByDate: payment.dueByDate || '',
        amountDue: payment.amountDue || '',
        currency: payment.currency || 'USD',
        billingCompany: payment.billingCompany || '',
        clientBillingEntity: payment.clientBillingEntity || payment.billingCompany || '',
        remarks: payment.remarks || ''
      });
    }
  }, [isOpen, payment]);

  useEffect(() => {
    if (formData.clientName && divisionOrders.length > 0) {
      const ordersForClient = divisionOrders.filter(o => (o.corporate || o.clientName) === formData.clientName);
      setAvailableOrders(ordersForClient);
    } else {
      setAvailableOrders([]);
    }
  }, [formData.clientName, divisionOrders]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // If order ID changes, fetch details from that order
      if (name === 'orderId') {
        if (value === 'Null') {
          return { ...updated, orderId: 'Null' };
        }
        const selectedOrder = availableOrders.find(o => String(o.id) === String(value));
        if (selectedOrder) {
          updated.currency = selectedOrder.billingDetails?.clientCurrency || updated.currency || 'USD';
          updated.billingCompany = selectedOrder.billingDetails?.billingEntity || selectedOrder.billingDetails?.billFrom || updated.billingCompany || 'MCC';
          
          if (selectedOrder.billingDetails?.currencyExchangeValue) {
            setExchangeRate(Number(selectedOrder.billingDetails.currencyExchangeValue) || 1);
          }
        }
      }
      
      return updated;
    });
  };

  if (!isOpen || !payment) return null;

  const calculatedUsd = (Number(formData.amountDue || 0) * exchangeRate).toFixed(2);
  const activeCompany = payment.clientBillingEntity || payment.billingCompany;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }} 
      onClick={() => {
        if (!showDeleteConfirm) onClose();
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className='bx bx-edit-alt'></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>
                Edit Scheduled Payment
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: {payment.id}
                </span>
                {activeCompany && (
                  <span style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    {activeCompany}
                    {payment.splitPercentage && payment.splitPercentage < 100 ? ` (${payment.splitPercentage}%)` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: '#64748b',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <i className='bx bx-x'></i>
          </button>
        </div>

        {/* Delete Confirmation Overlay (Replacing native window.confirm) */}
        {showDeleteConfirm && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(3px)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
            }}>
              <i className='bx bx-trash'></i>
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>
              Delete Invoice Schedule?
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#64748b', maxWidth: '360px', lineHeight: '1.5' }}>
              Are you sure you want to delete this scheduled payment for <strong style={{ color: '#0f172a' }}>{formData.clientName || 'this client'}</strong>? This action cannot be undone.
            </p>

            {/* Quick summary of what's being deleted */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: '#475569',
              display: 'flex',
              gap: '1rem'
            }}>
              <span>Due: <strong>{formData.dueByDate || '—'}</strong></span>
              <span>Amount: <strong style={{ color: '#0f172a' }}>{formData.currency} {Number(formData.amountDue || 0).toLocaleString()}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(payment.id)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
              >
                <i className='bx bx-trash'></i> Delete
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', maxHeight: '72vh', overflowY: 'auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                Client Name
              </label>
              <select 
                name="clientName" 
                value={formData.clientName} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled hidden>Select Client</option>
                {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                Order ID
              </label>
              <select 
                name="orderId" 
                value={formData.orderId} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  backgroundColor: formData.clientName ? '#ffffff' : '#f8fafc',
                  boxSizing: 'border-box'
                }} 
                disabled={!formData.clientName}
              >
                <option value="" disabled hidden>Select Order</option>
                {isOriginalOrderNull && (
                  <option value="Null">Null Order ID</option>
                )}
                {!isOriginalOrderNull && payment?.orderId && !availableOrders.some(o => String(o.id) === String(payment.orderId)) && (
                  <option value={payment.orderId}>
                    #{payment.orderId} {payment.orderName ? `• ${payment.orderName}` : ''}
                  </option>
                )}
                {availableOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.id} {o.planName ? `• ${o.planName}` : (o.serviceType ? `• ${o.serviceType}` : '')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                Invoice By Date
              </label>
              <input 
                type="date" 
                name="invoiceByDate" 
                value={formData.invoiceByDate} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                Due By Date
              </label>
              <input 
                type="date" 
                name="dueByDate" 
                value={formData.dueByDate} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                Amount ({formData.currency})
              </label>
              <input 
                type="number" 
                name="amountDue" 
                value={formData.amountDue} 
                onChange={handleChange} 
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
                Amount (USD)
              </label>
              <div style={{ 
                padding: '0.6rem 0.75rem', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0', 
                background: '#f8fafc', 
                fontSize: '0.88rem', 
                color: '#059669', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '38px',
                boxSizing: 'border-box'
              }}>
                <span>${calculatedUsd}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                  Auto-calculated
                </span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
              Remarks (on Invoice)
            </label>
            <input 
              type="text" 
              name="remarks" 
              value={formData.remarks || ''} 
              onChange={handleChange} 
              placeholder="Enter remarks for invoice..." 
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                boxSizing: 'border-box'
              }} 
            />
            <span style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
              These remarks will appear on the generated invoice and client communications.
            </span>
          </div>

        </div>

        {/* Footer Buttons */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          
          <button 
            type="button"
            onClick={() => setShowDeleteConfirm(true)} 
            style={{
              padding: '0.55rem 1rem',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            <i className='bx bx-trash' style={{ fontSize: '1rem' }}></i> Delete Invoice
          </button>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button 
              type="button"
              onClick={onClose} 
              style={{
                padding: '0.55rem 1.15rem',
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => {
                const selectedOrder = availableOrders.find(o => String(o.id) === String(formData.orderId));
                const orderName = formData.orderId === 'Null' 
                  ? '' 
                  : (selectedOrder?.orderName || (selectedOrder ? (selectedOrder.planName || selectedOrder.serviceType || '') : payment.orderName || ''));

                onSave({ 
                  ...payment, 
                  ...formData, 
                  orderId: formData.orderId || 'Null',
                  orderName: orderName,
                  amountDue: Number(formData.amountDue), 
                  amountDueUsd: Number(calculatedUsd) 
                });
              }} 
              style={{
                padding: '0.55rem 1.35rem',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.05)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              <i className='bx bx-check' style={{ fontSize: '1.1rem' }}></i> Save Changes
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default EditPaymentModal;
