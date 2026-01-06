import React, { useMemo, useCallback } from 'react';
import { ArrowLeft, Tag, Sparkles, ChefHat, Instagram, Facebook } from 'lucide-react';
import { isMobile } from "react-device-detect";
import { getInstagramEmbedUrl, getInstagramLinkUrl } from '../utils';

import Footer from './Footer';

const RecipeDetail = ({ recipe, onBack, relatedRecipes, onSelectRecipe, onTagClick }) => {

  const embedUrl = useMemo(() => 
    getInstagramEmbedUrl(recipe.instagramUrl),
    [recipe.instagramUrl]
  );

  const instagramLinkUrl = useMemo(() => 
    getInstagramLinkUrl(recipe.instagramUrl, recipe.shortcode, isMobile),
    [recipe.instagramUrl, recipe.shortcode]
  );

  const handleTagClick = useCallback((tag) => {
    onTagClick(tag);
  }, [onTagClick]);

  const handleSelectRecipe = useCallback((relatedRecipe) => {
    onSelectRecipe(relatedRecipe);
  }, [onSelectRecipe]);

  const descriptionLines = useMemo(() => 
    recipe.description.split('\n'),
    [recipe.description]
  );

  return (
    <div className="detail-view">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>{recipe.name}</h1>
      </div>

      <div className="detail-content">
        {embedUrl && (
          <div className="video-container">
            <iframe
              src={embedUrl}
              frameBorder="0"
              scrolling="no"
              allowFullScreen="true"
              allowTransparency="true"
              title={recipe.name}
            />
          </div>
        )}

        <div className="detail-section">
          <div className="tags-container">
            {recipe.tags.map((tag, idx) => (
              <span key={idx} className="detail-tag" onClick={() => handleTagClick(tag)} style={{ cursor: 'pointer' }}>
                <Tag size={14} /> {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h2><Sparkles size={20} /> Descripción</h2>
          <p className="description">
            {descriptionLines.map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < descriptionLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="detail-section">
          <h2><ChefHat size={20} /> Ingredientes</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="social-links">
          {recipe.instagramUrl && (
            <a
              href={instagramLinkUrl}
              target='_blank'
              rel={isMobile ? 'noreferrer' : 'noopener noreferrer'}
              className="social-btn instagram"
            >
              <Instagram size={20} /> Ver en Instagram 1
            </a>
          )}
          {recipe.facebookUrl && (
            <a href={recipe.facebookUrl} target="_blank" rel="noopener noreferrer" className="social-btn facebook">
              <Facebook size={20} /> Compartir en Facebook
            </a>
          )}
        </div>

        {relatedRecipes.length > 0 && (
          <div className="detail-section related-section">
            <h2>Recetas Relacionadas</h2>
            <div className="related-grid">
              {relatedRecipes.map(relatedRecipe => (
                <div key={relatedRecipe.id} className="related-card" onClick={() => handleSelectRecipe(relatedRecipe)}>
                  <img src={`${process.env.PUBLIC_URL}/${relatedRecipe.imageUrl}`} alt={relatedRecipe.name} />
                  <h3>{relatedRecipe.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RecipeDetail;
