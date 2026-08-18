import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import HashRedirect from './components/HashRedirect';
import ErrorBoundary from './components/ErrorBoundary';
import RecipeList from './pages/RecipeList';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ToolsPage from './pages/ToolsPage';
import UnitConverterPage from './pages/UnitConverterPage';
import TemperaturePage from './pages/TemperaturePage';
import ScaleRecipePage from './pages/ScaleRecipePage';
import MoldConverterPage from './pages/MoldConverterPage';
import CostPerServingPage from './pages/CostPerServingPage';
import WhatToCookPage from './pages/WhatToCookPage';

const App = () => {
  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <HashRedirect />
      <Routes>
        <Route path="/" element={<RecipeList />} />
        <Route path="/recipe/:id/" element={<RecipeDetailPage />} />
        <Route path="/herramientas/" element={<ToolsPage />} />
        <Route path="/herramientas/equivalencias/" element={<UnitConverterPage />} />
        <Route path="/herramientas/temperaturas/" element={<TemperaturePage />} />
        <Route path="/herramientas/escalar-receta/" element={<ScaleRecipePage />} />
        <Route path="/herramientas/moldes/" element={<MoldConverterPage />} />
        <Route path="/herramientas/costo-porcion/" element={<CostPerServingPage />} />
        <Route path="/herramientas/que-cocino/" element={<WhatToCookPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
