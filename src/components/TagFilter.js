import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TagFilter = ({ allTags, selectedTag, onSelectTag }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="tags-container-wrapper">
      <button className="scroll-btn left" onClick={() => scroll('left')} aria-label="Scroll izquierda">
        <ChevronLeft size={18} />
      </button>
      <div className="tags-scroll" ref={scrollContainerRef}>
        {allTags.map((tag, idx) => (
          <button
            key={idx}
            className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => onSelectTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <button className="scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll derecha">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default TagFilter;
