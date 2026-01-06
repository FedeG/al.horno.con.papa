import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generatePageNumbers } from '../utils';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generar números de página inteligentes
  const pageNumbers = useMemo(() => 
    generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} /> Anterior
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
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Siguiente <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default React.memo(Pagination);
