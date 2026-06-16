import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { trackTagScroll } from '../utils/analytics';

const TagFilter = ({ allTags, selectedTag, onSelectTag, featuredTags = [] }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollButtons();

    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(el);

    el.addEventListener('scroll', updateScrollButtons, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      trackTagScroll(direction);
      // Actualizar botones después del scroll animado
      requestAnimationFrame(updateScrollButtons);
    }
  }, [updateScrollButtons]);

  const scrollLeft = useCallback(() => scroll('left'), [scroll]);
  const scrollRight = useCallback(() => scroll('right'), [scroll]);

  return (
    <div className="tags-container-wrapper">
      {canScrollLeft && (
        <button className="scroll-btn left" onClick={scrollLeft} aria-label="Scroll izquierda">
          <ChevronLeft size={18} suppressHydrationWarning/>
        </button>
      )}
      <div className="tags-scroll" ref={scrollContainerRef}>
        {allTags.map((tag) => {
          const isFeatured = featuredTags.includes(tag);
          return (
            <button
              key={tag}
              className={['tag-chip', selectedTag === tag ? 'active' : '', isFeatured ? 'featured' : ''].filter(Boolean).join(' ')}
              onClick={() => onSelectTag(tag)}
            >
              {isFeatured && <Star size={14} className="featured-icon" fill="currentColor" suppressHydrationWarning/>}
              {tag}
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button className="scroll-btn right" onClick={scrollRight} aria-label="Scroll derecha">
          <ChevronRight size={18} suppressHydrationWarning/>
        </button>
      )}
    </div>
  );
};

export default React.memo(TagFilter);
