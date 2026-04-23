import React, { createContext, useContext, useState, useEffect } from 'react';
import recipesData from '../data/recipes.json';

const RecipesContext = createContext();

export const RecipesProvider = ({ children }) => {
  return (
    <RecipesContext.Provider value={{ recipesData }}>
      <React.Fragment>
        {children}
      </React.Fragment>
    </RecipesContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);
  if (!context) {
    throw new Error('useRecipes debe ser usado dentro de RecipesProvider');
  }
  return context;
};
