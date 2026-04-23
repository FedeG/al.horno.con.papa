import React, { useMemo } from 'react';
import { ChefHat, Instagram, Facebook, Mail } from 'lucide-react';
import { getInstagramProfileUrl, getFacebookProfileUrl, isMobileDevice } from '../utils';
import { ORGANIZATION, AUTHOR, SOCIAL_HANDLES, CONTACT } from '../utils/constants';

const Footer = () => {
  const instagramUrl = useMemo(() => 
    getInstagramProfileUrl(SOCIAL_HANDLES.instagram),
    []
  );

  const facebookUrl = useMemo(() => 
    getFacebookProfileUrl(SOCIAL_HANDLES.instagram, SOCIAL_HANDLES.facebookId),
    []
  );
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <ChefHat size={32} />
            <h3>{ORGANIZATION.name}</h3>
          </div>
          <p className="footer-desc">{AUTHOR.bio}</p>
          <p className="footer-desc">{AUTHOR.hobby}</p>
          <p className="footer-cta">{AUTHOR.ctaText}</p>
        </div>

        <div className="footer-section">
          <h4>Seguinos</h4>
          <div className="social-icons">
            <a href={instagramUrl} target="_blank" rel={isMobileDevice ? 'noreferrer' : 'noopener noreferrer'} className="social-icon instagram" aria-label="Seguir en Instagram">
              <Instagram size={20} />
            </a>
            <a href={facebookUrl} target="_blank" rel={isMobileDevice ? 'noreferrer' : 'noopener noreferrer'} className="social-icon facebook" aria-label="Seguir en Facebook">
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contacto</h4>
          <div className="contact-info">
            <a href={`mailto:${CONTACT.email}`} className="contact-link">
              <Mail size={18} />
              {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 {ORGANIZATION.name}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
