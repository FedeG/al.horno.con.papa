import React from 'react';
import { Clock } from 'lucide-react';

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="card-image">
        <img src={recipe.imageUrl} alt={recipe.name} />
        {recipe.easy && (
          <div className="card-overlay">
            <Clock size={16} /> Rápido y Fácil
          </div>
        )}
      </div>
      <div className="card-content">
        <h3>{recipe.name}</h3>
        <div className="card-tags">
          {recipe.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
