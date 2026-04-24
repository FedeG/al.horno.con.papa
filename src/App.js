import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import HashRedirect from './components/HashRedirect';
import RecipeList from './pages/RecipeList';
import RecipeDetailPage from './pages/RecipeDetailPage';

const App = () => {
  return (
    <>
      <HashRedirect />
      <Routes>
        <Route path="/" element={<RecipeList />} />
        <Route path="/recipe/:id/" element={<RecipeDetailPage />} />
      </Routes>
    </>
  );
};

export default App;
