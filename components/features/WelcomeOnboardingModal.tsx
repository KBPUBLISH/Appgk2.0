import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Book, Gamepad2, Star, Sparkles } from 'lucide-react';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const ONBOARDING_PAGES = [
  {
    icon: '📖',
    title: 'Stories & Adventures',
    subtitle: 'Explore Bible stories with beautiful illustrations and read-along audio!',
    color: 'from-blue-500 to-indigo-600',
    accent: '#4F46E5'
  },
  {
    icon: '🎮',
    title: 'Fun Games & Challenges',
    subtitle: 'Play memory games, daily challenges, and earn gold coins!',
    color: 'from-amber-500 to-orange-600',
    accent: '#F59E0B'
  },
  {
    icon: '⭐',
    title: 'Learn & Grow',
    subtitle: 'Watch video lessons, complete activities, and grow in faith every day!',
    color: 'from-purple-500 to-pink-600',
    accent: '#A855F7'
  }
];

const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Complete onboarding
      onComplete();
    }
  };

  const page = ONBOARDING_PAGES[currentPage];
  const isLastPage = currentPage === ONBOARDING_PAGES.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md">
        {/* Animated sparkles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles 
                size={12 + Math.random() * 12} 
                className="text-white/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        {/* Card Content */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Colored Header Section */}
          <div className={`bg-gradient-to-br ${page.color} pt-12 pb-16 px-6 text-center relative overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            
            {/* Icon */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white/30">
                <span className="text-5xl">{page.icon}</span>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-display font-extrabold text-white drop-shadow-lg mb-2">
              {page.title}
            </h2>
          </div>

          {/* Body Section */}
          <div className="px-6 pt-6 pb-8 -mt-8 bg-white rounded-t-3xl relative">
            {/* Subtitle */}
            <p className="text-gray-600 text-center text-lg leading-relaxed mb-8">
              {page.subtitle}
            </p>

            {/* Page Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {ONBOARDING_PAGES.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentPage 
                      ? 'w-8 bg-gradient-to-r ' + page.color
                      : i < currentPage
                        ? 'w-2 bg-gray-400'
                        : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-display font-bold text-lg text-white shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${page.color}`}
              style={{
                boxShadow: `0 8px 20px ${page.accent}40`
              }}
            >
              {isLastPage ? (
                <>
                  <span>Let's Go!</span>
                  <Star className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Skip option (only on non-last pages) */}
            {!isLastPage && (
              <button
                onClick={onComplete}
                className="w-full mt-3 py-2 text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors"
              >
                Skip intro
              </button>
            )}
          </div>
        </div>

        {/* Welcome badge at top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-lg border-2 border-gray-100">
          <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
            <span className="text-lg">👋</span> Welcome!
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomeOnboardingModal;

