import React from 'react';
import { Clock } from 'lucide-react';

const RecipeCard = ({ recipe, onClick }) => {
  const handleClick = () => onClick(recipe);
  
  return (
    <div className="recipe-card" onClick={handleClick}>
      <div className="card-image">
        <img 
          src={`${process.env.PUBLIC_URL}/${recipe.imageUrl}`} 
          alt={recipe.name}
          loading="lazy"
        />
        {recipe.easy && (
          <div className="card-overlay">
            <Clock size={16} /> Rápido y Fácil
          </div>
        )}
      </div>
      <div className="card-content">
        <h3>{recipe.name}</h3>
        <div className="card-tags">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RecipeCard);
