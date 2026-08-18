import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ClearButton from '../components/ClearButton';
import { ROUTES } from '../utils/constants';
import {
  COST_UNITS,
  costPerServing,
  formatARS,
  totalCost,
} from '../utils/costo';
import { trackPageView } from '../utils/analytics';
import { usePersistentState } from '../utils/usePersistentState';

const EMPTY_ROW = { name: '', unit: 'gr', bought: '', price: '', used: '' };

const DEFAULTS = {
  rows: [{ id: 1, ...EMPTY_ROW }],
  servings: '4',
};

const CostPerServingPage = () => {
  const nextId = useRef(1);
  const [state, setState] = usePersistentState('tool:costo', DEFAULTS);
  const { rows, servings } = state;

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  // Si las filas vienen de localStorage, el contador de ids sigue desde el máximo.
  useEffect(() => {
    nextId.current = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }, [rows]);

  useEffect(() => {
    trackPageView('/herramientas/costo-porcion/', 'Costo por porción');
  }, []);

  const hasValues =
    servings !== DEFAULTS.servings ||
    rows.length > 1 ||
    rows.some((r) => r.name || r.bought || r.price || r.used || r.unit !== EMPTY_ROW.unit);

  const updateRow = (id, patch) =>
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));

  const addRow = () =>
    setState((prev) => ({
      ...prev,
      rows: [...prev.rows, { id: nextId.current++, ...EMPTY_ROW }],
    }));

  const removeRow = (id) =>
    setState((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.filter((r) => r.id !== id) : prev.rows,
    }));

  const { total, invalidRows } = useMemo(
    () => totalCost(rows.map(({ id, ...row }) => row)),
    [rows]
  );
  const perServing = useMemo(() => costPerServing(total, servings), [total, servings]);

  return (
    <div className="app">
      <SEO
        title="Costo por porción"
        description="Cargá los ingredientes con sus precios y calculá cuánto sale cada porción de la receta."
        keywords="costo receta, precio por porción, cuánto sale cocinar, calcular costo ingredientes, inflación cocina"
      />
      <Header />
      <main id="main-content" className="converter-page">
        <Link to={ROUTES.tools} className="converter-back">
          ← Herramientas
        </Link>

        <div className="converter-hero">
          <h1>Costo por porción</h1>
          <p>
            Cargá precios y cantidades, y enterate cuánto sale cocinar cada
            porción.
          </p>
        </div>

        <div className="converter-card converter-card--full">
          <div className="converter-field">
            <label htmlFor="cost-servings">Porciones que salen de la receta</label>
            <input
              id="cost-servings"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 4"
              value={servings}
              onChange={(e) => update({ servings: e.target.value })}
            />
          </div>

          <div className="costo-rows">
            {rows.map((row) => (
              <div className="costo-row" key={row.id}>
                <div className="converter-field costo-name">
                  <label htmlFor={`costo-name-${row.id}`}>Ingrediente</label>
                  <input
                    id={`costo-name-${row.id}`}
                    type="text"
                    placeholder="Ej: harina"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  />
                </div>
                <div className="converter-field costo-unit">
                  <label htmlFor={`costo-unit-${row.id}`}>Unidad</label>
                  <select
                    id={`costo-unit-${row.id}`}
                    value={row.unit}
                    onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                  >
                    {COST_UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="converter-field costo-bought">
                  <label htmlFor={`costo-bought-${row.id}`}>Compraste</label>
                  <input
                    id={`costo-bought-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 1000"
                    value={row.bought}
                    onChange={(e) => updateRow(row.id, { bought: e.target.value })}
                  />
                </div>
                <div className="converter-field costo-price">
                  <label htmlFor={`costo-price-${row.id}`}>Precio ($)</label>
                  <input
                    id={`costo-price-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 1500"
                    value={row.price}
                    onChange={(e) => updateRow(row.id, { price: e.target.value })}
                  />
                </div>
                <div className="converter-field costo-used">
                  <label htmlFor={`costo-used-${row.id}`}>Usás</label>
                  <input
                    id={`costo-used-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 250"
                    value={row.used}
                    onChange={(e) => updateRow(row.id, { used: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="scalar-row-remove"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Quitar ${row.name || 'ingrediente'}`}
                  disabled={rows.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="scalar-add" onClick={addRow}>
            + Agregar ingrediente
          </button>

          <ClearButton show={hasValues} onClear={() => setState(DEFAULTS)} />

          <div className="converter-result" aria-live="polite">
            {total > 0 ? (
              <>
                <p>
                  Costo total: <strong>{formatARS(total)}</strong>
                </p>
                {perServing !== null ? (
                  <p className="temp-setting">
                    Sale{' '}
                    <strong className="costo-per-serving">
                      {formatARS(perServing)}
                    </strong>{' '}
                    por porción ({servings} porciones)
                  </p>
                ) : (
                  <p className="converter-result-placeholder">
                    Ingresá porciones válidas.
                  </p>
                )}
                {invalidRows > 0 && (
                  <p className="converter-result-placeholder">
                    {invalidRows} fila{invalidRows > 1 ? 's' : ''} incompleta
                    {invalidRows > 1 ? 's' : ''} (faltan datos o cantidad
                    comprada en 0).
                  </p>
                )}
              </>
            ) : (
              <p className="converter-result-placeholder">
                Cargá precios y cantidades para ver el costo.
              </p>
            )}
          </div>
        </div>

        <p className="converter-note">
          ℹ️ La cantidad comprada y la usada van en la misma unidad por fila
          (ej. compraste 1 kg a $1500 → 1000 gr, y usás 250 gr). Los precios son
          los del día: con la inflación, actualizalos al comprar.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default CostPerServingPage;
