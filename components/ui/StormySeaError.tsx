import React from 'react';
import { RefreshCw, Anchor, CloudRain } from 'lucide-react';

interface StormySeaErrorProps {
  onRetry: () => void;
  message?: string;
  isLoading?: boolean;
}

const StormySeaError: React.FC<StormySeaErrorProps> = ({ 
  onRetry, 
  message = "Something rocked the boat!", 
  isLoading = false 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Animated stormy scene */}
      <div className="relative mb-6">
        {/* Rain cloud */}
        <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
          <CloudRain className="w-20 h-20 text-gray-400" />
        </div>
        
        {/* Waves animation */}
        <div className="flex justify-center gap-1 mt-2">
          <div className="w-4 h-4 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="w-4 h-4 bg-blue-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-4 h-4 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="w-4 h-4 bg-blue-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
          <div className="w-4 h-4 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
        </div>
        
        {/* Anchor */}
        <Anchor className="w-10 h-10 text-amber-600 mx-auto mt-2 animate-swing" />
      </div>
      
      {/* Message */}
      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
        ⚓ Ahoy, Captain!
      </h3>
      <p className="text-white/90 mb-2 text-lg font-medium drop-shadow">
        {message}
      </p>
      <p className="text-white/70 mb-6 text-sm max-w-xs">
        We hit some rough waters trying to load your content. Let's try sailing again!
      </p>
      
      {/* Retry button */}
      <button
        onClick={onRetry}
        disabled={isLoading}
        className={`
          flex items-center gap-3 px-6 py-3 
          bg-gradient-to-r from-amber-500 to-amber-600 
          hover:from-amber-600 hover:to-amber-700
          text-white font-bold rounded-full 
          shadow-lg shadow-amber-500/30
          transform transition-all duration-200
          ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        `}
      >
        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Sailing back...' : 'Set Sail Again!'}
      </button>
      
      {/* Swipe hint */}
      <p className="text-white/50 text-xs mt-4 flex items-center gap-2">
        <span className="animate-bounce">↑</span>
        Or pull down to refresh
      </p>

      {/* CSS for custom animation */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};

export default StormySeaError;


