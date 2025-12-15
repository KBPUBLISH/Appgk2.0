import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiService';
import { Sparkles, Gift, Shield, Heart, Play, ArrowRight, BookOpen, Music, Gamepad2 } from 'lucide-react';

interface InfluencerData {
    name: string;
    code: string;
    discountPercent: number;
    trialDays: number;
    customSettings?: {
        headline?: string;
        subheadline?: string;
        imageUrl?: string;
        videoUrl?: string;
    };
}

const InfluencerLandingPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    
    const [influencer, setInfluencer] = useState<InfluencerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInfluencer = async () => {
            if (!code) {
                setError('Invalid referral link');
                setLoading(false);
                return;
            }

            try {
                // Track the click
                await ApiService.trackInfluencerClick(code);
                
                // Get influencer info
                const data = await ApiService.getInfluencer(code);
                if (data) {
                    setInfluencer(data);
                    // Store code in localStorage for attribution during onboarding
                    localStorage.setItem('godlykids_influencer_code', code.toUpperCase());
                    localStorage.setItem('godlykids_influencer_name', data.name);
                    localStorage.setItem('godlykids_influencer_discount', String(data.discountPercent));
                    localStorage.setItem('godlykids_influencer_trial', String(data.trialDays));
                } else {
                    setError('This referral code is not valid or has expired');
                }
            } catch (err) {
                setError('Failed to load referral information');
            } finally {
                setLoading(false);
            }
        };

        loadInfluencer();
    }, [code]);

    const handleGetStarted = () => {
        // Navigate to onboarding - the influencer code is already in localStorage
        navigate('/onboarding');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading your special offer...</p>
                </div>
            </div>
        );
    }

    if (error || !influencer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
                    <p className="text-white/80 mb-6">{error || 'Something went wrong'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[#FFD700] text-[#1a237e] font-bold rounded-full hover:bg-[#FFC000] transition-all"
                    >
                        Go to Godly Kids
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] relative overflow-auto">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center p-4 py-8">
                {/* Logo */}
                <div className="mb-6">
                    <img 
                        src="/assets/images/icon.png" 
                        alt="Godly Kids" 
                        className="w-20 h-20 rounded-2xl shadow-lg"
                    />
                </div>

                {/* Special Offer Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1a237e] px-5 py-2 rounded-full text-sm font-bold mb-6 shadow-lg animate-pulse">
                    <Gift className="w-5 h-5" />
                    EXCLUSIVE: {influencer.discountPercent}% OFF + {influencer.trialDays}-Day Free Trial
                </div>

                {/* Main Card */}
                <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 mb-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {influencer.customSettings?.headline || `${influencer.name} Recommends Godly Kids!`}
                        </h1>
                        <p className="text-white/80 text-sm">
                            {influencer.customSettings?.subheadline || 'The #1 faith-based app for kids. Stories, lessons & games your family will love.'}
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <BookOpen className="w-6 h-6 text-[#FFD700] mx-auto mb-1" />
                            <p className="text-white text-xs font-medium">Bible Stories</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <Play className="w-6 h-6 text-green-400 mx-auto mb-1" />
                            <p className="text-white text-xs font-medium">Video Lessons</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <Music className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                            <p className="text-white text-xs font-medium">Worship Songs</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <Gamepad2 className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                            <p className="text-white text-xs font-medium">Fun Games</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleGetStarted}
                        className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1a237e] font-bold text-lg rounded-xl hover:from-[#FFC000] hover:to-[#FF9500] transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-white/50 text-xs text-center mt-3">
                        No credit card required • Cancel anytime
                    </p>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-6 text-white/60 text-xs mb-6">
                    <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>Kid-Safe</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Ad-Free</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>Faith-Based</span>
                    </div>
                </div>

                {/* What's included section */}
                <div className="w-full max-w-md bg-white/5 rounded-2xl p-5 border border-white/10">
                    <h3 className="text-white font-bold text-center mb-4">What's Included:</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-white/80 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-xs">✓</span>
                            </div>
                            <span>100+ Interactive Bible Stories</span>
                        </li>
                        <li className="flex items-center gap-3 text-white/80 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-xs">✓</span>
                            </div>
                            <span>Daily Video Devotionals</span>
                        </li>
                        <li className="flex items-center gap-3 text-white/80 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-xs">✓</span>
                            </div>
                            <span>Christian Music & Audiobooks</span>
                        </li>
                        <li className="flex items-center gap-3 text-white/80 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-xs">✓</span>
                            </div>
                            <span>Educational Games & Activities</span>
                        </li>
                        <li className="flex items-center gap-3 text-white/80 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 text-xs">✓</span>
                            </div>
                            <span>Multiple Child Profiles</span>
                        </li>
                    </ul>
                </div>

                {/* Already have account */}
                <p className="mt-6 text-white/60 text-sm">
                    Already have an account?{' '}
                    <button 
                        onClick={() => navigate('/signin')}
                        className="text-[#FFD700] hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default InfluencerLandingPage;
