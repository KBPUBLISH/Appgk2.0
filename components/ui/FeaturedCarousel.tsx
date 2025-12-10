
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Book } from '../../types';
import { BookOpen, Music } from 'lucide-react';
import { ApiService } from '../../services/apiService';

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

// 3D Page flip preview component for books
const PageFlipPreview: React.FC<{
  bookId: string;
  coverUrl: string;
  title: string;
  onCycleComplete: () => void;
  isActive: boolean;
}> = ({ bookId, coverUrl, title, onCycleComplete, isActive }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [flipProgress, setFlipProgress] = useState(0); // 0 to 180 degrees
  const [isAnimating, setIsAnimating] = useState(false);
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const cycleCompleteRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const animationRef = useRef<number | null>(null);

  // All images: cover + pages
  const allImages = [coverUrl, ...pages];
  const totalImages = allImages.length;

  // Fetch first 3 pages of the book
  useEffect(() => {
    if (!bookId || hasFetchedRef.current) return;
    
    const fetchPages = async () => {
      hasFetchedRef.current = true;
      try {
        const bookPages = await ApiService.getBookPages(bookId);
        
        if (bookPages && bookPages.length > 0) {
          const pageImages = bookPages
            .slice(0, 3)
            .map((p: any) => p.files?.background?.url || p.backgroundUrl)
            .filter(Boolean);
          
          if (pageImages.length > 0) {
            console.log('📖 Got page images for', title, ':', pageImages.length);
            setPages(pageImages);
          }
        }
        setPagesLoaded(true);
      } catch (error) {
        console.log('📖 Could not fetch pages for:', title);
        setPagesLoaded(true);
      }
    };
    
    fetchPages();
  }, [bookId, title]);

  // Preload images
  useEffect(() => {
    allImages.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [allImages]);

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setCurrentPageIndex(0);
      setFlipProgress(0);
      setIsAnimating(false);
      cycleCompleteRef.current = false;
    }
  }, [isActive]);

  // Animate page flip
  const animateFlip = useCallback(() => {
    const duration = 600; // ms for flip animation
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth flip
      const eased = 1 - Math.pow(1 - progress, 3);
      setFlipProgress(eased * 180);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Flip complete
        setFlipProgress(0);
        setCurrentPageIndex((prev) => {
          const next = prev + 1;
          if (next >= totalImages - 1) {
            if (!cycleCompleteRef.current) {
              cycleCompleteRef.current = true;
              setTimeout(() => onCycleComplete(), 500);
            }
            return 0;
          }
          return next;
        });
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [totalImages, onCycleComplete]);

  // Auto-flip timer
  useEffect(() => {
    if (!isActive || isAnimating) return;

    if (totalImages <= 1) {
      if (pagesLoaded) {
        const timeout = setTimeout(() => {
          if (!cycleCompleteRef.current) {
            cycleCompleteRef.current = true;
            onCycleComplete();
          }
        }, 3000);
        return () => clearTimeout(timeout);
      }
      return;
    }
    
    const timeout = setTimeout(() => {
      setIsAnimating(true);
      animateFlip();
    }, 1500); // Wait 1.5s before flipping
    
    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, pagesLoaded, totalImages, isAnimating, animateFlip, onCycleComplete]);

  const currentImage = allImages[currentPageIndex] || coverUrl;
  const nextImage = allImages[currentPageIndex + 1] || allImages[0] || coverUrl;

  return (
    <div 
      className="w-full h-full relative"
      style={{ perspective: '1200px' }}
    >
      {/* Book spine shadow */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent z-10 rounded-l-lg" />
      
      {/* Bottom page (next page) - always visible behind */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <img
          src={nextImage}
          alt={`${title} - next`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Current page (flips up to reveal next) */}
      <div 
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'left center',
          transform: `rotateY(-${flipProgress}deg)`,
          backfaceVisibility: 'hidden',
        }}
      >
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Page shadow during flip */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 pointer-events-none"
          style={{ opacity: flipProgress / 180 }}
        />
      </div>
      
      {/* Back of flipping page */}
      <div 
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'left center',
          transform: `rotateY(${180 - flipProgress}deg)`,
          backfaceVisibility: 'hidden',
        }}
      >
        <div className="w-full h-full bg-gradient-to-l from-[#f5f0e6] to-[#e8e0d0]">
          {/* Paper texture on back of page */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
          }} />
        </div>
        {/* Shadow on back of page */}
        <div 
          className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent pointer-events-none"
        />
      </div>
      
      {/* Dynamic shadow under flipping page */}
      {flipProgress > 0 && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/30 to-transparent rounded-b-lg pointer-events-none"
          style={{ 
            opacity: Math.sin((flipProgress / 180) * Math.PI) * 0.5,
            transform: `scaleX(${1 - (flipProgress / 180) * 0.3})`
          }}
        />
      )}
      
      {/* Page curl effect on right edge */}
      {totalImages > 1 && flipProgress === 0 && (
        <div className="absolute right-0 top-4 bottom-4 w-4 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-l from-black/10 to-transparent rounded-r" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-white/20 to-transparent" />
        </div>
      )}
      
      {/* Border */}
      <div className="absolute inset-0 rounded-lg border-2 border-white/10 pointer-events-none" />
    </div>
  );
};

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ books, onBookClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getImageSrc = (item: FeaturedItem) => {
    // Try multiple possible cover image fields
    return item.coverUrl || item.coverImage || (item as any).files?.coverImage || '';
  };

  const isPlaylist = (item: FeaturedItem) => {
    return item._itemType === 'playlist';
  };

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle page flip cycle complete - advance to next book
  const handleCycleComplete = useCallback(() => {
    const nextIndex = (activeIndex + 1) % books.length;
    setActiveIndex(nextIndex);
    scrollToIndex(nextIndex);
  }, [activeIndex, books.length, scrollToIndex]);

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

  // Auto-advance for playlists (no page flip, just 3 seconds)
  useEffect(() => {
    const currentItem = books[activeIndex];
    if (!currentItem) return;
    
    const itemIsPlaylist = currentItem._itemType === 'playlist';
    if (itemIsPlaylist) {
      const timeout = setTimeout(() => {
        handleCycleComplete();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [activeIndex, books, handleCycleComplete]);

  if (books.length === 0) return null;

  return (
    <div className="relative w-full aspect-square max-h-[500px] md:max-h-[550px] rounded-2xl overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.4)] mb-6 mx-auto border-b-4 border-[#5c2e0b] bg-[#3e1f07]">

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full"
      >
        {books.map((item, index) => {
          const itemId = item.id || item._id || '';
          const itemIsPlaylist = isPlaylist(item);
          const isActive = index === activeIndex;
          const coverUrl = getImageSrc(item);
          
          return (
          <div
            key={itemId}
            className="flex-shrink-0 w-full h-full snap-center relative flex flex-col items-center justify-center"
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
              {/* Cover - Aspect Square */}
              <div className="w-[17rem] md:w-[21rem] aspect-square rounded-lg shadow-2xl relative overflow-visible">
                {/* Use PageFlipPreview for books with cover, static image for playlists */}
                {itemIsPlaylist || !coverUrl ? (
                  <img
                    src={coverUrl || '/assets/images/placeholder-book.png'}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg border-2 border-white/10"
                  />
                ) : (
                  <PageFlipPreview
                    bookId={itemId}
                    coverUrl={coverUrl}
                    title={item.title}
                    onCycleComplete={handleCycleComplete}
                    isActive={isActive}
                  />
                )}

                {/* Action Button Overlay */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-black text-xs md:text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg hover:bg-white transition-colors z-30">
                  {itemIsPlaylist ? (
                    <>
                      <Music size={14} fill="currentColor" className="md:w-4 md:h-4" />
                      <span>Listen</span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={14} fill="currentColor" className="md:w-4 md:h-4" />
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
