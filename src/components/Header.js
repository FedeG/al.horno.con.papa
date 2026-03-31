import React, { useCallback } from 'react';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HEADER } from '../utils/constants';

const Header = () => {
  const navigate = useNavigate();
  
  const handleLogoClick = useCallback(() => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  return (
    <header className="header">
      <div className="header-content">
        <button 
          className="logo" 
          onClick={handleLogoClick}
          aria-label="Volver al inicio"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ChefHat size={64} />
          <div className="title">
            <h1>{HEADER.title}</h1>
            <p className="subtitle">{HEADER.subtitle}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
