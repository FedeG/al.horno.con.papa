import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ClearButton from '../components/ClearButton';
import { ROUTES } from '../utils/constants';
import { scaleFactor, scaleQuantity } from '../utils/escalado';
import { trackPageView } from '../utils/analytics';
import { usePersistentState } from '../utils/usePersistentState';

const EMPTY_ROW = { name: '', amount: '', unit: 'gr' };

const DEFAULTS = {
  rows: [{ id: 1, ...EMPTY_ROW }],
  original: '4',
  target: '8',
};

const formatAmount = (value) => {
  if (value === null) return '—';
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2,
  }).format(value);
};

const ScaleRecipePage = () => {
  const nextId = useRef(1);
  const [state, setState] = usePersistentState('tool:escalado', DEFAULTS);
  const { rows, original, target } = state;

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  // Si las filas vienen de localStorage, el contador de ids sigue desde el máximo.
  useEffect(() => {
    nextId.current = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }, [rows]);

  useEffect(() => {
    trackPageView('/herramientas/escalar-receta/', 'Escalado de recetas');
  }, []);

  const factor = useMemo(() => scaleFactor(original, target), [original, target]);

  const hasValues =
    original !== DEFAULTS.original ||
    target !== DEFAULTS.target ||
    rows.length > 1 ||
    rows.some((r) => r.name || r.amount || r.unit !== EMPTY_ROW.unit);

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

  return (
    <div className="app">
      <SEO
        title="Escalado de recetas"
        description="Calculá las cantidades de una receta al cambiar las porciones: de 4 a 8, de 4 a 2, lo que necesites."
        keywords="escalar receta, calcular porciones, multiplicar receta, ajustar cantidades, receta para más personas"
      />
      <Header />
      <main id="main-content" className="converter-page">
        <Link to={ROUTES.tools} className="converter-back">
          ← Herramientas
        </Link>

        <div className="converter-hero">
          <h1>Escalado de recetas</h1>
          <p>
            Cargá las cantidades de la receta y ajustá las porciones: todo se
            recalcula al toque.
          </p>
        </div>

        <div className="converter-card converter-card--full">
          <div className="converter-fields-row">
            <div className="converter-field">
              <label htmlFor="scale-original">Porciones originales</label>
              <input
                id="scale-original"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 4"
                value={original}
                onChange={(e) => update({ original: e.target.value })}
              />
            </div>
            <div className="converter-field">
              <label htmlFor="scale-target">Porciones deseadas</label>
              <input
                id="scale-target"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 8"
                value={target}
                onChange={(e) => update({ target: e.target.value })}
              />
            </div>
          </div>

          {factor !== null ? (
            <div className="converter-result" aria-live="polite">
              <p>
                Factor: <strong>×{formatAmount(factor)}</strong>
              </p>
            </div>
          ) : (
            <div className="converter-result">
              <p className="converter-result-placeholder">
                Ingresá porciones válidas para calcular el factor.
              </p>
            </div>
          )}

          <div className="scalar-rows">
            {rows.map((row) => (
              <div className="scalar-row" key={row.id}>
                <div className="converter-field scalar-name">
                  <label htmlFor={`scalar-name-${row.id}`}>Ingrediente</label>
                  <input
                    id={`scalar-name-${row.id}`}
                    type="text"
                    placeholder="Ej: harina"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  />
                </div>
                <div className="converter-field scalar-amount">
                  <label htmlFor={`scalar-amount-${row.id}`}>Cantidad</label>
                  <input
                    id={`scalar-amount-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 250"
                    value={row.amount}
                    onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                  />
                </div>
                <div className="converter-field scalar-unit">
                  <label htmlFor={`scalar-unit-${row.id}`}>Unidad</label>
                  <select
                    id={`scalar-unit-${row.id}`}
                    value={row.unit}
                    onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                  >
                    <option value="gr">gr</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="taza">taza</option>
                    <option value="cucharada">cucharada</option>
                    <option value="cucharadita">cucharadita</option>
                    <option value="unidad">unidad</option>
                  </select>
                </div>
                <div className="converter-field scalar-result">
                  <label>Resultado</label>
                  <output className="scalar-result-value" aria-live="polite">
                    {factor !== null && row.amount
                      ? (() => {
                          const scaled = scaleQuantity(
                            row.amount,
                            factor,
                            row.unit === 'unidad'
                          );
                          if (!scaled) return '—';
                          if (row.unit === 'unidad') {
                            return `${scaled.roundedUp ? '≈ ' : ''}${
                              scaled.value
                            } unidad`;
                          }
                          return `${formatAmount(scaled.value)} ${row.unit}`;
                        })()
                      : '—'}
                  </output>
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
        </div>

        <p className="converter-note">
          ℹ️ Las unidades (huevos, unidades) se redondean hacia arriba y se
          marcan con ≈. El tiempo de cocción no se escala con el factor:
          mantené el de la receta y controlá con palillo.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default ScaleRecipePage;
