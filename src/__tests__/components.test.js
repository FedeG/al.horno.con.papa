import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// ─── Componentes ───────────────────────────────────────────────────────────

import Header from '../components/Header';
import Footer from '../components/Footer';
import RecipeCard from '../components/RecipeCard';
import RecipeGrid from '../components/RecipeGrid';
import Pagination from '../components/Pagination';
import TagFilter from '../components/TagFilter';
import SearchBar from '../components/SearchBar';
import ErrorBoundary from '../components/ErrorBoundary';

// ─── Helpers ───────────────────────────────────────────────────────────────

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const mockRecipe = {
  id: 1,
  name: 'Torta de Chocolate',
  slug: 'torta-de-chocolate',
  tags: ['Postre', 'Chocolate'],
  imageUrl: 'test.jpg',
  easy: true,
  description: '',
  ingredients: [],
  instagramUrl: '',
  facebookUrl: '',
  shortcode: '',
  date: '2024-01-01',
};

// ─── Header ────────────────────────────────────────────────────────────────

describe('Header', () => {
  it('renderiza el título y subtítulo', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Al Horno Con Papá')).toBeInTheDocument();
    expect(screen.getByText('Recetas reales para cocinar en familia')).toBeInTheDocument();
  });

  it('el logo tiene aria-label', () => {
    renderWithRouter(<Header />);
    expect(screen.getByLabelText('Volver al inicio')).toBeInTheDocument();
  });
});

// ─── Footer ────────────────────────────────────────────────────────────────

describe('Footer', () => {
  it('renderiza el nombre de la organización', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain('Al Horno Con Papá');
  });

  it('renderiza links a redes sociales', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Seguir en Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Seguir en Facebook')).toBeInTheDocument();
  });

  it('muestra el año actual en el copyright', () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});

// ─── RecipeCard ────────────────────────────────────────────────────────────

describe('RecipeCard', () => {
  it('renderiza nombre y tags', () => {
    render(<RecipeCard recipe={mockRecipe} onClick={() => {}} />);
    expect(screen.getByText('Torta de Chocolate')).toBeInTheDocument();
    expect(screen.getByText('Postre')).toBeInTheDocument();
  });

  it('es accesible por teclado (role button + tabIndex)', () => {
    render(<RecipeCard recipe={mockRecipe} onClick={() => {}} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('llama onClick al hacer click', () => {
    const onClick = jest.fn();
    render(<RecipeCard recipe={mockRecipe} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(mockRecipe);
  });

  it('muestra "Rápido y Fácil" si la receta es easy', () => {
    render(<RecipeCard recipe={mockRecipe} onClick={() => {}} />);
    expect(screen.getByText('Rápido y Fácil')).toBeInTheDocument();
  });

  it('no muestra "Rápido y Fácil" si no es easy', () => {
    render(<RecipeCard recipe={{ ...mockRecipe, easy: false }} onClick={() => {}} />);
    expect(screen.queryByText('Rápido y Fácil')).toBeNull();
  });
});

// ─── RecipeGrid ────────────────────────────────────────────────────────────

describe('RecipeGrid', () => {
  it('renderiza todas las recetas', () => {
    const recipes = [
      mockRecipe,
      { ...mockRecipe, id: 2, name: 'Otra receta', easy: false, tags: ['Salado'] },
    ];
    render(<RecipeGrid recipes={recipes} onSelectRecipe={() => {}} />);
    expect(screen.getByText('Torta de Chocolate')).toBeInTheDocument();
    expect(screen.getByText('Otra receta')).toBeInTheDocument();
  });

  it('muestra empty state si no hay recetas', () => {
    render(<RecipeGrid recipes={[]} onSelectRecipe={() => {}} />);
    expect(screen.getByText('No se encontraron recetas')).toBeInTheDocument();
  });
});

// ─── Pagination ────────────────────────────────────────────────────────────

describe('Pagination', () => {
  it('no renderiza si hay una sola página', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza botones de navegación', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('deshabilita "Anterior" en la primera página', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Anterior').closest('button')).toBeDisabled();
  });

  it('deshabilita "Siguiente" en la última página', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByText('Siguiente').closest('button')).toBeDisabled();
  });

  it('llama onPageChange al hacer click en un número', () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});

