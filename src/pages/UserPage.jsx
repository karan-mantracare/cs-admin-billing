import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getAllUsers, getUserById, saveUser, deleteUser, DEFAULT_USER } from '../utils/userStorage';

export default function UserPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const userIdQuery = searchParams.get('user_id');
  const [activeUser, setActiveUser] = useState(() => getUserById(userIdQuery));
  const [usersList, setUsersList] = useState(() => getAllUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Invite / Add User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Customer Success',
    divisionAccess: 'Healthcare',
    isPrimary: false
  });

  // Re-fetch active user whenever searchParams change or usersList updates
  useEffect(() => {
    const user = getUserById(userIdQuery);
    setActiveUser(user);
  }, [userIdQuery, usersList]);

  // Sync users list from localStorage & events
  useEffect(() => {
    const handleStorageChange = () => {
      setUsersList(getAllUsers());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSelectUser = (uid) => {
    setSearchParams({ user_id: uid });
  };

  const handleResetToAdmin = () => {
    setSearchParams({});
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Customer Success',
      divisionAccess: 'Healthcare',
      isPrimary: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'Customer Success',
      divisionAccess: u.divisionAccess || 'All',
      isPrimary: Boolean(u.isPrimary)
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please enter both name and email');
      return;
    }

    const payload = {
      ...(editingUser || {}),
      user_id: editingUser ? editingUser.user_id : 'USR-' + Math.floor(1000 + Math.random() * 9000),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      divisionAccess: formData.divisionAccess,
      isPrimary: formData.isPrimary,
      status: editingUser ? editingUser.status : 'Active',
      invitedAt: editingUser ? editingUser.invitedAt : new Date().toISOString().split('T')[0]
    };

    saveUser(payload);
    setUsersList(getAllUsers());
    setIsModalOpen(false);
    showToast(editingUser ? 'User profile updated!' : 'New user added & access granted!');

    // Automatically inspect the newly created/edited user
    setSearchParams({ user_id: payload.user_id });
  };

  const handleDelete = (uid, e) => {
    e.stopPropagation();
    if (uid === DEFAULT_USER.user_id || uid === 'USR-001') {
      showToast('Cannot delete primary Admin account');
      return;
    }
    deleteUser(uid);
    setUsersList(getAllUsers());
    if (activeUser.user_id === uid) {
      setSearchParams({});
    }
    showToast('User removed');
  };

  const handleCopyLink = (uid) => {
    const url = `${window.location.origin}/user?user_id=${encodeURIComponent(uid)}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(uid);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Direct user access URL copied!');
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.user_id && u.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.divisionAccess && u.divisionAccess.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
        return { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' };
      case 'Customer Success':
      case 'CS':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'HR':
        return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
      case 'Business Development':
      case 'BD':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#f8fafc', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          <Link to="/home" style={{ color: '#0284c7', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: '#64748b' }}>Admin Portal</span>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>User Access & Directory</span>
        </div>

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              User Access Management
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Inspect user privileges, division accessibility, and invite corporate or CS team members.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleResetToAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: !userIdQuery ? '#eff6ff' : '#ffffff',
                color: !userIdQuery ? '#0284c7' : '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="bx bx-shield-quarter"></i>
              <span>Default Admin (Karan Hinduja)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                background: '#034ea2',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(3, 78, 162, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#023c7d')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#034ea2')}
            >
              <i className="bx bx-user-plus"></i>
              <span>Invite / Add User</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <i className="bx bx-check-circle" style={{ color: '#4ade80', fontSize: '1.2rem' }}></i>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SECTION 1: Active User Profile & Access Card (Resolved via ?user_id=...) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
            padding: '1.75rem 2rem',
            marginBottom: '2.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#034ea2', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                Active Queried User
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                URL Parameter: <code>{userIdQuery ? `?user_id=${userIdQuery}` : '(default: none specified)'}</code>
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopyLink(activeUser.user_id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <i className={copiedId === activeUser.user_id ? 'bx bx-check' : 'bx bx-copy'}></i>
              <span>{copiedId === activeUser.user_id ? 'Link Copied!' : 'Share Access URL'}</span>
            </button>
          </div>

          {/* User Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              padding: '1.25rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              alignItems: 'center'
            }}
          >
            {/* User ID */}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                User ID
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1.05rem', color: '#0f172a' }}>
                  {activeUser.user_id}
                </span>
                {activeUser.isPrimary && (
                  <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '600' }}>
                    Primary
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                Name
              </div>
              <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#0f172a' }}>
                {activeUser.name}
              </div>
            </div>

            {/* Email */}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                Email
              </div>
              <a
                href={`mailto:${activeUser.email}`}
                style={{ color: '#0284c7', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}
              >
                {activeUser.email}
              </a>
            </div>

            {/* Role */}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                Role
              </div>
              {(() => {
                const b = getRoleBadgeStyle(activeUser.role);
                return (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      background: b.bg,
                      color: b.color,
                      border: `1px solid ${b.border}`
                    }}
                  >
                    {activeUser.role}
                  </span>
                );
              })()}
            </div>

            {/* Division Access */}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
                Division Access
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  background: activeUser.divisionAccess === 'All' ? '#ecfdf5' : '#f0f9ff',
                  color: activeUser.divisionAccess === 'All' ? '#047857' : '#0369a1',
                  border: `1px solid ${activeUser.divisionAccess === 'All' ? '#a7f3d0' : '#bae6fd'}`
                }}
              >
                <i className={activeUser.divisionAccess === 'All' ? 'bx bx-check-double' : 'bx bx-buildings'}></i>
                <span>{activeUser.divisionAccess === 'All' ? 'All Divisions (Unrestricted)' : activeUser.divisionAccess}</span>
              </span>
            </div>
          </div>

          {/* Privileges Matrix Banner */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className="bx bx-check-circle" style={{ color: '#10b981' }}></i>
              <span>Financials & Orders: <strong>{activeUser.role === 'Admin' || activeUser.role === 'Business Development' ? 'Full Control' : 'View Only'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className="bx bx-check-circle" style={{ color: '#10b981' }}></i>
              <span>Customer Success Portal: <strong>{activeUser.role === 'Admin' || activeUser.role === 'Customer Success' ? 'Assigned SPOC' : 'Standard Access'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className="bx bx-check-circle" style={{ color: '#10b981' }}></i>
              <span>Session Sign-offs: <strong>{activeUser.role === 'Admin' || activeUser.role === 'HR' ? 'Authorizer' : 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        {/* SECTION 2: User Directory & Invited Members Table */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          {/* Table Controls Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                All Users & Division Members ({filteredUsers.length})
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Click any row or 'Inspect Access' to load that user's permissions via <code>?user_id=...</code>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search input */}
              <div style={{ position: 'relative', width: '240px' }}>
                <i className="bx bx-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                <input
                  type="text"
                  placeholder="Search name, email, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem 0.45rem 2rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#334155'
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Customer Success">Customer Success</option>
                <option value="HR">HR</option>
                <option value="Business Development">Business Development</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1.25rem' }}>User ID</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Division Access</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => {
                  const isCurrent = activeUser.user_id === u.user_id;
                  const b = getRoleBadgeStyle(u.role);
                  return (
                    <tr
                      key={u.user_id}
                      onClick={() => handleSelectUser(u.user_id)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        background: isCurrent ? '#f0f9ff' : '#ffffff'
                      }}
                      onMouseOver={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseOut={(e) => {
                        if (!isCurrent) e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      {/* User ID */}
                      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontWeight: '700', color: isCurrent ? '#0284c7' : '#334155' }}>
                        {u.user_id}
                      </td>

                      {/* Name */}
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: b.bg,
                              color: b.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '700'
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span>{u.name}</span>
                          {u.isPrimary && (
                            <span style={{ fontSize: '0.68rem', color: '#0369a1', background: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                              Primary
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>
                        {u.email}
                      </td>

                      {/* Role */}
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: b.bg,
                            color: b.color,
                            border: `1px solid ${b.border}`
                          }}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Division Access */}
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            background: u.divisionAccess === 'All' ? '#f0fdf4' : '#f8fafc',
                            color: u.divisionAccess === 'All' ? '#166534' : '#334155',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {u.divisionAccess}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span
                          style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            background: u.status === 'Active' ? '#dcfce7' : '#fef3c7',
                            color: u.status === 'Active' ? '#15803d' : '#b45309'
                          }}
                        >
                          ● {u.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            title="Inspect User Access"
                            onClick={() => handleSelectUser(u.user_id)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#0284c7',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => handleOpenEditModal(u)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#475569',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            <i className="bx bx-edit"></i>
                          </button>
                          {u.user_id !== 'USR-001' && (
                            <button
                              type="button"
                              title="Delete User"
                              onClick={(e) => handleDelete(u.user_id, e)}
                              style={{
                                padding: '0.3rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #fee2e2',
                                background: '#fef2f2',
                                color: '#b91c1c',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Invite / Add User Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#034ea2',
                padding: '1.25rem 1.5rem',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                  {editingUser ? 'Edit User Access' : 'Invite / Add New User'}
                </h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                  Configure role permissions and corporate division access
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  cursor: 'pointer'
                }}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. user@company.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Role <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    color: '#1e293b'
                  }}
                >
                  <option value="Customer Success">Customer Success</option>
                  <option value="HR">HR</option>
                  <option value="Business Development">Business Development</option>
                  <option value="Admin">Admin</option>
                  <option value="Account Manager">Account Manager</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.35rem' }}>
                  Division Access <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.divisionAccess}
                  onChange={(e) => setFormData({ ...formData, divisionAccess: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    color: '#1e293b'
                  }}
                >
                  <option value="All">All Divisions (Unrestricted)</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Tech">Tech</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#034ea2' }}
                />
                <label htmlFor="primaryCheck" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Mark as Primary SPOC for this role
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#034ea2',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingUser ? 'Save Changes' : 'Invite User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
