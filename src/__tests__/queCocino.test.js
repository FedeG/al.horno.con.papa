import {
  normalize,
  ingredientsOptions,
  matchRecipes,
  randomRecipe,
} from '../utils/queCocino';

const recipes = [
  {
    id: 1,
    slug: 'torta',
    name: 'Torta',
    cleaned_ingredientes: ['harina', 'azúcar', 'huevo'],
  },
  {
    id: 2,
    slug: 'pan',
    name: 'Pan',
    cleaned_ingredientes: ['harina', 'agua', 'levadura'],
  },
  {
    id: 3,
    slug: 'budin',
    name: 'Budín',
    cleaned_ingredientes: ['harina', 'azúcar', 'manteca', 'leche'],
  },
  { id: 4, slug: 'sin-lista', name: 'Sin lista' }, // sin cleaned_ingredientes
];

describe('normalize', () => {
  it('normaliza mayúsculas y espacios', () => {
    expect(normalize('  Harina  ')).toBe('harina');
  });
});

describe('ingredientsOptions', () => {
  it('devuelve la unión única y ordenada', () => {
    expect(ingredientsOptions(recipes)).toEqual([
      'agua',
      'azúcar',
      'harina',
      'huevo',
      'leche',
      'levadura',
      'manteca',
    ]);
  });
});

describe('matchRecipes', () => {
  it('matchea recetas que contienen todos los "tengo"', () => {
    const r = matchRecipes(recipes, ['harina', 'azúcar'], []);
    expect(r.map((x) => x.recipe.slug)).toEqual(['torta', 'budin']);
  });

  it('excluye recetas con ingredientes de "noTengo"', () => {
    const r = matchRecipes(recipes, ['harina'], ['levadura']);
    expect(r.map((x) => x.recipe.slug)).toEqual(['torta', 'budin']);
  });

  it('ranking: más matches primero, menos extras después', () => {
    const r = matchRecipes(recipes, ['harina', 'azúcar'], []);
    // torta: 2 matches, 1 extra (huevo) — budín: 2 matches, 2 extras
    expect(r[0].recipe.slug).toBe('torta');
    expect(r[1].recipe.slug).toBe('budin');
  });

  it('devuelve matched/extra por receta', () => {
    const r = matchRecipes(recipes, ['harina'], []);
    const pan = r.find((x) => x.recipe.slug === 'pan');
    expect(pan.matched).toEqual(['harina']);
    expect(pan.extra).toEqual(['agua', 'levadura']);
    expect(pan.missing).toEqual([]);
  });

  it('sin "tengo": matchea todas (orden original), excluyendo noTengo', () => {
    const r = matchRecipes(recipes, [], []);
    expect(r.map((x) => x.recipe.slug)).toEqual(['torta', 'pan', 'budin']);
  });

  it('nunca incluye recetas sin cleaned_ingredientes', () => {
    const r = matchRecipes(recipes, [], []);
    expect(r.some((x) => x.recipe.slug === 'sin-lista')).toBe(false);
  });

  it('ignora ingredientes fuera del set', () => {
    const r = matchRecipes(recipes, ['no-existe'], []);
    expect(r).toEqual([]);
  });

  it('es case-insensitive', () => {
    const r = matchRecipes(recipes, ['HARINA'], []);
    expect(r.length).toBe(3);
  });
});

describe('randomRecipe', () => {
  it('devuelve una receta de los resultados filtrados', () => {
    const results = matchRecipes(recipes, ['harina'], []);
    const r = randomRecipe(results);
    expect(['torta', 'pan', 'budin']).toContain(r.recipe.slug);
  });

  it('devuelve null sin resultados', () => {
    expect(randomRecipe([])).toBeNull();
    expect(randomRecipe(null)).toBeNull();
  });
});