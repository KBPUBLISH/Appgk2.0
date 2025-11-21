
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import WoodButton from '../ui/WoodButton';
import { X, ShoppingBag, Check, Trash2, Crown, Move } from 'lucide-react';
import { useUser, ShopItem } from '../../context/UserContext';
import AvatarCompositor from '../avatar/AvatarCompositor';
import { AVATAR_ASSETS } from '../avatar/AvatarAssets';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- SHOP DATA ---
const SHOP_AVATARS: ShopItem[] = [
    // FUNNY HEADS
    { id: 'av1', name: 'Toast', price: 50, type: 'avatar', value: 'head-toast' },
    { id: 'av2', name: 'Burger', price: 50, type: 'avatar', value: 'head-burger' },
    { id: 'av3', name: 'TV', price: 50, type: 'avatar', value: 'head-tv' },
    { id: 'av4', name: 'Cookie', price: 50, type: 'avatar', value: 'head-cookie' },
    { id: 'av5', name: 'Slime', price: 50, type: 'avatar', value: 'head-slime' },
    { id: 'av6', name: 'Pumpkin', price: 50, type: 'avatar', value: 'head-pumpkin' },
    { id: 'av7', name: 'Earth', price: 50, type: 'avatar', value: 'head-earth', isPremium: true },
    { id: 'av8', name: 'Moon', price: 50, type: 'avatar', value: 'head-moon', isPremium: true },
    { id: 'av9', name: 'Bomb', price: 50, type: 'avatar', value: 'head-bomb', isPremium: true },
    { id: 'av10', name: 'Eye', price: 50, type: 'avatar', value: 'head-eye', isPremium: true },
    // ANIMAL HEADS
    { id: 'av13', name: 'Bear', price: 50, type: 'avatar', value: 'head-bear-brown' },
    { id: 'av14', name: 'Polar Bear', price: 50, type: 'avatar', value: 'head-bear-polar', isPremium: true },
    { id: 'av15', name: 'Aviator', price: 75, type: 'avatar', value: 'head-bear-aviator', isPremium: true },
    { id: 'av16', name: 'Pug', price: 50, type: 'avatar', value: 'head-dog-pug' },
    { id: 'av17', name: 'Dalmatian', price: 50, type: 'avatar', value: 'head-dog-dalmatian', isPremium: true },
    { id: 'av18', name: 'Orange Cat', price: 50, type: 'avatar', value: 'head-cat-orange' },
    { id: 'av19', name: 'Black Cat', price: 50, type: 'avatar', value: 'head-cat-black', isPremium: true },
    { id: 'av20', name: 'Lizard', price: 50, type: 'avatar', value: 'head-lizard', isPremium: true },
];

const SHOP_FRAMES: ShopItem[] = [
    { id: 'f1', name: 'Golden Wood', price: 100, type: 'frame', value: 'border-[#DAA520]', previewColor: 'bg-[#DAA520]' },
    { id: 'f2', name: 'Deep Ocean', price: 200, type: 'frame', value: 'border-[#0077be]', previewColor: 'bg-[#0077be]' },
    { id: 'f3', name: 'Emerald', price: 300, type: 'frame', value: 'border-[#50C878]', previewColor: 'bg-[#50C878]', isPremium: true },
    { id: 'f4', name: 'Ruby Red', price: 500, type: 'frame', value: 'border-[#E0115F]', previewColor: 'bg-[#E0115F]', isPremium: true },
];

