import React from 'react';

function Home() {
  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className='bx bx-pointer' style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary)' }}></i>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-color)' }}>Welcome to MantraCare</h2>
        <p style={{ fontSize: '1.1rem' }}>Please select what you want to do from the left menu.</p>
      </div>
    </main>
  );
}

export default Home;
