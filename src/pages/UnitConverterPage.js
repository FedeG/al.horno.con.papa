import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ClearButton from '../components/ClearButton';
import { INGREDIENTS, ROUTES, UNITS } from '../utils/constants';
import { convertUnits, formatCookingAmount } from '../utils/equivalencias';
import { trackPageView } from '../utils/analytics';
import { usePersistentState } from '../utils/usePersistentState';

const DEFAULTS = {
  value: '',
  fromUnit: 'taza',
  toUnit: 'ml',
  ingredientId: 'agua',
};

const UnitConverterPage = () => {
  const [state, setState] = usePersistentState('tool:equivalencias', DEFAULTS);
  const { value, fromUnit, toUnit, ingredientId } = state;

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    trackPageView('/herramientas/equivalencias/', 'Equivalencias');
  }, []);

  const hasValues =
    value !== '' ||
    fromUnit !== DEFAULTS.fromUnit ||
    toUnit !== DEFAULTS.toUnit ||
    ingredientId !== DEFAULTS.ingredientId;

  const result = useMemo(
    () => convertUnits({ value, fromUnit, toUnit, ingredientId }),
    [value, fromUnit, toUnit, ingredientId]
  );

  return (
    <div className="app">
      <SEO
        title="Equivalencias de cocina"
        description="Convertí unidades de cocina: ml, gr, tazas, cucharadas y cucharaditas según el ingrediente."
        keywords="equivalencias cocina, conversor unidades, tazas a gramos, ml a tazas, medidas cocina"
      />
      <Header />
      <main id="main-content" className="converter-page">
        <Link to={ROUTES.tools} className="converter-back">
          ← Herramientas
        </Link>

        <div className="converter-hero">
          <h1>Equivalencias</h1>
          <p>Convertí entre unidades de volumen y peso según el ingrediente.</p>
        </div>

        <div className="converter-card">
          <div className="converter-field">
            <label htmlFor="converter-value">Cantidad</label>
            <input
              id="converter-value"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 2"
              value={value}
              onChange={(e) => update({ value: e.target.value })}
            />
          </div>

          <div className="converter-fields-row">
            <div className="converter-field">
              <label htmlFor="converter-from">De</label>
              <select
                id="converter-from"
                value={fromUnit}
                onChange={(e) => update({ fromUnit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="converter-field">
              <label htmlFor="converter-to">A</label>
              <select
                id="converter-to"
                value={toUnit}
                onChange={(e) => update({ toUnit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="converter-field">
            <label htmlFor="converter-ingredient">Ingrediente</label>
            <select
              id="converter-ingredient"
              value={ingredientId}
              onChange={(e) => update({ ingredientId: e.target.value })}
            >
              {INGREDIENTS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          <ClearButton
            show={hasValues}
            onClear={() => setState(DEFAULTS)}
          />

          <div className="converter-result" aria-live="polite">
            {result === null ? (
              <p className="converter-result-placeholder">
                Ingresá una cantidad para ver el resultado.
              </p>
            ) : (
              <p>
                <strong>{formatCookingAmount(result, toUnit)}</strong>
              </p>
            )}
          </div>
        </div>

        <p className="converter-note">
          ℹ️ Las conversiones de peso (gr) dependen del ingrediente: una taza de
          harina no pesa lo mismo que una taza de azúcar. Las tazas se toman de
          240 ml.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default UnitConverterPage;