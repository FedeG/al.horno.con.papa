import React from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * Botón para limpiar los inputs de una herramienta. Solo se muestra cuando
 * hay algo cargado (prop `show`), así "empezar de nuevo" está a un toque.
 */
const ClearButton = ({ show, onClear }) => {
  if (!show) return null;
  return (
    <div className="card-clear">
      <button type="button" className="tool-clear-btn" onClick={onClear}>
        <RotateCcw size={16} aria-hidden="true" />
        Limpiar
      </button>
    </div>
  );
};

export default ClearButton;