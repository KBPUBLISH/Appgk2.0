import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { ApiService } from '../services/apiService';

interface BooksContextType {
  books: Book[];
  loading: boolean;
  error: string | null;
  refreshBooks: () => Promise<void>;
}

const BooksContext = createContext<BooksContextType>({
  books: [],
  loading: true,
  error: null,
  refreshBooks: async () => { },
});

export const useBooks = () => useContext(BooksContext);

export const BooksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    // Prevent infinite loops - don't load if already loading
    if (isLoadingRef.current) {
      console.log('⏸️ BooksContext: Already loading, skipping duplicate request');
      return;
    }

    isLoadingRef.current = true;
    setError(null); // Clear any previous error

    // Only show loading if we have no data to prevent flashing on manual refresh
    if (books.length === 0) setLoading(true);

    try {
      console.log('📚 BooksContext: Loading books from API...');

      // Always try to load from API - books are public content
      const data = await ApiService.getBooks();
      console.log('📚 BooksContext: Received', data.length, 'books');

      // Check for real cover URLs
      const hasRealCovers = data.some(book =>
        book.coverUrl &&
        !book.coverUrl.includes('picsum.photos') &&
        !book.coverUrl.includes('placeholder') &&
        book.coverUrl.length > 0
      );

      if (hasRealCovers) {
        console.log('✅ BooksContext: Using REAL API data with real covers from database');
        console.log('📊 Books with real covers:', data.filter(b => b.coverUrl && !b.coverUrl.includes('picsum')).length);
      } else {
        console.log('✅ BooksContext: Using API data from database');
      }

      setBooks(data);
      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error("❌ BooksContext: Failed to load books", err);
      // Set error state instead of showing mock data
      const errorMessage = err instanceof Error ? err.message : 'Failed to load books';
      setError(errorMessage);
      setBooks([]); // Clear books on error - don't show mock data
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    // Check if we're on the landing page - if so, don't load books yet
    const isLandingPage = window.location.hash === '#/' || window.location.hash === '';
    if (isLandingPage) {
      console.log('📚 BooksContext: On landing page, skipping book load');
      setBooks([]);
      setLoading(false);
      return;
    }

    // Always load books - they are public content
    console.log('📚 BooksContext: Initial load - fetching books from API');
    loadData();
  }, []);

  // Also reload when route changes (e.g., after navigation) - but only once
  useEffect(() => {
    const handleHashChange = () => {
      const isLandingPage = window.location.hash === '#/' || window.location.hash === '';
      if (!isLandingPage && !hasLoadedRef.current && !isLoadingRef.current) {
        console.log('📚 BooksContext: Route changed, loading books from API');
        loadData();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track if we've already loaded books to prevent infinite loops
  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Listen for storage changes (when token is set manually)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'godly_kids_auth_token' && e.newValue && !isLoadingRef.current) {
        console.log('🔄 Auth token changed (storage event), reloading books...');
        hasLoadedRef.current = false;
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event (for same-window token updates)
    const handleCustomStorage = () => {
      if (isLoadingRef.current) {
        console.log('⏸️ Already loading books, skipping duplicate request');
        return;
      }
      console.log('🔄 Auth token updated (custom event), reloading books...');
      hasLoadedRef.current = false;
      // Small delay to ensure token is stored
      setTimeout(() => {
        loadData();
      }, 100);
    };

    window.addEventListener('authTokenUpdated', handleCustomStorage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenUpdated', handleCustomStorage);
    };
  }, []);

  // Expose manual refresh in console for debugging
  if (typeof window !== 'undefined') {
    (window as any).refreshBooks = () => {
      console.log('🔄 Manual books refresh triggered');
      loadData();
    };
  }

  return (
    <BooksContext.Provider value={{ books, loading, error, refreshBooks: loadData }}>
      {children}
    </BooksContext.Provider>
  );
};