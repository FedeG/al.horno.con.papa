import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

import ToolsPage from '../pages/ToolsPage';
import UnitConverterPage from '../pages/UnitConverterPage';
import TemperaturePage from '../pages/TemperaturePage';
import ScaleRecipePage from '../pages/ScaleRecipePage';
import MoldConverterPage from '../pages/MoldConverterPage';
import CostPerServingPage from '../pages/CostPerServingPage';
import WhatToCookPage from '../pages/WhatToCookPage';

jest.mock('../utils/analytics', () => ({
  trackPageView: jest.fn(),
}));

window.scrollTo = jest.fn();

const renderWithRouter = (ui) =>
  render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>
  );

describe('ToolsPage', () => {
  it('renderiza el título y la card de Equivalencias', () => {
    renderWithRouter(<ToolsPage />);
    expect(screen.getByRole('heading', { name: 'Herramientas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Equivalencias' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Equivalencias' })).toBeInTheDocument();
  });
});

describe('UnitConverterPage', () => {
  it('renderiza el conversor con sus campos', () => {
    renderWithRouter(<UnitConverterPage />);
    expect(screen.getByLabelText('Cantidad')).toBeInTheDocument();
    expect(screen.getByLabelText('De')).toBeInTheDocument();
    expect(screen.getByLabelText('A')).toBeInTheDocument();
    expect(screen.getByLabelText('Ingrediente')).toBeInTheDocument();
  });
});

describe('TemperaturePage', () => {
  it('renderiza el conversor y la tabla de niveles', () => {
    renderWithRouter(<TemperaturePage />);
    expect(screen.getByLabelText('Temperatura')).toBeInTheDocument();
    expect(screen.getByLabelText('Unidad')).toBeInTheDocument();
    expect(screen.getByText('Alto (Fuerte)')).toBeInTheDocument();
    expect(screen.getByText('Descripción de calor')).toBeInTheDocument();
  });
});

describe('ScaleRecipePage', () => {
  it('renderiza el escalador con filas dinámicas', () => {
    renderWithRouter(<ScaleRecipePage />);
    expect(screen.getByLabelText('Porciones originales')).toBeInTheDocument();
    expect(screen.getByLabelText('Porciones deseadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Agregar ingrediente' })).toBeInTheDocument();
  });
});

describe('MoldConverterPage', () => {
  it('renderiza el conversor de moldes', () => {
    renderWithRouter(<MoldConverterPage />);
    expect(screen.getByLabelText('Forma del molde')).toBeInTheDocument();
    expect(screen.getByLabelText(/Molde de la receta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Molde que tengo/)).toBeInTheDocument();
  });
});

describe('CostPerServingPage', () => {
  it('renderiza la calculadora de costo', () => {
    renderWithRouter(<CostPerServingPage />);
    expect(screen.getByLabelText(/Porciones que salen/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Agregar ingrediente' })).toBeInTheDocument();
  });
});

describe('WhatToCookPage', () => {
  it('renderiza los buscadores y el botón sorpresa', () => {
    renderWithRouter(<WhatToCookPage />);
    expect(screen.getByLabelText('Ingredientes que tengo')).toBeInTheDocument();
    expect(screen.getByLabelText('Ingredientes que no tengo (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar recetas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🎲 ¡Dame una sorpresa!' })).toBeInTheDocument();
  });

  it('agrega el ingrediente al tocar una sugerencia, sin botón "Agregar"', () => {
    renderWithRouter(<WhatToCookPage />);
    const input = screen.getByLabelText('Ingredientes que tengo');
    fireEvent.change(input, { target: { value: 'hari' } });
    const suggestion = screen.getByRole('button', { name: 'harina' });
    fireEvent.click(suggestion);
    // Queda como chip (con su botón de quitar) y el input se limpia
    expect(screen.getByLabelText('Quitar harina')).toBeInTheDocument();
    expect(input.value).toBe('');
  });
});