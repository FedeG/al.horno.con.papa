import React from 'react';
import { ChefHat } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <ChefHat size={32} />
          <h1>Al Horno Con Papá</h1>
        </div>
        <p className="subtitle">Recetas reales para cocinar en familia</p>
      </div>
    </header>
  );
};

export default Header;
