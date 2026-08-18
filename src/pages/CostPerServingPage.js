import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ROUTES } from '../utils/constants';
import {
  COST_UNITS,
  costPerServing,
  formatARS,
  totalCost,
} from '../utils/costo';
import { trackPageView } from '../utils/analytics';

const EMPTY_ROW = { name: '', unit: 'gr', bought: '', price: '', used: '' };

const CostPerServingPage = () => {
  const nextId = useRef(1);
  const [rows, setRows] = useState([
    { id: nextId.current++, ...EMPTY_ROW },
  ]);
  const [servings, setServings] = useState('4');

  useEffect(() => {
    trackPageView('/herramientas/costo-porcion/', 'Costo por porción');
  }, []);

  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, { id: nextId.current++, ...EMPTY_ROW }]);

  const removeRow = (id) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

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
              onChange={(e) => setServings(e.target.value)}
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
