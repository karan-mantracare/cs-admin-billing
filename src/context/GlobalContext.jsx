import React, { createContext, useState, useContext, useEffect } from 'react';

const GlobalContext = createContext();

export function useGlobal() {
  return useContext(GlobalContext);
}

const defaultEvents = [];

const defaultExpenses = [];

export function GlobalProvider({ children }) {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('cs-admin-events');
    return saved ? JSON.parse(saved) : defaultEvents;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('cs-admin-expenses');
    return saved ? JSON.parse(saved) : defaultExpenses;
  });

  useEffect(() => {
    localStorage.setItem('cs-admin-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cs-admin-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const resetData = () => {
    localStorage.removeItem('cs-admin-events');
    localStorage.removeItem('cs-admin-expenses');
    setEvents(defaultEvents);
    setExpenses(defaultExpenses);
  };

  // Actions
  const updateEventStatus = (id, status, rejectReason = '') => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, status, rejectReason } : ev
    ));
  };

  const assignExpert = (id, expertName, cost) => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, assignedExpert: expertName, expertCost: cost, status: 'event_scheduled' } : ev
    ));
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

  return (
    <GlobalContext.Provider value={{
      events,
      expenses,
      updateEventStatus,
      assignExpert,
      updateExpenseStatus,
      addExpense,
      addEvent,
      addComment,
      updateEventDetails,
      deleteEvent,
      requestReschedule,
      acceptReschedule,
      requestAlternativeDate,
      resetData
    }}>
      {children}
    </GlobalContext.Provider>
  );
}
