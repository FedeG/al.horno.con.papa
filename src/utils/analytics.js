// Google Analytics utility functions usando react-ga4
import ReactGA from 'react-ga4';

// Inicializar Google Analytics
export const initGA = () => {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID no configurado');
    return;
  }

  ReactGA.initialize(measurementId, {
    gtagOptions: {
      send_page_view: false, // Lo manejamos manualmente con SPA
    }
  });
};

// Track pageview
export const trackPageView = (path, title) => {
  ReactGA.send({ 
    hitType: 'pageview', 
    page: path, 
    title: title 
  });
};

// Track eventos personalizados
export const trackEvent = (eventName, eventParams = {}) => {
  ReactGA.event(eventName, eventParams);
};

// Eventos específicos del proyecto

// 1. Búsqueda
export const trackSearch = (searchTerm, resultsCount) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// 2. Autocompletado seleccionado
export const trackAutocompleteSelection = (suggestion, searchType) => {
  trackEvent('autocomplete_select', {
    suggestion: suggestion,
    search_type: searchType, // 'ingredient', 'recipe', 'tag'
  });
};

// 3. Click en tag/filtro
export const trackTagClick = (tag, isFiltered) => {
  trackEvent('tag_click', {
    tag_name: tag,
    is_filtered: isFiltered,
  });
};

// 4. Filtro rápido (Easy filter)
export const trackEasyFilterToggle = (isEnabled) => {
  trackEvent('easy_filter_toggle', {
    is_enabled: isEnabled,
  });
};

// 5. Ver receta
export const trackRecipeView = (recipeId, recipeName) => {
  trackEvent('view_item', {
    item_id: recipeId,
    item_name: recipeName,
    content_type: 'recipe',
  });
};

// 6. Click en receta relacionada
export const trackRelatedRecipeClick = (fromRecipeId, toRecipeId, toRecipeName) => {
  trackEvent('related_recipe_click', {
    from_recipe_id: fromRecipeId,
    to_recipe_id: toRecipeId,
    to_recipe_name: toRecipeName,
  });
};

// 7. Click en redes sociales
export const trackSocialClick = (platform, recipeId, recipeName) => {
  trackEvent('social_click', {
    platform: platform, // 'instagram', 'facebook'
    recipe_id: recipeId,
    recipe_name: recipeName,
  });
};

// 8. Scroll en tags
export const trackTagScroll = (direction) => {
  trackEvent('tag_scroll', {
    direction: direction, // 'left', 'right'
  });
};

// 9. Paginación
export const trackPagination = (pageNumber, totalPages) => {
  trackEvent('pagination', {
    page_number: pageNumber,
    total_pages: totalPages,
  });
};

// 10. Clear search
export const trackSearchClear = () => {
  trackEvent('search_clear');
};

// 11. Click en tag desde detalle de receta
export const trackTagClickFromDetail = (tag, recipeId) => {
  trackEvent('tag_click_from_detail', {
    tag_name: tag,
    recipe_id: recipeId,
  });
};

// 12. Video embed load
export const trackVideoEmbed = (recipeId, recipeName) => {
  trackEvent('video_embed_load', {
    recipe_id: recipeId,
    recipe_name: recipeName,
  });
};
