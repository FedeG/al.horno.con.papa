import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ROUTES } from '../utils/constants';
import { scaleFactor, scaleQuantity } from '../utils/escalado';
import { trackPageView } from '../utils/analytics';

const EMPTY_ROW = { name: '', amount: '', unit: 'gr' };

const formatAmount = (value) => {
  if (value === null) return '—';
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2,
  }).format(value);
};

const ScaleRecipePage = () => {
  const nextId = useRef(1);
  const [rows, setRows] = useState([
    { id: nextId.current++, ...EMPTY_ROW },
  ]);
  const [original, setOriginal] = useState('4');
  const [target, setTarget] = useState('8');

  useEffect(() => {
    trackPageView('/herramientas/escalar-receta/', 'Escalado de recetas');
  }, []);

  const factor = useMemo(() => scaleFactor(original, target), [original, target]);

  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, { id: nextId.current++, ...EMPTY_ROW }]);

  const removeRow = (id) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

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
                onChange={(e) => setOriginal(e.target.value)}
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
                onChange={(e) => setTarget(e.target.value)}
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
