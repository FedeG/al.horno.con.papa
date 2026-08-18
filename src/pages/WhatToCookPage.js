import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ClearButton from '../components/ClearButton';
import Pagination from '../components/Pagination';
import recipesData from '../data/recipes.json';
import { ROUTES } from '../utils/constants';
import { ingredientsOptions, matchRecipes, randomRecipe } from '../utils/queCocino';
import { trackPageView } from '../utils/analytics';
import { usePersistentState } from '../utils/usePersistentState';

const RECIPES_WITHOUT_LIST = recipesData.filter(
  (r) => !r.cleaned_ingredientes || !r.cleaned_ingredientes.length
).length;

const RESULTS_PER_PAGE = 12;

const DEFAULTS = {
  tengo: [],
  noTengo: [],
  results: [],
  surprise: null,
  searched: false,
  page: 1,
};

const ChipInput = ({ label, id, options, chips, onAdd, onRemove }) => {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((o) => o.includes(q)).slice(0, 8);
  }, [options, query]);

  const addIngredient = (value) => {
    const v = value.trim().toLowerCase();
    if (v && !chips.includes(v) && options.includes(v)) {
      onAdd(v);
    }
    setQuery('');
    setSuggestion('');
  };

  const handleAdd = () => {
    addIngredient(query || suggestion);
  };

  return (
    <div className="qcc-section">
      <label htmlFor={id} className="qcc-label">
        {label}
      </label>
      <div className="qcc-input-row">
        <input
          id={id}
          type="text"
          list={undefined}
          placeholder="Escribí un ingrediente y agregalo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button type="button" className="qcc-add" onClick={handleAdd}>
          Agregar
        </button>
      </div>
      {filtered.length > 0 && (
        <div className="qcc-suggestions">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              className="qcc-suggestion"
              onClick={() => addIngredient(o)}
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {chips.length > 0 && (
        <div className="qcc-chips">
          {chips.map((chip) => (
            <span key={chip} className="qcc-chip">
              {chip}
              <button
                type="button"
                className="qcc-chip-remove"
                onClick={() => onRemove(chip)}
                aria-label={`Quitar ${chip}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const WhatToCookPage = () => {
  const [state, setState] = usePersistentState('tool:que-cocino', DEFAULTS);
  const { tengo, noTengo, results, surprise, searched, page } = state;

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    trackPageView('/herramientas/que-cocino/', 'Qué cocino con lo que tengo');
  }, []);

  const options = useMemo(() => ingredientsOptions(recipesData), []);

  const hasValues = tengo.length > 0 || noTengo.length > 0 || searched;

  const totalPages = Math.max(1, Math.ceil(results.length / RESULTS_PER_PAGE));
  // Estados viejos persistidos pueden no tener `page`: asumir 1.
  const pageNum = Number.isFinite(page) ? page : 1;
  const safePage = Math.min(Math.max(pageNum, 1), totalPages);
  const visibleResults = results.slice(
    (safePage - 1) * RESULTS_PER_PAGE,
    safePage * RESULTS_PER_PAGE
  );

  const handleSearch = () => {
    update({
      results: matchRecipes(recipesData, tengo, noTengo),
      surprise: null,
      searched: true,
      page: 1,
    });
  };

  const handleSurprise = () => {
    const matches = matchRecipes(recipesData, tengo, noTengo);
    update({
      results: surprise === null ? matches : results,
      surprise: randomRecipe(matches),
      searched: true,
      page: 1,
    });
  };

  // Recordar de dónde venimos al entrar a una receta, para que su botón
  // "volver" nos traiga de nuevo acá (incluso tras una carga completa de página).
  const saveReturnPath = () => {
    sessionStorage.setItem('app:return-path', ROUTES.queCocino);
  };

  return (
    <div className="app">
      <SEO
        title="Qué cocino con lo que tengo"
        description="Contanos qué ingredientes tenés en la heladera y te sugerimos recetas propias que los usen."
        keywords="qué cocino con lo que tengo, recetas con ingredientes, cocinar con lo que hay, recetas heladera"
      />
      <Header />
      <main id="main-content" className="converter-page">
        <Link to={ROUTES.tools} className="converter-back">
          ← Herramientas
        </Link>

        <div className="converter-hero">
          <h1>Qué cocino con lo que tengo</h1>
          <p>
            Marca los ingredientes que tenés en la heladera y te mostramos las
            recetas del sitio que matchean.
          </p>
        </div>

        <div className="converter-card converter-card--full">
          <div className="qcc-columns">
            <ChipInput
              label="Ingredientes que tengo"
              id="qcc-tengo"
              options={options}
              chips={tengo}
              onAdd={(v) => update({ tengo: [...tengo, v] })}
              onRemove={(v) => update({ tengo: tengo.filter((c) => c !== v) })}
            />
            <ChipInput
              label="Ingredientes que no tengo (opcional)"
              id="qcc-notengo"
              options={options}
              chips={noTengo}
              onAdd={(v) => update({ noTengo: [...noTengo, v] })}
              onRemove={(v) => update({ noTengo: noTengo.filter((c) => c !== v) })}
            />
          </div>

          <div className="qcc-actions">
            <button type="button" className="qcc-search" onClick={handleSearch}>
              Buscar recetas
            </button>
            <button type="button" className="qcc-surprise" onClick={handleSurprise}>
              🎲 ¡Dame una sorpresa!
            </button>
          </div>

          <ClearButton show={hasValues} onClear={() => setState(DEFAULTS)} />
        </div>

        {searched && surprise && (
          <div className="qcc-surprise-result">
            <h2>Receta sorpresa 🎉</h2>
            <Link
              to={`/recipe/${surprise.recipe.slug}/`}
              onClick={saveReturnPath}
            >
              {surprise.recipe.name}
            </Link>
            <p>
              Solo necesitás: {surprise.matched.join(', ')}. Te faltan{' '}
              {surprise.extra.length} ingrediente
              {surprise.extra.length === 1 ? '' : 's'} (
              {surprise.extra.join(', ')}).
            </p>
          </div>
        )}

        {searched && !surprise && (
          <div className="qcc-results">
            <h2>
              {results.length > 0
                ? `${results.length} receta${results.length === 1 ? '' : 's'} con lo que tenés`
                : 'No encontré recetas con esos ingredientes'}
            </h2>
            {results.length === 0 && (
              <p className="converter-note">
                Sumá algún ingrediente más o sacá de "no tengo" para ampliar la
                búsqueda.
              </p>
            )}
            <div className="qcc-result-list">
              {visibleResults.map(({ recipe, matched, extra }) => (
                <Link
                  to={`/recipe/${recipe.slug}/`}
                  key={recipe.id}
                  className="qcc-result-card"
                  onClick={saveReturnPath}
                >
                  <h3>{recipe.name}</h3>
                  <p>
                    <span className="qcc-badge qcc-badge-ok">
                      ✓ {matched.join(', ')}
                    </span>
                    {extra.length > 0 && (
                      <span className="qcc-badge qcc-badge-more">
                        +{extra.length} ingrediente{extra.length === 1 ? '' : 's'} más
                      </span>
                    )}
                  </p>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(p) => update({ page: p })}
            />
          </div>
        )}

        <p className="converter-note">
          ℹ️ Buscamos entre las recetas con ingredientes normalizados:{' '}
          {RECIPES_WITHOUT_LIST} recetas no tienen lista y no pueden matchearse.
          La búsqueda prioriza las recetas que usan la mayor cantidad de lo que
          tenés.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default WhatToCookPage;
