import React, { useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { trackSearchClear } from '../utils/analytics';

const SearchBar = ({ 
  value, 
  onChange, 
  showAutocomplete, 
  setShowAutocomplete, 
  autocompleteSuggestions, 
  onSelectSuggestion 
}) => {
  const wrapperRef = useRef(null);

  // Cerrar autocomplete al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowAutocomplete]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      setShowAutocomplete(false);
    }
  }, [setShowAutocomplete]);

  const handleSuggestionClick = useCallback((suggestion) => {
    onSelectSuggestion(suggestion);
    setShowAutocomplete(false);
  }, [onSelectSuggestion, setShowAutocomplete]);

  const handleSearchIconClick = useCallback(() => {
    setShowAutocomplete(false);
  }, [setShowAutocomplete]);

  const handleInputChange = useCallback((e) => {
    onChange(e.target.value);
    setShowAutocomplete(true);
  }, [onChange, setShowAutocomplete]);

  const handleFocus = useCallback(() => {
    if (value) setShowAutocomplete(true);
  }, [value, setShowAutocomplete]);

  const handleClear = useCallback(() => {
    onChange('');
    setShowAutocomplete(false);
    trackSearchClear();
  }, [onChange, setShowAutocomplete]);

  return (
    <div className="search-container">
      <div className="search-box-wrapper" ref={wrapperRef}>
        <div className="search-box">
          <Search 
            size={20} 
            style={{ cursor: 'pointer' }}
            onClick={handleSearchIconClick}
            suppressHydrationWarning
          />
          <input
            type="text"
            placeholder="¿Qué ingrediente tenés en la heladera?"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />
          {value && (
            <button 
              className="clear-btn" 
              onClick={handleClear}
            >
              <X size={18} suppressHydrationWarning/>
            </button>
          )}
        </div>
        
        {showAutocomplete && autocompleteSuggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {autocompleteSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="autocomplete-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Search size={16} suppressHydrationWarning/>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchBar);
