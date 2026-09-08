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
    billingCompany: ''
  });

  const [divisionOrders, setDivisionOrders] = useState([]);
  const [uniqueClients, setUniqueClients] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    if (isOpen) {
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

  useEffect(() => {
    if (isOpen && payment) {
      let initialRate = 1;
      if (payment.amountDueUsd && payment.amountDue && Number(payment.amountDue) > 0) {
        initialRate = Number(payment.amountDueUsd) / Number(payment.amountDue);
      }
      setExchangeRate(initialRate);

      setFormData({
        clientName: payment.clientName || payment.corporate || '',
        orderId: payment.orderId || '',
        invoiceByDate: payment.invoiceByDate || '',
        dueByDate: payment.dueByDate || '',
        amountDue: payment.amountDue || '',
        currency: payment.currency || 'USD',
        billingCompany: payment.billingCompany || ''
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
        const selectedOrder = availableOrders.find(o => String(o.id) === String(value));
        if (selectedOrder) {
          updated.currency = selectedOrder.billingDetails?.clientCurrency || 'USD';
          updated.billingCompany = selectedOrder.billingDetails?.billFrom || selectedOrder.billingDetails?.billingEntity || 'MCC';
          
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

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  };

  const modalStyle = {
    background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', 
    border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: '600', color: '#475569'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className='bx bx-edit-alt'></i> Edit Scheduled Payment
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Client Name</label>
              <select name="clientName" value={formData.clientName} onChange={handleChange} style={{...inputStyle, backgroundColor: 'white'}}>
                <option value="" disabled hidden>Select Client</option>
                {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Order ID</label>
              <select name="orderId" value={formData.orderId} onChange={handleChange} style={{...inputStyle, backgroundColor: 'white'}} disabled={!formData.clientName}>
                <option value="" disabled hidden>Select Order</option>
                {availableOrders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.planName}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Invoice Date</label>
              <input type="date" name="invoiceByDate" value={formData.invoiceByDate} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Due By Date</label>
              <input type="date" name="dueByDate" value={formData.dueByDate} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Amount ({formData.currency})</label>
              <input type="number" name="amountDue" value={formData.amountDue} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Amount (USD)</label>
              <div style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>
                ${calculatedUsd}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <button onClick={() => {
            if (window.confirm("Are you sure you want to delete this invoice schedule? This cannot be undone.")) {
              onDelete(payment.id);
            }
          }} style={{ padding: '0.6rem 1.25rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className='bx bx-trash'></i> Delete Invoice
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} style={{ padding: '0.6rem 1.25rem', background: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
              Cancel
            </button>
            <button onClick={() => onSave({ ...payment, ...formData, amountDue: Number(formData.amountDue), amountDueUsd: Number(calculatedUsd) })} style={{ padding: '0.6rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>
              <i className='bx bx-check'></i> Save
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default EditPaymentModal;
