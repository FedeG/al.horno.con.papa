import React from 'react';
import { ChefHat } from 'lucide-react';
import RecipeCard from './RecipeCard';

const RecipeGrid = ({ recipes, onSelectRecipe }) => {
  if (recipes.length === 0) {
    return (
      <div className="empty-state">
        <ChefHat size={64} />
        <h3>No recipes found</h3>
        <p>Try adjusting your search or filters</p>
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