// ─── TagFilter ─────────────────────────────────────────────────────────────

describe('TagFilter', () => {
  const allTags = ['Todas', 'Postre', 'Vegetariana', 'Pan'];

  it('renderiza todas las tags', () => {
    render(<TagFilter allTags={allTags} selectedTag="Todas" onSelectTag={() => {}} featuredTags={['Todas']} />);
    allTags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('marca la tag seleccionada como activa', () => {
    render(<TagFilter allTags={allTags} selectedTag="Postre" onSelectTag={() => {}} featuredTags={['Todas']} />);
    expect(screen.getByText('Postre').closest('button')).toHaveClass('active');
  });

  it('llama onSelectTag al clickear', () => {
    const onSelectTag = jest.fn();
    render(<TagFilter allTags={allTags} selectedTag="Todas" onSelectTag={onSelectTag} featuredTags={['Todas']} />);
    fireEvent.click(screen.getByText('Vegetariana'));
    expect(onSelectTag).toHaveBeenCalledWith('Vegetariana');
  });
});

// ─── SearchBar ─────────────────────────────────────────────────────────────

describe('SearchBar', () => {
  it('renderiza el input con placeholder', () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        showAutocomplete={false}
        setShowAutocomplete={() => {}}
        autocompleteSuggestions={[]}
        onSelectSuggestion={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('¿Qué ingrediente tenés en la heladera?')).toBeInTheDocument();
  });

  it('muestra el botón de limpiar cuando hay texto', () => {
    render(
      <SearchBar
        value="choco"
        onChange={() => {}}
        showAutocomplete={false}
        setShowAutocomplete={() => {}}
        autocompleteSuggestions={[]}
        onSelectSuggestion={() => {}}
      />
    );
    expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
  });

  it('no muestra el botón de limpiar cuando está vacío', () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        showAutocomplete={false}
        setShowAutocomplete={() => {}}
        autocompleteSuggestions={[]}
        onSelectSuggestion={() => {}}
      />
    );
    expect(screen.queryByLabelText('Limpiar búsqueda')).toBeNull();
  });

  it('llama onChange al escribir', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <SearchBar
        value=""
        onChange={onChange}
        showAutocomplete={false}
        setShowAutocomplete={() => {}}
        autocompleteSuggestions={[]}
        onSelectSuggestion={() => {}}
      />
    );
    const input = screen.getByRole('combobox');
    await user.type(input, 'h');
    expect(onChange).toHaveBeenCalled();
  });

  it('muestra sugerencias de autocomplete', () => {
    render(
      <SearchBar
        value="hue"
        onChange={() => {}}
        showAutocomplete={true}
        setShowAutocomplete={() => {}}
        autocompleteSuggestions={['huevos', 'huevo']}
        onSelectSuggestion={() => {}}
      />
    );
    expect(screen.getByText('huevos')).toBeInTheDocument();
    expect(screen.getByText('huevo')).toBeInTheDocument();
  });

  it('tiene atributos ARIA correctos', () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        showAutocomplete={false}
        setShowAutocomplete={() => {}}
        autocompleteSuggestions={[]}
        onSelectSuggestion={() => {}}
      />
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});

// ─── ErrorBoundary ────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Evitar que el error del test se muestre en consola
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <div>Todo bien</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('muestra fallback cuando hay un error', () => {
    const ThrowingComponent = () => {
      throw new Error('Error de prueba');
    };

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal en la cocina')).toBeInTheDocument();
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
    expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
  });

  it('usa fallback personalizado si se pasa como prop', () => {
    const ThrowingComponent = () => {
      throw new Error('Error de prueba');
    };

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});
