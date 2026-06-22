import {
  extractAllTags,
  generateAutocompleteSuggestions,
  fuzzyFilterRecipes,
  findRelatedRecipes,
  paginateArray,
  generatePageNumbers,
  getInstagramEmbedUrl,
  getInstagramLinkUrl,
  getInstagramProfileUrl,
  getFacebookProfileUrl,
} from '../utils';

// ─── Mock data ─────────────────────────────────────────────────────────────

const recipes = [
  {
    id: 1,
    name: 'Torta de Chocolate',
    tags: ['Postre', 'Chocolate'],
    cleaned_ingredientes: ['huevos', 'harina', 'chocolate', 'azúcar'],
    easy: true,
    related_recipes: [{ recipe_id: 2 }, { recipe_id: 99 }],
  },
  {
    id: 2,
    name: 'Ensalada Verde',
    tags: ['Vegetariana', 'Ensalada'],
    cleaned_ingredientes: ['lechuga', 'tomate', 'palta'],
    easy: false,
    related_recipes: [{ recipe_id: 1 }],
  },
  {
    id: 3,
    name: 'Pan Casero',
    tags: ['Pan', 'Horneado'],
    cleaned_ingredientes: ['harina', 'levadura', 'agua', 'sal'],
    easy: true,
    related_recipes: [],
  },
];

const featuredTags = ['Todas', 'Vegetariana'];

// ─── extractAllTags ────────────────────────────────────────────────────────

describe('extractAllTags', () => {
  it('extrae tags únicas ordenadas: destacadas primero, resto alfabético', () => {
    const result = extractAllTags(recipes, featuredTags);
    expect(result).toEqual([
      'Todas',
      'Vegetariana',
      'Chocolate',
      'Ensalada',
      'Horneado',
      'Pan',
      'Postre',
    ]);
  });

  it('devuelve solo la tag "Todas" si no hay recetas', () => {
    expect(extractAllTags([], featuredTags)).toEqual(['Todas']);
  });

  it('no incluye destacadas que no existen en las recetas', () => {
    const result = extractAllTags(recipes, ['Todas', 'Inexistente']);
    expect(result).not.toContain('Inexistente');
  });
});

// ─── generateAutocompleteSuggestions ───────────────────────────────────────

