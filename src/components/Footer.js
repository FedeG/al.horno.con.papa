import React from 'react';
import { ChefHat, Instagram, Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <ChefHat size={32} />
            <h3>Al Horno Con Papá</h3>
          </div>
          <p className="footer-desc">Soy Fede, ingeniero en sistemas.</p>
          <p className="footer-desc">Mi hobby es cocinar y compartir la cocina en familia 👨‍🍳😊</p>
          <p className="footer-cta">Si hacés una receta, etiquetame en Instagram para que la vea 📸</p>
        </div>

        <div className="footer-section">
          <h4>Seguinos</h4>
          <div className="social-icons">
            <a href="https://www.instagram.com/al.horno.con.papa/" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/al.horno.con.papa/" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <div className="contact-info">
            <a href="mailto:info@alhornoconpapa.com" className="contact-link">
              <Mail size={18} />
              info@alhornoconpapa.com
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Al Horno Con Papá. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