const SHOP_HATS: ShopItem[] = [
    { id: 'h1', name: 'Pirate Hat', price: 150, type: 'hat', value: 'hat-pirate' },
    { id: 'h2', name: 'Viking Helmet', price: 200, type: 'hat', value: 'hat-viking', isPremium: true },
    { id: 'h3', name: 'Propeller', price: 250, type: 'hat', value: 'hat-propeller' },
    { id: 'h4', name: 'King Crown', price: 500, type: 'hat', value: 'hat-crown', isPremium: true },
    { id: 'h5', name: 'Cowboy', price: 200, type: 'hat', value: 'hat-cowboy' },
    { id: 'h6', name: 'Cone', price: 100, type: 'hat', value: 'hat-cone' },
    { id: 'h7', name: 'Sombrero', price: 250, type: 'hat', value: 'hat-sombrero' },
    { id: 'h8', name: 'Brain', price: 400, type: 'hat', value: 'hat-brain', isPremium: true },
    { id: 'h9', name: 'Poo', price: 300, type: 'hat', value: 'hat-poo' },
    { id: 'h10', name: 'Astronaut', price: 350, type: 'hat', value: 'hat-astronaut', isPremium: true },
    { id: 'h11', name: 'Chef', price: 150, type: 'hat', value: 'hat-chef' },
    { id: 'h12', name: 'Party', price: 100, type: 'hat', value: 'hat-party' },
    { id: 'h13', name: 'Top Hat', price: 250, type: 'hat', value: 'hat-tophat' },
    { id: 'h14', name: 'Flowers', price: 150, type: 'hat', value: 'hat-flowers' },
    { id: 'h15', name: 'Ninja', price: 200, type: 'hat', value: 'hat-ninja', isPremium: true },
    { id: 'h16', name: 'Backwards Cap', price: 150, type: 'hat', value: 'hat-cap-backwards' },
    { id: 'h17', name: 'Beanie', price: 120, type: 'hat', value: 'hat-beanie' },
    { id: 'h18', name: 'Jester', price: 300, type: 'hat', value: 'hat-jester', isPremium: true },
    { id: 'h19', name: 'Afro', price: 200, type: 'hat', value: 'hat-afro' },
    { id: 'h20', name: 'Grad', price: 250, type: 'hat', value: 'hat-grad', isPremium: true },
    { id: 'h21', name: 'Headphones', price: 300, type: 'hat', value: 'hat-headphones', isPremium: true },
];

const SHOP_BODIES: ShopItem[] = [
    { id: 'b1', name: 'Robot Chest', price: 150, type: 'body', value: 'body-robot', isPremium: true },
    { id: 'b2', name: 'Super Suit', price: 200, type: 'body', value: 'body-suit', isPremium: true },
    { id: 'b3', name: 'Tuxedo', price: 250, type: 'body', value: 'body-tux' },
    { id: 'b4', name: 'Hotdog', price: 300, type: 'body', value: 'body-hotdog' },
    { id: 'b5', name: 'Skeleton', price: 300, type: 'body', value: 'body-skeleton', isPremium: true },
    { id: 'b6', name: 'Armor', price: 350, type: 'body', value: 'body-armor', isPremium: true },
    { id: 'b7', name: 'Donut', price: 250, type: 'body', value: 'body-donut' },
    { id: 'b8', name: 'Dress', price: 200, type: 'body', value: 'body-dress' },
    { id: 'b9', name: 'Overalls', price: 150, type: 'body', value: 'body-overalls' },
    { id: 'b10', name: 'Muscle', price: 200, type: 'body', value: 'body-muscle' },
    { id: 'b11', name: 'Ghost', price: 300, type: 'body', value: 'body-ghost' },
    { id: 'b12', name: 'Hawaiian', price: 150, type: 'body', value: 'body-hawaiian' },
    { id: 'b13', name: 'Puffer', price: 200, type: 'body', value: 'body-puffer' },
    { id: 'b14', name: 'Hoodie', price: 150, type: 'body', value: 'body-hoodie' },
    { id: 'b15', name: 'Logo Tee', price: 120, type: 'body', value: 'body-tshirt-logo' },
    { id: 'b16', name: 'King Robe', price: 400, type: 'body', value: 'body-king-robe', isPremium: true },
    { id: 'b17', name: 'Jester Suit', price: 300, type: 'body', value: 'body-jester', isPremium: true },
    { id: 'b18', name: 'Karate', price: 200, type: 'body', value: 'body-karate' },
    { id: 'b19', name: 'Space Suit', price: 350, type: 'body', value: 'body-space-suit', isPremium: true },
];

