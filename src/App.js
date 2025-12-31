import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'All');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showEasyOnly, setShowEasyOnly] = useState(searchParams.get('easy') === 'true');
  const isInitialLoad = useRef(true);
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
    if (selectedTag !== 'All') params.tag = selectedTag;
    if (currentPage > 1) params.page = currentPage.toString();
    if (showEasyOnly) params.easy = 'true';
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedTag, currentPage, showEasyOnly, setSearchParams]);

  const handleSearchSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setShowAutocomplete(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecipe = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = recipesData.find(r => r.id === parseInt(id));

  const getRelatedRecipes = (recipe) => {
    return recipesData
      .filter(r => r.id !== recipe.id && r.tags.some(tag => recipe.tags.includes(tag)))
      .slice(0, 3);
  };

  const handleSelectRecipe = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const relatedRecipes = getRelatedRecipes(recipe);
  
  return (
    <RecipeDetail
      recipe={recipe}
      onBack={handleBackToList}
      relatedRecipes={relatedRecipes}
      onSelectRecipe={handleSelectRecipe}
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
