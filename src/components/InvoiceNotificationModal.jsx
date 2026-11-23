import React, { useState, useEffect } from 'react';
import {
  getInvoiceParticipants,
  addInvoiceParticipant,
  removeInvoiceParticipant,
  getInvoiceActivities,
  addInvoiceComment,
  markInvoiceActivitiesRead,
  getInvoiceUnreadCount
} from '../utils/notificationService';

export default function InvoiceNotificationModal({ isOpen, onClose, payment }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'participants' | 'emails'
  const [activities, setActivities] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Customer Success');
  const [previewEmail, setPreviewEmail] = useState(null);

  // New participant form state
  const [newPartName, setNewPartName] = useState('');
  const [newPartEmail, setNewPartEmail] = useState('');
  const [newPartRole, setNewPartRole] = useState('CS Team');

  const invoiceKey = payment?.id || payment?.invoiceNumber || 'INV';
  const invoiceNum = payment?.invoiceNumber || (payment?.invoiceLink ? payment.invoiceLink.split('/').pop() : `INV-${payment?.id || 'N/A'}`);
  const clientName = payment?.clientName || 'Corporate Client';

  const reloadData = () => {
    if (!invoiceKey) return;
    setActivities(getInvoiceActivities(invoiceKey));
    setParticipants(getInvoiceParticipants(invoiceKey, payment));
    markInvoiceActivitiesRead(invoiceKey);
  };

  useEffect(() => {
    if (isOpen && payment) {
      reloadData();
      setActiveTab('feed');
      setPreviewEmail(null);
    }
  }, [isOpen, payment]);

  useEffect(() => {
    const handleUpdate = () => {
      if (isOpen && payment) {
        setActivities(getInvoiceActivities(invoiceKey));
        setParticipants(getInvoiceParticipants(invoiceKey, payment));
      }
    };
    window.addEventListener('ar_notification_update', handleUpdate);
    return () => window.removeEventListener('ar_notification_update', handleUpdate);
  }, [isOpen, payment, invoiceKey]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (previewEmail) {
          setPreviewEmail(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewEmail, onClose]);

  if (!isOpen || !payment) return null;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addInvoiceComment(invoiceKey, commentText.trim(), commentAuthor);
    setCommentText('');
    reloadData();
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!newPartEmail.trim() || !newPartEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    addInvoiceParticipant(invoiceKey, {
      name: newPartName.trim() || newPartEmail.split('@')[0],
      email: newPartEmail.trim(),
      role: newPartRole
    }, payment);

    setNewPartName('');
    setNewPartEmail('');
    reloadData();
  };

  const handleRemoveParticipant = (email) => {
    removeInvoiceParticipant(invoiceKey, email, payment);
    reloadData();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'INVOICE_CREATED':
      case 'INVOICE_UPLOADED':
        return { icon: 'bx-file-blank', color: '#2563eb', bg: '#eff6ff' };
      case 'PAYMENT_ADDED':
        return { icon: 'bx-check-circle', color: '#16a34a', bg: '#f0fdf4' };
      case 'SCHEDULE_CREATED':
        return { icon: 'bx-calendar-event', color: '#d97706', bg: '#fef3c7' };
      case 'INVOICE_EDITED':
        return { icon: 'bx-edit', color: '#7c3aed', bg: '#f5f3ff' };
      case 'COMMENT_ADDED':
      default:
        return { icon: 'bx-comment-detail', color: '#0284c7', bg: '#e0f2fe' };
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                background: '#e0e7ff', 
                color: '#4338ca', 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                <i className='bx bx-bell'></i>
              </span>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                Notifications & Comments
              </h2>
            </div>
            <div style={{ marginTop: '0.25rem', fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span><strong>Invoice:</strong> <span style={{ color: '#2563eb', fontWeight: '600' }}>{invoiceNum}</span></span>
              <span>•</span>
              <span><strong>Client:</strong> {clientName}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.4rem', 
              color: '#94a3b8', 
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <i className='bx bx-x'></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '0 1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('feed')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'feed' ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'feed' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'feed' ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <i className='bx bx-history'></i> Activity & Comments
            <span style={{ 
              background: activeTab === 'feed' ? '#e0e7ff' : '#f1f5f9', 
              color: activeTab === 'feed' ? '#4338ca' : '#64748b',
              padding: '0.1rem 0.45rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem',
              fontWeight: '600'
            }}>
              {activities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'participants' ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'participants' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'participants' ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <i className='bx bx-group'></i> Notification Recipients
            <span style={{ 
              background: activeTab === 'participants' ? '#e0e7ff' : '#f1f5f9', 
              color: activeTab === 'participants' ? '#4338ca' : '#64748b',
              padding: '0.1rem 0.45rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem',
              fontWeight: '600'
            }}>
              {participants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'emails' ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'emails' ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === 'emails' ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <i className='bx bx-mail-send'></i> Email Templates & Logs
            <span style={{ 
              background: '#ecfdf5', 
              color: '#047857',
              padding: '0.1rem 0.45rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem',
              fontWeight: '600'
            }}>
              Zero-Leakage
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          
          {/* TAB 1: ACTIVITY & COMMENTS FEED */}
          {activeTab === 'feed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Anti-Data Leakage banner */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <i className='bx bx-shield-quarter' style={{ fontSize: '1.1rem', marginTop: '0.1rem' }}></i>
                <div>
                  <strong>Data Privacy Policy:</strong> Automated email notifications are strictly sent to Primary CS and Accounts Team without amounts to prevent data leakage. Comments added here update unread badges without sending outbound emails.
                </div>
              </div>

              {/* Feed items */}
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <i className='bx bx-message-square-detail' style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></i>
                  <p style={{ margin: 0, fontWeight: '500' }}>No activity or comments recorded yet for this invoice.</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem' }}>Leave a comment below or trigger notifications via invoice updates.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activities.map((act) => {
                    const iconStyle = getActivityIcon(act.type);
                    return (
                      <div 
                        key={act.id} 
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: iconStyle.bg,
                              color: iconStyle.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem'
                            }}>
                              <i className={`bx ${iconStyle.icon}`}></i>
                            </span>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1e293b' }}>
                                {act.title || 'System Notification'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                by <span style={{ fontWeight: '500', color: '#334155' }}>{act.author || 'System'}</span> • {new Date(act.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {act.emailSent ? (
                              <span style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <i className='bx bx-check'></i> Email Dispatched
                              </span>
                            ) : (
                              <span style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: '500'
                              }}>
                                In-App Only
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.45', paddingLeft: '2.3rem' }}>
                          {act.summary}
                        </div>

                        {act.emailDetails && (
                          <div style={{ paddingLeft: '2.3rem', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button
                              onClick={() => setPreviewEmail(act.emailDetails)}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.74rem',
                                color: '#475569',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontWeight: '500'
                              }}
                            >
                              <i className='bx bx-search-alt'></i> Preview Dispatched Email
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Comment Section */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Add Comment / Note</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '400' }}>
                    <i className='bx bx-info-circle'></i> No email is sent; increments unread count badge
                  </span>
                </div>
                <form onSubmit={handleAddComment}>
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter your comment, internal note, or follow-up update for this invoice..."
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Author:</span>
                      <select
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          background: '#fff'
                        }}
                      >
                        <option value="Customer Success">Customer Success</option>
                        <option value="Accounts Team">Accounts Team</option>
                        <option value="Finance Operations">Finance Operations</option>
                        <option value="Karan Hinduja">Karan Hinduja (Primary CS)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      style={{
                        background: commentText.trim() ? '#4f46e5' : '#cbd5e1',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.45rem 1rem',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <i className='bx bx-send'></i> Post Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS TAB */}
          {activeTab === 'participants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <i className='bx bx-bell-plus' style={{ fontSize: '1.1rem', marginTop: '0.1rem' }}></i>
                <div>
                  <strong>Automatic Email Subscriptions:</strong> All active participants listed below receive automated email notifications when invoices are uploaded, modified, payments recorded, or schedules added.
                </div>
              </div>

              {/* Participant List */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '0.85rem', color: '#1e293b' }}>
                  Current Subscribed Recipients ({participants.length})
                </div>
                <div style={{ divideY: '1px solid #e2e8f0' }}>
                  {participants.map((p) => (
                    <div 
                      key={p.email} 
                      style={{ 
                        padding: '0.85rem 1rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: p.isDefault ? '#e0e7ff' : '#f1f5f9',
                          color: p.isDefault ? '#4338ca' : '#475569',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.82rem'
                        }}>
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {p.name}
                            {p.isDefault && (
                              <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                                Default System
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {p.email} • <span style={{ color: '#475569', fontWeight: '500' }}>{p.role}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {p.isDefault ? (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <i className='bx bx-lock-alt'></i> Required
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRemoveParticipant(p.email)}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              borderRadius: '4px',
                              padding: '0.25rem 0.6rem',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <i className='bx bx-trash'></i> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Participant Form */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className='bx bx-user-plus' style={{ color: '#4f46e5', fontSize: '1.1rem' }}></i>
                  Add Notification Participant
                </div>
                <form onSubmit={handleAddParticipant} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@mantracare.com"
                      value={newPartEmail}
                      onChange={(e) => setNewPartEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>
                      Role / Department
                    </label>
                    <select
                      value={newPartRole}
                      onChange={(e) => setNewPartRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        background: '#fff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="CS Team">CS Team</option>
                      <option value="CS Manager">CS Manager</option>
                      <option value="Finance Ops">Finance Ops</option>
                      <option value="Account Lead">Account Lead</option>
                      <option value="Auditor">Auditor</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <i className='bx bx-plus'></i> Add Participant
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL TEMPLATES & LOGS */}
          {activeTab === 'emails' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#92400e',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <i className='bx bx-lock' style={{ fontSize: '1.1rem', marginTop: '0.1rem' }}></i>
                <div>
                  <strong>Zero-Amount Email Notification Guarantee:</strong> To eliminate corporate data leakage, none of our notification templates transmit money values, amounts, or fee totals over email. All recipients click secure portal links to view financial details inside the authenticated dashboard.
                </div>
              </div>

              {/* Template showcase cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.3rem', borderRadius: '6px' }}>
                      <i className='bx bx-file-blank'></i>
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>1. New Invoice Template</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Sent on new invoice upload. Includes client name, billing entity, invoice ID, dates, remarks, bill from, and direct portal link. Zero amounts included.
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.3rem', borderRadius: '6px' }}>
                      <i className='bx bx-check-circle'></i>
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>2. Payment Template</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Sent on payment recorded. Includes client name, invoice reference, payment date, receiving bank, and direct payment tab link. Zero amounts included.
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.3rem', borderRadius: '6px' }}>
                      <i className='bx bx-calendar-event'></i>
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>3. Schedule Template</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Sent on schedule created. Includes client name, order ID, cadence, installment count, and filtered schedule link. Zero amounts included.
                  </p>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.3rem', borderRadius: '6px' }}>
                      <i className='bx bx-edit'></i>
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>4. Invoice Edited Template</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Sent on invoice modifications. Includes invoice ID, client name, modified fields summary, and direct link. Zero amounts included.
                  </p>
                </div>
              </div>

              {/* Email Audit Log */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '0.85rem', color: '#1e293b' }}>
                  Audit Log of Dispatched Notifications for this Invoice
                </div>
                {activities.filter(a => a.emailDetails).length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                    No automated emails have been dispatched for this invoice yet.
                  </div>
                ) : (
                  <div style={{ divideY: '1px solid #f1f5f9' }}>
                    {activities.filter(a => a.emailDetails).map(act => (
                      <div key={act.id} style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b' }}>
                            {act.emailDetails.subject}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                            Recipients: {act.emailDetails.recipients.map(r => r.email).join(', ')} • {new Date(act.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => setPreviewEmail(act.emailDetails)}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '4px',
                            color: '#2563eb',
                            padding: '0.3rem 0.7rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <i className='bx bx-search'></i> View HTML
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className='bx bx-check-shield' style={{ color: '#16a34a', fontSize: '1rem' }}></i>
            Zero-Amount Email Transmission Active
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Nested Email HTML Preview Modal */}
      {previewEmail && (
        <div 
          onClick={() => setPreviewEmail(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Sent Email Preview
                </span>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#0f172a', marginTop: '0.25rem' }}>
                  {previewEmail.subject}
                </div>
              </div>
              <button 
                onClick={() => setPreviewEmail(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f1f5f9' }}>
              <div 
                dangerouslySetInnerHTML={{ __html: previewEmail.htmlBody }} 
                style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewEmail(null)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
