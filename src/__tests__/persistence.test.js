import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

import ClearButton from '../components/ClearButton';
import { usePersistentState } from '../utils/usePersistentState';
import TemperaturePage from '../pages/TemperaturePage';

jest.mock('../utils/analytics', () => ({
  trackPageView: jest.fn(),
}));

window.scrollTo = jest.fn();

const renderPage = (ui) =>
  render(
    <HelmetProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </HelmetProvider>
  );

describe('ClearButton', () => {
  it('no se muestra si no hay valores', () => {
    const { container } = render(<ClearButton show={false} onClear={() => {}} />);
    expect(container.querySelector('.clear-btn')).toBeNull();
  });

  it('se muestra y dispara onClear cuando hay valores', () => {
    const onClear = jest.fn();
    render(<ClearButton show onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe('usePersistentState', () => {
  const Probe = ({ storageKey }) => {
    const [value, setValue] = usePersistentState(storageKey, 'inicial');
    return (
      <div>
        <output data-testid="value">{value}</output>
        <button type="button" onClick={() => setValue('guardado')}>
          Guardar
        </button>
      </div>
    );
  };

  beforeEach(() => window.localStorage.clear());

  it('arranca con el valor inicial si no hay nada guardado', () => {
    render(<Probe storageKey="probe" />);
    expect(screen.getByTestId('value')).toHaveTextContent('inicial');
  });

  it('persiste el valor entre montajes', () => {
    const { unmount } = render(<Probe storageKey="probe" />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    unmount();

    render(<Probe storageKey="probe" />);
    expect(screen.getByTestId('value')).toHaveTextContent('guardado');
  });

  it('tolera JSON inválido en localStorage', () => {
    window.localStorage.setItem('probe', 'no-es-json{');
    render(<Probe storageKey="probe" />);
    expect(screen.getByTestId('value')).toHaveTextContent('inicial');
  });
});

describe('TemperaturePage con persistencia', () => {
  beforeEach(() => window.localStorage.clear());

  it('restaura el valor al volver a la herramienta', () => {
    const { unmount } = renderPage(<TemperaturePage />);
    fireEvent.change(screen.getByLabelText('Temperatura'), {
      target: { value: '200' },
    });
    expect(screen.getAllByText('Alto (Fuerte)').length).toBeGreaterThan(0);
    unmount();

    renderPage(<TemperaturePage />);
    expect(screen.getByLabelText('Temperatura')).toHaveValue('200');
    expect(screen.getAllByText('Alto (Fuerte)').length).toBeGreaterThan(0);
  });

  it('muestra Limpiar solo con valores y limpia todo', () => {
    renderPage(<TemperaturePage />);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull();

    fireEvent.change(screen.getByLabelText('Temperatura'), {
      target: { value: '180' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(screen.getByLabelText('Temperatura')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull();
  });
});