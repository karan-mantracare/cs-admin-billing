import React, { useState, useRef, useEffect } from 'react';

const OPTIONS = [
  { 
    value: 'Healthy', 
    label: 'Healthy', 
    color: '#15803d', 
    bg: '#dcfce7', 
    border: '#86efac', 
    dot: '#22c55e', 
    hoverBg: '#f0fdf4' 
  },
  { 
    value: 'Moderate', 
    label: 'Moderate', 
    color: '#b45309', 
    bg: '#fef3c7', 
    border: '#fde68a', 
    dot: '#f59e0b', 
    hoverBg: '#fffbeb' 
  },
  { 
    value: 'Risky', 
    label: 'Risky', 
    color: '#b91c1c', 
    bg: '#fee2e2', 
    border: '#fca5a5', 
    dot: '#ef4444', 
    hoverBg: '#fef2f2' 
  }
];

export default function HealthScoreDropdown({ value, onChange, openUpwards = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption = OPTIONS.find(o => o.value === value) || OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div 
      ref={dropdownRef} 
      style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.28rem 0.65rem',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: '700',
          cursor: 'pointer',
          border: `1px solid ${currentOption.border}`,
          background: currentOption.bg,
          color: currentOption.color,
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.15s ease',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(0.96)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <span 
          style={{ 
            width: '7px', 
            height: '7px', 
            borderRadius: '50%', 
            background: currentOption.dot,
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: `0 0 4px ${currentOption.dot}`
          }} 
        />
        <span>{currentOption.label}</span>
        <i 
          className="bx bx-chevron-down" 
          style={{ 
            fontSize: '0.85rem', 
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(openUpwards 
              ? { bottom: 'calc(100% + 5px)' } 
              : { top: 'calc(100% + 5px)' }),
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '130px',
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            padding: '4px',
            zIndex: 1000,
            animation: 'dropdownFadeIn 0.15s ease-out'
          }}
        >
          {OPTIONS.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: opt.color,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                  background: isSelected ? opt.hoverBg : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = opt.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected ? opt.hoverBg : 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span 
                    style={{ 
                      width: '7px', 
                      height: '7px', 
                      borderRadius: '50%', 
                      background: opt.dot,
                      display: 'inline-block',
                      flexShrink: 0
                    }} 
                  />
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <i className="bx bx-check" style={{ fontSize: '1.05rem', color: opt.color, fontWeight: 'bold' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
