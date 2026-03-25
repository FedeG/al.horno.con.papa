import React from 'react';
import { Clock } from 'lucide-react';

const RecipeCard = ({ recipe, onClick, isHighPriority = false }) => {
  const handleClick = () => onClick(recipe);
  const imageUrl = `${process.env.PUBLIC_URL}/${recipe.imageUrl}`;
  const webpUrl = imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return (
    <div className="recipe-card" onClick={handleClick}>
      <div className="card-image">
        <picture>
          <source srcSet={webpUrl} type="image/webp" />
          <img 
            src={imageUrl}
            alt={recipe.name}
            loading={isHighPriority ? 'eager' : 'lazy'}
            fetchpriority={isHighPriority ? 'high' : 'auto'}
            decoding={isHighPriority ? 'sync' : 'async'}
          />
        </picture>
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
