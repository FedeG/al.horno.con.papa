import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, Ruler, Scale, Shuffle, Thermometer, Wallet } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { TOOLS } from '../utils/constants';
import { scrollToTop } from '../utils';
import { trackPageView } from '../utils/analytics';

// Icono por herramienta (lucide). Se mapea acá para mantener constants.js
// como datos puros.
const TOOL_ICONS = {
  equivalencias: Scale,
  temperaturas: Thermometer,
  escalar: Percent,
  moldes: Ruler,
  costo: Wallet,
  'que-cocino': Shuffle,
};

const ToolsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('/herramientas/', 'Herramientas');
  }, []);

  const handleSelectTool = useCallback(
    (path) => {
      navigate(path);
      scrollToTop();
    },
    [navigate]
  );

  return (
    <div className="app">
      <SEO
        title="Herramientas"
        description="Herramientas útiles para cocinar en familia: conversor de equivalencias de unidades de cocina."
        keywords="equivalencias cocina, conversor unidades, herramientas cocina, medidas cocina"
      />
      <Header />
      <main id="main-content" className="tools-page">
        <div className="tools-hero">
          <h1>Herramientas</h1>
          <p>Utilidades para que cocinar sea más fácil.</p>
        </div>
        <div className="tools-grid">
          {TOOLS.map((tool) => {
            const Icon = TOOL_ICONS[tool.slug] || Scale;
            return (
              <button
                key={tool.slug}
                className="tool-card"
                onClick={() => handleSelectTool(tool.path)}
                aria-label={tool.name}
              >
                <Icon size={40} suppressHydrationWarning />
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
                <span className="tool-card-cta">Abrir herramienta →</span>
              </button>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToolsPage;