import React, { createContext, useState, useContext, useEffect } from 'react';

const GlobalContext = createContext();

export function useGlobal() {
  return useContext(GlobalContext);
}

const defaultEvents = [
  {
    id: 4,
    submittedOn: '2026-08-24',
    sessionName: 'Mindfulness Webinar-1',
    clientName: 'MantraCare Internal',
    sessionDate: '2026-08-25',
    sessionType: 'online',
    location: 'Google Meet',
    expertExp: 5,
    genderPref: 'no_preference',
    budget: 500,
    otherCosts: 0,
    requirements: 'Monthly mindfulness session.',
    status: 'Tentative',
    createdBy: 'CS-Karan',
    assignedExpert: null,
    expertCost: 0,
    comments: [
      { name: 'Admin', text: 'Confirmed the speaker lineup for the session.', date: '2026-08-24' },
      { name: 'John Doe', text: 'Initial marketing materials have been distributed.', date: '2026-08-19' },
      { name: 'Jane Smith', text: 'Checked the budget approval with the finance team.', date: '2026-08-14' },
      { name: 'Admin', text: 'Please ensure we have a backup expert on standby.', date: '2026-08-09' },
      { name: 'Dr. Sarah Jenkins', text: 'I am available for this webinar on the selected date.', date: '2026-08-04' },
      { name: 'MantraCare Internal', text: 'Created the initial draft for the session outline.', date: '2026-07-30' }
    ]
  }
];

const defaultExpenses = [
  {
    id: 4,
    date: '2026-08-24',
    clientName: 'MantraCare Internal',
    sessionName: 'Mindfulness Webinar-1',
    sessionDate: '2026-08-04',
    addedBy: 'Admin',
    expenseType: 'Flight',
    details: 'Flight tickets for the guest speaker',
    deliveredBy: '2026-07-20',
    amount: 450,
    status: 'Pending',
  }
];

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
      ev.id === id ? { ...ev, assignedExpert: expertName, expertCost: cost } : ev
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
      status: eventData.status || 'Pending',
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
      resetData
    }}>
      {children}
    </GlobalContext.Provider>
  );
}
