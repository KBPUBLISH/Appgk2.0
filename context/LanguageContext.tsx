import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/translationService';
import { getApiBaseUrl } from '../services/apiService';

// UI text translations - static strings used throughout the app
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    en: {
        // Navigation
        home: 'Home',
        explore: 'Explore',
        read: 'Read',
        listen: 'Listen',
        settings: 'Settings',
        profile: 'Profile',
        library: 'Library',
        
        // Actions
        play: 'Play',
        pause: 'Pause',
        stop: 'Stop',
        continue: 'Continue',
        next: 'Next',
        back: 'Back',
        skip: 'Skip',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        done: 'Done',
        
        // Sections
        dailyLessons: 'Daily Lessons',
        featuredBooks: 'Featured Books',
        recentlyRead: 'Recently Read',
        favorites: 'Favorites',
        categories: 'Categories',
        allBooks: 'All Books',
        audioBooks: 'Audio Books',
        
        // Book Reader
        readAloud: 'Read Aloud',
        autoPlay: 'Auto Play',
        voice: 'Voice',
        language: 'Language',
        selectLanguage: 'Select Language',
        
        // Lessons
        watchVideo: 'Watch Video',
        devotional: 'Devotional',
        activity: 'Activity',
        quiz: 'Quiz',
        takeQuiz: 'Take Quiz',
        episode: 'Episode',
        
        // Settings
        account: 'Account',
        notifications: 'Notifications',
        appearance: 'Appearance',
        privacy: 'Privacy',
        help: 'Help',
        about: 'About',
        signOut: 'Sign Out',
        
        // Common
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        noResults: 'No results found',
        searchPlaceholder: 'Search...',
        
        // Messages
        welcome: 'Welcome',
        greatJob: 'Great job!',
        keepGoing: 'Keep going!',
        theEnd: 'The End!',
        whatNext: "Great reading! What's next?",
        readAgain: 'Read Again',
        addToFavorites: 'Add to Favorites',
        removeFromFavorites: 'Remove from Favorites',
    },
};

// Cache for dynamically translated content
const translationCache = new Map<string, string>();

interface LanguageContextType {
    currentLanguage: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string; // Translate UI text
    translateText: (text: string) => Promise<string>; // Translate dynamic content
    translateTexts: (texts: string[]) => Promise<string[]>; // Batch translate
    isTranslating: boolean;
    supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'godlykids_app_language';

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
        return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    });
    const [isTranslating, setIsTranslating] = useState(false);
    const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, Record<string, string>>>({});

    // Save language preference
    const setLanguage = useCallback((lang: string) => {
        setCurrentLanguage(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }, []);

    // Translate static UI text
    const t = useCallback((key: string): string => {
        // If English, return English text
        if (currentLanguage === 'en') {
            return UI_TRANSLATIONS.en[key] || key;
        }

        // Check if we have a cached translation for this language
        if (dynamicTranslations[currentLanguage]?.[key]) {
            return dynamicTranslations[currentLanguage][key];
        }

        // Return English as fallback while translation loads
        return UI_TRANSLATIONS.en[key] || key;
    }, [currentLanguage, dynamicTranslations]);

    // Translate UI strings when language changes
    useEffect(() => {
        const translateUIStrings = async () => {
            if (currentLanguage === 'en') return;
            if (dynamicTranslations[currentLanguage]) return; // Already cached

            setIsTranslating(true);
            try {
                const englishStrings = UI_TRANSLATIONS.en;
                const keys = Object.keys(englishStrings);
                const texts = Object.values(englishStrings);

                // Batch translate all UI strings
                const response = await fetch(`${getApiBaseUrl()}translate/ui`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts, lang: currentLanguage }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const translated: Record<string, string> = {};
                    keys.forEach((key, index) => {
                        translated[key] = data.translations[index] || englishStrings[key];
                    });

                    setDynamicTranslations(prev => ({
                        ...prev,
                        [currentLanguage]: translated,
                    }));
                }
            } catch (error) {
                console.error('Failed to translate UI strings:', error);
            } finally {
                setIsTranslating(false);
            }
        };

        translateUIStrings();
    }, [currentLanguage]);

    // Translate dynamic content (book titles, descriptions, etc.)
    const translateText = useCallback(async (text: string): Promise<string> => {
        if (!text || currentLanguage === 'en') return text;

        const cacheKey = `${currentLanguage}_${text}`;
        if (translationCache.has(cacheKey)) {
            return translationCache.get(cacheKey)!;
        }

        try {
            const response = await fetch(
                `${getApiBaseUrl()}translate/text?lang=${currentLanguage}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                translationCache.set(cacheKey, data.translatedText);
                return data.translatedText;
            }
        } catch (error) {
            console.error('Translation error:', error);
        }

        return text;
    }, [currentLanguage]);

    // Batch translate multiple texts
    const translateTexts = useCallback(async (texts: string[]): Promise<string[]> => {
        if (currentLanguage === 'en') return texts;

        // Check cache for each text
        const results: string[] = [];
        const uncachedTexts: string[] = [];
        const uncachedIndices: number[] = [];

        texts.forEach((text, index) => {
            const cacheKey = `${currentLanguage}_${text}`;
            if (translationCache.has(cacheKey)) {
                results[index] = translationCache.get(cacheKey)!;
            } else {
                uncachedTexts.push(text);
                uncachedIndices.push(index);
            }
        });

        if (uncachedTexts.length === 0) {
            return results;
        }

        try {
            const response = await fetch(
                `${getApiBaseUrl()}translate/texts?lang=${currentLanguage}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts: uncachedTexts }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                data.translations.forEach((translated: string, i: number) => {
                    const originalIndex = uncachedIndices[i];
                    const originalText = uncachedTexts[i];
                    const cacheKey = `${currentLanguage}_${originalText}`;
                    translationCache.set(cacheKey, translated);
                    results[originalIndex] = translated;
                });
            }
        } catch (error) {
            console.error('Batch translation error:', error);
            // Fill remaining with original texts
            uncachedIndices.forEach((index, i) => {
                if (!results[index]) results[index] = uncachedTexts[i];
            });
        }

        return results;
    }, [currentLanguage]);

    const value: LanguageContextType = {
        currentLanguage,
        setLanguage,
        t,
        translateText,
        translateTexts,
        isTranslating,
        supportedLanguages: SUPPORTED_LANGUAGES,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;

