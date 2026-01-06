import React from 'react';
import { ArrowLeft, Tag, Sparkles, ChefHat, Instagram, Facebook } from 'lucide-react';
import { isMobile } from "react-device-detect";

import Footer from './Footer';

const RecipeDetail = ({ recipe, onBack, relatedRecipes, onSelectRecipe, onTagClick }) => {

  const getInstagramEmbedUrl = (url) => {
    if (!url) return null;
    const isReel = url.includes('/reel/');
    const isPost = url.includes('/p/');
    if (isReel || isPost) {
      return `${url}embed/`;
    }
    return null;
  };

  const getInstagramLinkUrl = () => {
    if (!recipe.instagramUrl || !recipe.id) return null;
    if (isMobile) {
      return `instagram://media?id=${recipe.id}`;
    }
    return recipe.instagramUrl;
  };

  const getInstagramLinkUrl2 = () => {
    if (!recipe.instagramUrl) return null;
    const shortcode = recipe.instagramUrl.split('/p/')[1]?.split('/')[0] || recipe.instagramUrl.split('/reel/')[1]?.split('/')[0];
    if (isMobile) {
      return `instagram://media?id=${shortcode}`;
    }
    return recipe.instagramUrl;
  };

  const openLink = () => {
    if (isMobile) {
      window.location.href = 'instagram://reel?id=DS8ZtFWDmi7';
      setTimeout(() => window.location.href = 'https://www.instagram.com/reel/DS8ZtFWDmi7/', 2000);
    } else {
      window.open('https://www.instagram.com/reel/DS8ZtFWDmi7/', '_blank');
    }
  };

  const embedUrl = getInstagramEmbedUrl(recipe.instagramUrl);

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
              <span key={idx} className="detail-tag" onClick={() => onTagClick(tag)} style={{ cursor: 'pointer' }}>
                <Tag size={14} /> {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h2><Sparkles size={20} /> Descripción</h2>
          <p className="description">
            {recipe.description.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < recipe.description.split('\n').length - 1 && <br />}
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
              href={getInstagramLinkUrl(recipe.instagramUrl)}
              target='_blank'
              rel={isMobile ? 'noreferrer' : 'noopener noreferrer'}
              className="social-btn instagram"
            >
              <Instagram size={20} /> Ver en Instagram 1
            </a>
          )}
          {recipe.instagramUrl && (
            <a
              href={getInstagramLinkUrl2(recipe.instagramUrl)}
              target='_blank'
              rel={isMobile ? 'noreferrer' : 'noopener noreferrer'}
              className="social-btn instagram"
            >
              <Instagram size={20} /> Ver en Instagram 2
            </a>
          )}
          {recipe.instagramUrl && (
            <button
              onClick={openLink}
              className="social-btn instagram"
            >
              <Instagram size={20} /> Ver en Instagram click
            </button>
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
                <div key={relatedRecipe.id} className="related-card" onClick={() => onSelectRecipe(relatedRecipe)}>
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
