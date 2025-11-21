import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Plus, Trash2, UserCircle } from 'lucide-react';
import WoodButton from '../components/ui/WoodButton';
import { useUser } from '../context/UserContext';
import { useAudio } from '../context/AudioContext';
import { AVATAR_ASSETS } from '../components/avatar/AvatarAssets';
import ParentGateModal from '../components/features/ParentGateModal';

// Use Funny Heads instead of generic human seeds
const FUNNY_HEADS = [
  'head-toast',
  'head-burger',
  'head-cookie',
  'head-tv',
  'head-slime',
  'head-pumpkin',
  'head-earth',
  'head-moon',
  'head-bomb',
  'head-eye',
  'head-bear-brown',
  'head-bear-polar',
  'head-bear-aviator',
  'head-dog-pug',
  'head-dog-dalmatian',
  'head-cat-orange',
  'head-cat-black',
  'head-lizard'
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setParentName, setEquippedAvatar, addKid, kids, removeKid, subscribe, resetUser } = useUser();
  const { playClick, playSuccess } = useAudio();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State (Parent)
  const [pName, setPName] = useState('');
  const [pAvatar, setPAvatar] = useState(FUNNY_HEADS[0]);

  // Step 2 State (Kid Entry)
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');
  const [kidAvatar, setKidAvatar] = useState(FUNNY_HEADS[1]);
  
  // Step 3 State (Paywall)
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [showParentGate, setShowParentGate] = useState(false);

  // Reset user data when entering onboarding to ensure a fresh start
  useEffect(() => {
    if (resetUser && typeof resetUser === 'function') {
      resetUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HANDLERS ---

  const handleStep1Submit = () => {
    if (!pName.trim()) return;
    playClick();
    setParentName(pName);
    setEquippedAvatar(pAvatar);
    setStep(2);
  };

  const handleAddKid = () => {
    if (!kidName.trim()) return;
    playSuccess();
    addKid({
      id: Date.now().toString(),
      name: kidName,
      age: kidAge,
      avatarSeed: kidAvatar
    });
    // Reset inputs for next kid
    setKidName('');
    setKidAge('');
    setKidAvatar(FUNNY_HEADS[Math.floor(Math.random() * FUNNY_HEADS.length)]);
  };

  const handleStep2Continue = () => {
    playClick();
    setStep(3);
  };

  const handleSubscribeClick = () => {
    setShowParentGate(true);
  };

  const handleGateSuccess = () => {
    playSuccess();
    subscribe();
    navigate('/home');
  };

  // --- RENDERERS ---

  const renderProgress = () => (
    <div className="w-full max-w-md px-8 mb-8">
       <div className="flex justify-between mb-2 text-[#eecaa0] font-display font-bold text-xs uppercase tracking-widest">
          <span className={step >= 1 ? "text-[#FFD700]" : "opacity-50"}>Parent</span>
          <span className={step >= 2 ? "text-[#FFD700]" : "opacity-50"}>Family</span>
          <span className={step >= 3 ? "text-[#FFD700]" : "opacity-50"}>Unlock</span>
       </div>
       <div className="h-3 bg-[#3E1F07] rounded-full overflow-hidden border border-[#5c2e0b] shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#ffb300] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
       </div>
    </div>
  );

  // Helper for rendering internal avatar asset
  const renderAvatarAsset = (headKey: string) => {
    const isInternalHead = headKey.startsWith('head-');
    if (isInternalHead && AVATAR_ASSETS[headKey]) {
      return (
        <div className="w-[90%] h-[90%]">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {AVATAR_ASSETS[headKey]}
          </svg>
        </div>
      );
    }
    return (
      <img src={headKey} alt="avatar" className="w-full h-full object-cover" />
    );
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-y-auto no-scrollbar bg-[#0f172a]">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
          <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-[#0ea5e9]/20 to-transparent"></div>
      </div>

      {/* HEADER */}
      <div className="relative z-20 pt-6 px-6 flex items-center justify-between">
         {step > 1 && (
           <button onClick={() => setStep(prev => (prev - 1) as any)} className="text-[#eecaa0] hover:text-white transition-colors">
              <ChevronLeft size={32} />
           </button>
         )}
         {step === 1 && <div className="w-8"></div>} {/* Spacer */}
         
         <div className="flex flex-col items-center">
             <h1 className="font-display font-extrabold text-2xl text-white tracking-wide drop-shadow-md">
                 SETUP
             </h1>
         </div>
         
         <div className="w-8"></div> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center pt-6 pb-10 w-full relative z-10">
        
        {renderProgress()}

        {/* --- STEP 1: PARENT PROFILE --- */}
        {step === 1 && (
          <div className="w-full max-w-md px-6 animate-in slide-in-from-right-10 duration-500">
             
             {/* Clarification Banner */}
             <div className="bg-[#eecaa0]/20 rounded-lg p-3 mb-6 flex items-center gap-3 border border-[#eecaa0]/30">
                 <div className="bg-[#FFD700] rounded-full p-1.5 text-[#5c2e0b]">
                     <UserCircle size={20} />
                 </div>
                 <p className="text-[#eecaa0] text-sm font-bold">
                     Step 1: Create the <span className="text-white">Parent Profile</span>
                 </p>
             </div>

             {/* Avatar Picker */}
             <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] bg-[#f3e5ab] mb-6 relative overflow-hidden flex items-center justify-center">
                     <div className="w-[90%] h-[90%] flex items-center justify-center">
                         {renderAvatarAsset(pAvatar)}
                     </div>
                </div>
                
                <div className="w-full overflow-x-auto no-scrollbar pb-2">
                  <div className="flex gap-3 justify-center min-w-min px-2">
                    {FUNNY_HEADS.map((head) => (
                      <button
                        key={head}
                        onClick={() => setPAvatar(head)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 p-1 bg-[#f3e5ab] flex items-center justify-center ${pAvatar === head ? 'border-[#FFD700] scale-110 ring-2 ring-[#FFD700]/50' : 'border-white/20 opacity-60 hover:opacity-100'}`}
                      >
                          {renderAvatarAsset(head)}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             {/* Name Input */}
             <div className="bg-[#3E1F07] p-6 rounded-2xl border-2 border-[#5c2e0b] shadow-xl">
                 <label className="block text-[#eecaa0] font-display font-bold text-sm tracking-wide mb-2 uppercase">
                   Parent Name
                 </label>
                 <input 
                    type="text" 
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Mom, Dad"
                    className="w-full bg-black/30 border-2 border-[#8B4513] rounded-xl px-4 py-3 text-white font-display text-lg placeholder:text-white/30 focus:outline-none focus:border-[#FFD700] transition-colors text-center"
                    autoFocus
                 />
             </div>

             <div className="mt-8">
                <WoodButton 
                  fullWidth 
                  onClick={handleStep1Submit} 
                  disabled={!pName.trim()}
                  className={`py-4 text-xl ${!pName.trim() ? 'opacity-50 grayscale' : ''}`}
                >
                   NEXT: FAMILY
                </WoodButton>
             </div>
          </div>
        )}

        {/* --- STEP 2: ADD KIDS --- */}
        {step === 2 && (
           <div className="w-full max-w-md px-6 animate-in slide-in-from-right-10 duration-500 flex flex-col h-full">
              
              <div className="text-center mb-6">
                 <h2 className="text-white font-display font-bold text-xl">Who is adventuring?</h2>
                 <p className="text-[#eecaa0] text-sm">Create profiles for your children.</p>
              </div>

              {/* Added Kids List */}
              <div className="space-y-3 mb-6">
                  {kids.map((kid) => (
                      <div key={kid.id} className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/10 animate-in zoom-in">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[#f3e5ab] overflow-hidden border-2 border-white/50 flex items-center justify-center p-1">
                                   {renderAvatarAsset(kid.avatarSeed)}
                              </div>
                              <div>
                                  <h3 className="text-white font-bold font-display text-lg">{kid.name}</h3>
                                  <span className="text-[#eecaa0] text-xs font-bold">{kid.age} years old</span>
                              </div>
                          </div>
                          <button onClick={() => removeKid(kid.id)} className="w-8 h-8 bg-red-500/20 text-red-300 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
              </div>

              {/* Add Kid Form */}
              <div className="bg-[#3E1F07] p-5 rounded-2xl border-2 border-[#5c2e0b] shadow-xl mb-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 bg-[#FFD700] text-[#5c2e0b] text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW PROFILE</div>
                 
                 <div className="flex gap-4 mb-4">
                    <div className="w-20 shrink-0 flex flex-col gap-2">
                        <div 
                           className="w-20 h-20 rounded-xl bg-[#f3e5ab] border-2 border-[#8B4513] overflow-hidden relative cursor-pointer hover:opacity-90 flex items-center justify-center p-2"
                           onClick={() => setKidAvatar(FUNNY_HEADS[Math.floor(Math.random() * FUNNY_HEADS.length)])}
                        >
                             {renderAvatarAsset(kidAvatar)}
                             <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[8px] text-center py-0.5">TAP</div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <input 
                            type="text" 
                            placeholder="Child's Name"
                            value={kidName}
                            onChange={(e) => setKidName(e.target.value)}
                            className="w-full bg-black/30 border border-[#8B4513] rounded-lg px-3 py-2 text-white font-display placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]"
                        />
                        <input 
                            type="number" 
                            placeholder="Age"
                            value={kidAge}
                            onChange={(e) => setKidAge(e.target.value)}
                            className="w-20 bg-black/30 border border-[#8B4513] rounded-lg px-3 py-2 text-white font-display placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]"
                        />
                    </div>
                 </div>
                 
                 <button 
                    onClick={handleAddKid}
                    disabled={!kidName.trim()}
                    className={`w-full bg-[#5c2e0b] hover:bg-[#70380d] text-[#eecaa0] font-display font-bold py-3 rounded-xl border border-[#8B4513] flex items-center justify-center gap-2 transition-colors ${!kidName.trim() ? 'opacity-50' : ''}`}
                 >
                    <Plus size={18} />
                    ADD CHILD
                 </button>
              </div>

              <div className="mt-auto">
                 <WoodButton 
                    fullWidth 
                    onClick={handleStep2Continue}
                    className="py-4 text-xl"
                 >
                    {kids.length > 0 ? "CONTINUE" : "SKIP FOR NOW"}
                 </WoodButton>
              </div>
           </div>
        )}

        {/* --- STEP 3: PAYWALL / DEAL --- */}
        {step === 3 && (
            <div className="w-full max-w-md px-4 animate-in slide-in-from-right-10 duration-500 pb-10">
                 
                 {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl border-4 border-[#FFD700] flex flex-col items-center text-center relative">
                    
                    {/* Best Value Badge */}
                    <div className="absolute -top-4 bg-gradient-to-r from-[#d32f2f] to-[#c62828] text-white px-4 py-1 rounded-full font-bold shadow-md text-xs uppercase tracking-widest border-2 border-white transform rotate-2">
                        Special Launch Offer
                    </div>

                    <h2 className="text-[#3E1F07] font-display font-extrabold text-3xl leading-none mb-2 mt-2">
                        Unlock Everything
                    </h2>
                    <p className="text-[#5c2e0b] font-sans font-medium text-sm mb-6 opacity-80">
                        Give your kids unlimited access to faith-filled adventures.
                    </p>

                    {/* Pricing Options */}
                    <div className="w-full space-y-3 mb-6">
                        {/* Annual Option */}
                        <div 
                            onClick={() => setSelectedPlan('annual')}
                            className={`relative w-full rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                                selectedPlan === 'annual' 
                                ? 'bg-[#fff8e1] border-[#FFD700] shadow-md scale-[1.02] ring-1 ring-[#FFD700]' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="absolute top-0 right-0 bg-[#FFD700] text-[#3E1F07] text-[10px] font-extrabold px-3 py-1 rounded-bl-lg">
                                SAVE 70%
                            </div>
                            <div className="px-4 py-4 flex items-center justify-between">
                                <div className="flex flex-col text-left">
                                    <span className="font-display font-bold text-lg text-[#3E1F07]">Annual Plan</span>
                                    <span className="text-xs text-[#8B4513]">$0.55 / week</span>
                                </div>
                                <div className="flex flex-col items-end pr-2">
                                        <span className="font-display font-extrabold text-2xl text-[#3E1F07]">$29</span>
                                        <span className="text-[10px] text-red-500 line-through font-bold opacity-70">$99.99</span>
                                </div>
                            </div>
                            {selectedPlan === 'annual' && (
                                <div className="absolute top-1/2 -translate-y-1/2 left-3 bg-[#FFD700] rounded-full p-0.5">
                                    <Check size={12} className="text-[#3E1F07]" strokeWidth={4} />
                                </div>
                            )}
                        </div>

                        {/* Monthly Option */}
                        <div 
                            onClick={() => setSelectedPlan('monthly')}
                            className={`relative w-full rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                                selectedPlan === 'monthly' 
                                ? 'bg-[#fff8e1] border-[#FFD700] shadow-md scale-[1.02]' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                             <div className="px-4 py-4 flex items-center justify-between">
                                <div className="flex flex-col text-left pl-6">
                                    <span className="font-display font-bold text-lg text-[#3E1F07]">Monthly</span>
                                </div>
                                <div className="flex flex-col items-end">
                                     <span className="font-display font-extrabold text-2xl text-[#3E1F07]">$7.99</span>
                                </div>
                            </div>
                            {selectedPlan === 'monthly' && (
                                <div className="absolute top-1/2 -translate-y-1/2 left-3 bg-[#FFD700] rounded-full p-0.5">
                                    <Check size={12} className="text-[#3E1F07]" strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <WoodButton 
                        fullWidth 
                        variant="gold"
                        onClick={handleSubscribeClick}
                        className="py-4 text-xl shadow-xl mb-4 border-b-4 border-[#B8860B]"
                    >
                        START FREE TRIAL
                    </WoodButton>

                    <button 
                        onClick={() => navigate('/home')}
                        className="text-[#8B4513] text-xs font-bold underline decoration-dotted opacity-70 hover:opacity-100"
                    >
                        No thanks, I'll continue with limited access
                    </button>
                </div>
            </div>
        )}

        {/* Make sure ParentGateModal is imported at the top of your file:
            import ParentGateModal from '../components/ParentGateModal';
        */}
        <ParentGateModal 
            isOpen={showParentGate} 
            onClose={() => setShowParentGate(false)} 
            onSuccess={handleGateSuccess} 
        />

      </div>
    </div>
  );
};

export default OnboardingPage;