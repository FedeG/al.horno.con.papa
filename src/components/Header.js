import React from 'react';
import { ChefHat } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <ChefHat size={64} />
          <div className="title">
            <h1>Al Horno Con Papá</h1>
            <p className="subtitle">Recetas reales para cocinar en familia</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
