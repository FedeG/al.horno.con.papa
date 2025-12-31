import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { recipesData, featuredTags } from './data/recipes';
import { Clock } from 'lucide-react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import RecipeGrid from './components/RecipeGrid';
import Pagination from './components/Pagination';
import RecipeDetail from './components/RecipeDetail';
import Footer from './components/Footer';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showEasyOnly, setShowEasyOnly] = useState(false);
  const recipesPerPage = 6;

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    recipesData.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    const featured = featuredTags.filter(tag => tag === 'All' || tags.has(tag));
    const others = Array.from(tags).filter(tag => !featuredTags.includes(tag)).sort();
    
    return [...featured, ...others];
  }, []);

  // Generate autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    
    const suggestions = new Set();
    const term = searchTerm.toLowerCase();
    
    recipesData.forEach(recipe => {
      if (recipe.name.toLowerCase().includes(term)) {
        suggestions.add(recipe.name);
      }
      recipe.ingredients.forEach(ing => {
        if (ing.toLowerCase().includes(term)) {
          suggestions.add(ing);
        }
      });
      recipe.tags.forEach(tag => {
        if (tag.toLowerCase().includes(term)) {
          suggestions.add(tag);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [searchTerm]);

  // Filter recipes based on search and tag
  const filteredRecipes = useMemo(() => {
    return recipesData.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) || 
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = selectedTag === 'All' || recipe.tags.includes(selectedTag);
      const matchesEasy = !showEasyOnly || recipe.easy;
      return matchesSearch && matchesTag && matchesEasy;
    });
  }, [searchTerm, selectedTag, showEasyOnly]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = useMemo(() => {
    const startIndex = (currentPage - 1) * recipesPerPage;
    return filteredRecipes.slice(startIndex, startIndex + recipesPerPage);
  }, [filteredRecipes, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, showEasyOnly]);

  // Get related recipes based on tags
  const getRelatedRecipes = (recipe) => {
    return recipesData
      .filter(r => r.id !== recipe.id && r.tags.some(tag => recipe.tags.includes(tag)))
      .slice(0, 3);
  };

  const handleSearchSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setShowAutocomplete(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedRecipe(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedRecipe) {
    const relatedRecipes = getRelatedRecipes(selectedRecipe);
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={handleBackToList}
        relatedRecipes={relatedRecipes}
        onSelectRecipe={handleSelectRecipe}
      />
    );
  }

  return (
    <div className="app">
      <Header />
      
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showAutocomplete={showAutocomplete}
        setShowAutocomplete={setShowAutocomplete}
        autocompleteSuggestions={autocompleteSuggestions}
        onSelectSuggestion={handleSearchSelect}
      />

      <TagFilter
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      <div className="results-header">
        <div className="results-info">
          <h2>
            {filteredRecipes.length > 0 
              ? `Hoy tenemos ${filteredRecipes.length} ideas para vos`
              : 'No encontramos recetas con esos filtros'}
          </h2>
          <button 
            className={`easy-filter-btn ${showEasyOnly ? 'active' : ''}`}
            onClick={() => setShowEasyOnly(!showEasyOnly)}
          >
            <Clock size={16} /> Solo Rápidas y Fáciles
          </button>
        </div>
      </div>

      <RecipeGrid
        recipes={paginatedRecipes}
        onSelectRecipe={handleSelectRecipe}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <Footer />
    </div>
  );
};

export default App;
