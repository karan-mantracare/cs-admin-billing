import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';

function AddExpenseModal({ isOpen, onClose, orderId, clientName, editExpenseData }) {
  const { addExpense, updateExpense, showToast } = useGlobal();

  const [formData, setFormData] = useState({
    deliveryDay: '',
    category: '',
    otherCategory: '',
    description: '',
    amount: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && editExpenseData) {
      const predefinedCategories = ['Standee', 'Flyers', 'Flight', 'Books', 'Launch Expenses'];
      const isOther = !predefinedCategories.includes(editExpenseData.expenseType);
      
      setFormData({
        deliveryDay: editExpenseData.deliveredBy || '',
        category: isOther ? 'Other (please Specify)' : editExpenseData.expenseType,
        otherCategory: isOther ? editExpenseData.expenseType : '',
        description: editExpenseData.details || '',
        amount: editExpenseData.amount || ''
      });
    } else if (isOpen && !editExpenseData) {
      setFormData({
        deliveryDay: '',
        category: '',
        otherCategory: '',
        description: '',
        amount: ''
      });
    }
  }, [isOpen, editExpenseData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSave = () => {
    const newErrors = {};
    if (!formData.deliveryDay) newErrors.deliveryDay = 'Delivery Day is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.category === 'Other (please Specify)' && !formData.otherCategory) {
      newErrors.otherCategory = 'Please specify the category';
    }
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expenseCategory = formData.category === 'Other (please Specify)' ? formData.otherCategory : formData.category;
    
    const newExpenseData = {
      orderId,
      clientName: clientName || 'Unknown Client',
      date: new Date().toISOString().split('T')[0], // Submitted/Resubmitted date
      expenseType: expenseCategory,
      details: formData.description, // mapped to 'details' for ExpenseApproval table
      deliveredBy: formData.deliveryDay, // mapped to 'deliveredBy' which is now Delivery Date in the table
      amount: Number(formData.amount),
      addedBy: 'Admin'
    };

    if (editExpenseData) {
      updateExpense(editExpenseData.id, newExpenseData);
      if (showToast) {
        showToast('Expense updated and resubmitted for Approval');
      } else {
        alert('Expense updated and resubmitted for Approval');
      }
    } else {
      addExpense(newExpenseData);
      if (showToast) {
        showToast('Expense sent for Approval');
      } else {
        alert('Expense sent for Approval');
      }
    }

    setFormData({
      deliveryDay: '',
      category: '',
      otherCategory: '',
      description: '',
      amount: ''
    });
    setErrors({});
    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    color: '#0f172a',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '90%', maxWidth: '450px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className='bx bx-receipt'></i> {editExpenseData ? 'Edit Expense' : 'Add Expenses'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Delivery Day <span style={{color:'#ef4444'}}>*</span></label>
            <input 
              type="date" 
              name="deliveryDay"
              style={{ ...inputStyle, borderColor: errors.deliveryDay ? '#ef4444' : '#cbd5e1' }}
              value={formData.deliveryDay}
              onChange={handleChange}
            />
            {errors.deliveryDay && <p style={{margin:'0.25rem 0 0',fontSize:'0.75rem',color:'#ef4444'}}>{errors.deliveryDay}</p>}
          </div>

          <div>
            <label style={labelStyle}>Category <span style={{color:'#ef4444'}}>*</span></label>
            <select 
              name="category"
              style={{ ...inputStyle, borderColor: errors.category ? '#ef4444' : '#cbd5e1' }}
              value={formData.category}
              onChange={handleChange}
            >
              <option value="" disabled>Select a category</option>
              <option value="Standee">Standee</option>
              <option value="Flyers">Flyers</option>
              <option value="Flight">Flight</option>
              <option value="Books">Books</option>
              <option value="Launch Expenses">Launch Expenses</option>
              <option value="Other (please Specify)">Other (please Specify)</option>
            </select>
            {errors.category && <p style={{margin:'0.25rem 0 0',fontSize:'0.75rem',color:'#ef4444'}}>{errors.category}</p>}
          </div>

          {formData.category === 'Other (please Specify)' && (
            <div>
              <label style={labelStyle}>Specify Category <span style={{color:'#ef4444'}}>*</span></label>
              <input 
                type="text" 
                name="otherCategory"
                placeholder="Enter category name"
                style={{ ...inputStyle, borderColor: errors.otherCategory ? '#ef4444' : '#cbd5e1' }}
                value={formData.otherCategory}
                onChange={handleChange}
              />
              {errors.otherCategory && <p style={{margin:'0.25rem 0 0',fontSize:'0.75rem',color:'#ef4444'}}>{errors.otherCategory}</p>}
            </div>
          )}

          <div>
            <label style={labelStyle}>Description</label>
            <textarea 
              name="description"
              placeholder="Enter details about this expense"
              rows="3"
              style={{ ...inputStyle, resize: 'vertical' }}
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label style={labelStyle}>Amount (USD) <span style={{color:'#ef4444'}}>*</span></label>
            <input 
              type="number" 
              name="amount"
              placeholder="0.00"
              step="0.01"
              style={{ ...inputStyle, borderColor: errors.amount ? '#ef4444' : '#cbd5e1' }}
              value={formData.amount}
              onChange={handleChange}
            />
            {errors.amount && <p style={{margin:'0.25rem 0 0',fontSize:'0.75rem',color:'#ef4444'}}>{errors.amount}</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc' }}>
          <button 
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500', fontSize: '0.9rem' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ padding: '0.5rem 1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <i className='bx bx-check'></i> {editExpenseData ? 'Resubmit Expense' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddExpenseModal;
