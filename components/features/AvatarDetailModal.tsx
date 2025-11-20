
import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import AvatarCompositor from '../avatar/AvatarCompositor';
import { useUser } from '../../context/UserContext';
import WoodButton from '../ui/WoodButton';

interface AvatarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const AvatarDetailModal: React.FC<AvatarDetailModalProps> = ({ isOpen, onClose, onEdit }) => {
  const navigate = useNavigate();
  const { equippedAvatar, equippedFrame, equippedHat, equippedBody, equippedLeftArm, equippedRightArm, equippedLegs } = useUser();

  if (!isOpen) return null;

  const handleGoToProfiles = () => {
    onClose();
    navigate('/profile');
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex justify-center px-4 pointer-events-auto overflow-y-auto no-scrollbar">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Scrollable Content Container */}
      <div className="relative w-full max-w-sm flex flex-col items-center min-h-full py-10 animate-in zoom-in-90 duration-300 z-10">
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-0 text-white hover:text-gray-300 transition-colors z-50 bg-black/20 rounded-full p-2"
          >
              <X size={24} />
          </button>

          {/* Avatar Large View - INCREASED MARGIN FOR LEGS */}
          {/* The avatar compositor can extend significantly downwards. We use a large margin-bottom to reserve space. */}
          <div className="w-48 h-48 md:w-64 md:h-64 relative mb-[18rem] md:mb-[22rem] shrink-0 mt-10">
              {/* Glow */}
              <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-3xl opacity-20 animate-pulse"></div>
              
              <div className={`w-full h-full rounded-full border-[8px] ${equippedFrame} shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#f3e5ab] relative z-10 overflow-visible`}>
                   <AvatarCompositor 
                        headUrl={equippedAvatar}
                        hat={equippedHat}
                        body={equippedBody}
                        leftArm={equippedLeftArm}
                        rightArm={equippedRightArm}
                        legs={equippedLegs}
                   />
              </div>
          </div>

          {/* Text Info Panel */}
          <div className="text-center relative z-20 bg-black/40 p-4 rounded-2xl backdrop-blur-sm w-full mb-4 border border-white/5 shadow-xl">
             <h2 className="font-display font-extrabold text-white text-3xl mb-1 text-shadow-lg tracking-wide">YOUR AVATAR</h2>
             <p className="text-white/70 font-bold">Ready for adventure!</p>
          </div>

          {/* Buttons */}
          <div className="w-full max-w-xs space-y-3 relative z-20 pb-10">
              <WoodButton variant="gold" onClick={() => { onClose(); onEdit(); }} className="w-full py-4 text-xl shadow-xl">
                 CUSTOMIZE
              </WoodButton>
              
              <WoodButton variant="light" onClick={handleGoToProfiles} className="w-full py-3 text-lg shadow-lg border-b-4">
                 GO TO PROFILES
              </WoodButton>
          </div>

      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default AvatarDetailModal;
