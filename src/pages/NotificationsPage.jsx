import React, { useState, useEffect, useRef } from 'react';
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
  toggleUserCommentReaction,
  formatMessageTime,
  getMessageDateCategory
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
  const [arReplyingTo, setArReplyingTo] = useState(null);
  const [showArEmojiPicker, setShowArEmojiPicker] = useState(false);
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
  const [userReplyingTo, setUserReplyingTo] = useState(null);
  const [showUserEmojiPicker, setShowUserEmojiPicker] = useState(false);
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState(null);

  // Auto-scroll and scroll-to-bottom refs & state
  const userThreadScrollRef = useRef(null);
  const userThreadBottomRef = useRef(null);
  const [showUserScrollToBottom, setShowUserScrollToBottom] = useState(false);

  const arThreadScrollRef = useRef(null);
  const arThreadBottomRef = useRef(null);
  const [showArScrollToBottom, setShowArScrollToBottom] = useState(false);

  useEffect(() => {
    if (userThreadBottomRef.current) {
      userThreadBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [selectedUserId, userThreadComments.length]);

  useEffect(() => {
    if (arThreadBottomRef.current) {
      arThreadBottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [selectedInvoiceKey, selectedInvoiceActivities.length]);

  const handleUserThreadScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowUserScrollToBottom(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleScrollUserToBottom = () => {
    userThreadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleArThreadScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowArScrollToBottom(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleScrollArToBottom = () => {
    arThreadBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    addInvoiceComment(selectedInvoiceKey, arCommentText.trim(), currentUserName, arReplyingTo);
    setArCommentText('');
    setArReplyingTo(null);
    const inputEl = document.getElementById('ar-comment-input');
    if (inputEl) inputEl.style.height = '24px';
    setSelectedInvoiceActivities(getInvoiceActivities(selectedInvoiceKey));
    setUpdateTrigger(prev => prev + 1);
  };

  // Submit reply to Other User
  const handleSendUserReply = (e) => {
    e.preventDefault();
    if (!userReplyText.trim() || !selectedUserId) return;
    postUserComment(selectedUserId, userReplyText.trim(), currentUserName, loggedInUser.role || 'Admin', userReplyingTo);
    setUserReplyText('');
    setUserReplyingTo(null);
    const inputEl = document.getElementById('user-reply-input');
    if (inputEl) inputEl.style.height = '24px';
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
          gap: 0,
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          height: 'calc(100vh - 200px)',
          minHeight: '620px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Left Master List: Invoices */}
          <div style={{
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
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
          <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {activeInvoice ? (
              <>
                {/* Header for selected invoice */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  flexShrink: 0
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
                <div
                  ref={arThreadScrollRef}
                  onScroll={handleArThreadScroll}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
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
                                by <span style={{ fontWeight: '500', color: '#334155' }}>{act.author || 'System'}</span> • {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {formatMessageTime(act.timestamp)}
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

                          {/* Quoted Reply if any */}
                          {act.replyTo && (
                            <div style={{
                              marginLeft: '2.1rem',
                              marginBottom: '0.35rem',
                              padding: '0.3rem 0.6rem',
                              background: '#f8fafc',
                              borderLeft: '3px solid #6366f1',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              color: '#64748b'
                            }}>
                              <div style={{ fontWeight: '600', color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <i className='bx bx-reply' style={{ transform: 'rotate(180deg)' }}></i>
                                <span>Replying to {act.replyTo.author}</span>
                              </div>
                              <div style={{ fontStyle: 'italic', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>
                                "{act.replyTo.text}"
                              </div>
                            </div>
                          )}

                          <div style={{ fontSize: '0.84rem', color: '#334155', paddingLeft: '2.1rem', lineHeight: '1.45' }}>
                            {act.summary}
                          </div>

                          {/* Comment Reactions & Reply Action */}
                          <div style={{ paddingLeft: '2.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <CommentReactions
                              reactions={act.reactions}
                              currentUserName={currentUserName}
                              onToggleReaction={(emoji) => {
                                toggleInvoiceActivityReaction(activeInvoice.invoiceKey, act.id, emoji, currentUserName);
                                setUpdateTrigger(prev => prev + 1);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setArReplyingTo({
                                  id: act.id,
                                  author: act.author || act.title || 'User',
                                  text: act.summary || ''
                                });
                                const inputEl = document.getElementById('ar-comment-input');
                                if (inputEl) inputEl.focus();
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '0.74rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                              title="Reply to this comment"
                            >
                              <i className='bx bx-reply' style={{ fontSize: '0.9rem' }}></i> Reply
                            </button>
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
                  <div ref={arThreadBottomRef} />
                </div>

                {/* Floating Scroll to Bottom Button */}
                {showArScrollToBottom && (
                  <button
                    type="button"
                    onClick={handleScrollArToBottom}
                    style={{
                      position: 'absolute',
                      bottom: '76px',
                      right: '24px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#475569',
                      zIndex: 20,
                      transition: 'transform 0.15s'
                    }}
                    title="Scroll to latest updates"
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <i className='bx bx-chevron-down' style={{ fontSize: '1.4rem' }}></i>
                  </button>
                )}

                {/* Comment Composer - Sleek Single-Line Bar (FIXED AT BOTTOM) */}
                <div style={{
                  padding: '0.85rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  {/* Quoted reply banner */}
                  {arReplyingTo && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      marginBottom: '0.4rem',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                        <i className='bx bx-reply' style={{ color: '#2563eb', fontSize: '1rem', transform: 'rotate(180deg)' }}></i>
                        <span style={{ color: '#1e40af', fontWeight: '600' }}>Replying to {arReplyingTo.author}:</span>
                        <span style={{ color: '#3b82f6', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{arReplyingTo.text.slice(0, 60)}{arReplyingTo.text.length > 60 ? '...' : ''}"
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setArReplyingTo(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 0.2rem'
                        }}
                        title="Cancel reply"
                      >
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  )}

                  {/* Emoji Popover Picker for AR */}
                  {showArEmojiPicker && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: '48px',
                      marginBottom: '6px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      padding: '0.35rem 0.5rem',
                      display: 'flex',
                      gap: '0.3rem',
                      zIndex: 50
                    }}>
                      {['👍', '❤️', '😊', '🎉', '👏', '✅', '🔥', '💬', '🙌', '🚀'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setArCommentText(prev => prev + emoji);
                            setShowArEmojiPicker(false);
                            const inputEl = document.getElementById('ar-comment-input');
                            if (inputEl) inputEl.focus();
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.15rem',
                            padding: '0.2rem',
                            borderRadius: '4px',
                            lineHeight: 1
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleSendARComment}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '24px',
                      padding: '0.2rem 0.35rem 0.2rem 0.85rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <textarea
                      id="ar-comment-input"
                      rows={1}
                      value={arCommentText}
                      onChange={(e) => {
                        setArCommentText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendARComment(e);
                          e.target.style.height = '24px';
                        }
                      }}
                      placeholder={arReplyingTo ? `Reply to ${arReplyingTo.author}...` : `Comment on invoice ${activeInvoice.invoiceNumber}...`}
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.84rem',
                        color: '#1e293b',
                        background: 'transparent',
                        padding: '0.2rem 0',
                        fontFamily: 'inherit',
                        lineHeight: '1.4',
                        height: '24px',
                        minHeight: '24px',
                        maxHeight: '120px',
                        resize: 'none',
                        overflowY: 'auto'
                      }}
                    />

                    {/* Emoji button */}
                    <button
                      type="button"
                      onClick={() => setShowArEmojiPicker(prev => !prev)}
                      style={{
                        background: showArEmojiPicker ? '#e0e7ff' : 'none',
                        border: 'none',
                        color: showArEmojiPicker ? '#4f46e5' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Insert emoji"
                    >
                      <i className='bx bx-smile'></i>
                    </button>

                    {/* Send Icon button */}
                    <button
                      type="submit"
                      disabled={!arCommentText.trim()}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: 'none',
                        background: arCommentText.trim() ? '#4f46e5' : '#e2e8f0',
                        color: arCommentText.trim() ? '#ffffff' : '#94a3b8',
                        cursor: arCommentText.trim() ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.05rem',
                        flexShrink: 0
                      }}
                      title="Post comment"
                    >
                      <i className='bx bx-send' style={{ transform: 'translateX(1px)' }}></i>
                    </button>
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
                        {new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {formatMessageTime(notif.timestamp)}
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
          gap: 0,
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          height: 'calc(100vh - 200px)',
          minHeight: '620px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Left Master List: Users */}
          <div style={{
            borderRight: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
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
          <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {activeUser ? (
              <>
                {/* User Header */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  flexShrink: 0
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
                <div
                  ref={userThreadScrollRef}
                  onScroll={handleUserThreadScroll}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
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
                    (() => {
                      let lastDateCategory = null;
                      let lastSenderId = null;

                      // Vibrant sender colors matching WhatsApp group style
                      const getSenderColor = (senderId) => {
                        const colors = {
                          ananya: '#0284c7',   // Sky blue
                          vikram: '#10b981',   // Emerald green
                          karan: '#8b5cf6',    // Violet
                          sneha: '#f59e0b',    // Amber
                          rahul: '#ec4899',    // Pink
                          system: '#64748b'
                        };
                        return colors[senderId] || '#0284c7';
                      };

                      return userThreadComments.map((comm) => {
                        const isMe = comm.senderId === 'currentUser';
                        const dateCategory = getMessageDateCategory(comm.timestamp);
                        const showDateDivider = dateCategory !== lastDateCategory;
                        lastDateCategory = dateCategory;

                        // Check if this message is back-to-back from the same sender on the same day
                        const isConsecutive = !showDateDivider && comm.senderId === lastSenderId;
                        lastSenderId = comm.senderId;

                        const reactionsEntries = Object.entries(comm.reactions || {}).filter(([_, u]) => Array.isArray(u) && u.length > 0);
                        const hasReactions = reactionsEntries.length > 0;

                        return (
                          <React.Fragment key={comm.id}>
                            {/* WhatsApp Date Segregator Pill */}
                            {showDateDivider && (
                              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.85rem 0 0.5rem' }}>
                                <span style={{
                                  background: '#e2e8f0',
                                  color: '#475569',
                                  fontSize: '0.72rem',
                                  fontWeight: '600',
                                  padding: '0.2rem 0.75rem',
                                  borderRadius: '8px',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                  textTransform: 'capitalize'
                                }}>
                                  {dateCategory}
                                </span>
                              </div>
                            )}

                            <div
                              onMouseEnter={() => setHoveredCommentId(comm.id)}
                              onMouseLeave={() => setHoveredCommentId(null)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                marginTop: isConsecutive ? '2px' : '8px',
                                marginBottom: hasReactions ? '0.75rem' : '2px',
                                position: 'relative'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '0.45rem',
                                flexDirection: isMe ? 'row-reverse' : 'row',
                                maxWidth: '82%'
                              }}>
                                {/* Avatar for teammate (only shown on the first message of a consecutive series) */}
                                {!isMe && (
                                  !isConsecutive ? (
                                    <span style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      background: getSenderColor(comm.senderId),
                                      color: '#ffffff',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: '700',
                                      fontSize: '0.75rem',
                                      flexShrink: 0,
                                      marginBottom: '2px',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}>
                                      {comm.senderName ? comm.senderName.charAt(0) : 'T'}
                                    </span>
                                  ) : (
                                    <div style={{ width: '28px', height: '28px', flexShrink: 0 }} />
                                  )
                                )}

                                {/* Message Bubble */}
                                <div style={{
                                  position: 'relative',
                                  background: isMe ? '#4f46e5' : '#f1f5f9',
                                  color: isMe ? '#ffffff' : '#0f172a',
                                  borderRadius: isMe
                                    ? (isConsecutive ? '12px 6px 6px 12px' : '12px 12px 2px 12px')
                                    : (isConsecutive ? '6px 12px 12px 6px' : '12px 12px 12px 2px'),
                                  padding: '0.55rem 0.85rem 0.45rem',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                  wordBreak: 'break-word',
                                  minWidth: '95px'
                                }}>
                                  {/* Sender name for teammate - ONLY shown on first message in a back-to-back sequence */}
                                  {!isMe && !isConsecutive && (
                                    <div style={{
                                      fontSize: '0.74rem',
                                      fontWeight: '700',
                                      marginBottom: '0.25rem',
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      justifyContent: 'space-between',
                                      gap: '0.65rem'
                                    }}>
                                      <span style={{ color: getSenderColor(comm.senderId) }}>
                                        ~ {comm.senderName}
                                      </span>
                                      <span style={{ fontSize: '0.67rem', fontWeight: '500', color: '#64748b' }}>
                                        {comm.role}
                                      </span>
                                    </div>
                                  )}

                                  {/* Quoted Reply inside bubble */}
                                  {comm.replyTo && (
                                    <div style={{
                                      background: isMe ? 'rgba(255,255,255,0.18)' : '#e2e8f0',
                                      borderLeft: `3px solid ${isMe ? '#ffffff' : '#0284c7'}`,
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '4px',
                                      marginBottom: '0.35rem',
                                      fontSize: '0.72rem',
                                      color: isMe ? '#e0e7ff' : '#475569'
                                    }}>
                                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <i className='bx bx-reply' style={{ transform: 'rotate(180deg)' }}></i>
                                        <span>Replying to {comm.replyTo.author}:</span>
                                      </div>
                                      <div style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>
                                        "{comm.replyTo.text}"
                                      </div>
                                    </div>
                                  )}

                                  {/* Message Text and Time at bottom right (HH:MM, no seconds) */}
                                  <div style={{ fontSize: '0.86rem', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                                    {comm.text}
                                    <span style={{
                                      fontSize: '0.65rem',
                                      color: isMe ? 'rgba(255,255,255,0.72)' : '#94a3b8',
                                      marginLeft: '0.65rem',
                                      float: 'right',
                                      marginTop: '0.35rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.2rem',
                                      lineHeight: 1
                                    }}>
                                      {formatMessageTime(comm.timestamp)}
                                      {isMe && <i className='bx bx-check-double' style={{ color: '#c7d2fe', fontSize: '0.85rem' }}></i>}
                                    </span>
                                  </div>

                                  {/* WhatsApp Reaction Pill (at bottom edge of bubble) */}
                                  {hasReactions && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveReactionPickerId(activeReactionPickerId === comm.id ? null : comm.id);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        bottom: '-10px',
                                        right: isMe ? '8px' : 'auto',
                                        left: isMe ? 'auto' : '8px',
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        padding: '1px 5px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        cursor: 'pointer',
                                        zIndex: 3,
                                        fontSize: '0.74rem'
                                      }}
                                      title={reactionsEntries.map(([em, us]) => `${em} by ${us.join(', ')}`).join('\n')}
                                    >
                                      {reactionsEntries.map(([emoji, users]) => (
                                        <span key={emoji} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                          {emoji}
                                          {users.length > 1 && (
                                            <span style={{ fontSize: '0.66rem', fontWeight: '700', color: '#475569', marginLeft: '2px' }}>
                                              {users.length}
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Hover Action Bar: Option to add reaction and reply at the end of the message */}
                                {(hoveredCommentId === comm.id || activeReactionPickerId === comm.id) && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.15rem',
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '0.1rem 0.3rem',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    position: 'relative'
                                  }}>
                                    {/* Smiley reaction button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveReactionPickerId(activeReactionPickerId === comm.id ? null : comm.id);
                                      }}
                                      style={{
                                        background: activeReactionPickerId === comm.id ? '#e0e7ff' : 'none',
                                        border: 'none',
                                        color: activeReactionPickerId === comm.id ? '#4f46e5' : '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        padding: '0.15rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Add reaction"
                                    >
                                      <i className='bx bx-smile'></i>
                                    </button>

                                    {/* Reply button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUserReplyingTo({
                                          id: comm.id,
                                          author: comm.senderName || 'Teammate',
                                          text: comm.text || ''
                                        });
                                        const inputEl = document.getElementById('user-reply-input');
                                        if (inputEl) inputEl.focus();
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        padding: '0.15rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Reply"
                                    >
                                      <i className='bx bx-reply'></i>
                                    </button>

                                    {/* Reaction Popover */}
                                    {activeReactionPickerId === comm.id && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          position: 'absolute',
                                          bottom: 'calc(100% + 6px)',
                                          left: isMe ? 'auto' : 0,
                                          right: isMe ? 0 : 'auto',
                                          background: '#ffffff',
                                          borderRadius: '24px',
                                          padding: '0.2rem 0.45rem',
                                          display: 'flex',
                                          gap: '0.25rem',
                                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                          border: '1px solid #e2e8f0',
                                          zIndex: 100
                                        }}
                                      >
                                        {['👍', '❤️', '😂', '😮', '😢', '🙏', '✅', '🚀'].map(emoji => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => {
                                              toggleUserCommentReaction(activeUser.id, comm.id, emoji, currentUserName);
                                              setActiveReactionPickerId(null);
                                              setUpdateTrigger(prev => prev + 1);
                                            }}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'pointer',
                                              fontSize: '1.15rem',
                                              padding: '0.15rem',
                                              borderRadius: '50%',
                                              lineHeight: 1,
                                              transition: 'transform 0.12s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  )}
                  <div ref={userThreadBottomRef} />
                </div>

                {/* WhatsApp Style Floating Scroll to Bottom Button */}
                {showUserScrollToBottom && (
                  <button
                    type="button"
                    onClick={handleScrollUserToBottom}
                    style={{
                      position: 'absolute',
                      bottom: '76px',
                      right: '24px',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#475569',
                      zIndex: 20,
                      transition: 'transform 0.15s'
                    }}
                    title="Scroll to latest messages"
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <i className='bx bx-chevron-down' style={{ fontSize: '1.4rem' }}></i>
                  </button>
                )}

                {/* Reply Composer - Sleek Single-Line Bar (FIXED AT BOTTOM) */}
                <div style={{
                  padding: '0.85rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  {/* Quoted reply banner */}
                  {userReplyingTo && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      marginBottom: '0.4rem',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                        <i className='bx bx-reply' style={{ color: '#0284c7', fontSize: '1rem', transform: 'rotate(180deg)' }}></i>
                        <span style={{ color: '#0369a1', fontWeight: '600' }}>Replying to {userReplyingTo.author}:</span>
                        <span style={{ color: '#0284c7', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{userReplyingTo.text.slice(0, 60)}{userReplyingTo.text.length > 60 ? '...' : ''}"
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUserReplyingTo(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 0.2rem'
                        }}
                        title="Cancel reply"
                      >
                        <i className='bx bx-x'></i>
                      </button>
                    </div>
                  )}

                  {/* Emoji Popover Picker for User Reply */}
                  {showUserEmojiPicker && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: '48px',
                      marginBottom: '6px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      padding: '0.35rem 0.5rem',
                      display: 'flex',
                      gap: '0.3rem',
                      zIndex: 50
                    }}>
                      {['👍', '❤️', '😊', '🎉', '👏', '✅', '🔥', '💬', '🙌', '🚀'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setUserReplyText(prev => prev + emoji);
                            setShowUserEmojiPicker(false);
                            const inputEl = document.getElementById('user-reply-input');
                            if (inputEl) inputEl.focus();
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.15rem',
                            padding: '0.2rem',
                            borderRadius: '4px',
                            lineHeight: 1
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleSendUserReply}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '24px',
                      padding: '0.2rem 0.35rem 0.2rem 0.85rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <textarea
                      id="user-reply-input"
                      rows={1}
                      value={userReplyText}
                      onChange={(e) => {
                        setUserReplyText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendUserReply(e);
                          e.target.style.height = '24px';
                        }
                      }}
                      placeholder={userReplyingTo ? `Reply to ${userReplyingTo.author}...` : `Send a comment to ${activeUser.name}...`}
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.84rem',
                        color: '#1e293b',
                        background: 'transparent',
                        padding: '0.2rem 0',
                        fontFamily: 'inherit',
                        lineHeight: '1.4',
                        height: '24px',
                        minHeight: '24px',
                        maxHeight: '120px',
                        resize: 'none',
                        overflowY: 'auto'
                      }}
                    />

                    {/* Emoji button */}
                    <button
                      type="button"
                      onClick={() => setShowUserEmojiPicker(prev => !prev)}
                      style={{
                        background: showUserEmojiPicker ? '#e0f2fe' : 'none',
                        border: 'none',
                        color: showUserEmojiPicker ? '#0284c7' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.3rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Insert emoji"
                    >
                      <i className='bx bx-smile'></i>
                    </button>

                    {/* Send Icon button */}
                    <button
                      type="submit"
                      disabled={!userReplyText.trim()}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: 'none',
                        background: userReplyText.trim() ? '#0284c7' : '#e2e8f0',
                        color: userReplyText.trim() ? '#ffffff' : '#94a3b8',
                        cursor: userReplyText.trim() ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.05rem',
                        flexShrink: 0
                      }}
                      title="Send message"
                    >
                      <i className='bx bx-send' style={{ transform: 'translateX(1px)' }}></i>
                    </button>
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
