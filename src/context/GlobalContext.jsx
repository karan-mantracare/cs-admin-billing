import React, { createContext, useState, useContext, useEffect } from 'react';

const GlobalContext = createContext();

export function useGlobal() {
  return useContext(GlobalContext);
}

const defaultEvents = [];

const defaultExpenses = [];

const defaultClients = [];

export function GlobalProvider({ children }) {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('cs-admin-events');
    return saved ? JSON.parse(saved) : defaultEvents;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('cs-admin-expenses');
    return saved ? JSON.parse(saved) : defaultExpenses;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('cs-admin-clients');
    return saved ? JSON.parse(saved) : defaultClients;
  });

  useEffect(() => {
    localStorage.setItem('cs-admin-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cs-admin-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('cs-admin-clients', JSON.stringify(clients));
  }, [clients]);

  const resetData = () => {
    localStorage.removeItem('cs-admin-events');
    localStorage.removeItem('cs-admin-expenses');
    localStorage.removeItem('cs-admin-clients');
    setEvents(defaultEvents);
    setExpenses(defaultExpenses);
    setClients(defaultClients);
  };

  // Actions
  const updateEventStatus = (id, status, rejectReason = '') => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, status, rejectReason } : ev
    ));
  };

  const assignExpert = (id, expertName, cost, requestId = null) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== id) return ev;
      if (requestId && ev.expertRequests) {
        return {
          ...ev,
          status: 'event_scheduled',
          expertRequests: ev.expertRequests.map(req => 
            req.id === requestId 
              ? { ...req, assignedExpert: expertName, expertCost: cost, status: 'event_scheduled' } 
              : req
          )
        };
      }
      return { ...ev, assignedExpert: expertName, expertCost: cost, status: 'event_scheduled' };
    }));
  };

  const rejectExpertRequest = (eventId, requestId, reason) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      if (ev.expertRequests) {
        return {
          ...ev,
          expertRequests: ev.expertRequests.map(req => 
            req.id === requestId 
              ? { ...req, status: 'rejected', rejectionReason: reason } 
              : req
          )
        };
      }
      return ev;
    }));
  };

  const updateExpenseStatus = (id, status, rejectReason = '') => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status, rejectReason } : exp
    ));
  };

  const addExpense = (expenseData) => {
    setExpenses(prev => [{
      ...expenseData,
      id: Date.now(),
      status: 'Pending',
      rejectReason: ''
    }, ...prev]);
  };

  const addClient = (clientData) => {
    setClients(prev => [...prev, { ...clientData, status: 'Active', id: Date.now(), divisions: [] }]);
  };

  const updateClient = (id, updatedData) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updatedData } : client
    ));
  };

  const updateExpense = (id, updatedData) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...updatedData, status: 'Pending', rejectReason: '' } : exp
    ));
  };

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now(),
      status: eventData.status || 'pending_confirmation',
      assignedExpert: null,
      expertCost: 0,
      comments: []
    };
    setEvents([newEvent, ...events]);
  };

  const addComment = (eventId, commentData) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          comments: [commentData, ...(ev.comments || [])]
        };
      }
      return ev;
    }));
  };

  const updateEventDetails = (id, updates) => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, ...updates } : ev
    ));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const requestReschedule = (id, newDate) => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, status: 'reschedule_requested', requestedDate: newDate } : ev
    ));
  };

  const acceptReschedule = (id) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === id) {
        return { ...ev, status: 'event_scheduled', sessionDate: ev.requestedDate || ev.sessionDate, requestedDate: null };
      }
      return ev;
    }));
  };

  const requestAlternativeDate = (id) => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, status: 'date_change_requested' } : ev
    ));
  };

  const [toastMessage, setToastMessage] = useState('');
  const [toastDuration, setToastDuration] = useState(5000);

  const showToast = (message, duration = 5000) => {
    setToastMessage(message);
    setToastDuration(duration);
    setTimeout(() => {
      setToastMessage('');
    }, duration);
  };

  return (
    <GlobalContext.Provider value={{
      events,
      expenses,
      clients,
      updateEventStatus,
      assignExpert,
      rejectExpertRequest,
      updateExpenseStatus,
      addExpense,
      updateExpense,
      addEvent,
      addComment,
      updateEventDetails,
      deleteEvent,
      requestReschedule,
      acceptReschedule,
      requestAlternativeDate,
      addClient,
      updateClient,
      resetData,
      showToast
    }}>
      {children}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', background: '#1E293B', color: '#F8FAFC',
          padding: '16px 24px', borderRadius: '12px', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', zIndex: 9999, minWidth: '320px', overflow: 'hidden',
          animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <i className='bx bx-check-circle' style={{ color: '#10B981', fontSize: '1.5rem' }}></i>
            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{toastMessage}</span>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, height: '4px', background: '#6366F1',
            animation: `progressShrink ${toastDuration}ms linear forwards`
          }}></div>
        </div>
      )}
    </GlobalContext.Provider>
  );
}
