import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { RecipesProvider } from './context/RecipesContext';
import { initGA } from './utils/analytics';

// Inicializar Google Analytics
initGA();

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode suppressHydrationWarning>
    <HelmetProvider>
      <BrowserRouter>
        <RecipesProvider>
          <App />
        </RecipesProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
