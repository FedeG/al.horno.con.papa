import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import RecipeDetailPage from '../pages/RecipeDetailPage';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../utils/analytics', () => ({
  trackPageView: jest.fn(),
  trackRecipeView: jest.fn(),
  trackRelatedRecipeClick: jest.fn(),
  trackSocialClick: jest.fn(),
  trackTagClickFromDetail: jest.fn(),
  trackVideoEmbed: jest.fn(),
}));

window.scrollTo = jest.fn();

// ─── Mock data ─────────────────────────────────────────────────────────────

const mockRecipes = [
  {
    id: 1,
    slug: 'torta-de-chocolate',
    name: 'Torta de Chocolate',
    description: 'Una torta húmeda y esponjosa.',
    tags: ['Postre', 'Chocolate'],
    ingredients: ['harina', 'huevos', 'chocolate', 'azúcar'],
    cleaned_ingredientes: ['harina', 'huevos', 'chocolate', 'azúcar'],
    instagramUrl: 'https://instagram.com/reel/test123/',
    shortcode: 'test123',
    imageUrl: 'images/torta.jpg',
    facebookUrl: '',
    easy: true,
    related_recipes: [
      { recipe_id: 2, recipe_name: 'Ensalada Verde', score: 8 },
    ],
  },
  {
    id: 2,
    slug: 'ensalada-verde',
    name: 'Ensalada Verde',
    description: 'Una ensalada fresca.',
    tags: ['Vegetariana', 'Ensalada'],
    ingredients: ['lechuga', 'tomate', 'palta'],
    cleaned_ingredientes: ['lechuga', 'tomate', 'palta'],
    instagramUrl: '',
    shortcode: '',
    imageUrl: 'images/ensalada.jpg',
    facebookUrl: '',
    easy: false,
    related_recipes: [
      { recipe_id: 1, recipe_name: 'Torta de Chocolate', score: 9 },
      { recipe_id: 3, recipe_name: 'Pan Casero', score: 5 },
    ],
  },
  {
    id: 3,
    slug: 'pan-casero',
    name: 'Pan Casero',
    description: 'Pan casero de toda la vida.',
    tags: ['Pan', 'Horneado'],
    ingredients: ['harina', 'levadura', 'agua', 'sal'],
    cleaned_ingredientes: ['harina', 'levadura', 'agua', 'sal'],
    instagramUrl: '',
    shortcode: '',
    imageUrl: 'images/pan.jpg',
    facebookUrl: '',
    easy: true,
    related_recipes: [],
  },
];

jest.mock('../context/RecipesContext', () => ({
  RecipesProvider: ({ children }) => children,
  useRecipes: () => ({ recipesData: mockRecipes }),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

const renderDetailPage = (slug = 'torta-de-chocolate') =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/recipe/${slug}/`]}>
        <Routes>
          <Route path="/" element={<div data-testid="home-page" />} />
          <Route path="/recipe/:id/" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('RecipeDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Recipe found ──────────────────────────────────────────────────────

  it('muestra el nombre de la receta cuando se encuentra por slug', () => {
    renderDetailPage('torta-de-chocolate');
    expect(screen.getByText('Torta de Chocolate')).toBeInTheDocument();
  });

  it('muestra la descripción de la receta', () => {
    renderDetailPage();
    expect(screen.getByText('Una torta húmeda y esponjosa.')).toBeInTheDocument();
  });

  it('muestra la lista de ingredientes', () => {
    renderDetailPage();
    expect(screen.getByText('harina')).toBeInTheDocument();
    expect(screen.getByText('huevos')).toBeInTheDocument();
    expect(screen.getByText('chocolate')).toBeInTheDocument();
  });

  it('muestra las tags de la receta', () => {
    renderDetailPage();
    expect(screen.getByText('Postre')).toBeInTheDocument();
    expect(screen.getByText('Chocolate')).toBeInTheDocument();
  });

  it('muestra el enlace a Instagram si la receta tiene instagramUrl', () => {
    renderDetailPage('torta-de-chocolate');
    expect(screen.getByText('Ver en Instagram')).toBeInTheDocument();
  });

  it('no muestra enlace a Instagram si la receta no tiene instagramUrl', () => {
    renderDetailPage('pan-casero');
    expect(screen.queryByText('Ver en Instagram')).not.toBeInTheDocument();
  });

  it('no muestra enlace a Facebook si facebookUrl está vacío', () => {
    renderDetailPage();
    expect(screen.queryByText('Compartir en Facebook')).not.toBeInTheDocument();
  });

  // ── Related recipes ───────────────────────────────────────────────────

  it('muestra recetas relacionadas cuando existen', () => {
    renderDetailPage('torta-de-chocolate');
    expect(screen.getByText('Recetas Relacionadas')).toBeInTheDocument();
    expect(screen.getByText('Ensalada Verde')).toBeInTheDocument();
  });

  it('no muestra la sección de relacionadas si no hay', () => {
    renderDetailPage('pan-casero');
    expect(screen.queryByText('Recetas Relacionadas')).not.toBeInTheDocument();
  });

  // ── Back button ───────────────────────────────────────────────────────

  it('navega al home al clickear "volver"', () => {
    renderDetailPage();
    const backBtn = screen.getByLabelText('Volver al listado de recetas');
    fireEvent.click(backBtn);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  // ── Tag click ─────────────────────────────────────────────────────────

  it('navega a home con ?tag= al clickear una tag', () => {
    renderDetailPage('torta-de-chocolate');
    fireEvent.click(screen.getByText('Postre'));
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  // ── Recipe not found ──────────────────────────────────────────────────

  it('muestra "Receta no encontrada" cuando el slug no existe', () => {
    renderDetailPage('slug-inexistente');
    expect(screen.getByText('Receta no encontrada')).toBeInTheDocument();
  });

  it('muestra el slug formateado como texto de búsqueda en la pantalla de no encontrada', () => {
    renderDetailPage('milanesa-con-pure');
    expect(screen.getByText(/milanesa con pure/)).toBeInTheDocument();
  });

  it('navega al home con ?search= al clickear "Buscar" en no encontrada', () => {
    renderDetailPage('milanesa-con-pure');
    const searchBtn = screen.getByText('Buscar');
    fireEvent.click(searchBtn);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  // ── Slug case insensitivity ───────────────────────────────────────────

  it('encuentra la receta con slug en mayúsculas (case insensitive)', () => {
    renderDetailPage('TORTA-DE-CHOCOLATE');
    expect(screen.getByText('Torta de Chocolate')).toBeInTheDocument();
  });

  // ── Navegación por ID numérico (retrocompatibilidad) ──────────────────

  it('encuentra receta por ID numérico', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/recipe/2/']}>
          <Routes>
            <Route path="/" element={<div data-testid="home-page" />} />
            <Route path="/recipe/:id/" element={<RecipeDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(screen.getByText('Ensalada Verde')).toBeInTheDocument();
  });
});
