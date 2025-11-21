
import React from 'react';
import { AVATAR_ASSETS } from './AvatarAssets';
import DraggableArm from './DraggableArm';
import { useUser, ArmPosition } from '../../context/UserContext';

interface AvatarCompositorProps {
  headUrl: string;
  hat?: string | null;
  body?: string | null;
  leftArm?: string | null;
  rightArm?: string | null;
  legs?: string | null;
  className?: string;
  isEditable?: boolean; // Enable/disable arm positioning (default: false)
  onEditRequest?: () => void; // Callback when arm is clicked in non-editable mode
  selectedArm?: 'leftArm' | 'rightArm' | null; // Which arm is currently selected
  onArmSelect?: (armType: 'leftArm' | 'rightArm' | null) => void; // Callback when arm is selected
  onArmRotate?: (armType: 'leftArm' | 'rightArm', angle: number) => void; // Callback to rotate arm
}

const AvatarCompositor: React.FC<AvatarCompositorProps> = ({
  headUrl,
  hat,
  body,
  leftArm,
  rightArm,
  legs,
  className = "w-full h-full",
  isEditable = false,
  onEditRequest,
  selectedArm = null,
  onArmSelect,
  onArmRotate
}) => {
  const { getArmPosition, setArmPosition } = useUser();
  
  // Card Styles - The "Badge/Button" look
  const cardClass = "absolute bg-[#fdf6e3] border-[3px] border-[#8B4513] shadow-[0_3px_0_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden";
  
  // Robust check: treat any string starting with "head-" as internal ID.
  // If AVATAR_ASSETS doesn't have it, we still treat it as internal to avoid 404ing on an image tag.
  const isInternalHead = headUrl && headUrl.startsWith('head-');
  const headAsset = isInternalHead ? AVATAR_ASSETS[headUrl] : null;

  // Helper function to get default arm position
  const getDefaultArmPosition = (armType: 'leftArm' | 'rightArm'): ArmPosition => {
    if (armType === 'leftArm') {
      return {
        top: '50%',
        horizontal: '-40%',
        rotation: -15,
        transformOrigin: 'left center',
        width: '65%',
        height: '80%'
      };
    } else {
      return {
        top: '50%',
        horizontal: '-40%',
        rotation: 15,
        transformOrigin: 'right center',
        width: '65%',
        height: '80%'
      };
    }
  };

  // Get arm positions from context or use defaults
  const leftArmPosition = getArmPosition('leftArm') || getDefaultArmPosition('leftArm');
  const rightArmPosition = getArmPosition('rightArm') || getDefaultArmPosition('rightArm');

  return (
    <div className={`relative ${className}`}>
      {/* 
         LAYOUT CONCEPT: "Connected Modules"
         The Head is the central hub.
         The Body connects to the Head.
         Limbs connect to the Body.
      */}

      {/* 1. HEAD (Anchor) */}
      <div className="absolute inset-0 z-30 rounded-full overflow-hidden border-[4px] border-[#eecaa0] bg-[#f3e5ab] shadow-inner flex items-center justify-center">
          {headAsset ? (
               <div className="w-[90%] h-[90%]">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      {headAsset}
                  </svg>
               </div>
          ) : (
               // Fallback Logic
               isInternalHead ? (
                 /* Missing internal asset fallback - shows a Question Mark instead of broken image */
                 <div className="w-full h-full bg-[#f3e5ab] flex flex-col items-center justify-center text-[#8B4513]">
                    <span className="text-xs font-bold">?</span>
                 </div>
               ) : (
                 /* External Image URL */
                 <img src={headUrl || ''} alt="Head" className="w-full h-full object-cover" />
               )
          )}
      </div>

      {/* 2. HAT (Connects to Head) */}
      {hat && AVATAR_ASSETS[hat] && (
          <div 
            className={`${cardClass} z-40 rounded-2xl`}
            style={{ 
                top: '-55%', left: '10%', width: '80%', height: '70%',
                transform: 'rotate(-5deg)' 
            }}
          >
               <svg viewBox="0 0 100 80" className="w-full h-full p-1 overflow-visible">
                  {AVATAR_ASSETS[hat]}
               </svg>
          </div>
      )}

      {/* 3. BODY CONTAINER (Connects to Head) 
          This container holds the Body Card AND the attached Limbs.
          If Body is missing, Limbs are not rendered.
      */}
      {body && AVATAR_ASSETS[body] && (
          <div
             className="absolute z-20 flex items-center justify-center"
             style={{
                // Positioned relative to the Head container
                top: '80%', left: '50%', width: '70%', height: '70%',
                transform: 'translate(-50%, 0)' 
             }}
          >
               {/* 3a. LEGS (Behind Body) */}
               {legs && AVATAR_ASSETS[legs] && (
                    <div 
                        className={`${cardClass} z-0 rounded-xl bg-[#fff8e1]`}
                        style={{ 
                            top: '85%', left: '10%', width: '80%', height: '80%',
                            transform: 'rotate(-2deg)'
                        }}
                    >
                        <svg viewBox="0 0 100 60" className="w-full h-full p-1 overflow-visible">
                            {AVATAR_ASSETS[legs]}
                        </svg>
                    </div>
                )}

               {/* 3b. RIGHT ARM (Viewer Left) */}
               {rightArm && AVATAR_ASSETS[rightArm] && (
                  <DraggableArm
                    armType="rightArm"
                    initialPosition={rightArmPosition}
                    onPositionChange={(position) => setArmPosition('rightArm', position)}
                    isEditable={isEditable}
                    onEditRequest={onEditRequest}
                    isSelected={selectedArm === 'rightArm'}
                    onSelect={() => onArmSelect && onArmSelect(selectedArm === 'rightArm' ? null : 'rightArm')}
                    onRotate={(angle) => {
                      if (onArmRotate) {
                        const newPosition: ArmPosition = {
                          ...rightArmPosition,
                          rotation: angle
                        };
                        setArmPosition('rightArm', newPosition);
                        onArmRotate('rightArm', angle);
                      }
                    }}
                  >
                    <div className={`${cardClass} w-full h-full rounded-xl`}>
                      <svg viewBox="0 0 50 100" className="w-full h-full p-0 overflow-visible">
                        <g transform="translate(5, 0)">
                          {AVATAR_ASSETS[rightArm]}
                        </g>
                      </svg>
                    </div>
                  </DraggableArm>
               )}

               {/* 3c. LEFT ARM (Viewer Right) */}
               {leftArm && AVATAR_ASSETS[leftArm] && (
                  <DraggableArm
                    armType="leftArm"
                    initialPosition={leftArmPosition}
                    onPositionChange={(position) => setArmPosition('leftArm', position)}
                    isEditable={isEditable}
                    onEditRequest={onEditRequest}
                    isSelected={selectedArm === 'leftArm'}
                    onSelect={() => onArmSelect && onArmSelect(selectedArm === 'leftArm' ? null : 'leftArm')}
                    onRotate={(angle) => {
                      if (onArmRotate) {
                        const newPosition: ArmPosition = {
                          ...leftArmPosition,
                          rotation: angle
                        };
                        setArmPosition('leftArm', newPosition);
                        onArmRotate('leftArm', angle);
                      }
                    }}
                  >
                    <div className={`${cardClass} w-full h-full rounded-xl`}>
                      <svg viewBox="0 0 50 100" className="w-full h-full p-0 overflow-visible">
                        <g transform="translate(-5, 0)">
                          {AVATAR_ASSETS[leftArm]}
                        </g>
                      </svg>
                    </div>
                  </DraggableArm>
               )}

               {/* 3d. THE BODY CARD ITSELF */}
               <div className={`${cardClass} z-10 rounded-2xl w-full h-full`}>
                   <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible">
                      <g transform="scale(1.15) translate(-7.5, -5)">
                         {AVATAR_ASSETS[body]}
                      </g>
                   </svg>
               </div>
          </div>
      )}

    </div>
  );
};

export default AvatarCompositor;
