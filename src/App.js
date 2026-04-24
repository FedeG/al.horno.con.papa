import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import HashRedirect from './components/HashRedirect';

const RecipeList = lazy(() => import('./pages/RecipeList'));
const RecipeDetailPage = lazy(() => import('./pages/RecipeDetailPage'));

const App = () => {
  return (
    <>
      <HashRedirect />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipe/:id/" element={<RecipeDetailPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
