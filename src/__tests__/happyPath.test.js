import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import RecipeList from '../pages/RecipeList';
import RecipeDetailPage from '../pages/RecipeDetailPage';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../utils/analytics', () => ({
  trackPageView: jest.fn(),
  trackSearch: jest.fn(),
  trackTagClick: jest.fn(),
  trackEasyFilterToggle: jest.fn(),
  trackPagination: jest.fn(),
  trackAutocompleteSelection: jest.fn(),
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
    name: 'Torta de Chocolate',
    slug: 'torta-de-chocolate',
    description: 'Una torta húmeda y esponjosa de chocolate.',
    tags: ['Postre', 'Chocolate'],
    ingredients: ['harina', 'huevos', 'chocolate', 'azúcar'],
    cleaned_ingredientes: ['harina', 'huevos', 'chocolate', 'azúcar'],
    instagramUrl: 'https://instagram.com/reel/test123/',
    shortcode: 'test123',
    imageUrl: 'images/torta.jpg',
    facebookUrl: '',
    easy: true,
    date: '2024-01-01',
  },
  {
    id: 2,
    name: 'Ensalada Verde',
    slug: 'ensalada-verde',
    description: 'Una ensalada fresca y saludable.',
    tags: ['Vegetariano', 'Ensalada'],
    ingredients: ['lechuga', 'tomate', 'palta'],
    cleaned_ingredientes: ['lechuga', 'tomate', 'palta'],
    instagramUrl: '',
    shortcode: '',
    imageUrl: 'images/ensalada.jpg',
    facebookUrl: '',
    easy: false,
    date: '2024-01-02',
  },
  {
    id: 3,
    name: 'Pan Casero',
    slug: 'pan-casero',
    description: 'Pan casero de toda la vida.',
    tags: ['Pan', 'Horneado'],
    ingredients: ['harina', 'levadura', 'agua', 'sal'],
    cleaned_ingredientes: ['harina', 'levadura', 'agua', 'sal'],
    instagramUrl: '',
    shortcode: '',
    imageUrl: 'images/pan.jpg',
    facebookUrl: '',
    easy: true,
    date: '2024-01-03',
  },
];

jest.mock('../context/RecipesContext', () => ({
  RecipesProvider: ({ children }) => children,
  useRecipes: () => ({ recipesData: mockRecipes }),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

const renderApp = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={<RecipeList />}
          />
          <Route
            path="/recipe/:id/"
            element={<RecipeDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

// ─── Happy path ────────────────────────────────────────────────────────────

describe('Flujo completo — happy path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navega del listado al detalle al clickear una tarjeta de receta', async () => {
    renderApp();

    // 1. El listado muestra las recetas
    const recipeCard = screen.getByText('Torta de Chocolate');
    expect(recipeCard).toBeInTheDocument();

    // 2. Click en la tarjeta (el card wrapper tiene role="button")
    const cardButtons = screen.getAllByRole('button');
    const cardButton = cardButtons.find(
      (btn) => btn.closest('.recipe-card') !== null
    );
    expect(cardButton).toBeTruthy();
    fireEvent.click(cardButton);

    // 3. Debería mostrar el detalle de la receta clickeada
    await waitFor(() => {
      expect(
        screen.getByText('Una torta húmeda y esponjosa de chocolate.')
      ).toBeInTheDocument();
    });

    // 4. Verificar que se vean ingredientes y tags de Torta de Chocolate
    expect(screen.getByText('chocolate')).toBeInTheDocument();
    expect(screen.getByText('Postre')).toBeInTheDocument();

    // 5. Verificar que NO se vean datos de otra receta
    expect(screen.queryByText('Ensalada Verde')).not.toBeInTheDocument();
  });

  it('navega de vuelta al listado desde el detalle con el botón "volver"', async () => {
    renderApp();

    // Click en la primera tarjeta
    const cardButtons = screen.getAllByRole('button');
    const cardButton = cardButtons.find(
      (btn) => btn.closest('.recipe-card') !== null
    );
    fireEvent.click(cardButton);

    // Esperar a que cargue el detalle
    await waitFor(() => {
      expect(
        screen.getByText('Una torta húmeda y esponjosa de chocolate.')
      ).toBeInTheDocument();
    });

    // Click en "volver"
    const backBtn = screen.getByLabelText('Volver al listado de recetas');
    fireEvent.click(backBtn);

    // Debería volver al listado con todas las recetas
    await waitFor(() => {
      expect(screen.getByText('Pan Casero')).toBeInTheDocument();
      expect(screen.getByText('Ensalada Verde')).toBeInTheDocument();
    });
  });
});
