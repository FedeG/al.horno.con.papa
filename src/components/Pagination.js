import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generar números de página inteligentes
  const pageNumbers = useMemo(() => {
    const pages = [];
    const delta = 1; // Páginas a mostrar alrededor de la actual
    
    // Siempre mostrar primera página
    pages.push(1);
    
    if (totalPages <= 7) {
      // Si hay pocas páginas, mostrarlas todas
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para muchas páginas
      if (currentPage <= 3) {
        // Cerca del inicio
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-1');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final
        pages.push('ellipsis-1');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push('ellipsis-1');
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-2');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} /> Previous
      </button>

      <div className="pagination-numbers">
        {pageNumbers.map((page, idx) => {
          if (typeof page === 'string') {
            return (
              <span key={page} className="pagination-ellipsis">
                ...
              </span>
            );
          }
          
          return (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default React.memo(Pagination);
