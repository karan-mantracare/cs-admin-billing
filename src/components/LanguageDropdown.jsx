import React, { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Mandarin Chinese",
  "Hindi", "Arabic", "Portuguese", "Russian", "Japanese",
  "Punjabi", "Korean", "Vietnamese", "Telugu", "Marathi",
  "Turkish", "Tamil", "Urdu", "Gujarati", "Polish",
  "Ukrainian", "Italian", "Malayalam", "Kannada", "Oriya",
  "Burmese", "Thai", "Amharic", "Sundanese", "Kurdish",
  "Somali", "Nepali", "Sindhi", "Sinhala", "Khmer",
  "Dutch", "Greek", "Czech", "Swedish", "Hungarian",
  "Romanian", "Finnish", "Danish", "Hebrew", "Norwegian",
  "Slovak", "Croatian", "Bulgarian", "Lithuanian", "Serbian"
].sort();

function LanguageDropdown({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredLanguages = LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="language-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <div 
        className={`form-control ${disabled ? 'disabled' : ''}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'var(--bg-light)' : 'white'
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'inherit' : '#9ca3af' }}>{value || 'Select Language'}</span>
        <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search language..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.25rem 0.5rem' }}
              autoFocus
            />
          </div>
          <ul style={{ 
            listStyle: 'none', 
            margin: 0, 
            padding: 0, 
            maxHeight: '245px', // about 7 items (assuming ~35px per item)
            overflowY: 'auto' 
          }}>
            {filteredLanguages.length > 0 ? filteredLanguages.map(lang => (
              <li 
                key={lang}
                onClick={() => {
                  onChange(lang);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  background: value === lang ? 'var(--primary-light)' : 'transparent',
                  color: value === lang ? 'var(--primary)' : 'inherit',
                  borderBottom: '1px solid #f1f5f9'
                }}
                onMouseEnter={(e) => {
                  if (value !== lang) e.target.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (value !== lang) e.target.style.background = 'transparent';
                }}
              >
                {lang}
              </li>
            )) : (
              <li style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>No languages found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LanguageDropdown;
