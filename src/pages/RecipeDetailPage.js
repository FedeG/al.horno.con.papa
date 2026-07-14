import React, { useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useRecipes } from '../context/RecipesContext';
import Header from '../components/Header';
import RecipeDetail from '../components/RecipeDetail';
import Footer from '../components/Footer';
import {
  findRelatedRecipes,
  scrollToTop
} from '../utils';
import {
  trackPageView
} from '../utils/analytics';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipesData } = useRecipes();
  
  const recipe = useMemo(() => {
    // Buscar por slug primero (strings), luego por ID para retrocompatibilidad
    if (isNaN(id)) {
      const normalizedId = id.toLowerCase();
      return recipesData.find(
        (r) => typeof r.slug === 'string' && r.slug.toLowerCase() === normalizedId
      );
    }
    // Si es un número, buscar por ID (para retrocompatibilidad)
    const recipeId = parseInt(id);
    return recipesData.find(r => r.id === recipeId);
  }, [id, recipesData]);

  // Track pageview cuando se carga la receta, usando el parámetro id de la URL
  // para que el page_path coincida con la ruta real del browser (slug o ID numérico legacy)
  useEffect(() => {
    if (recipe) {
      trackPageView(`/recipe/${id}/`, recipe.name);
    }
  }, [recipe, id]);

  const relatedRecipes = useMemo(() => 
    findRelatedRecipes(recipesData, recipe),
    [recipe, recipesData]
  );

  const handleSelectRecipe = useCallback((selectedRecipe) => {
    navigate(`/recipe/${selectedRecipe.slug}/`);
    scrollToTop();
  }, [navigate]);

  const handleBackToList = useCallback(() => {
    navigate('/');
    scrollToTop();
  }, [navigate]);

  const handleSearchSlug = useCallback(() => {
    const searchQuery = id.replace(/[-_]/g, ' ');
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    scrollToTop();
  }, [navigate, id]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/?tag=${encodeURIComponent(tag)}`);
    scrollToTop();
  }, [navigate]);

  if (!recipe) {
    const searchQuery = id.replace(/[-_]/g, ' ');
    return (
      <div className="app" suppressHydrationWarning>
        <Header />
        <main id="main-content" className="detail-content">
          <div className="not-found">
            <h2>Receta no encontrada</h2>
            <p>No hay ninguna receta con ese nombre. ¿Querés buscar "{searchQuery}"?</p>
            <button className="search-btn" onClick={handleSearchSlug}>
              Buscar
            </button>
          </div>
        </main>
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

export default RecipeDetailPage;
