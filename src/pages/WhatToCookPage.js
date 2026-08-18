import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import recipesData from '../data/recipes.json';
import { ROUTES } from '../utils/constants';
import { ingredientsOptions, matchRecipes, randomRecipe } from '../utils/queCocino';
import { trackPageView } from '../utils/analytics';

const RECIPES_WITHOUT_LIST = recipesData.filter(
  (r) => !r.cleaned_ingredientes || !r.cleaned_ingredientes.length
).length;

const WHAT_COOK_RESULTS_LIMIT = 10;

const ChipInput = ({ label, id, options, chips, onAdd, onRemove }) => {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((o) => o.includes(q)).slice(0, 8);
  }, [options, query]);

  const handleAdd = () => {
    const value = (query || suggestion).trim().toLowerCase();
    if (value && !chips.includes(value) && options.includes(value)) {
      onAdd(value);
    }
    setQuery('');
    setSuggestion('');
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
              onClick={() => {
                setSuggestion(o);
                setQuery(o);
              }}
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
  const [tengo, setTengo] = useState([]);
  const [noTengo, setNoTengo] = useState([]);
  const [results, setResults] = useState([]);
  const [surprise, setSurprise] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    trackPageView('/herramientas/que-cocino/', 'Qué cocino con lo que tengo');
  }, []);

  const options = useMemo(() => ingredientsOptions(recipesData), []);

  const handleSearch = () => {
    setResults(matchRecipes(recipesData, tengo, noTengo).slice(0, WHAT_COOK_RESULTS_LIMIT));
    setSurprise(null);
    setSearched(true);
  };

  const handleSurprise = () => {
    if (surprise === null) {
      setResults(matchRecipes(recipesData, tengo, noTengo));
    }
    setSurprise(randomRecipe(matchRecipes(recipesData, tengo, noTengo)));
    setSearched(true);
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
              onAdd={(v) => setTengo((prev) => [...prev, v])}
              onRemove={(v) => setTengo((prev) => prev.filter((c) => c !== v))}
            />
            <ChipInput
              label="Ingredientes que no tengo (opcional)"
              id="qcc-notengo"
              options={options}
              chips={noTengo}
              onAdd={(v) => setNoTengo((prev) => [...prev, v])}
              onRemove={(v) => setNoTengo((prev) => prev.filter((c) => c !== v))}
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
        </div>

        {searched && surprise && (
          <div className="qcc-surprise-result">
            <h2>Receta sorpresa 🎉</h2>
            <Link to={`/recipe/${surprise.recipe.slug}/`}>
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
              {results.map(({ recipe, matched, extra }) => (
                <Link
                  to={`/recipe/${recipe.slug}/`}
                  key={recipe.id}
                  className="qcc-result-card"
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
