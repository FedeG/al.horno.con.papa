import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import HashRedirect from './components/HashRedirect';
import ErrorBoundary from './components/ErrorBoundary';
import RecipeList from './pages/RecipeList';
import RecipeDetailPage from './pages/RecipeDetailPage';

const App = () => {
  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link" suppressHydrationWarning>
        Saltar al contenido principal
      </a>
      <HashRedirect />
      <Routes>
        <Route path="/" element={<RecipeList />} />
        <Route path="/recipe/:id/" element={<RecipeDetailPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
