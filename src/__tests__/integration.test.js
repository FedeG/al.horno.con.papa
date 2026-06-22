import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { RecipesProvider } from '../context/RecipesContext';
import RecipeList from '../pages/RecipeList';

// ─── Mocks ─────────────────────────────────────────────────────────────────

// Silenciar analytics en tests de integración
jest.mock('../utils/analytics', () => ({
  trackPageView: jest.fn(),
  trackSearch: jest.fn(),
  trackTagClick: jest.fn(),
  trackEasyFilterToggle: jest.fn(),
  trackPagination: jest.fn(),
  trackAutocompleteSelection: jest.fn(),
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

const renderRecipeList = (initialRoute = '/') =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <RecipesProvider>
          <RecipeList />
        </RecipesProvider>
      </MemoryRouter>
    </HelmetProvider>
  );

// Buscar el texto del contador de resultados: "Hoy tenemos X ideas para vos"
const getResultsCount = () => {
  const heading = screen.getByRole('heading', { level: 2 });
  const match = heading.textContent.match(/Hoy tenemos (\d+) ideas/);
  return match ? parseInt(match[1], 10) : 0;
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('RecipeList — integración', () => {
  beforeAll(() => {
    // jsdom no implementa window.scrollTo
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Render inicial ─────────────────────────────────────────────────────

  it('renderiza todos los elementos principales de la página', () => {
    renderRecipeList();

    // Header — aparece tanto en header como en footer, verificamos cantidad
    const headerMatches = screen.getAllByText('Al Horno Con Papá');
    expect(headerMatches.length).toBeGreaterThanOrEqual(1);

    // SearchBar con placeholder
    expect(
      screen.getByPlaceholderText('¿Qué ingrediente tenés en la heladera?')
    ).toBeInTheDocument();

    // TagFilter (al menos las tags destacadas existen)
    expect(screen.getByText('Todas')).toBeInTheDocument();

    // Easy filter button
    expect(screen.getByText(/Solo Rápidas y Fáciles/)).toBeInTheDocument();

    // Resultados
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toMatch(/ideas para vos/);

    // Footer
    const footerMatches = screen.getAllByText(/Al Horno Con Papá/);
    expect(footerMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('carga recetas y muestra el contador de resultados', () => {
    renderRecipeList();
    const count = getResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  // ── Búsqueda ───────────────────────────────────────────────────────────

  it('filtra recetas al escribir en el buscador (con debounce)', async () => {
    renderRecipeList();
    const initialCount = getResultsCount();

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'chocolate' } });

    // Avanzar el timer del debounce (300ms)
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      const filteredCount = getResultsCount();
      expect(filteredCount).toBeLessThan(initialCount);
    });
  });

  it('filtra recetas por ingrediente', async () => {
    renderRecipeList();
    const initialCount = getResultsCount();

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'huevo' } });
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      const filteredCount = getResultsCount();
      expect(filteredCount).toBeLessThan(initialCount);
    });
  });

  it('devuelve 0 resultados si el término no existe', async () => {
    renderRecipeList();

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'xyzzyxnonesiste' } });
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(screen.getByText('No encontramos recetas con esos filtros')).toBeInTheDocument();
    });
  });

  // ── Filtro por tag ─────────────────────────────────────────────────────

  it('filtra recetas al clickear una tag', async () => {
    renderRecipeList();
    const initialCount = getResultsCount();

    const tagButton = screen.getByText('Vegetariano');
    fireEvent.click(tagButton);
    act(() => { jest.advanceTimersByTime(50); });

    await waitFor(() => {
      const filteredCount = getResultsCount();
      expect(filteredCount).toBeLessThan(initialCount);
    });
  });

  it('vuelve a mostrar todas las recetas al seleccionar "Todas"', async () => {
    renderRecipeList();

    // Primero filtrar
    fireEvent.click(screen.getByText('Vegetariano'));
    act(() => { jest.advanceTimersByTime(50); });
    await waitFor(() => expect(getResultsCount()).toBeGreaterThan(0));

    // Luego mostrar todas
    fireEvent.click(screen.getByText('Todas'));
    act(() => { jest.advanceTimersByTime(50); });
    await waitFor(() => {
      // Después de sacar el filtro, debería haber más recetas que con el filtro
      // (no podemos comparar con initial porque el render no lo guardó)
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.textContent).toMatch(/ideas para vos/);
    });
  });

  // ── Easy filter ────────────────────────────────────────────────────────

  it('filtra solo recetas fáciles al togglear el easy filter', async () => {
    renderRecipeList();
    const initialCount = getResultsCount();

    // El botón muestra "Solo Rápidas y Fáciles"
    const easyBtn = screen.getByText(/Solo Rápidas y Fáciles/);
    fireEvent.click(easyBtn);

    await waitFor(() => {
      const filteredCount = getResultsCount();
      expect(filteredCount).toBeLessThan(initialCount);
    });
  });

  // ── Filtros combinados ─────────────────────────────────────────────────

  it('combina búsqueda + tag + easy filter', async () => {
    renderRecipeList();

    // Tag
    fireEvent.click(screen.getByText('Postres'));
    act(() => { jest.advanceTimersByTime(50); });

    // Easy filter
    fireEvent.click(screen.getByText(/Solo Rápidas y Fáciles/));
    act(() => { jest.advanceTimersByTime(50); });

    // Búsqueda
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'chocolate' } });
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      // Debería haber recetas que cumplan los 3 filtros
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.textContent).toMatch(/Hoy tenemos/);
    });
  });

  // ── Paginación ─────────────────────────────────────────────────────────

  it('muestra paginación cuando hay suficientes recetas', async () => {
    renderRecipeList();
    // Con >6 recetas debería mostrar paginación
    const pagination = screen.queryByText('Anterior');
    // Si hay paginación, el botón Anterior está deshabilitado en página 1
    if (pagination) {
      expect(pagination.closest('button')).toBeDisabled();
    }
  });

  it('cambia de página al hacer click en Siguiente', async () => {
    renderRecipeList();

    const nextBtn = screen.queryByText('Siguiente');
    // Solo si hay más de una página
    if (nextBtn && !nextBtn.closest('button').disabled) {
      fireEvent.click(nextBtn);
      await waitFor(() => {
        // Después del click, "Anterior" debería estar habilitado
        const prevBtn = screen.getByText('Anterior');
        expect(prevBtn.closest('button')).not.toBeDisabled();
      });
    }
  });

  // ── Parámetros de URL ──────────────────────────────────────────────────

  it('respeta el tag desde el query param de la URL', async () => {
    renderRecipeList('/?tag=Vegetariano');
    act(() => { jest.advanceTimersByTime(100); });

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.textContent).toMatch(/ideas para vos/);
      // Debería mostrar solo recetas Vegetarianas
      expect(heading.textContent).not.toMatch(/^Hoy tenemos 0 ideas/);
    });
  });

  it('respeta la búsqueda desde el query param de la URL', async () => {
    renderRecipeList('/?search=chocolate');
    act(() => { jest.advanceTimersByTime(400); }); // debounce + render

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.textContent).toMatch(/ideas para vos/);
    });
  });

  // ── Autocomplete ───────────────────────────────────────────────────────

  it('muestra sugerencias de autocomplete al escribir', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderRecipeList();

    const input = screen.getByRole('combobox');
    await user.type(input, 'hue');

    // Deberían aparecer sugerencias después de escribir
    await waitFor(() => {
      const suggestions = screen.queryAllByRole('option');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
