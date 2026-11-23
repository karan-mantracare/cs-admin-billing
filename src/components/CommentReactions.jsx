import React, { useState, useRef, useEffect } from 'react';

const POPULAR_EMOJIS = ['👍', '❤️', '✅', '👀', '🚀', '👏'];

export default function CommentReactions({ reactions = {}, onToggleReaction, currentUserName = 'Karan Hinduja', align = 'left' }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const activeReactions = Object.entries(reactions || {}).filter(([_, users]) => Array.isArray(users) && users.length > 0);

  return (
    <div 
      ref={pickerRef}
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '0.35rem',
        marginTop: '0.35rem'
      }}
    >
      {/* Existing Reaction Badges */}
      {activeReactions.map(([emoji, users]) => {
        const hasReacted = users.includes(currentUserName);
        return (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReaction(emoji);
            }}
            title={`Reacted by: ${users.join(', ')}`}
            style={{
              background: hasReacted ? '#e0e7ff' : '#f1f5f9',
              border: `1px solid ${hasReacted ? '#818cf8' : '#e2e8f0'}`,
              borderRadius: '999px',
              padding: '0.12rem 0.5rem',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              color: hasReacted ? '#3730a3' : '#475569',
              fontWeight: hasReacted ? '700' : '500',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        );
      })}

      {/* Add Reaction Button (+ smiley) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(prev => !prev);
        }}
        title="Add a reaction"
        style={{
          background: showPicker ? '#e2e8f0' : 'transparent',
          border: '1px solid transparent',
          borderRadius: '999px',
          padding: '0.15rem 0.4rem',
          fontSize: '0.8rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.2rem',
          cursor: 'pointer',
          color: '#64748b',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f1f5f9';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }}
        onMouseLeave={(e) => {
          if (!showPicker) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        <i className='bx bx-smile'></i>
        <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>+</span>
      </button>

      {/* Emoji Picker Popover */}
      {showPicker && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 4px)',
            left: align === 'right' ? 'auto' : 0,
            right: align === 'right' ? 0 : 'auto',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '0.25rem 0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {POPULAR_EMOJIS.map((emoji) => {
            const users = reactions?.[emoji] || [];
            const hasReacted = users.includes(currentUserName);
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggleReaction(emoji);
                  setShowPicker(false);
                }}
                style={{
                  background: hasReacted ? '#e0e7ff' : 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.12s ease, background 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.25)';
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = hasReacted ? '#e0e7ff' : 'transparent';
                }}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
