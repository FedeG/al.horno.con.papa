import { useEffect, useState } from 'react';

/**
 * useState que persiste en localStorage: al montar recupera el valor guardado
 * bajo `key` y en cada cambio lo vuelve a guardar. Sirve para que las
 * herramientas conserven lo cargado al navegar y volver.
 *
 * @param {string} key - Clave única por herramienta (ej. 'tool:temperaturas')
 * @param {*} initialValue - Valor inicial si no hay nada guardado
 * @returns {[*, function]} Igual que useState
 */
export const usePersistentState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {
      // localStorage no disponible o JSON inválido: usar el valor inicial.
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Cuota llena o modo privado: la herramienta sigue funcionando en memoria.
    }
  }, [key, value]);

  return [value, setValue];
};