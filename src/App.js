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
import {
  extractAllTags,
  generateAutocompleteSuggestions,
  filterRecipes,
  findRelatedRecipes,
  paginateArray
} from './utils';

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
  const allTags = useMemo(() => 
    extractAllTags(recipesData, featuredTags, selectedTag),
    [selectedTag]
  );

  // Generate autocomplete suggestions (optimizado - detiene búsqueda al llegar a 5)
  const autocompleteSuggestions = useMemo(() => 
    generateAutocompleteSuggestions(inputValue, recipesData),
    [inputValue]
  );

  // Filter recipes based on search and tag
  const filteredRecipes = useMemo(() => 
    filterRecipes(recipesData, searchTerm, selectedTag, showEasyOnly),
    [searchTerm, selectedTag, showEasyOnly]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = useMemo(() => 
    paginateArray(filteredRecipes, currentPage, recipesPerPage),
    [filteredRecipes, currentPage]
  );

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

  const relatedRecipes = useMemo(() => 
    findRelatedRecipes(recipesData, recipe),
    [recipe]
  );

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
