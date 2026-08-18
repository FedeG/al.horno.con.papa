import React, { useCallback } from 'react';
import { ChefHat, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HEADER, ROUTES } from '../utils/constants';
import { scrollToTop } from '../utils';

const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = useCallback(() => {
    navigate('/');
    scrollToTop();
  }, [navigate]);

  const handleToolsClick = useCallback(() => {
    navigate(ROUTES.tools);
    scrollToTop();
  }, [navigate]);

  return (
    <header className="header">
      <div className="header-content">
        <button
          className="logo"
          onClick={handleLogoClick}
          aria-label="Volver al inicio"
        >
          <ChefHat size={64} suppressHydrationWarning />
          <div className="title">
            <h1>{HEADER.title}</h1>
            <p className="subtitle">{HEADER.subtitle}</p>
          </div>
        </button>
        <button
          className="header-tools-button"
          onClick={handleToolsClick}
          aria-label="Ir a herramientas"
        >
          <Wrench size={20} suppressHydrationWarning />
          Herramientas
        </button>
      </div>
    </header>
  );
};

export default Header;