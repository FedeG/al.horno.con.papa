import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { trackSearchClear } from '../utils/analytics';

const LISTBOX_ID = 'autocomplete-listbox';

const SearchBar = ({ 
  value, 
  onChange, 
  showAutocomplete, 
  setShowAutocomplete, 
  autocompleteSuggestions, 
  onSelectSuggestion 
}) => {
  const wrapperRef = useRef(null);
  const listboxRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [autocompleteSuggestions]);

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

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('.autocomplete-item');
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback((e) => {
    if (!showAutocomplete || autocompleteSuggestions.length === 0) {
      if (e.key === 'Enter') {
        setShowAutocomplete(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev =>
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          onSelectSuggestion(autocompleteSuggestions[activeIndex]);
        }
        setShowAutocomplete(false);
        break;
      case 'Escape':
        setShowAutocomplete(false);
        break;
      default:
        break;
    }
  }, [showAutocomplete, autocompleteSuggestions, activeIndex, onSelectSuggestion, setShowAutocomplete]);

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
            role="combobox"
            aria-expanded={showAutocomplete && autocompleteSuggestions.length > 0}
            aria-haspopup="listbox"
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeIndex >= 0 ? `${LISTBOX_ID}-option-${activeIndex}` : undefined}
            aria-autocomplete="list"
          />
          {value && (
            <button 
              className="clear-btn" 
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              <X size={18} suppressHydrationWarning/>
            </button>
          )}
        </div>
        
        {showAutocomplete && autocompleteSuggestions.length > 0 && (
          <div 
            className="autocomplete-dropdown"
            id={LISTBOX_ID}
            role="listbox"
            aria-label="Sugerencias de búsqueda"
            ref={listboxRef}
          >
            {autocompleteSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`autocomplete-item${index === activeIndex ? ' autocomplete-item--active' : ''}`}
                role="option"
                id={`${LISTBOX_ID}-option-${index}`}
                aria-selected={index === activeIndex}
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
