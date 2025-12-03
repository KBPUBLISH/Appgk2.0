
import React, { useState, useRef } from 'react';
import { Book } from '../../types';
import { BookOpen, Music } from 'lucide-react';

interface FeaturedItem extends Partial<Book> {
  id: string;
  _id?: string;
  title: string;
  coverUrl?: string;
  coverImage?: string;
  _itemType?: 'book' | 'playlist';
}

interface FeaturedCarouselProps {
  books: FeaturedItem[];
  onBookClick: (id: string, isPlaylist?: boolean) => void;
}

// Default placeholder image
const DEFAULT_COVER = 'https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Book+Cover';

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ books, onBookClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getImageSrc = (item: FeaturedItem) => {
    const id = item.id || item._id || '';
    const coverUrl = item.coverUrl || item.coverImage || '';
    if (imageErrors[id] || !coverUrl) {
      return DEFAULT_COVER;
    }
    return coverUrl;
  };

  const isPlaylist = (item: FeaturedItem) => {
    return item._itemType === 'playlist';
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== activeIndex && index >= 0 && index < books.length) {
        setActiveIndex(index);
      }
    }
  };

  if (books.length === 0) return null;

  return (
    // Aspect ratio set to square 1:1
    <div className="relative w-full aspect-square max-h-[500px] md:max-h-[550px] rounded-2xl overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.4)] mb-6 mx-auto border-b-4 border-[#5c2e0b] bg-[#3e1f07]">

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full"
      >
        {books.map((item) => {
          const itemId = item.id || item._id || '';
          const itemIsPlaylist = isPlaylist(item);
          
          return (
          <div
            key={itemId}
            className="flex-shrink-0 w-full h-full snap-center relative flex items-center justify-center"
            onClick={() => onBookClick(itemId, itemIsPlaylist)}
          >
            {/* Vertical Wood Plank Background */}
            <div className="absolute inset-0" style={{
              background: `repeating-linear-gradient(
                    90deg, 
                    #8B4513 0%, #8B4513 10%, 
                    #5e2c04 10%, #5e2c04 11%, 
                    #A0522D 11%, #A0522D 24%, 
                    #5e2c04 24%, #5e2c04 25%, 
                    #8B4513 25%, #8B4513 40%, 
                    #5e2c04 40%, #5e2c04 41%
                )`
            }}></div>

            {/* Vignette / Shadow Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.6)_100%)]"></div>

            {/* Content Container */}
            <div className="relative z-10 transform transition-transform active:scale-95 duration-200 px-4">
              {/* Cover - Aspect Square - Increased size by 15% */}
              <div className="w-[18.5rem] md:w-[23rem] aspect-square rounded-lg shadow-2xl relative overflow-visible">
                <img
                  src={getImageSrc(item)}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg border-2 border-white/10"
                  onError={() => handleImageError(itemId)}
                />

                {/* NEW! Badge */}
                <div className="absolute -top-3 -right-5 bg-white text-black font-display font-extrabold text-xs md:text-sm px-3 py-1.5 rounded-full shadow-lg transform rotate-12 border-2 border-gray-100 z-20">
                  NEW!
                </div>

                {/* Action Button Overlay */}
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-black text-[10px] md:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-white transition-colors z-30">
                  {itemIsPlaylist ? (
                    <>
                      <Music size={12} fill="currentColor" className="md:w-4 md:h-4" />
                      <span>Listen</span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={12} fill="currentColor" className="md:w-4 md:h-4" />
                      <span>Read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
        {books.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300 ${index === activeIndex ? 'bg-white scale-110 opacity-100' : 'bg-white opacity-50'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
