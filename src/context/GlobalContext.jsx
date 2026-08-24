import React, { createContext, useState, useContext } from 'react';

const GlobalContext = createContext();

export function useGlobal() {
  return useContext(GlobalContext);
}

export function GlobalProvider({ children }) {
  const [events, setEvents] = useState([
    {
      id: 1,
      submittedOn: '2026-08-20',
      sessionName: 'Annual Corporate Wellness',
      clientName: 'MantraCare Internal',
      sessionDate: '2026-09-15',
      sessionType: 'onsite',
      location: '123 Wellness Blvd, NY',
      expertExp: 5,
      genderPref: 'no_preference',
      budget: 1500,
      otherCosts: 200,
      requirements: 'Need a certified yoga instructor and a nutritionist for a full day onsite event.',
      status: 'Pending',
      assignedExpert: null,
      expertCost: 0
    },
    {
      id: 2,
      submittedOn: '2026-08-22',
      sessionName: 'Mental Health Workshop',
      clientName: 'Comprehensive Wellness',
      sessionDate: '2026-10-05',
      sessionType: 'online',
      location: 'Zoom',
      expertExp: 3,
      genderPref: 'female',
      budget: 800,
      otherCosts: 0,
      requirements: '1 hour virtual interactive session for 50 employees focusing on stress management.',
      status: 'Approved',
      assignedExpert: 'Dr. Sarah Jenkins',
      expertCost: 400
    },
    {
      id: 3,
      submittedOn: '2026-08-23',
      sessionName: 'Ergonomics Assessment',
      clientName: 'Tech Corp LLC',
      sessionDate: '2026-11-10',
      sessionType: 'onsite',
      location: 'Tech Park, SF',
      expertExp: 7,
      genderPref: 'no_preference',
      budget: 300,
      otherCosts: 50,
      requirements: 'Quick walkthrough of office setups.',
      status: 'Rejected',
      assignedExpert: null,
      expertCost: 0
    },
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
      status: 'Approved',
      assignedExpert: null,
      expertCost: 0
    }
  ]);

  const [expenses, setExpenses] = useState([
    {
      id: 4,
      date: '2026-08-24',
      clientName: 'MantraCare Internal',
      sessionName: 'Mindfulness Webinar-1',
      sessionDate: '2026-08-04', // Using a different date to match original mock but linking it
      addedBy: 'Admin',
      expenseType: 'Flight',
      details: 'Flight tickets for the guest speaker',
      deliveredBy: '2026-07-20',
      amount: 450,
      status: 'Pending',
      rejectReason: ''
    },
    {
      id: 1,
      date: '2026-08-20',
      clientName: 'MantraCare Internal',
      sessionName: 'Annual Corporate Wellness',
      sessionDate: '2026-09-15',
      addedBy: 'John Doe',
      expenseType: 'Standee',
      details: 'Two standees for the wellness fair',
      deliveredBy: '2026-09-01',
      amount: 150,
      status: 'Pending',
      rejectReason: ''
    },
    {
      id: 2,
      date: '2026-08-22',
      clientName: 'Comprehensive Wellness',
      sessionName: 'Mental Health Workshop',
      sessionDate: '2026-10-05',
      addedBy: 'Jane Smith',
      expenseType: 'Goodies',
      details: 'Custom branded stress balls for attendees',
      deliveredBy: '2026-09-10',
      amount: 300,
      status: 'Approved',
      rejectReason: ''
    },
    {
      id: 3,
      date: '2026-08-23',
      clientName: 'Tech Corp LLC',
      sessionName: 'Ergonomics Assessment',
      sessionDate: '2026-11-10',
      addedBy: 'Mike Johnson',
      expenseType: 'Eatables',
      details: 'Catering sandwiches and snacks for the workshop',
      deliveredBy: '2026-08-25',
      amount: 450,
      status: 'Rejected',
      rejectReason: 'Over budget.'
    }
  ]);

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
    setEvents(prev => [{
      ...eventData,
      id: Date.now(),
      status: 'Pending',
      rejectReason: '',
      assignedExpert: null,
      expertCost: 0
    }, ...prev]);
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
      updateEventDetails
    }}>
      {children}
    </GlobalContext.Provider>
  );
}
