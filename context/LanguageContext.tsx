import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/translationService';
import { getApiBaseUrl } from '../services/apiService';

// All UI text strings used throughout the app (English as default)
const UI_STRINGS: Record<string, string> = {
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
    signIn: 'Sign In',
    signOut: 'Sign Out',
    
    // Settings Page
    audioAndNotifications: 'Audio & Notifications',
    backgroundMusic: 'Background Music',
    soundEffects: 'Sound Effects',
    notifications: 'Notifications',
    language: 'Language',
    appLanguage: 'App Language',
    voiceLibrary: 'Voice Library',
    deleteVoice: 'Delete Voice',
    restorePurchases: 'Restore Purchases',
    manageSubscription: 'Manage Subscription',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    helpSupport: 'Help & Support',
    account: 'Account',
    appearance: 'Appearance',
    privacy: 'Privacy',
    help: 'Help',
    about: 'About',
    
    // Sections & Titles
    dailyLessons: 'Daily Lessons',
    featuredBooks: 'Featured Books',
    recentlyRead: 'Recently Read',
    favorites: 'Favorites',
    categories: 'Categories',
    allBooks: 'All Books',
    audioBooks: 'Audio Books',
    dailyTasks: 'Daily Tasks & IQ Games',
    thisWeeksProgress: "This Week's Progress",
    
    // Book Reader
    readAloud: 'Read Aloud',
    autoPlay: 'Auto Play',
    voice: 'Voice',
    selectLanguage: 'Select Language',
    selectVoice: 'Select Voice',
    
    // Lessons
    watchVideo: 'Watch Video',
    devotional: 'Devotional',
    activity: 'Activity',
    quiz: 'Quiz',
    takeQuiz: 'Take Quiz',
    episode: 'Episode',
    continueToDevotional: 'Continue to Devotional',
    
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
    adventureAwaits: 'Adventure Awaits!',
    
    // Onboarding
    setup: 'Setup',
    parent: 'Parent',
    family: 'Family',
    unlock: 'Unlock',
    parentName: 'Parent Name',
    createParentProfile: 'Step 1: Create the Parent Profile',
    tapToChangeAvatar: 'Tap to change avatar',
    nextFamily: 'NEXT: FAMILY',
    
    // Profile
    selectProfile: 'Select Profile',
    addChild: 'Add Child',
    editProfile: 'Edit Profile',
    
    // Subscription
    premium: 'Premium',
    subscribe: 'Subscribe',
    freeTrial: 'Free Trial',
    
    // Days
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    
    // Misc
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    comingSoon: 'Coming Soon',
    restAndPlayDay: 'Rest & Play Day!',
    noLessonsToday: 'No lessons today. Enjoy reading stories or playing games with family!',
};

// Storage keys
const LANGUAGE_STORAGE_KEY = 'godlykids_app_language';
const TRANSLATIONS_CACHE_KEY = 'godlykids_translations_cache';

interface LanguageContextType {
    currentLanguage: string;
    setLanguage: (lang: string) => void;
    t: (key: string, fallback?: string) => string;
    translateText: (text: string) => Promise<string>;
    translateTexts: (texts: string[]) => Promise<string[]>;
    isTranslating: boolean;
    supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
        return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    });
    const [isTranslating, setIsTranslating] = useState(false);
    const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(() => {
        // Load cached translations from localStorage
        try {
            const cached = localStorage.getItem(TRANSLATIONS_CACHE_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            console.error('Failed to load cached translations:', e);
        }
        return { en: UI_STRINGS };
    });

    // Save language preference and trigger translation
    const setLanguage = useCallback((lang: string) => {
        setCurrentLanguage(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }, []);

    // Translate static UI text
    const t = useCallback((key: string, fallback?: string): string => {
        // If English, return English text directly
        if (currentLanguage === 'en') {
            return UI_STRINGS[key] || fallback || key;
        }

        // Check if we have a translation for this language
        if (translations[currentLanguage]?.[key]) {
            return translations[currentLanguage][key];
        }

        // Return English as fallback
        return UI_STRINGS[key] || fallback || key;
    }, [currentLanguage, translations]);

    // Translate all UI strings when language changes
    useEffect(() => {
        const translateAllStrings = async () => {
            if (currentLanguage === 'en') return;
            if (translations[currentLanguage] && Object.keys(translations[currentLanguage]).length > 10) {
                // Already have translations for this language
                return;
            }

            setIsTranslating(true);
            console.log(`🌐 Translating UI to ${currentLanguage}...`);

            try {
                const keys = Object.keys(UI_STRINGS);
                const texts = Object.values(UI_STRINGS);

                // Translate in batches of 20 to avoid API limits
                const batchSize = 20;
                const translatedStrings: Record<string, string> = {};

                for (let i = 0; i < texts.length; i += batchSize) {
                    const batchTexts = texts.slice(i, i + batchSize);
                    const batchKeys = keys.slice(i, i + batchSize);

                    try {
                        const response = await fetch(`${getApiBaseUrl()}translate/ui`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ texts: batchTexts, lang: currentLanguage }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            batchKeys.forEach((key, index) => {
                                translatedStrings[key] = data.translations[index] || UI_STRINGS[key];
                            });
                        } else {
                            // Fallback to English for this batch
                            batchKeys.forEach((key, index) => {
                                translatedStrings[key] = UI_STRINGS[key];
                            });
                        }
                    } catch (err) {
                        console.error('Batch translation error:', err);
                        batchKeys.forEach((key) => {
                            translatedStrings[key] = UI_STRINGS[key];
                        });
                    }
                }

                // Update state and cache
                const newTranslations = {
                    ...translations,
                    [currentLanguage]: translatedStrings,
                };
                setTranslations(newTranslations);
                
                // Cache to localStorage
                try {
                    localStorage.setItem(TRANSLATIONS_CACHE_KEY, JSON.stringify(newTranslations));
                } catch (e) {
                    console.error('Failed to cache translations:', e);
                }

                console.log(`✅ UI translated to ${currentLanguage} (${Object.keys(translatedStrings).length} strings)`);
            } catch (error) {
                console.error('Failed to translate UI strings:', error);
            } finally {
                setIsTranslating(false);
            }
        };

        translateAllStrings();
    }, [currentLanguage]);

    // Translate dynamic content (book titles, descriptions, etc.)
    const translateText = useCallback(async (text: string): Promise<string> => {
        if (!text || currentLanguage === 'en') return text;

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
                return data.translatedText;
            }
        } catch (error) {
            console.error('Translation error:', error);
        }

        return text;
    }, [currentLanguage]);

    // Batch translate multiple texts
    const translateTexts = useCallback(async (texts: string[]): Promise<string[]> => {
        if (currentLanguage === 'en' || texts.length === 0) return texts;

        try {
            const response = await fetch(
                `${getApiBaseUrl()}translate/texts?lang=${currentLanguage}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.translations;
            }
        } catch (error) {
            console.error('Batch translation error:', error);
        }

        return texts;
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
