import React from 'react';
import { ChefHat } from 'lucide-react';
import RecipeCard from './RecipeCard';

const RecipeGrid = ({ recipes, onSelectRecipe }) => {
  if (recipes.length === 0) {
    return (
      <div className="empty-state">
        <ChefHat size={64} />
        <h3>No se encontraron recetas</h3>
        <p>Intenta ajustar tu búsqueda o filtros</p>
      </div>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onClick={onSelectRecipe} 
        />
      ))}
    </div>
  );
};

export default React.memo(RecipeGrid);
