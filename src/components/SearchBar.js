import React, { useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { trackSearchClear } from '../utils/analytics';

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  showAutocomplete, 
  setShowAutocomplete, 
  autocompleteSuggestions, 
  onSelectSuggestion 
}) => {
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
    setSearchTerm(e.target.value);
    setShowAutocomplete(true);
  }, [setSearchTerm, setShowAutocomplete]);

  const handleFocus = useCallback(() => {
    if (searchTerm) setShowAutocomplete(true);
  }, [searchTerm, setShowAutocomplete]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setShowAutocomplete(false);
    trackSearchClear();
  }, [setSearchTerm, setShowAutocomplete]);

  return (
    <div className="search-container">
      <div className="search-box-wrapper">
        <div className="search-box">
          <Search 
            size={20} 
            style={{ cursor: 'pointer' }}
            onClick={handleSearchIconClick}
          />
          <input
            type="text"
            placeholder="¿Qué ingrediente tenés en la heladera?"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />
          {searchTerm && (
            <button 
              className="clear-btn" 
              onClick={handleClear}
            >
              <X size={18} />
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
                <Search size={16} />
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
