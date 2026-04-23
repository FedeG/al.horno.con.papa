import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el usuario está en un dispositivo móvil
 * Solo se ejecuta en el cliente después de la hidratación
 * @returns {boolean} true si es dispositivo móvil, false en servidor y en componentes no hidratados
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
    setIsMobile(isMobileDevice);
  }, []);

  return isMobile;
};