describe('generateAutocompleteSuggestions', () => {
  it('sugiere ingredientes que matchean', () => {
    const result = generateAutocompleteSuggestions('hue', recipes, 5);
    expect(result).toContain('huevos');
  });

  it('sugiere nombres de recetas si no hay suficientes ingredientes', () => {
    const result = generateAutocompleteSuggestions('torta', recipes, 5);
    expect(result).toContain('Torta de Chocolate');
  });

  it('sugiere tags si es necesario', () => {
    const result = generateAutocompleteSuggestions('postre', recipes, 5);
    expect(result).toContain('Postre');
  });

  it('devuelve array vacío si input está vacío', () => {
    expect(generateAutocompleteSuggestions('', recipes)).toEqual([]);
  });

  it('respeta maxSuggestions', () => {
    const result = generateAutocompleteSuggestions('a', recipes, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('no duplica sugerencias', () => {
    const result = generateAutocompleteSuggestions('harina', recipes, 5);
    const unique = new Set(result);
    expect(result.length).toBe(unique.size);
  });
});

// ─── fuzzyFilterRecipes ────────────────────────────────────────────────────

describe('fuzzyFilterRecipes', () => {
  it('filtra por término de búsqueda en nombre', () => {
    const result = fuzzyFilterRecipes(recipes, 'torta', 'Todas', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Torta de Chocolate');
  });

  it('filtra por tag', () => {
    const result = fuzzyFilterRecipes(recipes, '', 'Vegetariana', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ensalada Verde');
  });

  it('filtra por easy', () => {
    const result = fuzzyFilterRecipes(recipes, '', 'Todas', true);
    expect(result).toHaveLength(2); // Torta + Pan
  });

  it('filtra combinando tag + easy', () => {
    const result = fuzzyFilterRecipes(recipes, '', 'Vegetariana', true);
    expect(result).toHaveLength(0); // Ensalada no es easy
  });

  it('filtra por ingrediente', () => {
    const result = fuzzyFilterRecipes(recipes, 'palta', 'Todas', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ensalada Verde');
  });

  it('filtra por tag en búsqueda', () => {
    const result = fuzzyFilterRecipes(recipes, 'Postre', 'Todas', false);
    expect(result).toHaveLength(1);
  });

  it('devuelve todas las recetas si no hay filtros', () => {
    const result = fuzzyFilterRecipes(recipes, '', 'Todas', false);
    expect(result).toHaveLength(3);
  });

  it('devuelve vacío si ningún filtro matchea', () => {
    const result = fuzzyFilterRecipes(recipes, 'nadaquematchee', 'Todas', false);
    expect(result).toHaveLength(0);
  });

  // ── Fuzzy thresholds y edge cases ────────────────────────────────────

  it('tolera errores tipográficos leves en nombres (Fuse.js)', () => {
    const result = fuzzyFilterRecipes(recipes, 'chocolat', 'Todas', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Torta de Chocolate');
  });

  it('normaliza acentos en la búsqueda (azucar → azúcar)', () => {
    const result = fuzzyFilterRecipes(recipes, 'azucar', 'Todas', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Torta de Chocolate');
  });

  it('requiere intersección de múltiples tokens significativos', () => {
    // "chocolate" → [Torta], "tomate" → [Ensalada], intersección = []
    const result = fuzzyFilterRecipes(recipes, 'chocolate tomate', 'Todas', false);
    expect(result).toHaveLength(0);
  });

  it('intersecta tokens que matchean en distintos campos', () => {
    // "chocolate" (nombre/ingrediente) + "huevos" (ingrediente) → Torta
    const result = fuzzyFilterRecipes(recipes, 'chocolate huevos', 'Todas', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Torta de Chocolate');
  });

  it('filtra stopwords antes de buscar', () => {
    // "de" y "y" son stopwords → solo "ensalada" es significativo
    const result = fuzzyFilterRecipes(recipes, 'de y ensalada', 'Todas', false);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ensalada Verde');
  });

  it('fallback a substring matching si todos los tokens son stopwords', () => {
    // "de" y "la" son stopwords → fallback a includesNormalized (OR por token)
    const result = fuzzyFilterRecipes(recipes, 'de la', 'Todas', false);
    // "de" matchea nombre "Torta de Chocolate", "la" matchea "Ensalada" entre otros
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('tokens de largo 2 son significativos (≥ 2 chars)', () => {
    // "pa" → matchea "Pan Casero" y "palta" (ingrediente de Ensalada Verde)
    const result = fuzzyFilterRecipes(recipes, 'pa', 'Todas', false);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('tokens de largo 1 usan fallback de substring', () => {
    // "a" → largo 1, no es significativo → fallback a includesNormalized
    const result = fuzzyFilterRecipes(recipes, 'a', 'Todas', false);
    // "a" aparece como substring en varios nombres e ingredientes
    expect(result.length).toBeGreaterThan(0);
  });

  it('aplica threshold dinámico según largo del token', () => {
    // Token corto "tv" (largo 2, threshold ≈ 0.135, más exacto)
    // Token largo "chocolate" (largo 9, threshold ≈ 0.38, más permisivo)
    const result = fuzzyFilterRecipes(recipes, 'tv chocolate', 'Todas', false);
    // ningún recipe tiene "tv", así que intersección vacía (o fallback)
    expect(result).toHaveLength(0);
  });
});

// ─── findRelatedRecipes ────────────────────────────────────────────────────

describe('findRelatedRecipes', () => {
  it('encuentra recetas relacionadas por ID', () => {
    const result = findRelatedRecipes(recipes, recipes[0]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Ensalada Verde');
  });

  it('salta IDs que no existen en la lista', () => {
    const result = findRelatedRecipes(recipes, recipes[0]);
    expect(result.find(r => r.id === 99)).toBeUndefined();
  });

  it('devuelve array vacío si no hay related_recipes', () => {
    expect(findRelatedRecipes(recipes, {})).toEqual([]);
  });

  it('devuelve array vacío si related_recipes es null', () => {
    expect(findRelatedRecipes(recipes, { related_recipes: null })).toEqual([]);
  });
});

// ─── paginateArray ─────────────────────────────────────────────────────────

describe('paginateArray', () => {
  it('devuelve los items de la página solicitada', () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginateArray(items, 1, 2)).toEqual([1, 2]);
    expect(paginateArray(items, 2, 2)).toEqual([3, 4]);
    expect(paginateArray(items, 3, 2)).toEqual([5]);
  });

  it('devuelve vacío si la página está fuera de rango', () => {
    expect(paginateArray([1, 2], 5, 2)).toEqual([]);
  });
});

// ─── generatePageNumbers ───────────────────────────────────────────────────

describe('generatePageNumbers', () => {
  it('muestra todas las páginas si son <= 7', () => {
    expect(generatePageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('usa elipsis para muchas páginas cerca del inicio', () => {
    const result = generatePageNumbers(1, 10);
    expect(result).toEqual([1, 2, 3, 4, 'ellipsis-1', 10]);
  });

  it('usa elipsis cerca del final', () => {
    const result = generatePageNumbers(10, 10);
    expect(result).toEqual([1, 'ellipsis-1', 7, 8, 9, 10]);
  });

  it('usa doble elipsis en el medio', () => {
    const result = generatePageNumbers(5, 10);
    expect(result).toContain('ellipsis-1');
    expect(result).toContain('ellipsis-2');
  });
});

// ─── getInstagramEmbedUrl ──────────────────────────────────────────────────

describe('getInstagramEmbedUrl', () => {
  it('devuelve embed URL para reels', () => {
    expect(getInstagramEmbedUrl('https://instagram.com/reel/abc123/'))
      .toBe('https://instagram.com/reel/abc123/embed/');
  });

  it('devuelve embed URL para posts', () => {
    expect(getInstagramEmbedUrl('https://instagram.com/p/abc123/'))
      .toBe('https://instagram.com/p/abc123/embed/');
  });

  it('devuelve null para URLs no soportadas', () => {
    expect(getInstagramEmbedUrl('https://example.com')).toBeNull();
  });

  it('devuelve null para input vacío', () => {
    expect(getInstagramEmbedUrl('')).toBeNull();
    expect(getInstagramEmbedUrl(null)).toBeNull();
  });
});

// ─── getInstagramLinkUrl ───────────────────────────────────────────────────

describe('getInstagramLinkUrl', () => {
  it('devuelve deep link en mobile', () => {
    expect(getInstagramLinkUrl('https://instagram.com/p/abc/', 'abc', true))
      .toBe('instagram://media?id=abc');
  });

  it('devuelve URL normal en desktop', () => {
    expect(getInstagramLinkUrl('https://instagram.com/p/abc/', 'abc', false))
      .toBe('https://instagram.com/p/abc/');
  });

  it('devuelve null sin parámetros', () => {
    expect(getInstagramLinkUrl('', '', false)).toBeNull();
    expect(getInstagramLinkUrl(null, null, false)).toBeNull();
  });
});

// ─── getInstagramProfileUrl ────────────────────────────────────────────────

describe('getInstagramProfileUrl', () => {
  it('devuelve deep link en mobile', () => {
    expect(getInstagramProfileUrl('testuser', true))
      .toBe('instagram://user?username=testuser');
  });

  it('devuelve URL web en desktop', () => {
    expect(getInstagramProfileUrl('testuser', false))
      .toBe('https://www.instagram.com/testuser/');
  });
});

// ─── getFacebookProfileUrl ─────────────────────────────────────────────────

describe('getFacebookProfileUrl', () => {
  it('devuelve deep link en mobile', () => {
    expect(getFacebookProfileUrl('username', 'pageId', true))
      .toBe('fb://page/pageId');
  });

  it('devuelve URL web en desktop', () => {
    expect(getFacebookProfileUrl('username', 'pageId', false))
      .toBe('https://www.facebook.com/username/');
  });
});
