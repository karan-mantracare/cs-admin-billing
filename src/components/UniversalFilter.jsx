import React, { useState, useEffect, useRef } from 'react';

// Default operators for field types
const getOperators = (type) => {
  if (type === 'date') return ['Between', 'Before', 'After', 'Is'];
  if (type === 'number') return ['Is', 'Greater than', 'Less than'];
  return ['Is', 'Is not', 'Contains', 'Not Contains'];
};

export default function UniversalFilter({ 
  pageName = 'All Orders',
  storageKey = 'universal_filters',
  fields = [],
  defaultFields = [],
  onApply = () => {},
  initialSearchText = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState('conditions'); // 'conditions' | 'add_field'
  
  // Array of condition objects: { id (unique), fieldId, operator, value }
  const [draftConditions, setDraftConditions] = useState([]);
  
  // The actively applied conditions (mirrors draft on search)
  const [appliedConditions, setAppliedConditions] = useState([]);
  
  const [activePreset, setActivePreset] = useState(pageName);
  
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  
  const [presets, setPresets] = useState([]);
  const [searchText, setSearchText] = useState(initialSearchText);
  
  const popoverRef = useRef(null);

  // Load presets on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setPresets(JSON.parse(saved));
    } catch(e) {}
  }, [storageKey]);

  // Load default fields initially
  useEffect(() => {
    if (draftConditions.length === 0 && activePreset === pageName) {
      loadPreset(pageName);
    }
  }, []); // eslint-disable-line

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsSavingPreset(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to load a preset (or default)
  const loadPreset = (name) => {
    setActivePreset(name);
    if (name === pageName) {
      // Default reset
      const initConds = defaultFields.map(fieldId => ({
        id: Math.random().toString(36).substr(2, 9),
        fieldId,
        operator: getOperators(fields.find(f => f.id === fieldId)?.type || 'text')[0],
        value: ''
      }));
      setDraftConditions(initConds);
      setAppliedConditions(initConds);
      onApply(initConds, searchText);
    } else {
      const found = presets.find(p => p.name === name);
      if (found) {
        setDraftConditions(found.conditions);
        setAppliedConditions(found.conditions);
        onApply(found.conditions, searchText);
      }
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPreset = { name: presetName.trim(), conditions: [...draftConditions] };
    const updated = [...presets.filter(p => p.name !== newPreset.name), newPreset];
    setPresets(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setActivePreset(newPreset.name);
    setAppliedConditions([...draftConditions]);
    setIsSavingPreset(false);
    setPresetName('');
    onApply([...draftConditions], searchText);
  };

  const handleApply = () => {
    // If we modified conditions but didn't save, we should show "Custom filter"
    let currentIsPreset = false;
    if (activePreset !== pageName && activePreset !== 'Custom filter') {
      const p = presets.find(pr => pr.name === activePreset);
      if (p && JSON.stringify(p.conditions) === JSON.stringify(draftConditions)) {
        currentIsPreset = true;
      }
    } else if (activePreset === pageName) {
      // Check if it matches default
      const defaultMatch = draftConditions.map(c => c.fieldId).sort().join(',') === defaultFields.sort().join(',');
      currentIsPreset = defaultMatch; // Simple assumption for now
    }
    
    if (!currentIsPreset) setActivePreset('Custom filter');
    
    setAppliedConditions([...draftConditions]);
    setIsOpen(false);
    onApply([...draftConditions], searchText);
  };
  
  const handleLiveSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    onApply(appliedConditions, val);
  };

  const removeAppliedCondition = (index) => {
    const newConds = [...appliedConditions];
    newConds.splice(index, 1);
    setAppliedConditions(newConds);
    setDraftConditions(newConds); // Keep draft in sync if removed from chip
    setActivePreset('Custom filter');
    onApply(newConds, searchText);
  };

  const removeDraftCondition = (index) => {
    const newConds = [...draftConditions];
    newConds.splice(index, 1);
    setDraftConditions(newConds);
  };

  const updateCondition = (index, key, value) => {
    const newConds = [...draftConditions];
    newConds[index][key] = value;
    // Reset value if operator changes to/from between
    if (key === 'operator') {
       if (value === 'Between' && !Array.isArray(newConds[index].value)) newConds[index].value = ['', ''];
       else if (value !== 'Between' && Array.isArray(newConds[index].value)) newConds[index].value = '';
    }
    setDraftConditions(newConds);
  };

  // --- Render Add Field Subview ---
  const [fieldSearch, setFieldSearch] = useState('');
  const renderAddField = () => {
    const filteredFields = fields.filter(f => f.label.toLowerCase().includes(fieldSearch.toLowerCase()));
    const activeIds = draftConditions.map(c => c.fieldId);
    
    const toggleField = (fieldId) => {
      if (activeIds.includes(fieldId)) {
        setDraftConditions(draftConditions.filter(c => c.fieldId !== fieldId));
      } else {
        setDraftConditions([...draftConditions, {
          id: Math.random().toString(36).substr(2, 9),
          fieldId,
          operator: getOperators(fields.find(f => f.id === fieldId)?.type || 'text')[0],
          value: ''
        }]);
      }
    };

    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.5px' }}>FILTER FIELD SETTINGS</h4>
          <i className='bx bx-x' style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }} onClick={() => setActiveView('conditions')}></i>
        </div>
        
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <i className='bx bx-search' style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }}></i>
          <input 
            type="text" 
            placeholder="Find field" 
            value={fieldSearch}
            onChange={(e) => setFieldSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} 
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 'max-content', gap: '0.5rem' }}>
          {filteredFields.map(f => (
            <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
              <input 
                type="checkbox" 
                checked={activeIds.includes(f.id)} 
                onChange={() => toggleField(f.id)} 
              />
              {f.label}
            </label>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#0ea5e9', fontWeight: '500' }}>
            <input 
              type="checkbox" 
              checked={activeIds.length === fields.length && fields.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  const all = fields.map(f => ({
                    id: Math.random().toString(36).substr(2, 9), fieldId: f.id, operator: getOperators(f.type || 'text')[0], value: ''
                  }));
                  setDraftConditions(all);
                } else {
                  setDraftConditions([]);
                }
              }}
            />
            select all
          </label>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => {
               const defaults = defaultFields.map(fid => ({
                 id: Math.random().toString(36).substr(2, 9), fieldId: fid, operator: getOperators(fields.find(f => f.id === fid)?.type || 'text')[0], value: ''
               }));
               setDraftConditions(defaults);
            }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem' }}>
              <i className='bx bx-refresh'></i> default
            </button>
            <button onClick={() => setActiveView('conditions')} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>CANCEL</button>
            <button onClick={() => setActiveView('conditions')} style={{ background: '#0284c7', border: '1px solid #0284c7', color: 'white', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>APPLY</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }} ref={popoverRef}>
      
      {/* Trigger Area (Search Bar) */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', 
          border: isOpen ? '1px solid #3b82f6' : '1px solid #cbd5e1', 
          borderRadius: '8px', padding: '0.4rem 0.8rem', background: 'white', 
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
          minHeight: '44px', cursor: 'text', transition: 'all 0.2s'
        }}
      >
        <i className='bx bx-search' style={{ color: '#94a3b8', fontSize: '1.2rem' }}></i>
        
        {/* Preset Chip (if not default) */}
        {activePreset && activePreset !== pageName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: '1px solid #bae6fd', color: '#0284c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
            {activePreset}
            <i className='bx bx-x' style={{ cursor: 'pointer', fontSize: '1rem' }} onClick={(e) => { e.stopPropagation(); loadPreset(pageName); }}></i>
          </div>
        )}

        {/* Individual Condition Chips */}
        {appliedConditions.map((cond, idx) => {
          const fieldDef = fields.find(f => f.id === cond.fieldId);
          if (!fieldDef || !cond.value || (Array.isArray(cond.value) && !cond.value[0])) return null;
          
          let valStr = '';
          if (cond.operator === 'Between' && Array.isArray(cond.value)) {
            valStr = `${cond.value[0] || '..'} to ${cond.value[1] || '..'}`;
          } else {
            valStr = String(cond.value || '');
          }

          return (
            <div key={cond.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>{fieldDef.label}:</span> {cond.operator.toLowerCase()} <strong>{valStr}</strong>
              <i className='bx bx-x' style={{ cursor: 'pointer', fontSize: '1rem' }} onClick={(e) => { e.stopPropagation(); removeAppliedCondition(idx); }}></i>
            </div>
          );
        })}

        <input 
          type="text" 
          placeholder="Search..." 
          value={searchText}
          onChange={handleLiveSearch}
          style={{ border: 'none', outline: 'none', flex: 1, minWidth: '150px', fontSize: '0.9rem', color: '#0f172a', background: 'transparent' }} 
        />
      </div>

      {/* Popover */}
      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '700px', background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 1000, display: 'flex', maxHeight: '500px', overflow: 'hidden' }}>
          
          {/* Left Sidebar (Saved Filters) */}
          <div style={{ width: '200px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
              SAVED FILTERS
            </div>
            <div style={{ padding: '0.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              
              {/* Top Level Item */}
              <div 
                onClick={() => loadPreset(pageName)}
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500',
                  color: activePreset === pageName ? '#0284c7' : '#475569',
                  background: activePreset === pageName ? 'white' : 'transparent',
                  border: activePreset === pageName ? '1px solid #bae6fd' : '1px solid transparent'
                }}
              >
                {pageName}
              </div>

              {/* Saved Presets */}
              {presets.map(p => (
                <div 
                  key={p.name}
                  onClick={() => loadPreset(p.name)}
                  style={{ 
                    padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginLeft: '1rem',
                    color: activePreset === p.name ? '#0284c7' : '#64748b',
                    background: activePreset === p.name ? 'white' : 'transparent',
                    border: activePreset === p.name ? '1px solid #bae6fd' : '1px solid transparent'
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Right Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {activeView === 'add_field' ? renderAddField() : (
              <>
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.5px' }}>CONDITIONS</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {draftConditions.map((cond, idx) => {
                      const fieldDef = fields.find(f => f.id === cond.fieldId);
                      if (!fieldDef) return null;
                      
                      const operators = getOperators(fieldDef.type);

                      return (
                        <div key={cond.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>{fieldDef.label}</label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select 
                              value={cond.operator}
                              onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                              style={{ width: '30%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', color: '#334155', outline: 'none', fontSize: '0.85rem' }}
                            >
                              {operators.map(op => <option key={op} value={op}>{op}</option>)}
                            </select>

                            {cond.operator === 'Between' && fieldDef.type === 'date' ? (
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="date" value={cond.value?.[0] || ''} onChange={(e) => updateCondition(idx, 'value', [e.target.value, cond.value?.[1] || ''])} style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>to</span>
                                <input type="date" value={cond.value?.[1] || ''} onChange={(e) => updateCondition(idx, 'value', [cond.value?.[0] || '', e.target.value])} style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }} />
                              </div>
                            ) : (
                              fieldDef.type === 'select' ? (
                                <select value={cond.value} onChange={(e) => updateCondition(idx, 'value', e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', color: '#334155', outline: 'none', fontSize: '0.85rem' }}>
                                  <option value="">Select...</option>
                                  {fieldDef.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : (
                                <input type={fieldDef.type === 'number' ? 'number' : 'text'} value={cond.value || ''} onChange={(e) => updateCondition(idx, 'value', e.target.value)} placeholder="Type here..." style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#334155', outline: 'none', fontSize: '0.85rem' }} />
                              )
                            )}

                            <i className='bx bx-x' style={{ color: '#94a3b8', cursor: 'pointer', padding: '0.3rem', fontSize: '1.2rem' }} onClick={() => removeDraftCondition(idx)}></i>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <button onClick={() => setActiveView('add_field')} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0', fontSize: '0.9rem' }}>
                      <i className='bx bx-plus'></i> Add field
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #e2e8f0', padding: '1rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {isSavingPreset ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="text" placeholder="Preset Name" value={presetName} onChange={e => setPresetName(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', width: '150px' }} />
                      <button onClick={savePreset} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                      <button onClick={() => setIsSavingPreset(false)} style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                    </div>
                  ) : (
                    <span onClick={() => setIsSavingPreset(true)} style={{ color: '#0ea5e9', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>
                      Save filters
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { loadPreset(pageName); setIsOpen(false); }} style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '0.4rem 1.25rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
                    <button onClick={handleApply} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 1.25rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <i className='bx bx-search'></i> Search
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
