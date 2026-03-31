import React from 'react';
import { ChefHat } from 'lucide-react';
import { HEADER } from '../utils/constants';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <ChefHat size={64} />
          <div className="title">
            <h1>{HEADER.title}</h1>
            <p className="subtitle">{HEADER.subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