const SHOP_ARMS: ShopItem[] = [
    { id: 'al1', name: 'L Robot', price: 100, type: 'leftArm', value: 'arm-l-robot', isPremium: true },
    { id: 'ar1', name: 'R Robot', price: 100, type: 'rightArm', value: 'arm-r-robot', isPremium: true },
    { id: 'al2', name: 'L Muscle', price: 120, type: 'leftArm', value: 'arm-l-muscle' },
    { id: 'ar2', name: 'R Muscle', price: 120, type: 'rightArm', value: 'arm-r-muscle' },
    { id: 'al3', name: 'L Tentacle', price: 150, type: 'leftArm', value: 'arm-l-tentacle', isPremium: true },
    { id: 'ar3', name: 'R Tentacle', price: 150, type: 'rightArm', value: 'arm-r-tentacle', isPremium: true },
    { id: 'al4', name: 'L Hook', price: 150, type: 'leftArm', value: 'arm-l-hook' },
    { id: 'ar4', name: 'R Hook', price: 150, type: 'rightArm', value: 'arm-r-hook' },
    { id: 'al5', name: 'L Crab', price: 200, type: 'leftArm', value: 'arm-l-crab', isPremium: true },
    { id: 'ar5', name: 'R Crab', price: 200, type: 'rightArm', value: 'arm-r-crab', isPremium: true },
    { id: 'al6', name: 'L Zombie', price: 200, type: 'leftArm', value: 'arm-l-zombie' },
    { id: 'ar6', name: 'R Zombie', price: 200, type: 'rightArm', value: 'arm-r-zombie' },
    { id: 'al7', name: 'L Wing', price: 250, type: 'leftArm', value: 'arm-l-wing' },
    { id: 'ar7', name: 'R Wing', price: 250, type: 'rightArm', value: 'arm-r-wing' },
    { id: 'al8', name: 'L Dragon', price: 300, type: 'leftArm', value: 'arm-l-wing-dragon', isPremium: true },
    { id: 'ar8', name: 'R Dragon', price: 300, type: 'rightArm', value: 'arm-r-wing-dragon', isPremium: true },
    { id: 'al9', name: 'L Cactus', price: 150, type: 'leftArm', value: 'arm-l-cactus' },
    { id: 'ar9', name: 'R Cactus', price: 150, type: 'rightArm', value: 'arm-r-cactus' },
    { id: 'al10', name: 'L Box', price: 100, type: 'leftArm', value: 'arm-l-box' },
    { id: 'ar10', name: 'R Box', price: 100, type: 'rightArm', value: 'arm-r-box' },
    { id: 'al11', name: 'L Slime', price: 250, type: 'leftArm', value: 'arm-l-slime' },
    { id: 'ar11', name: 'R Slime', price: 250, type: 'rightArm', value: 'arm-r-slime' },
    { id: 'al12', name: 'L Bone', price: 200, type: 'leftArm', value: 'arm-l-skeleton-fancy', isPremium: true },
    { id: 'ar12', name: 'R Bone', price: 200, type: 'rightArm', value: 'arm-r-skeleton-fancy', isPremium: true },
    { id: 'al13', name: 'L Drill', price: 300, type: 'leftArm', value: 'arm-l-drill', isPremium: true },
    { id: 'ar13', name: 'R Drill', price: 300, type: 'rightArm', value: 'arm-r-drill', isPremium: true },
    { id: 'al14', name: 'L Baguette', price: 150, type: 'leftArm', value: 'arm-l-baguette' },
    { id: 'ar14', name: 'R Baguette', price: 150, type: 'rightArm', value: 'arm-r-baguette' },
    { id: 'al15', name: 'L Angel', price: 250, type: 'leftArm', value: 'arm-l-wing-angel', isPremium: true },
    { id: 'ar15', name: 'R Angel', price: 250, type: 'rightArm', value: 'arm-r-wing-angel', isPremium: true },
    { id: 'al16', name: 'L Boxing', price: 150, type: 'leftArm', value: 'arm-l-glove-boxing' },
    { id: 'ar16', name: 'R Boxing', price: 150, type: 'rightArm', value: 'arm-r-glove-boxing' },
    { id: 'al17', name: 'L Claw', price: 200, type: 'leftArm', value: 'arm-l-claw-monster' },
    { id: 'ar17', name: 'R Claw', price: 200, type: 'rightArm', value: 'arm-r-claw-monster' },
    { id: 'al18', name: 'L Leaf', price: 120, type: 'leftArm', value: 'arm-l-leaf' },
    { id: 'ar18', name: 'R Leaf', price: 120, type: 'rightArm', value: 'arm-r-leaf' },
    { id: 'al19', name: 'L Wand', price: 300, type: 'leftArm', value: 'arm-l-wand', isPremium: true },
    { id: 'ar19', name: 'R Wand', price: 300, type: 'rightArm', value: 'arm-r-wand', isPremium: true },
    { id: 'al20', name: 'L Shield', price: 250, type: 'leftArm', value: 'arm-l-shield', isPremium: true },
    { id: 'ar20', name: 'R Shield', price: 250, type: 'rightArm', value: 'arm-r-shield', isPremium: true },
];

