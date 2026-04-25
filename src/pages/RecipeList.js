import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { featuredTags } from '../data/recipes';
import { useRecipes } from '../context/RecipesContext';
import { Clock } from 'lucide-react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import RecipeGrid from '../components/RecipeGrid';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import {
  extractAllTags,
  generateAutocompleteSuggestions,
  filterRecipes,
  paginateArray
} from '../utils';
import {
  trackPageView,
  trackSearch,
  trackTagClick,
  trackEasyFilterToggle,
  trackPagination,
  trackAutocompleteSelection
} from '../utils/analytics';
import { generateCollectionSchema } from '../utils/seoHelpers';

const RecipeList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { recipesData } = useRecipes();
  
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'Todas');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showEasyOnly, setShowEasyOnly] = useState(searchParams.get('easy') === 'true');
  const isInitialLoad = useRef(true);
  const recipesPerPage = 6;

  // Track pageview
  useEffect(() => {
    trackPageView('/', 'Listado de Recetas');
  }, []);

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
    [selectedTag, recipesData]
  );

  // Generate autocomplete suggestions (optimizado - detiene búsqueda al llegar a 5)
  const autocompleteSuggestions = useMemo(() => 
    generateAutocompleteSuggestions(inputValue, recipesData),
    [inputValue, recipesData]
  );

  // Filter recipes based on search and tag
  const filteredRecipes = useMemo(() => 
    filterRecipes(recipesData, searchTerm, selectedTag, showEasyOnly),
    [searchTerm, selectedTag, showEasyOnly, recipesData]
  );

  // Track search when searchTerm changes
  useEffect(() => {
    if (searchTerm && !isInitialLoad.current) {
      trackSearch(searchTerm, filteredRecipes.length);
    }
  }, [searchTerm, filteredRecipes.length]);

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

  // Sync page from URL
  useEffect(() => {
    const rawPage = parseInt(searchParams.get('page'), 10);
    const pageFromUrl = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    setCurrentPage((prevPage) => (
      prevPage === pageFromUrl ? prevPage : pageFromUrl
    ));
  }, [searchParams]);

  // Clamp current page when filtered results reduce the available pages
  useEffect(() => {
    const maxPage = totalPages > 0 ? totalPages : 1;

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, totalPages]);
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
    
    // Determinar tipo de sugerencia
    const isIngredient = recipesData.some(r => 
      r.ingredients.some(ing => ing.toLowerCase().includes(suggestion.toLowerCase()))
    );
    const isRecipe = recipesData.some(r => 
      r.name.toLowerCase().includes(suggestion.toLowerCase())
    );
    const searchType = isIngredient ? 'ingredient' : (isRecipe ? 'recipe' : 'tag');
    
    trackAutocompleteSelection(suggestion, searchType);
  }, [recipesData]);

  const handleSearchChange = useCallback((value) => {
    setInputValue(value);
    setShowAutocomplete(true);
  }, []);

  const handlePageChange = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    trackPagination(newPage, totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handleSelectRecipe = useCallback((recipe) => {
    const slugOrId = recipe.slug && recipe.slug.trim() ? recipe.slug : String(recipe.id);
    navigate(`/recipe/${slugOrId}/`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const recipeCollectionSchema = useMemo(() => 
    generateCollectionSchema(),
    []
  );

  const preloadImages = useMemo(() => 
    paginatedRecipes.slice(0, 3).map(recipe => recipe.imageUrl),
    [paginatedRecipes]
  );

  return (
    <div className="app">
      <SEO 
        title={selectedTag !== 'Todas' ? `Recetas ${selectedTag}` : undefined}
        description={selectedTag !== 'Todas' 
          ? `Descubre deliciosas recetas ${selectedTag}. Cocina en familia con Al Horno Con Papá.`
          : 'Encuentra recetas deliciosas de cocina en familia. Recetas clasicas, familiares, vegetarianas, veganas, fáciles y mucho más. ¡Cocina con amor!'}
        keywords={selectedTag !== 'Todas' ? `recetas ${selectedTag}, cocina en familia, recetas argentinas` : 'recetas cocina en familia, recetas vegetarianas, recetas veganas, recetas fáciles, cocina argentina'}
        schema={recipeCollectionSchema}
        preloadImages={preloadImages}
      />
      <Header />
      <main>
      
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
        onSelectTag={(tag) => {
          setSelectedTag(tag);
          trackTagClick(tag, tag !== 'Todas');
        }}
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
            className={['easy-filter-btn', showEasyOnly ? 'active' : ''].filter(Boolean).join(' ')}
            onClick={() => {
              const newValue = !showEasyOnly;
              setShowEasyOnly(newValue);
              trackEasyFilterToggle(newValue);
            }}
          >
            <Clock size={16} suppressHydrationWarning/> Solo Rápidas y Fáciles
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
      </main>
      <Footer />
    </div>
  );
};

export default RecipeList;
