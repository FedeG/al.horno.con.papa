import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

const RecipeList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'Todas');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showEasyOnly, setShowEasyOnly] = useState(searchParams.get('easy') === 'true');
  const isInitialLoad = useRef(true);
  const recipesPerPage = 6;

  // Debouncing effect para searchTerm
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Extract all unique tags (optimizado - solo se ejecuta una vez)
  const allTags = useMemo(() => {
    const tags = new Set();
    for (let i = 0; i < recipesData.length; i++) {
      const recipeTags = recipesData[i].tags;
      for (let j = 0; j < recipeTags.length; j++) {
        tags.add(recipeTags[j]);
      }
    }
    const featured = featuredTags.filter(tag => tag === 'Todas' || tags.has(tag));
    const others = Array.from(tags).filter(tag => !featuredTags.includes(tag)).sort();
    
    let result = [...featured, ...others];
    
    // If there's a selected tag that's not 'Todas', move it to position 1 (after 'Todas')
    if (selectedTag !== 'Todas') {
      const tagIndex = result.indexOf(selectedTag);
      if (tagIndex > 1) {
        result.splice(tagIndex, 1);
        result.splice(1, 0, selectedTag);
      }
    }
    
    return result;
  }, [selectedTag]);

  // Generate autocomplete suggestions (optimizado - detiene búsqueda al llegar a 5)
  const autocompleteSuggestions = useMemo(() => {
    if (!inputValue) return [];
    
    const suggestions = [];
    const seen = new Set();
    const term = inputValue.toLowerCase();
    const maxSuggestions = 5;
    
    // 1. Buscar en ingredientes primero
    for (let i = 0; i < recipesData.length && suggestions.length < maxSuggestions; i++) {
      const ingredients = recipesData[i].ingredients;
      for (let j = 0; j < ingredients.length && suggestions.length < maxSuggestions; j++) {
        const ing = ingredients[j];
        if (ing.toLowerCase().includes(term) && !seen.has(ing)) {
          suggestions.push(ing);
          seen.add(ing);
        }
      }
    }
    
    // 2. Si no llegamos a 5, buscar en nombres
    if (suggestions.length < maxSuggestions) {
      for (let i = 0; i < recipesData.length && suggestions.length < maxSuggestions; i++) {
        const name = recipesData[i].name;
        if (name.toLowerCase().includes(term) && !seen.has(name)) {
          suggestions.push(name);
          seen.add(name);
        }
      }
    }
    
    // 3. Si aún no llegamos a 5, buscar en tags
    if (suggestions.length < maxSuggestions) {
      for (let i = 0; i < recipesData.length && suggestions.length < maxSuggestions; i++) {
        const tags = recipesData[i].tags;
        for (let j = 0; j < tags.length && suggestions.length < maxSuggestions; j++) {
          const tag = tags[j];
          if (tag.toLowerCase().includes(term) && !seen.has(tag)) {
            suggestions.push(tag);
            seen.add(tag);
          }
        }
      }
    }
    
    return suggestions;
  }, [inputValue]);

  // Filter recipes based on search and tag
  const filteredRecipes = useMemo(() => {
    return recipesData.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) || 
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = selectedTag === 'Todas' || recipe.tags.includes(selectedTag);
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

  // Reset to page 1 when filters change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      setCurrentPage(1);
    } else {
      isInitialLoad.current = false;
    }
  }, [searchTerm, selectedTag, showEasyOnly]);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedTag !== 'Todas') params.tag = selectedTag;
    if (currentPage > 1) params.page = currentPage.toString();
    if (showEasyOnly) params.easy = 'true';
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedTag, currentPage, showEasyOnly, setSearchParams]);

  const handleSearchSelect = useCallback((suggestion) => {
    setInputValue(suggestion);
    setSearchTerm(suggestion);
    setShowAutocomplete(false);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setInputValue(value);
    setShowAutocomplete(true);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handleSelectRecipe = useCallback((recipe) => {
    navigate(`/recipe/${recipe.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  return (
    <div className="app">
      <Header />
      
      <SearchBar
        searchTerm={inputValue}
        setSearchTerm={handleSearchChange}
        showAutocomplete={showAutocomplete}
        setShowAutocomplete={setShowAutocomplete}
        autocompleteSuggestions={autocompleteSuggestions}
        onSelectSuggestion={handleSearchSelect}
      />

      <TagFilter
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        featuredTags={featuredTags}
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

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipeId = parseInt(id);
  
  const recipe = useMemo(() => 
    recipesData.find(r => r.id === recipeId),
    [recipeId]
  );

  const relatedRecipes = useMemo(() => {
    if (!recipe) return [];
    const related = [];
    const recipeTags = new Set(recipe.tags);
    
    for (let i = 0; i < recipesData.length && related.length < 3; i++) {
      const r = recipesData[i];
      if (r.id !== recipe.id) {
        for (let j = 0; j < r.tags.length; j++) {
          if (recipeTags.has(r.tags[j])) {
            related.push(r);
            break;
          }
        }
      }
    }
    return related;
  }, [recipe]);

  const handleSelectRecipe = useCallback((recipe) => {
    navigate(`/recipe/${recipe.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const handleBackToList = useCallback(() => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/?tag=${encodeURIComponent(tag)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  if (!recipe) {
    return (
      <div className="app">
        <Header />
        <div className="detail-content">
          <h2>Receta no encontrada</h2>
          <button onClick={handleBackToList}>Volver al inicio</button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <RecipeDetail
      recipe={recipe}
      onBack={handleBackToList}
      relatedRecipes={relatedRecipes}
      onSelectRecipe={handleSelectRecipe}
      onTagClick={handleTagClick}
    />
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RecipeList />} />
      <Route path="/recipe/:id" element={<RecipeDetailPage />} />
    </Routes>
  );
};

export default App;