const SHOP_LEGS: ShopItem[] = [
    { id: 'l1', name: 'Wheels', price: 200, type: 'legs', value: 'legs-wheels' },
    { id: 'l2', name: 'Chicken', price: 150, type: 'legs', value: 'legs-chicken' },
    { id: 'l3', name: 'Rocket', price: 300, type: 'legs', value: 'legs-rocket', isPremium: true },
    { id: 'l4', name: 'Mermaid', price: 350, type: 'legs', value: 'legs-mermaid', isPremium: true },
    { id: 'l5', name: 'Spider', price: 300, type: 'legs', value: 'legs-spider', isPremium: true },
    { id: 'l6', name: 'Peg', price: 200, type: 'legs', value: 'legs-peg' },
    { id: 'l7', name: 'UFO', price: 400, type: 'legs', value: 'legs-ufo', isPremium: true },
    { id: 'l8', name: 'Skates', price: 250, type: 'legs', value: 'legs-skates' },
    { id: 'l9', name: 'Ghost', price: 200, type: 'legs', value: 'legs-ghost' },
    { id: 'l10', name: 'Ballerina', price: 200, type: 'legs', value: 'legs-ballerina' },
    { id: 'l11', name: 'Jeans', price: 150, type: 'legs', value: 'legs-jeans' },
    { id: 'l12', name: 'Shorts', price: 150, type: 'legs', value: 'legs-shorts' },
    { id: 'l13', name: 'Springs', price: 250, type: 'legs', value: 'legs-springs' },
    { id: 'l14', name: 'Rain Boots', price: 150, type: 'legs', value: 'legs-boots-rain' },
    { id: 'l15', name: 'Pink Tail', price: 350, type: 'legs', value: 'legs-tail-mermaid-pink', isPremium: true },
    { id: 'l16', name: 'Hoverboard', price: 400, type: 'legs', value: 'legs-hoverboard', isPremium: true },
    { id: 'l17', name: 'Cloud', price: 300, type: 'legs', value: 'legs-cloud', isPremium: true },
    { id: 'l18', name: 'Elf', price: 200, type: 'legs', value: 'legs-elf' },
    { id: 'l19', name: 'Karate', price: 150, type: 'legs', value: 'legs-karate' },
];

