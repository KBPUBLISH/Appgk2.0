
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Book } from '../../types';
import { BookOpen, Music } from 'lucide-react';
import { ApiService } from '../../services/apiService';

// Track in-flight requests (module-level, doesn't need persistence)
const fetchingBooks: Set<string> = new Set();

// LocalStorage-backed cache that survives WebView restarts
const CACHE_KEY_PREFIX = 'gk_pages_';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getPageCache = (bookId: string): string[] | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${bookId}`);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) {
        return data;
      }
      // Expired, remove it
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${bookId}`);
    }
  } catch {}
  return null;
};

const setPageCache = (bookId: string, pages: string[]) => {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${bookId}`, JSON.stringify({
      data: pages,
      ts: Date.now()
    }));
  } catch {}
};

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

// Page flip preview component for books
const PageFlipPreview: React.FC<{
  bookId: string;
  coverUrl: string;
  title: string;
  onCycleComplete: () => void;
  isActive: boolean;
}> = ({ bookId, coverUrl, title, onCycleComplete, isActive }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pagesLoaded, setPagesLoaded] = useState(false);
  const cycleCompleteRef = useRef(false);
  const flipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // All images: cover + pages
  const allImages = [coverUrl, ...pages];
  const totalImages = allImages.length;

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch first 2 pages of the book ONLY when it becomes active
  // Uses localStorage cache to survive WebView restarts
  useEffect(() => {
    if (!bookId || !isActive) return;
    
    // Check localStorage cache first (survives app restarts)
    const cached = getPageCache(bookId);
    if (cached) {
      setPages(cached);
      setPagesLoaded(true);
      return;
    }
    
    // Already fetching this book in this session? Wait for it
    if (fetchingBooks.has(bookId)) {
      const checkCache = setInterval(() => {
        const c = getPageCache(bookId);
        if (c) {
          setPages(c);
          setPagesLoaded(true);
          clearInterval(checkCache);
        }
      }, 100);
      // Max wait 3 seconds
      setTimeout(() => clearInterval(checkCache), 3000);
      return () => clearInterval(checkCache);
    }
    
    // Mark as fetching
    fetchingBooks.add(bookId);
    
    const fetchPagesData = async () => {
      try {
        const bookPages = await ApiService.getBookPages(bookId);
        
        if (bookPages && bookPages.length > 0) {
          const pageImages = bookPages
            .slice(0, 2)
            .map((p: any) => p.files?.background?.url || p.backgroundUrl)
            .filter(Boolean);
          
          // Store in localStorage cache
          setPageCache(bookId, pageImages);
          
          if (isMountedRef.current && pageImages.length > 0) {
            setPages(pageImages);
          }
        } else {
          setPageCache(bookId, []);
        }
        
        if (isMountedRef.current) {
          setPagesLoaded(true);
        }
      } catch (error) {
        console.log('📖 Could not fetch pages for:', title);
        setPageCache(bookId, []);
        if (isMountedRef.current) {
          setPagesLoaded(true);
        }
      } finally {
        fetchingBooks.delete(bookId);
      }
    };
    
    fetchPagesData();
  }, [bookId, title, isActive]);

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setCurrentImageIndex(0);
      cycleCompleteRef.current = false;
    }
  }, [isActive]);

  // Auto-flip animation - runs when active AND has pages
  useEffect(() => {
    // Clear any existing interval
    if (flipIntervalRef.current) {
      clearInterval(flipIntervalRef.current);
      flipIntervalRef.current = null;
    }

    if (!isActive) return;

    console.log('📖 Flip effect starting for', title, '- total images:', totalImages, 'pagesLoaded:', pagesLoaded);

    // If only cover (no pages yet or pages failed to load), wait and advance
    if (totalImages <= 1) {
      if (pagesLoaded) {
        // Pages loaded but none found, wait 3s then advance
        const timeout = setTimeout(() => {
          if (!cycleCompleteRef.current) {
            cycleCompleteRef.current = true;
            onCycleComplete();
          }
        }, 3000);
        return () => clearTimeout(timeout);
      }
      // Still loading, don't do anything yet
      return;
    }
    
    // We have pages! Start flipping
    
    flipIntervalRef.current = setInterval(() => {
      try {
        if (!isMountedRef.current) {
          if (flipIntervalRef.current) {
            clearInterval(flipIntervalRef.current);
            flipIntervalRef.current = null;
          }
          return;
        }
        
        setIsFlipping(true);
        
        setTimeout(() => {
          if (!isMountedRef.current) return;
          
          setCurrentImageIndex((prev) => {
            const next = prev + 1;
            if (next >= totalImages) {
              // Completed one cycle through all images
              if (!cycleCompleteRef.current) {
                cycleCompleteRef.current = true;
                setTimeout(() => {
                  if (isMountedRef.current) {
                    onCycleComplete();
                  }
                }, 300);
              }
              return 0;
            }
            return next;
          });
          setIsFlipping(false);
        }, 200);
      } catch (e) {
        // Silently handle any errors during flip
        console.warn('Flip animation error:', e);
      }
    }, 1200); // Show each image for 1.2 seconds
    
    return () => {
      if (flipIntervalRef.current) {
        clearInterval(flipIntervalRef.current);
        flipIntervalRef.current = null;
      }
    };
  }, [isActive, pagesLoaded, totalImages, title, onCycleComplete]);

  const currentImage = allImages[currentImageIndex] || coverUrl;
  const [imageError, setImageError] = useState(false);

  // Handle image load error - fallback to cover
  const handleImageError = useCallback(() => {
    if (currentImageIndex > 0) {
      // If a page image fails, skip to next or back to cover
      setCurrentImageIndex(0);
    }
    setImageError(true);
  }, [currentImageIndex]);

  return (
    <div className="w-full h-full relative" style={{ perspective: '1000px' }}>
      <div 
        className="w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipping ? 'rotateY(-20deg) scale(0.96)' : 'rotateY(0deg) scale(1)',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <img
          src={imageError ? coverUrl : currentImage}
          alt={title}
          className="w-full h-full object-cover rounded-lg border-2 border-white/10"
          onError={handleImageError}
        />
        
        {/* Page edge effect when showing pages (not cover) */}
        {currentImageIndex > 0 && (
          <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-r from-black/30 to-transparent rounded-l pointer-events-none" />
        )}
      </div>
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

  // Auto-advance all items every 4 seconds (page flip disabled)
  useEffect(() => {
    const currentItem = books[activeIndex];
    if (!currentItem) return;
    
    const timeout = setTimeout(() => {
      handleCycleComplete();
    }, 4000);
    return () => clearTimeout(timeout);
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
            className="flex-shrink-0 w-full h-full snap-center relative flex flex-col items-center justify-center pb-8"
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

            {/* Tap to Read/Listen text above cover */}
            <div className="relative z-20 mb-2 px-4">
              <p className="text-white font-display font-bold text-sm sm:text-base md:text-lg drop-shadow-lg text-center whitespace-nowrap">
                {itemIsPlaylist ? '🎧 Tap to listen' : '📖 Tap to read'}
              </p>
            </div>

            {/* Content Container */}
            <div className="relative z-10 transform transition-transform active:scale-95 duration-200 px-4">
              {/* Cover - Aspect Square - Bigger */}
              <div className="w-[19rem] md:w-[24rem] aspect-square rounded-lg shadow-2xl relative overflow-visible">
                {/* DISABLED PageFlipPreview - was causing crashes */}
                {/* Now showing static cover images for all items */}
                <img
                  src={coverUrl || '/assets/images/placeholder-book.png'}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg border-2 border-white/10"
                />

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
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
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
