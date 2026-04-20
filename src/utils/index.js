/**
 * Normaliza una cadena quitando acentos y diacríticos para búsqueda flexible
 * @param {string} str - Cadena a normalizar
 * @returns {string} Cadena normalizada sin acentos
 */
const normalizeForSearch = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

const includesNormalized = (text, search) => {
    const normalizedText = normalizeForSearch(text).replace(/ñ/g, 'n');
    const normalizedSearch = normalizeForSearch(search).replace(/ñ/g, 'n');
    return normalizedText.includes(normalizedSearch);
};

/**
 * Extrae todas las tags únicas de las recetas
 * @param {Array} recipes - Array de recetas
 * @param {Array} featuredTags - Tags destacadas para priorizar
 * @param {string} selectedTag - Tag actualmente seleccionada
 * @returns {Array} Array de tags ordenadas
 */
export const extractAllTags = (recipes, featuredTags, selectedTag) => {
    const tags = new Set();
    for (let i = 0; i < recipes.length; i++) {
        const recipeTags = recipes[i].tags;
        for (let j = 0; j < recipeTags.length; j++) {
            tags.add(recipeTags[j]);
        }
    }
    const featured = featuredTags.filter(tag => tag === 'Todas' || tags.has(tag));
    const others = Array.from(tags).filter(tag => !featuredTags.includes(tag)).sort();

    let result = [...featured, ...others];

    // Si hay una tag seleccionada que no es 'Todas', moverla a posición 1 (después de 'Todas')
    if (selectedTag !== 'Todas') {
        const tagIndex = result.indexOf(selectedTag);
        if (tagIndex > 1) {
            result.splice(tagIndex, 1);
            result.splice(1, 0, selectedTag);
        }
    }

    return result;
};

/**
 * Genera sugerencias de autocompletado basadas en el input
 * @param {string} inputValue - Texto de búsqueda
 * @param {Array} recipes - Array de recetas
 * @param {number} maxSuggestions - Número máximo de sugerencias (default: 5)
 * @returns {Array} Array de sugerencias
 */
export const generateAutocompleteSuggestions = (inputValue, recipes, maxSuggestions = 5) => {
    if (!inputValue) return [];

    const suggestions = [];
    const seen = new Set();

    // 1. Buscar en ingredientes (cleaned_ingredientes) primero
    for (let i = 0; i < recipes.length && suggestions.length < maxSuggestions; i++) {
        const ingredients = recipes[i].cleaned_ingredientes;
        for (let j = 0; j < ingredients.length && suggestions.length < maxSuggestions; j++) {
            const ing = ingredients[j];
            if (includesNormalized(ing, inputValue) && !seen.has(ing)) {
                suggestions.push(ing);
                seen.add(ing);
            }
        }
    }

    // 2. Si no llegamos al máximo, buscar en nombres
    if (suggestions.length < maxSuggestions) {
        for (let i = 0; i < recipes.length && suggestions.length < maxSuggestions; i++) {
            const name = recipes[i].name;
            if (includesNormalized(name, inputValue) && !seen.has(name)) {
                suggestions.push(name);
                seen.add(name);
            }
        }
    }

    // 3. Si aún no llegamos al máximo, buscar en tags
    if (suggestions.length < maxSuggestions) {
        for (let i = 0; i < recipes.length && suggestions.length < maxSuggestions; i++) {
            const tags = recipes[i].tags;
            for (let j = 0; j < tags.length && suggestions.length < maxSuggestions; j++) {
                const tag = tags[j];
                if (includesNormalized(tag, inputValue) && !seen.has(tag)) {
                    suggestions.push(tag);
                    seen.add(tag);
                }
            }
        }
    }

    return suggestions;
};

/**
 * Filtra recetas según búsqueda, tag y facilidad
 * @param {Array} recipes - Array de recetas
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} selectedTag - Tag seleccionada
 * @param {boolean} showEasyOnly - Mostrar solo recetas fáciles
 * @returns {Array} Array de recetas filtradas
 */
