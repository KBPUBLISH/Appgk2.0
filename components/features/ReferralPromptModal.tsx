import React, { useState, useEffect } from 'react';
import { X, Gift, Copy, Check, Share2, Coins, Users, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface ReferralPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'first_open' | 'zero_coins' | 'manual';
}

const ReferralPromptModal: React.FC<ReferralPromptModalProps> = ({ isOpen, onClose, trigger }) => {
  const { referralCode } = useUser();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join Godly Kids! 🌟',
      text: `Hey! Use my special code ${referralCode} when you join Godly Kids and we BOTH get 250 gold coins! 🪙✨`,
      url: 'https://app.godlykids.com',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyCode();
      }
    } catch (err) {
      console.log('Share cancelled');
    }
  };

  if (!isOpen) return null;

  const getMessage = () => {
    switch (trigger) {
      case 'first_open':
        return {
          title: 'Welcome to Godly Kids! 🌟',
          subtitle: 'Share with friends and earn rewards together!',
        };
      case 'zero_coins':
        return {
          title: 'Need More Coins? 🪙',
          subtitle: 'Share your code with friends to earn free coins!',
        };
      default:
        return {
          title: 'Earn Free Coins! 🎉',
          subtitle: 'Share your code with friends and family!',
        };
    }
  };

  const { title, subtitle } = getMessage();

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header with illustration */}
        <div className="relative bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 pt-8 pb-6 px-6 text-center">
          {/* Decorative coins */}
          <div className="absolute top-4 left-6 opacity-60">
            <Coins className="w-8 h-8 text-amber-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
          </div>
          <div className="absolute top-8 right-8 opacity-60">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-40">
            <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Main icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-lg mb-4">
            <Gift className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">{title}</h2>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Reward explanation */}
          <div className="flex items-center justify-center gap-3 mb-5 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span className="text-gray-700 font-medium">You</span>
            </div>
            <span className="text-amber-500 font-bold">+</span>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span className="text-gray-700 font-medium">Friend</span>
            </div>
            <span className="text-amber-500 font-bold">=</span>
            <div className="flex items-center gap-1.5 bg-amber-400 text-white px-3 py-1.5 rounded-full font-bold shadow">
              <Coins className="w-4 h-4" />
              <span>250 each!</span>
            </div>
          </div>

          {/* Referral code */}
          <div className="mb-5">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2 text-center">Your Special Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-center">
                <span className="font-mono font-bold text-xl text-gray-800 tracking-wider">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`p-3 rounded-xl transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && (
              <p className="text-center text-green-600 text-sm mt-2 font-medium">Code copied! ✓</p>
            )}
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Share2 className="w-5 h-5" />
            Share with Friends
          </button>

          {/* Skip text */}
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralPromptModal;

