import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ 
  searchTerm, 
  setSearchTerm, 
  showAutocomplete, 
  setShowAutocomplete, 
  autocompleteSuggestions, 
  onSelectSuggestion 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowAutocomplete(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSelectSuggestion(suggestion);
    setShowAutocomplete(false);
  };

  const handleSearchIconClick = () => {
    setShowAutocomplete(false);
  };

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => searchTerm && setShowAutocomplete(true)}
            onKeyDown={handleKeyDown}
          />
          {searchTerm && (
            <button 
              className="clear-btn" 
              onClick={() => {
                setSearchTerm('');
                setShowAutocomplete(false);
              }}
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