export const filterRecipes = (recipes, searchTerm, selectedTag, showEasyOnly) => {
    return recipes.filter(recipe => {
        const matchesSearch = includesNormalized(recipe.name, searchTerm) ||
            recipe.cleaned_ingredientes.some(ing => includesNormalized(ing, searchTerm)) ||
            recipe.tags.some(tag => includesNormalized(tag, searchTerm));
        const matchesTag = selectedTag === 'Todas' || recipe.tags.includes(selectedTag);
        const matchesEasy = !showEasyOnly || recipe.easy;
        return matchesSearch && matchesTag && matchesEasy;
    });
};

/**
 * Obtiene recetas relacionadas usando el campo pre-computado related_recipes
 * @param {Array} recipes - Array de todas las recetas
 * @param {Object} recipe - Receta actual
 * @returns {Array} Array de recetas relacionadas completas
 */
export const findRelatedRecipes = (recipes, recipe) => {
    if (!recipe || !recipe.related_recipes) return [];
    
    const related = [];

    for (const rel of recipe.related_recipes) {
        const found = recipes.find(r => r.id === rel.recipe_id);
        if (found) {
            related.push(found);
        }
    }

    return related;
};

/**
 * Obtiene la URL embed de Instagram
 * @param {string} url - URL de Instagram
 * @returns {string|null} URL embed o null
 */
export const getInstagramEmbedUrl = (url) => {
    if (!url) return null;
    const isReel = url.includes('/reel/');
    const isPost = url.includes('/p/');
    if (isReel || isPost) {
        return `${url}embed/`;
    }
    return null;
};

/**
 * Obtiene la URL de link de Instagram según el dispositivo
 * @param {string} instagramUrl - URL de Instagram
 * @param {string} shortcode - Shortcode del post
 * @param {boolean} isMobile - Si es dispositivo móvil
 * @returns {string|null} URL de link o null
 */
export const getInstagramLinkUrl = (instagramUrl, shortcode, isMobile) => {
    if (!instagramUrl || !shortcode) return null;
    if (isMobile) {
        return `instagram://media?id=${shortcode}`;
    }
    return instagramUrl;
};

/**
 * Obtiene la URL de perfil de Instagram según el dispositivo
 * @param {string} username - Username de Instagram (sin @)
 * @param {boolean} isMobile - Si es dispositivo móvil
 * @returns {string} URL de perfil
 */
export const getInstagramProfileUrl = (username, isMobile) => {
    if (isMobile) {
        return `instagram://user?username=${username}`;
    }
    return `https://www.instagram.com/${username}/`;
};

/**
 * Obtiene la URL de perfil de Facebook según el dispositivo
 * @param {string} username - Username de Facebook
 * @param {boolean} isMobile - Si es dispositivo móvil
 * @returns {string} URL de perfil
 */
export const getFacebookProfileUrl = (username, isMobile, pageId) => {
    if (isMobile) {
        return `fb://page/${pageId}`;
    }
    return `https://www.facebook.com/${username}/`;
};

/**
 * Pagina un array de elementos
 * @param {Array} items - Array de elementos
 * @param {number} currentPage - Página actual
 * @param {number} itemsPerPage - Elementos por página
 * @returns {Array} Array paginado
 */
export const paginateArray = (items, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
};

/**
 * Genera números de página para el paginador
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas
 * @returns {Array} Array con números de página y ellipsis
 */
export const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const delta = 1; // Páginas a mostrar alrededor de la actual

    // Siempre mostrar primera página
    pages.push(1);

    if (totalPages <= 7) {
        // Si hay pocas páginas, mostrarlas todas
        for (let i = 2; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Lógica para muchas páginas
        if (currentPage <= 3) {
            // Cerca del inicio
            for (let i = 2; i <= 4; i++) {
                pages.push(i);
            }
            pages.push('ellipsis-1');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            // Cerca del final
            pages.push('ellipsis-1');
            for (let i = totalPages - 3; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // En el medio
            pages.push('ellipsis-1');
            for (let i = currentPage - delta; i <= currentPage + delta; i++) {
                pages.push(i);
            }
            pages.push('ellipsis-2');
            pages.push(totalPages);
        }
    }

    return pages;
};