type ShopTab = 'head' | 'frame' | 'hat' | 'body' | 'arms' | 'legs';

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ShopTab>('head');
  const [isMenuMinimized, setIsMenuMinimized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArm, setSelectedArm] = useState<'leftArm' | 'rightArm' | null>(null);

  const { 
      coins, 
      purchaseItem, 
      equipItem, 
      unequipItem,
      isOwned, 
      isSubscribed,
      equippedFrame, 
      equippedAvatar,
      equippedHat,
      equippedBody,
      equippedLeftArm,
      equippedRightArm,
      equippedLegs
  } = useUser();

  if (!isOpen) return null;

  const handleBuy = (item: ShopItem) => {
    purchaseItem(item);
  };

  const handleEquip = (item: ShopItem) => {
    equipItem(item.type, item.value);
  };

  const handleUnequip = (type: ShopItem['type']) => {
      unequipItem(type);
  };

  const getActiveItems = () => {
      switch(activeTab) {
          case 'head': return SHOP_AVATARS;
          case 'frame': return SHOP_FRAMES;
          case 'hat': return SHOP_HATS;
          case 'body': return SHOP_BODIES;
          case 'arms': return SHOP_ARMS;
          case 'legs': return SHOP_LEGS;
          default: return [];
      }
  };

  const isEquipped = (item: ShopItem) => {
      switch(item.type) {
          case 'avatar': return equippedAvatar === item.value;
          case 'frame': return equippedFrame === item.value;
          case 'hat': return equippedHat === item.value;
          case 'body': return equippedBody === item.value;
          case 'leftArm': return equippedLeftArm === item.value;
          case 'rightArm': return equippedRightArm === item.value;
          case 'legs': return equippedLegs === item.value;
          default: return false;
      }
  };

  const isBodyEquipped = !!equippedBody;

  const renderItem = (item: ShopItem) => {
    const owned = isOwned(item.id);
    const equipped = isEquipped(item);
    
    // Debug: Log if head assets are missing
    if (item.type === 'avatar' && !AVATAR_ASSETS[item.value]) {
      console.warn(`⚠️ Missing avatar asset: ${item.value}`, { item, available: Object.keys(AVATAR_ASSETS).filter(k => k.startsWith('head-')) });
    }
    const isLimb = ['leftArm', 'rightArm', 'legs'].includes(item.type);
    const isDisabled = isLimb && !isBodyEquipped;
    
    // Premium Lock Logic
    const isLocked = item.isPremium && !isSubscribed;

    return (
        <div key={item.id} className={`bg-[#3E1F07] rounded-xl p-3 border-2 border-[#5c2e0b] shadow-lg flex flex-col items-center group ${isDisabled ? 'opacity-60' : ''} relative`}>
            
            {/* Item Preview Box */}
            <div className={`w-20 h-20 rounded-xl bg-[#f3e5ab] mb-3 overflow-hidden shadow-inner relative flex items-center justify-center ${item.type === 'frame' ? item.value + ' border-[6px] rounded-full' : 'border-2 border-[#eecaa0]/30'} ${isLocked ? 'grayscale opacity-70' : ''}`}>
                {/* Avatar Handling */}
                {item.type === 'avatar' && (
                    AVATAR_ASSETS[item.value] ? (
                        <div className="w-[90%] h-[90%] flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                {AVATAR_ASSETS[item.value]}
                            </svg>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-[#f3e5ab] flex items-center justify-center text-[#8B4513] font-bold text-lg">
                            ?
                        </div>
                    )
                )}
                
                {item.type === 'frame' && (
                    <div className="text-[#5c2e0b]/40 font-bold text-[10px]">FRAME</div>
                )}
                {(['hat', 'body', 'leftArm', 'rightArm', 'legs'].includes(item.type)) && AVATAR_ASSETS[item.value] && (
                    <svg viewBox={item.type === 'body' ? "0 0 100 80" : "0 0 100 100"} className={`w-full h-full ${item.type === 'body' ? 'p-0' : 'p-2'} overflow-visible`}>
                        {item.type === 'body' ? (
                            <g transform="scale(1.15) translate(-7.5, -5)">
                                {AVATAR_ASSETS[item.value]}
                            </g>
                        ) : (
                            AVATAR_ASSETS[item.value]
                        )}
                    </svg>
                )}
                
                {/* Disabled Overlay (Need Body) */}
                {isDisabled && !isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                       <span className="text-white font-bold text-[8px] uppercase text-center px-1">Needs Body</span>
                    </div>
                )}

                {/* BIG GOLD CROWN LOCK OVERLAY */}
                {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
                         <Crown size={36} className="text-[#FFD700] drop-shadow-md mb-1" fill="#B8860B" />
                         <span className="text-[#FFD700] text-[8px] font-extrabold uppercase tracking-wide bg-black/60 px-1.5 py-0.5 rounded-full">Locked</span>
                    </div>
                )}
            </div>

            <h3 className="text-white font-display font-bold text-xs mb-2 text-center leading-tight h-8 flex items-center justify-center">{item.name}</h3>
            
            {/* Action Buttons */}
            {isLocked ? (
                <WoodButton
                    variant="gold"
                    fullWidth
                    className="text-[10px] py-1.5 flex items-center justify-center gap-1 border border-[#B8860B] shadow-[0_2px_0_#8B4513]"
                    onClick={() => { onClose(); navigate('/paywall'); }}
                >
                    <Crown size={10} fill="currentColor" /> PREMIUM
                </WoodButton>
            ) : owned ? (
                <div className="flex w-full gap-1">
                    {equipped ? (
                         <button 
                            onClick={() => handleUnequip(item.type)}
                            className="flex-1 bg-[#2e7d32] text-white font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 border border-white/20 shadow-inner hover:bg-[#d32f2f] group-hover:content-['UNEQUIP']"
                         >
                            <Check size={12} /> <span className="group-hover:hidden">ON</span> <span className="hidden group-hover:block"><Trash2 size={10} /></span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleEquip(item)}
                            disabled={isDisabled}
                            className={`flex-1 font-bold text-[10px] py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-[0_2px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none transition-all ${isDisabled ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-[#f3e5ab] hover:bg-[#fff5cc] text-[#5c2e0b] shadow-[0_2px_0_#d4a373]'}`}
                        >
                            {isDisabled ? 'NEED BODY' : 'WEAR'}
                        </button>
                    )}
                </div>
            ) : (
                <WoodButton 
                    variant="primary" 
                    fullWidth 
                    className={`text-[10px] py-1.5 ${(coins < item.price || isDisabled) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    onClick={() => handleBuy(item)}
                    disabled={coins < item.price || isDisabled}
                >
                    {isDisabled ? 'NEED BODY' : `${item.price} gold`}
                </WoodButton>
            )}
        </div>
    );
  };

  const renderTab = (id: ShopTab, label: string) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`flex-shrink-0 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all whitespace-nowrap ${activeTab === id ? 'bg-[#8B4513] text-[#FFD700] shadow-md border border-[#FFD700]/20' : 'text-[#8B4513] hover:bg-[#3E1F07]/10'}`}
    >
        {label}
    </button>
  );

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Main Shop Card */}
      <div className="relative w-full max-w-md h-[90vh] bg-[#f3e5ab] rounded-3xl border-4 border-[#8B4513] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-[#5c2e0b] p-4 flex justify-between items-center border-b-4 border-[#3E1F07] relative z-10 shadow-md shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center border-2 border-[#CD853F] shadow-md">
                    <ShoppingBag size={20} className="text-[#FFD700]" />
                </div>
                <div className="leading-tight">
                    <h2 className="font-display font-bold text-white text-lg tracking-wide">Builder Shop</h2>
                    <span className="text-[#eecaa0] text-[10px] font-bold uppercase tracking-wider">Create your monster!</span>
                </div>
             </div>
             
             {/* Coin Balance */}
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-[#FFD700]/30 shadow-inner">
                <div className="w-5 h-5 rounded-full bg-[#FFD700] border border-[#B8860B] flex items-center justify-center text-[#B8860B] font-bold text-[10px]">$</div>
                <span className="text-[#FFD700] font-bold font-display text-lg">{coins}</span>
             </div>

             {/* Edit Mode Toggle */}
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditMode(!isEditMode);
                  if (!isEditMode) {
                    setSelectedArm(null); // Clear selection when exiting edit mode
                  }
                }}
                className={`ml-2 p-2 rounded-lg transition-all ${
                  isEditMode 
                    ? 'bg-[#FFD700] text-[#8B4513] shadow-lg' 
                    : 'text-[#eecaa0] hover:text-white hover:bg-black/20'
                } active:scale-95`}
                title={isEditMode ? "Exit Edit Mode" : "Edit Arm Positions"}
             >
                <Move size={20} />
             </button>

             <button onClick={onClose} className="ml-2 text-[#eecaa0] hover:text-white active:scale-95 transition-transform">
                <X size={24} />
             </button>
          </div>

          {/* Preview Area (Live updates) */}
          <div 
              className={`w-full bg-[#8B4513] relative shrink-0 shadow-inner overflow-hidden flex justify-center items-center transition-all duration-500 ease-in-out ${isMenuMinimized ? 'flex-1' : 'h-64 shrink-0'}`}
              onClick={() => setIsMenuMinimized(true)} 
          >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
              </div>
              
              {/* Spotlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none blur-md"></div>

              {/* The Compositor */}
              <div className={`w-32 h-32 relative z-10 transition-all duration-500 ease-in-out ${isMenuMinimized ? 'translate-y-0 scale-110' : '-translate-y-8 scale-90'}`}>
                   <div className={`w-full h-full rounded-full border-[4px] ${equippedFrame} shadow-2xl bg-white overflow-visible`}>
                        <AvatarCompositor 
                            headUrl={equippedAvatar}
                            hat={equippedHat}
                            body={equippedBody}
                            leftArm={equippedLeftArm}
                            rightArm={equippedRightArm}
                            legs={equippedLegs}
                            isEditable={isEditMode}
                            onEditRequest={() => setIsEditMode(true)}
                            selectedArm={selectedArm}
                            onArmSelect={setSelectedArm}
                            onArmRotate={(armType, angle) => {
                              // Rotation is handled by DraggableArm's onRotate callback
                              // This is just for tracking if needed
                            }}
                        />
                   </div>
              </div>

              {/* Edit Mode Tooltip */}
              {isEditMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-20 pointer-events-none animate-pulse">
                  {selectedArm ? 'Tap rotation buttons to adjust angle' : 'Tap an arm to select, then use rotation buttons'}
                </div>
              )}
          </div>

          {/* Menu Container */}
          <div className={`flex flex-col bg-[#f3e5ab] border-t-4 border-[#8B4513] rounded-t-3xl -mt-6 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] transition-all duration-500 ease-in-out ${isMenuMinimized ? 'h-auto shrink-0' : 'flex-1 min-h-0'}`}>
             
             {/* Handle Bar */}
             <div 
                className="w-full h-9 flex items-center justify-center cursor-pointer touch-none shrink-0 hover:bg-black/5 transition-colors rounded-t-3xl"
                onClick={() => setIsMenuMinimized(!isMenuMinimized)}
             >
                <div className={`w-12 h-1.5 rounded-full bg-[#8B4513]/30 transition-all duration-300 ${isMenuMinimized ? 'rotate-0' : ''}`}></div>
             </div>

             {/* Tabs Scroller */}
             <div className="flex overflow-x-auto p-2 gap-1 border-b border-[#8B4513]/20 bg-[#eecaa0]/30 no-scrollbar shrink-0">
                {renderTab('head', 'HEADS')}
                {renderTab('hat', 'HATS')}
                {renderTab('body', 'BODIES')}
                {renderTab('arms', 'ARMS')}
                {renderTab('legs', 'LEGS')}
                {renderTab('frame', 'FRAMES')}
             </div>

             {/* Scrollable Items Content */}
             <div className={`overflow-y-auto p-4 bg-[#f3e5ab] relative transition-all duration-500 ${isMenuMinimized ? 'h-0 p-0 opacity-0' : 'flex-1 opacity-100'}`}>
                 <div className="grid grid-cols-3 gap-3 pb-20">
                    {getActiveItems().map(renderItem)}
                 </div>
             </div>
          </div>

      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ShopModal;
