import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommentReactions from '../components/CommentReactions';
import {
  getARInvoicesWithNotifications,
  getARTotalUnreadCount,
  getGeneralNotifications,
  getGeneralUnreadCount,
  addGeneralNotification,
  markGeneralNotificationRead,
  markGeneralNotificationUnread,
  markAllGeneralNotificationsRead,
  getOtherUsersWithStats,
  getOtherUsersTotalUnreadCount,
  getUserCommentsThread,
  postUserComment,
  markUserThreadRead,
  markUserThreadUnread,
  markAllUserThreadsRead,
  getInvoiceActivities,
  addInvoiceComment,
  markInvoiceActivitiesRead,
  markInvoiceActivitiesUnread,
  markAllInvoicesRead,
  getInvoiceParticipants,
  toggleInvoiceActivityReaction,
  toggleUserCommentReaction
} from '../utils/notificationService';

export default function NotificationsPage() {
  const navigate = useNavigate();

  // Active top tab: 'ar' | 'general' | 'users'
  const [activeTab, setActiveTab] = useState('ar');

  // Trigger re-render on notification changes
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Auto-fetch logged-in user identity (no Author dropdown option)
  const loggedInUser = (() => {
    try {
      const stored = localStorage.getItem('logged_in_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { name: 'Karan Hinduja', role: 'Admin', email: 'hinduja1988@gmail.com' };
  })();
  const currentUserName = loggedInUser.name || 'Karan Hinduja';

  // ----------------------------------------------------
  // ACCOUNTS RECEIVABLES STATE
  // ----------------------------------------------------
  const [arInvoices, setArInvoices] = useState([]);
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState(null);
  const [selectedInvoiceActivities, setSelectedInvoiceActivities] = useState([]);
  const [arSearchText, setArSearchText] = useState('');
  const [arCommentText, setArCommentText] = useState('');
  const [emailPreviewModal, setEmailPreviewModal] = useState(null);

  // ----------------------------------------------------
  // GENERAL NOTIFICATIONS STATE
  // ----------------------------------------------------
  const [generalList, setGeneralList] = useState([]);
  const [isNewGeneralModalOpen, setIsNewGeneralModalOpen] = useState(false);
  const [newGeneralForm, setNewGeneralForm] = useState({
    title: '',
    message: '',
    category: 'Billing Policy',
    priority: 'Normal'
  });

  // ----------------------------------------------------
  // OTHER USER COMMENTS STATE
  // ----------------------------------------------------
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userThreadComments, setUserThreadComments] = useState([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [userReplyText, setUserReplyText] = useState('');

  // ----------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------
  const loadAllData = () => {
    // 1. AR Invoices
    const arList = getARInvoicesWithNotifications();
    setArInvoices(arList);
    if (!selectedInvoiceKey && arList.length > 0) {
      setSelectedInvoiceKey(arList[0].invoiceKey);
      setSelectedInvoiceActivities(getInvoiceActivities(arList[0].invoiceKey));
      markInvoiceActivitiesRead(arList[0].invoiceKey);
    } else if (selectedInvoiceKey) {
      setSelectedInvoiceActivities(getInvoiceActivities(selectedInvoiceKey));
    }

    // 2. General Notifications
    setGeneralList(getGeneralNotifications());

    // 3. Other Users
    const uList = getOtherUsersWithStats();
    setUsersList(uList);
    if (!selectedUserId && uList.length > 0) {
      setSelectedUserId(uList[0].id);
      setUserThreadComments(getUserCommentsThread(uList[0].id));
      markUserThreadRead(uList[0].id);
    } else if (selectedUserId) {
      setUserThreadComments(getUserCommentsThread(selectedUserId));
    }
  };

  useEffect(() => {
    loadAllData();
  }, [updateTrigger]);

  useEffect(() => {
    const handleUpdate = () => setUpdateTrigger(prev => prev + 1);
    window.addEventListener('ar_notification_update', handleUpdate);
    return () => window.removeEventListener('ar_notification_update', handleUpdate);
  }, []);

  // When selected AR invoice changes
  const handleSelectInvoice = (invoiceKey) => {
    setSelectedInvoiceKey(invoiceKey);
    setSelectedInvoiceActivities(getInvoiceActivities(invoiceKey));
    markInvoiceActivitiesRead(invoiceKey);
    setUpdateTrigger(prev => prev + 1);
  };

  // When selected other user changes
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setUserThreadComments(getUserCommentsThread(userId));
    markUserThreadRead(userId);
    setUpdateTrigger(prev => prev + 1);
  };

  // Submit comment on AR Invoice
  const handleSendARComment = (e) => {
    e.preventDefault();
    if (!arCommentText.trim() || !selectedInvoiceKey) return;
    addInvoiceComment(selectedInvoiceKey, arCommentText.trim(), currentUserName);
    setArCommentText('');
    setSelectedInvoiceActivities(getInvoiceActivities(selectedInvoiceKey));
    setUpdateTrigger(prev => prev + 1);
  };

  // Submit reply to Other User
  const handleSendUserReply = (e) => {
    e.preventDefault();
    if (!userReplyText.trim() || !selectedUserId) return;
    postUserComment(selectedUserId, userReplyText.trim(), currentUserName, loggedInUser.role || 'Admin');
    setUserReplyText('');
    setUserThreadComments(getUserCommentsThread(selectedUserId));
    setUpdateTrigger(prev => prev + 1);
  };

  // Submit new General Notification (Admin Panel)
  const handleCreateGeneralNotification = (e) => {
    e.preventDefault();
    if (!newGeneralForm.title.trim() || !newGeneralForm.message.trim()) return;
    addGeneralNotification({
      title: newGeneralForm.title,
      message: newGeneralForm.message,
      category: newGeneralForm.category,
      priority: newGeneralForm.priority,
      sender: 'Admin Panel'
    });
    setNewGeneralForm({ title: '', message: '', category: 'Billing Policy', priority: 'Normal' });
    setIsNewGeneralModalOpen(false);
    setUpdateTrigger(prev => prev + 1);
  };

  // Compute unread badges
  const arUnreadCount = getARTotalUnreadCount();
  const generalUnreadCount = getGeneralUnreadCount();
  const otherUsersUnreadCount = getOtherUsersTotalUnreadCount();

  // Selected AR Invoice item details
  const activeInvoice = arInvoices.find(inv => inv.invoiceKey === selectedInvoiceKey) || arInvoices[0];
  const activeUser = usersList.find(u => u.id === selectedUserId) || usersList[0];

  // Filtered lists
  const filteredARInvoices = arInvoices.filter(inv => {
    const q = arSearchText.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      inv.billingCompany.toLowerCase().includes(q)
    );
  });

  const filteredUsers = usersList.filter(u => {
    const q = userSearchText.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

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
    <main style={{ padding: '1.5rem 2rem', maxWidth: '1440px', margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ 
              background: '#e0e7ff', 
              color: '#4338ca', 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.35rem' 
            }}>
              <i className='bx bx-bell'></i>
            </span>
            Notifications Center
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Centralized hub for Accounts Receivable activity, Admin general notices, and direct team comments.
          </p>
        </div>

        {/* Global Security / Privacy Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.45rem 0.85rem',
          fontSize: '0.8rem',
          color: '#475569'
        }}>
          <i className='bx bx-shield-check' style={{ color: '#16a34a', fontSize: '1.2rem' }}></i>
          <span><strong>Anti-Data Leakage:</strong> Zero-Amount Email Policy Active</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '1.25rem',
        background: '#ffffff',
        borderRadius: '8px 8px 0 0',
        padding: '0.25rem 0.5rem 0'
      }}>
        {/* TAB 1: ACCOUNTS RECEIVABLES */}
        <button
          onClick={() => setActiveTab('ar')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'ar' ? '3px solid #4f46e5' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'ar' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'ar' ? '700' : '500',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <i className='bx bx-receipt' style={{ fontSize: '1.15rem' }}></i>
          <span>Accounts Receivables</span>
          {arUnreadCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {arUnreadCount}
            </span>
          )}
        </button>

        {/* TAB 2: GENERAL */}
        <button
          onClick={() => setActiveTab('general')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'general' ? '3px solid #4f46e5' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'general' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'general' ? '700' : '500',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <i className='bx bx-broadcast' style={{ fontSize: '1.15rem' }}></i>
          <span>General</span>
          {generalUnreadCount > 0 && (
            <span style={{
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {generalUnreadCount}
            </span>
          )}
        </button>

        {/* TAB 3: OTHER USER */}
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #4f46e5' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'users' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'users' ? '700' : '500',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <i className='bx bx-user-voice' style={{ fontSize: '1.15rem' }}></i>
          <span>Other User</span>
          {otherUsersUnreadCount > 0 && (
            <span style={{
              background: '#3b82f6',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.45rem',
              borderRadius: '999px',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {otherUsersUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ACCOUNTS RECEIVABLES
          ========================================================================= */}
      {activeTab === 'ar' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: '1.25rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          minHeight: '680px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Left Master List: Invoices */}
          <div style={{
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Search Invoices */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ position: 'relative' }}>
                <i className='bx bx-search' style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}></i>
                <input
                  type="text"
                  placeholder="Search invoice ID or client..."
                  value={arSearchText}
                  onChange={(e) => setArSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
              {arUnreadCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      markAllInvoicesRead();
                      setUpdateTrigger(prev => prev + 1);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0
                    }}
                  >
                    <i className='bx bx-check-double'></i> Mark all {arUnreadCount} as read
                  </button>
                </div>
              )}
            </div>

            {/* Invoices List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredARInvoices.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                  No invoices found.
                </div>
              ) : (
                filteredARInvoices.map((inv) => {
                  const isSelected = inv.invoiceKey === selectedInvoiceKey;
                  return (
                    <div
                      key={inv.invoiceKey}
                      onClick={() => handleSelectInvoice(inv.invoiceKey)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        background: isSelected ? '#eef2ff' : '#ffffff',
                        borderLeft: isSelected ? '4px solid #4f46e5' : '4px solid transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.88rem', color: isSelected ? '#4338ca' : '#0f172a' }}>
                          {inv.invoiceNumber}
                        </span>
                        {inv.unreadCount > 0 && (
                          <span style={{
                            background: '#ef4444',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '999px'
                          }}>
                            {inv.unreadCount} new
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem', fontWeight: '500' }}>
                        {inv.clientName}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                        <span style={{ 
                          background: inv.status === 'Received' ? '#dcfce7' : (inv.status === 'Partial' ? '#fff7ed' : '#fef9c3'),
                          color: inv.status === 'Received' ? '#15803d' : (inv.status === 'Partial' ? '#c2410c' : '#a16207'),
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          {inv.status}
                        </span>
                        <span>
                          <i className='bx bx-message-rounded-dots'></i> {inv.activityCount} updates
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detail Pane: Selected Invoice Feed & Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            {activeInvoice ? (
              <>
                {/* Header for selected invoice */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#0f172a' }}>
                        {activeInvoice.invoiceNumber}
                      </h2>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#4338ca',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {activeInvoice.clientName}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: '#64748b' }}>
                      Billing Entity: <strong>{activeInvoice.billingCompany}</strong> • Status: <strong>{activeInvoice.status}</strong>
                    </div>
                  </div>

                  {/* Action Buttons: Mark as Read/Unread & View in AR */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {activeInvoice.unreadCount > 0 ? (
                      <button
                        onClick={() => {
                          markInvoiceActivitiesRead(activeInvoice.invoiceKey);
                          setUpdateTrigger(prev => prev + 1);
                        }}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '6px',
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#059669',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title="Mark this invoice's notifications as read"
                      >
                        <i className='bx bx-check'></i> Mark as Read
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          markInvoiceActivitiesUnread(activeInvoice.invoiceKey);
                          setUpdateTrigger(prev => prev + 1);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title="Flag this invoice as unread"
                      >
                        <i className='bx bx-envelope'></i> Mark as Unread
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/client-payments?invoiceId=${encodeURIComponent(activeInvoice.invoiceNumber)}`)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: '#2563eb',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <i className='bx bx-link-external'></i> View in Accounts Receivable
                    </button>
                  </div>
                </div>

                {/* Activities & Comments Timeline */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Zero-leakage alert pill */}
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.78rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <i className='bx bx-lock' style={{ fontSize: '1rem' }}></i>
                    <span><strong>Data Leakage Prevention:</strong> Automated emails to Primary CS & Accounts omit amounts. In-app comments below do not send external emails.</span>
                  </div>

                  {selectedInvoiceActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                      <i className='bx bx-chat' style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></i>
                      <p style={{ margin: 0, fontWeight: '500' }}>No activity or comments recorded yet for this invoice.</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem' }}>Use the comment box below to add notes or updates.</p>
                    </div>
                  ) : (
                    selectedInvoiceActivities.map((act) => {
                      const iconStyle = getActivityIcon(act.type);
                      return (
                        <div
                          key={act.id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: iconStyle.bg,
                                color: iconStyle.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.95rem'
                              }}>
                                <i className={`bx ${iconStyle.icon}`}></i>
                              </span>
                              <strong style={{ fontSize: '0.86rem', color: '#1e293b' }}>
                                {act.title || 'Notification'}
                              </strong>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                by <span style={{ fontWeight: '500', color: '#334155' }}>{act.author || 'System'}</span> • {new Date(act.timestamp).toLocaleString()}
                              </span>
                            </div>

                            {act.emailSent ? (
                              <span style={{
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '999px',
                                fontSize: '0.68rem',
                                fontWeight: '600'
                              }}>
                                Email Dispatched
                              </span>
                            ) : (
                              <span style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '999px',
                                fontSize: '0.68rem'
                              }}>
                                In-App Comment
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.84rem', color: '#334155', paddingLeft: '2.1rem', lineHeight: '1.45' }}>
                            {act.summary}
                          </div>

                          {/* Comment Reactions */}
                          <div style={{ paddingLeft: '2.1rem' }}>
                            <CommentReactions
                              reactions={act.reactions}
                              currentUserName={currentUserName}
                              onToggleReaction={(emoji) => {
                                toggleInvoiceActivityReaction(activeInvoice.invoiceKey, act.id, emoji, currentUserName);
                                setUpdateTrigger(prev => prev + 1);
                              }}
                            />
                          </div>

                          {act.emailDetails && (
                            <div style={{ paddingLeft: '2.1rem', marginTop: '0.2rem' }}>
                              <button
                                onClick={() => setEmailPreviewModal(act.emailDetails)}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  padding: '0.2rem 0.55rem',
                                  fontSize: '0.72rem',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  fontWeight: '500'
                                }}
                              >
                                <i className='bx bx-search'></i> View Dispatched Email
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment Composer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <form onSubmit={handleSendARComment}>
                    <textarea
                      rows={2}
                      value={arCommentText}
                      onChange={(e) => setArCommentText(e.target.value)}
                      placeholder={`Add a comment or follow-up note for invoice ${activeInvoice.invoiceNumber}...`}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#64748b' }}>
                        <i className='bx bx-user' style={{ color: '#4f46e5' }}></i>
                        <span>Posting as:</span>
                        <strong style={{ color: '#0f172a' }}>{currentUserName}</strong>
                      </div>

                      <button
                        type="submit"
                        disabled={!arCommentText.trim()}
                        style={{
                          background: arCommentText.trim() ? '#4f46e5' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 1.1rem',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: arCommentText.trim() ? 'pointer' : 'not-allowed',
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
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8' }}>
                Select an invoice on the left to view notifications and add comments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GENERAL NOTIFICATIONS (ADMIN BROADCASTS, NO USER COMMENTS)
          ========================================================================= */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Controls Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                General System & Policy Broadcasts
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Company-wide updates and Admin notices. These are read-only broadcasts (no comments enabled).
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={markAllGeneralNotificationsRead}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className='bx bx-check-double'></i> Mark All Read
              </button>

              <button
                onClick={() => setIsNewGeneralModalOpen(true)}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <i className='bx bx-plus-circle'></i> Post Admin Notice
              </button>
            </div>
          </div>

          {/* Cards Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {generalList.map((notif) => {
              const readStore = JSON.parse(localStorage.getItem('general_notifications_read_state') || '{}');
              const isUnread = !readStore[String(notif.id)];

              const priorityCfg = {
                Critical: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
                High: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
                Normal: { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' }
              }[notif.priority] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (isUnread) {
                      markGeneralNotificationRead(notif.id);
                    }
                  }}
                  style={{
                    background: '#ffffff',
                    border: isUnread ? '1.5px solid #38bdf8' : '1px solid #e2e8f0',
                    borderLeft: isUnread ? '5px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '1.15rem 1.35rem',
                    boxShadow: isUnread ? '0 4px 6px -1px rgba(2, 132, 199, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        background: priorityCfg.bg,
                        color: priorityCfg.color,
                        border: `1px solid ${priorityCfg.border}`,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {notif.priority}
                      </span>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: '600'
                      }}>
                        {notif.category}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '700', color: '#0f172a' }}>
                        {notif.title}
                      </h3>
                      {isUnread && (
                        <span style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '999px'
                        }}>
                          Unread
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isUnread) {
                            markGeneralNotificationRead(notif.id);
                          } else {
                            markGeneralNotificationUnread(notif.id);
                          }
                          setUpdateTrigger(prev => prev + 1);
                        }}
                        style={{
                          background: isUnread ? '#ecfdf5' : '#f8fafc',
                          border: `1px solid ${isUnread ? '#a7f3d0' : '#cbd5e1'}`,
                          color: isUnread ? '#059669' : '#64748b',
                          borderRadius: '4px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                        title={isUnread ? "Click to mark as read" : "Click to mark as unread"}
                      >
                        <i className={`bx ${isUnread ? 'bx-check' : 'bx-envelope'}`}></i>
                        {isUnread ? 'Mark Read' : 'Mark Unread'}
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.86rem', color: '#334155', lineHeight: '1.5' }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <span>Dispatched by <strong>{notif.sender || 'Admin Panel'}</strong></span>
                    <span style={{ fontStyle: 'italic' }}>General Notice • Comments disabled</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: OTHER USER COMMENTS
          ========================================================================= */}
      {activeTab === 'users' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.25rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          minHeight: '680px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Left Master List: Users */}
          <div style={{
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Search Users */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ position: 'relative' }}>
                <i className='bx bx-search' style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }}></i>
                <input
                  type="text"
                  placeholder="Search user name or role..."
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
              {otherUsersUnreadCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      markAllUserThreadsRead();
                      setUpdateTrigger(prev => prev + 1);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.74rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0
                    }}
                  >
                    <i className='bx bx-check-double'></i> Mark all {otherUsersUnreadCount} as read
                  </button>
                </div>
              )}
            </div>

            {/* User List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredUsers.map((user) => {
                const isSelected = user.id === selectedUserId;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: isSelected ? '#e0f2fe' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isSelected ? '#0284c7' : '#e0e7ff',
                        color: isSelected ? '#ffffff' : '#4338ca',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.88rem'
                      }}>
                        {user.avatar || user.name.charAt(0)}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: isSelected ? '#0369a1' : '#0f172a' }}>
                            {user.name}
                          </span>
                          {user.unreadCount > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: '700',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '999px'
                            }}>
                              {user.unreadCount} new
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.role}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.lastMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Pane: User Comments Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            {activeUser ? (
              <>
                {/* User Header */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#0284c7',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.95rem'
                    }}>
                      {activeUser.avatar || activeUser.name.charAt(0)}
                    </span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                        {activeUser.name}
                      </h2>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {activeUser.role} • {activeUser.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {activeUser.unreadCount > 0 ? (
                      <button
                        onClick={() => {
                          markUserThreadRead(activeUser.id);
                          setUpdateTrigger(prev => prev + 1);
                        }}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          color: '#059669',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Mark this user's thread as read"
                      >
                        <i className='bx bx-check'></i> Mark as Read
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          markUserThreadUnread(activeUser.id);
                          setUpdateTrigger(prev => prev + 1);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Flag this conversation as unread"
                      >
                        <i className='bx bx-envelope'></i> Mark as Unread
                      </button>
                    )}

                    <span style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <i className='bx bx-check-circle'></i> Active Teammate
                    </span>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Banner notice */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textAlign: 'center'
                  }}>
                    <i className='bx bx-info-circle'></i> Direct comments thread. In-app notifications only (no emails sent).
                  </div>

                  {userThreadComments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                      <i className='bx bx-message-square-dots' style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></i>
                      <p style={{ margin: 0, fontWeight: '500' }}>No comments exchanged with {activeUser.name} yet.</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem' }}>Type below to send a comment.</p>
                    </div>
                  ) : (
                    userThreadComments.map((comm) => {
                      const isMe = comm.senderId === 'currentUser';
                      return (
                        <div
                          key={comm.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{
                            maxWidth: '75%',
                            background: isMe ? '#4f46e5' : '#f1f5f9',
                            color: isMe ? '#ffffff' : '#0f172a',
                            borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            padding: '0.75rem 1rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                          }}>
                            <div style={{
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              marginBottom: '0.25rem',
                              color: isMe ? '#c7d2fe' : '#475569'
                            }}>
                              {comm.senderName} ({comm.role})
                            </div>
                            <div style={{ fontSize: '0.86rem', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                              {comm.text}
                            </div>
                          </div>

                          {/* Comment Reactions */}
                          <div style={{ marginTop: '0.1rem' }}>
                            <CommentReactions
                              reactions={comm.reactions}
                              currentUserName={currentUserName}
                              align={isMe ? 'right' : 'left'}
                              onToggleReaction={(emoji) => {
                                toggleUserCommentReaction(activeUser.id, comm.id, emoji, currentUserName);
                                setUpdateTrigger(prev => prev + 1);
                              }}
                            />
                          </div>

                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem', padding: '0 0.35rem' }}>
                            {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Composer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <form onSubmit={handleSendUserReply}>
                    <textarea
                      rows={2}
                      value={userReplyText}
                      onChange={(e) => setUserReplyText(e.target.value)}
                      placeholder={`Send a comment to ${activeUser.name}...`}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        boxSizing: 'border-box',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={!userReplyText.trim()}
                        style={{
                          background: userReplyText.trim() ? '#0284c7' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 1.25rem',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: userReplyText.trim() ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <i className='bx bx-send'></i> Send Comment
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8' }}>
                Select a user on the left to view conversation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NEW GENERAL NOTIFICATION (ADMIN BROADCAST)
          ========================================================================= */}
      {isNewGeneralModalOpen && (
        <div
          onClick={() => setIsNewGeneralModalOpen(false)}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              padding: '1.1rem 1.35rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>
                Post Admin General Notice
              </h2>
              <button
                onClick={() => setIsNewGeneralModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            <form onSubmit={handleCreateGeneralNotification} style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Corporate Billing Guidelines Activated"
                  value={newGeneralForm.title}
                  onChange={(e) => setNewGeneralForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <select
                    value={newGeneralForm.category}
                    onChange={(e) => setNewGeneralForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      background: '#fff'
                    }}
                  >
                    <option value="Billing Policy">Billing Policy</option>
                    <option value="Security">Security & Compliance</option>
                    <option value="System Notice">System Notice</option>
                    <option value="Feature Update">Feature Update</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                    Priority
                  </label>
                  <select
                    value={newGeneralForm.priority}
                    onChange={(e) => setNewGeneralForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      background: '#fff'
                    }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>
                  Notice Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter notice details. Note that comments will be disabled for recipients."
                  value={newGeneralForm.message}
                  onChange={(e) => setNewGeneralForm(prev => ({ ...prev, message: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewGeneralModalOpen(false)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.45rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EMAIL HTML PREVIEW
          ========================================================================= */}
      {emailPreviewModal && (
        <div
          onClick={() => setEmailPreviewModal(null)}
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
                  Dispatched Email Preview
                </span>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#0f172a', marginTop: '0.25rem' }}>
                  {emailPreviewModal.subject}
                </div>
              </div>
              <button
                onClick={() => setEmailPreviewModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#f1f5f9' }}>
              <div
                dangerouslySetInnerHTML={{ __html: emailPreviewModal.htmlBody }}
                style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEmailPreviewModal(null)}
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
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
