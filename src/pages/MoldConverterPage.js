import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ClearButton from '../components/ClearButton';
import { ROUTES } from '../utils/constants';
import {
  areaFor,
  formatFactor,
  quantityFactor,
  timeGuidance,
} from '../utils/moldes';
import { trackPageView } from '../utils/analytics';
import { usePersistentState } from '../utils/usePersistentState';

const DEFAULTS = { shape: 'redondo', recipeSize: '24', mySize: '20' };

const MoldConverterPage = () => {
  const [state, setState] = usePersistentState('tool:moldes', DEFAULTS);
  const { shape, recipeSize, mySize } = state;

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    trackPageView('/herramientas/moldes/', 'Conversor de moldes');
  }, []);

  const hasValues =
    shape !== DEFAULTS.shape ||
    recipeSize !== DEFAULTS.recipeSize ||
    mySize !== DEFAULTS.mySize;

  const factor = useMemo(() => {
    const recipeArea = areaFor(shape, recipeSize);
    const myArea = areaFor(shape, mySize);
    return quantityFactor(myArea, recipeArea);
  }, [shape, recipeSize, mySize]);

  return (
    <div className="app">
      <SEO
        title="Conversor de moldes"
        description="Tenés un molde de 20 cm pero la receta pide 24 cm: calculá cuánta cantidad y tiempo ajustar."
        keywords="conversor moldes, cambiar molde, adaptar receta molde, molde redondo cuadrado, ajustar cantidad horno"
      />
      <Header />
      <main id="main-content" className="converter-page">
        <Link to={ROUTES.tools} className="converter-back">
          ← Herramientas
        </Link>

        <div className="converter-hero">
          <h1>Conversor de moldes</h1>
          <p>
            Cambiaste de molde: calculá cuánta cantidad ajustar y cómo afecta
            el tiempo de cocción.
          </p>
        </div>

        <div className="converter-card">
          <div className="converter-field">
            <label htmlFor="mold-shape">Forma del molde</label>
            <select
              id="mold-shape"
              value={shape}
              onChange={(e) => update({ shape: e.target.value })}
            >
              <option value="redondo">Redondo (diámetro)</option>
              <option value="cuadrado">Cuadrado (lado)</option>
            </select>
          </div>

          <div className="converter-fields-row">
            <div className="converter-field">
              <label htmlFor="mold-recipe">
                Molde de la receta ({shape === 'redondo' ? 'cm diámetro' : 'cm lado'})
              </label>
              <input
                id="mold-recipe"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 24"
                value={recipeSize}
                onChange={(e) => update({ recipeSize: e.target.value })}
              />
            </div>
            <div className="converter-field">
              <label htmlFor="mold-mine">
                Molde que tengo ({shape === 'redondo' ? 'cm diámetro' : 'cm lado'})
              </label>
              <input
                id="mold-mine"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 20"
                value={mySize}
                onChange={(e) => update({ mySize: e.target.value })}
              />
            </div>
          </div>

          <ClearButton show={hasValues} onClear={() => setState(DEFAULTS)} />

          <div className="converter-result" aria-live="polite">
            {factor === null ? (
              <p className="converter-result-placeholder">
                Ingresá tamaños válidos para calcular.
              </p>
            ) : (
              <>
                <p className="mold-cantidad">
                  Cantidad: <strong>{formatFactor(factor)}</strong>
                </p>
                <p className="mold-guidance">{timeGuidance(factor)}</p>
              </>
            )}
          </div>
        </div>

        <p className="converter-note">
          ℹ️ La cantidad se ajusta por área del molde (ej. redondo 20 → 24 cm:
          multiplicá por 1.44). El tiempo es orientativo: cada horno y masa son
          distintos, así que controlá con palillo.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default MoldConverterPage;
