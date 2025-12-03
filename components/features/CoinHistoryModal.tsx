import React from 'react';
import { X, Coins, Gift, BookOpen, Gamepad2, Calendar, Users, ShoppingBag, TrendingUp, TrendingDown, Share2, Copy, Check } from 'lucide-react';
import { useUser, CoinTransaction } from '../../context/UserContext';

interface CoinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShop: () => void;
}

const getSourceIcon = (source: CoinTransaction['source']) => {
  switch (source) {
    case 'quiz':
      return <BookOpen className="w-4 h-4" />;
    case 'lesson':
      return <Calendar className="w-4 h-4" />;
    case 'game':
      return <Gamepad2 className="w-4 h-4" />;
    case 'daily':
      return <Gift className="w-4 h-4" />;
    case 'referral':
      return <Users className="w-4 h-4" />;
    case 'purchase':
      return <ShoppingBag className="w-4 h-4" />;
    default:
      return <Coins className="w-4 h-4" />;
  }
};

const getSourceColor = (source: CoinTransaction['source']) => {
  switch (source) {
    case 'quiz':
      return 'bg-blue-500/20 text-blue-400';
    case 'lesson':
      return 'bg-purple-500/20 text-purple-400';
    case 'game':
      return 'bg-green-500/20 text-green-400';
    case 'daily':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'referral':
      return 'bg-pink-500/20 text-pink-400';
    case 'purchase':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

const CoinHistoryModal: React.FC<CoinHistoryModalProps> = ({ isOpen, onClose, onOpenShop }) => {
  const { coins, coinTransactions } = useUser();
  const [copied, setCopied] = React.useState(false);
  
  // Generate a simple referral code based on timestamp (placeholder)
  const referralCode = React.useMemo(() => {
    const code = `GODLY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return code;
  }, []);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = async () => {
    const shareData = {
      title: 'Join Godly Kids!',
      text: `Use my referral code ${referralCode} to get started with Godly Kids and we both earn 100 gold coins!`,
      url: 'https://app.godlykids.com',
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyCode();
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md max-h-[85vh] bg-gradient-to-b from-[#2a1810] to-[#1a0f08] rounded-3xl border-2 border-[#8B4513]/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#8B4513]/30">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
          
          {/* Coin Balance */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFD700]/20 to-[#B8860B]/20 px-6 py-3 rounded-2xl border border-[#FFD700]/30">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFE55C] to-[#DAA520] rounded-full border-2 border-[#B8860B] shadow-lg flex items-center justify-center">
                  <span className="text-[#5c2e0b] font-black text-lg">G</span>
                </div>
                <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full"></div>
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs font-medium">Your Balance</p>
                <p className="text-[#FFD700] font-black text-2xl font-display">
                  {coins.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Invite Friends Section */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-b border-[#8B4513]/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">Invite Friends</h3>
              <p className="text-white/60 text-xs">Earn 100 coins for each friend!</p>
            </div>
          </div>
          
          {/* Referral Code */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-black/30 rounded-xl px-4 py-2.5 border border-white/10">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Your Code</p>
              <p className="text-[#FFD700] font-mono font-bold text-lg">{referralCode}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-3 rounded-xl transition-all ${
                copied 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-black/30 border border-white/10 hover:bg-black/50'
              }`}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-white/70" />
              )}
            </button>
          </div>
          
          <button
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
          >
            <Share2 className="w-4 h-4" />
            Share with Friends
          </button>
        </div>
        
        {/* Transaction History */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-white/80 font-bold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FFD700]" />
            Transaction History
          </h3>
          
          {coinTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/50 text-sm">No transactions yet</p>
              <p className="text-white/30 text-xs mt-1">
                Earn coins by completing quizzes, games, and lessons!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {coinTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Source Icon */}
                  <div className={`p-2 rounded-xl ${getSourceColor(transaction.source)}`}>
                    {getSourceIcon(transaction.source)}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {transaction.reason}
                    </p>
                    <p className="text-white/40 text-xs">
                      {formatTimeAgo(transaction.timestamp)}
                    </p>
                  </div>
                  
                  {/* Amount */}
                  <div className={`flex items-center gap-1 font-bold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#8B4513]/30 bg-black/20">
          <button
            onClick={() => {
              onClose();
              onOpenShop();
            }}
            className="w-full py-3 bg-gradient-to-r from-[#8B4513] to-[#A0522D] hover:from-[#9B5523] hover:to-[#B0623D] rounded-xl font-bold text-[#FFD700] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg border-2 border-[#5c2e0b]"
          >
            <ShoppingBag className="w-5 h-5" />
            Visit Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinHistoryModal;

