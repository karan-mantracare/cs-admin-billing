import React, { useState, useMemo } from 'react';
import { getActivityLogs, formatLogTimestamp } from '../utils/cadenceActivityLogs';

export default function CadenceActivityLogsTab({ selectedDivision }) {
  const [logs, setLogs] = useState(() => getActivityLogs());
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh logs from storage
  const handleRefresh = () => {
    setLogs(getActivityLogs());
  };

  // Unique users for filter dropdown
  const uniqueUsers = useMemo(() => {
    const set = new Set();
    logs.forEach(l => {
      const u = l.requestedBy?.name || l.requestedBy?.email;
      if (u) set.add(u);
    });
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Division scope
      if (selectedDivision && selectedDivision.value !== 'all') {
        const divMatch = log.divisionName === selectedDivision.label || String(log.divisionId) === String(selectedDivision.value);
        if (!divMatch) return false;
      }

      // Status filter
      if (statusFilter !== 'All' && log.status !== statusFilter) return false;

      // Action type filter
      if (actionFilter !== 'All' && log.actionType !== actionFilter) return false;

      // User filter
      if (userFilter !== 'All') {
        const u = log.requestedBy?.name || log.requestedBy?.email;
        if (u !== userFilter) return false;
      }

      // Date filter
      if (dateFilter) {
        const logDateStr = log.requestedOn ? log.requestedOn.split('T')[0] : '';
        if (logDateStr !== dateFilter) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = log.meetingTitle?.toLowerCase().includes(q);
        const matchDiv = log.divisionName?.toLowerCase().includes(q) || log.corporateName?.toLowerCase().includes(q);
        const matchExec = log.executionId?.toLowerCase().includes(q);
        const matchGcal = log.calendarEventId?.toLowerCase().includes(q);
        const matchErr = log.errorMessage?.toLowerCase().includes(q);
        if (!matchTitle && !matchDiv && !matchExec && !matchGcal && !matchErr) return false;
      }

      return true;
    });
  }, [logs, selectedDivision, statusFilter, actionFilter, userFilter, dateFilter, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          icon: 'bx-check-circle',
          label: 'Success'
        };
      case 'Pending':
        return {
          bg: '#fef3c7',
          color: '#92400e',
          icon: 'bx-time-five',
          label: 'Pending'
        };
      case 'In progress':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          icon: 'bx-loader-alt bx-spin',
          label: 'In progress'
        };
      case 'Failed':
        return {
          bg: '#fee2e2',
          color: '#b91c1c',
          icon: 'bx-x-circle',
          label: 'Failed'
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          icon: 'bx-info-circle',
          label: status || 'Unknown'
        };
    }
  };

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
            Cadence Activity & Execution Audit Logs
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            Tracks meeting creation attempts, acceptance reminder dispatches, and n8n webhook execution statuses
          </p>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            padding: '0.45rem 0.85rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <i className="bx bx-refresh"></i>
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem'
        }}
      >
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
            Search Query
          </label>
          <input
            type="text"
            placeholder="Search title, execution, event..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action Type Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
            Action Type
          </label>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              background: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Actions</option>
            <option value="Meeting Creation">Meeting Creation</option>
            <option value="Acceptance Reminder">Acceptance Reminder</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              background: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="In progress">In progress</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Requested By Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
            Requested By
          </label>
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              background: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Users</option>
            {uniqueUsers.map((u, i) => (
              <option key={i} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '0.25rem' }}>
            Date
          </label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                boxSizing: 'border-box'
              }}
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                title="Clear date"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0 0.4rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Action & Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Requested On (Local)</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Requested By</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Division & Cadence</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Execution Details</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Recipients / Error</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const badge = getStatusBadge(log.status);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Action & Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                        {log.actionType}
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: badge.bg,
                          color: badge.color,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '700'
                        }}
                      >
                        <i className={`bx ${badge.icon}`}></i>
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Requested On */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {formatLogTimestamp(log.requestedOn)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }} title="UTC Storage Timestamp">
                        UTC: {log.requestedOn}
                      </div>
                    </td>

                    {/* Requested By */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {log.requestedBy?.name || 'Customer Success'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.74rem' }}>
                        {log.requestedBy?.email || 'cs-lead@mantracare.com'}
                      </div>
                    </td>

                    {/* Division & Cadence */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#0369a1' }}>
                        {log.divisionName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#334155' }}>
                        {log.meetingTitle}
                      </div>
                      {log.cadenceId && (
                        <span style={{ fontSize: '0.68rem', background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#64748b' }}>
                          ID: {log.cadenceId}
                        </span>
                      )}
                    </td>

                    {/* Execution Details */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {log.executionId ? (
                        <div>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.74rem', background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                            #{log.executionId}
                          </span>
                          <div style={{ marginTop: '0.3rem' }}>
                            <a
                              href={log.executionUrl || `https://workflows.mantracare.com/execution/${log.executionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#0284c7',
                                fontWeight: '700',
                                textDecoration: 'none',
                                fontSize: '0.74rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                            >
                              <span>Open execution</span>
                              <i className="bx bx-link-external"></i>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>No execution ID</span>
                      )}
                      {log.calendarEventId && (
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.2rem' }}>
                          GCal: <code>{log.calendarEventId.slice(0, 16)}...</code>
                        </div>
                      )}
                    </td>

                    {/* Recipients / Error */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {log.errorMessage ? (
                        <div style={{ color: '#b91c1c', fontSize: '0.74rem', fontWeight: '600', maxWidth: '240px' }}>
                          ⚠️ {log.errorMessage}
                        </div>
                      ) : (
                        <div>
                          {log.recipients && log.recipients.length > 0 ? (
                            <div style={{ fontSize: '0.74rem', color: '#334155' }}>
                              <span style={{ fontWeight: '700' }}>{log.recipients.length} Recipient(s):</span>
                              <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                {log.recipients.map(r => r.email).join(', ')}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.74rem' }}>All invitees synced</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No activity logs matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
