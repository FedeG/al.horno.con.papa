import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ClearButton from '../components/ClearButton';
import { ROUTES } from '../utils/constants';
import {
  OVEN_SETTINGS,
  settingForCelsius,
  settingForFahrenheit,
} from '../utils/temperaturas';
import { trackPageView } from '../utils/analytics';
import { usePersistentState } from '../utils/usePersistentState';

const DEFAULTS = { value: '', unit: 'C' };

const TemperaturePage = () => {
  const [state, setState] = usePersistentState('tool:temperaturas', DEFAULTS);
  const { value, unit } = state;

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    trackPageView('/herramientas/temperaturas/', 'Temperaturas de horno');
  }, []);

  const amount = parseFloat(value.replace(',', '.'));
  const hasValue = Number.isFinite(amount);
  const hasValues = value !== '' || unit !== DEFAULTS.unit;

  const { setting } = useMemo(() => {
    if (!hasValue) return { setting: null };
    if (unit === 'C') {
      return { setting: settingForCelsius(amount) };
    }
    return { setting: settingForFahrenheit(amount) };
  }, [hasValue, amount, unit]);

  return (
    <div className="app">
      <SEO
        title="Temperaturas de horno"
        description="Ingresá la temperatura de tu receta y averiguá el nivel de horno: descripción de calor con su escala en grados Celsius y Fahrenheit."
        keywords="temperatura horno, celsius fahrenheit, horno mínimo, horno moderado, horno fuerte, conversor temperatura"
      />
      <Header />
      <main id="main-content" className="converter-page">
        <Link to={ROUTES.tools} className="converter-back">
          ← Herramientas
        </Link>

        <div className="converter-hero">
          <h1>Temperaturas de horno</h1>
          <p>
            Ingresá la temperatura de tu receta y averiguá el nivel de horno
            equivalente (descripción de calor y escala en °C y °F).
          </p>
        </div>

        <div className="converter-card">
          <div className="converter-field">
            <label htmlFor="temp-value">Temperatura</label>
            <input
              id="temp-value"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 180"
              value={value}
              onChange={(e) => update({ value: e.target.value })}
            />
          </div>

          <div className="converter-field">
            <label htmlFor="temp-unit">Unidad</label>
            <select
              id="temp-unit"
              value={unit}
              onChange={(e) => update({ unit: e.target.value })}
            >
              <option value="C">Grados Celsius (°C)</option>
              <option value="F">Grados Fahrenheit (°F)</option>
            </select>
          </div>

          <ClearButton show={hasValues} onClear={() => setState(DEFAULTS)} />

          <div className="converter-result" aria-live="polite">
            {!hasValue ? (
              <p className="converter-result-placeholder">
                Ingresá una temperatura para ver el nivel de horno.
              </p>
            ) : (
              setting && (
                <>
                  <p className="temp-heat">{setting.heat}</p>
                  <p className="temp-scales">
                    {setting.c[0] === setting.c[1]
                      ? `${setting.c[0]}°C`
                      : `${setting.c[0]}–${setting.c[1]}°C`}{' '}
                    ·{' '}
                    {setting.f[0] === setting.f[1]
                      ? `${setting.f[0]}°F`
                      : `${setting.f[0]}–${setting.f[1]}°F`}
                  </p>
                </>
              )
            )}
          </div>
        </div>

        <h2 className="temp-table-title">Niveles de horno</h2>
        <div className="temp-table-wrap">
          <table className="temp-table">
            <thead>
              <tr>
                <th>Descripción de calor</th>
                <th>°C</th>
                <th>°F</th>
              </tr>
            </thead>
            <tbody>
              {OVEN_SETTINGS.map((s) => (
                <tr
                  key={s.gas}
                  className={setting && setting.gas === s.gas ? 'temp-row-active' : ''}
                >
                  <td>{s.heat}</td>
                  <td>
                    {s.c[0] === s.c[1] ? s.c[0] : `${s.c[0]}–${s.c[1]}`}°C
                  </td>
                  <td>
                    {s.f[0] === s.f[1] ? s.f[0] : `${s.f[0]}–${s.f[1]}`}°F
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="converter-note">
          ℹ️ La tabla usa el estándar de cocina argentino: así se habla de
          horno mínimo, moderado o fuerte. Los niveles son valores de
          referencia: si tu temperatura no coincide exacto, mostramos el más
          cercano.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default TemperaturePage;
