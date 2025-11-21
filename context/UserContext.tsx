import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'avatar' | 'frame' | 'hat' | 'body' | 'leftArm' | 'rightArm' | 'legs';
  value: string; // URL for avatar, Color Class/Hex for frame, Asset ID for parts
  previewColor?: string; // For displaying frame colors in shop
  isPremium?: boolean; // Locked for non-subscribers
}

// Define KidProfile type
type KidProfile = {
  id: string;
  name: string;
  age?: string;
  avatarSeed?: string;
  [key: string]: any;
};

// Arm Position interface for custom positioning
export interface ArmPosition {
  top: string;        // e.g., "50%"
  horizontal: string; // e.g., "-40%" (left for right arm, right for left arm)
  rotation: number;    // degrees, e.g., 15
  transformOrigin: string; // e.g., "right center"
  width?: string;      // optional override
  height?: string;     // optional override
}

interface UserContextType {
  coins: number;
  addCoins: (amount: number) => void;
  ownedItems: string[];
  
  // Parent Profile
  parentName: string;
  setParentName: (name: string) => void;

  // Kids Profiles
  kids: KidProfile[];
  addKid: (kid: KidProfile) => void;
  removeKid: (id: string) => void;

  // Equipment Slots (Main User)
  equippedAvatar: string; // "Head"
  equippedFrame: string;
  equippedHat: string | null;
  equippedBody: string | null;
  equippedLeftArm: string | null;
  equippedRightArm: string | null;
  equippedLegs: string | null;

  setEquippedAvatar: (url: string) => void; // Exposed for onboarding

  purchaseItem: (item: ShopItem) => boolean;
  equipItem: (type: ShopItem['type'], value: string) => void;
  unequipItem: (type: ShopItem['type']) => void;
  isOwned: (id: string) => boolean;
  
  isSubscribed: boolean;
  subscribe: () => void;

  resetUser: () => void; // New method to wipe data

  // Arm Positioning
  armPositions: { leftArm?: ArmPosition; rightArm?: ArmPosition };
  getArmPosition: (armType: 'leftArm' | 'rightArm') => ArmPosition | undefined;
  setArmPosition: (armType: 'leftArm' | 'rightArm', position: ArmPosition) => void;
}

const UserContext = createContext<UserContextType>({
  coins: 350,
  addCoins: () => {},
  ownedItems: [],
  parentName: 'Parent',
  setParentName: () => {},
  kids: [],
  addKid: () => {},
  removeKid: () => {},
  equippedAvatar: '',
  equippedFrame: '',
  equippedHat: null,
  equippedBody: null,
  equippedLeftArm: null,
  equippedRightArm: null,
  equippedLegs: null,
  setEquippedAvatar: () => {},
  purchaseItem: () => false,
  equipItem: () => {},
  unequipItem: () => {},
  isOwned: () => false,
  isSubscribed: false,
  subscribe: () => {},
  resetUser: () => {},
  armPositions: {},
  getArmPosition: () => undefined,
  setArmPosition: () => {},
});

export const useUser = () => useContext(UserContext);

const STORAGE_KEY = 'godly_kids_data_v2';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // --- INITIALIZATION FROM LOCAL STORAGE ---
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load user data", e);
      return null;
    }
  };

  const saved = loadState();

  const [coins, setCoins] = useState(saved?.coins ?? 650);
  const [ownedItems, setOwnedItems] = useState<string[]>(saved?.ownedItems ?? ['f1']);
  
  // Profile Data
  const [parentName, setParentName] = useState<string>(saved?.parentName ?? 'Parent');
  const [kids, setKids] = useState<KidProfile[]>(saved?.kids ?? []);

  // Default Equipment - Start with TOAST!
  const [equippedAvatar, setEquippedAvatar] = useState<string>(saved?.equippedAvatar ?? 'head-toast');
  const [equippedFrame, setEquippedFrame] = useState<string>(saved?.equippedFrame ?? 'border-[#8B4513]');
  const [equippedHat, setEquippedHat] = useState<string | null>(saved?.equippedHat ?? null);
  const [equippedBody, setEquippedBody] = useState<string | null>(saved?.equippedBody ?? null);
  const [equippedLeftArm, setEquippedLeftArm] = useState<string | null>(saved?.equippedLeftArm ?? null);
  const [equippedRightArm, setEquippedRightArm] = useState<string | null>(saved?.equippedRightArm ?? null);
  const [equippedLegs, setEquippedLegs] = useState<string | null>(saved?.equippedLegs ?? null);

  const [isSubscribed, setIsSubscribed] = useState(saved?.isSubscribed ?? false);

  // Arm Positioning State
  const [armPositions, setArmPositions] = useState<{ leftArm?: ArmPosition; rightArm?: ArmPosition }>(
    saved?.armPositions ?? {}
  );

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    const stateToSave = {
      coins,
      ownedItems,
      parentName,
      kids,
      equippedAvatar,
      equippedFrame,
      equippedHat,
      equippedBody,
      equippedLeftArm,
      equippedRightArm,
      equippedLegs,
      isSubscribed,
      armPositions
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    coins, ownedItems, parentName, kids, 
    equippedAvatar, equippedFrame, equippedHat, equippedBody, 
    equippedLeftArm, equippedRightArm, equippedLegs, isSubscribed,
    armPositions
  ]);

  const addCoins = (amount: number) => {
    setCoins(prev => prev + amount);
  };

  const addKid = (kid: KidProfile) => {
    setKids(prev => [...prev, kid]);
  };

  const removeKid = (id: string) => {
    setKids(prev => prev.filter(k => k.id !== id));
  };

  const isOwned = (id: string) => {
    return ownedItems.includes(id);
  };

  const purchaseItem = (item: ShopItem): boolean => {
    if (ownedItems.includes(item.id)) return true;
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      setOwnedItems(prev => [...prev, item.id]);
      return true;
    }
    return false;
  };

  const equipItem = (type: ShopItem['type'], value: string) => {
    switch (type) {
      case 'avatar': setEquippedAvatar(value); break;
      case 'frame': setEquippedFrame(value); break;
      case 'hat': setEquippedHat(value); break;
      case 'body': setEquippedBody(value); break;
      case 'leftArm': setEquippedLeftArm(value); break;
      case 'rightArm': setEquippedRightArm(value); break;
      case 'legs': setEquippedLegs(value); break;
    }
  };

  const unequipItem = (type: ShopItem['type']) => {
    switch (type) {
      case 'hat': setEquippedHat(null); break;
      case 'body': setEquippedBody(null); break;
      case 'leftArm': setEquippedLeftArm(null); break;
      case 'rightArm': setEquippedRightArm(null); break;
      case 'legs': setEquippedLegs(null); break;
      // Avatar and Frame cannot be unequipped (must be replaced)
    }
  };

  const subscribe = () => {
    setIsSubscribed(true);
  };

  const getArmPosition = (armType: 'leftArm' | 'rightArm'): ArmPosition | undefined => {
    return armPositions[armType];
  };

  const setArmPosition = (armType: 'leftArm' | 'rightArm', position: ArmPosition) => {
    setArmPositions(prev => ({
      ...prev,
      [armType]: position
    }));
  };

  const resetUser = () => {
    setCoins(350);
    setOwnedItems(['f1']);
    setParentName('');
    setKids([]);
    setEquippedAvatar('head-toast');
    setEquippedFrame('border-[#8B4513]');
    setEquippedHat(null);
    setEquippedBody(null);
    setEquippedLeftArm(null);
    setEquippedRightArm(null);
    setEquippedLegs(null);
    setIsSubscribed(false);
    setArmPositions({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserContext.Provider value={{
      coins,
      addCoins,
      ownedItems,
      parentName,
      setParentName,
      kids,
      addKid,
      removeKid,
      equippedAvatar,
      equippedFrame,
      equippedHat,
      equippedBody,
      equippedLeftArm,
      equippedRightArm,
      equippedLegs,
      setEquippedAvatar,
      purchaseItem,
      equipItem,
      unequipItem,
      isOwned,
      isSubscribed,
      subscribe,
      resetUser,
      armPositions,
      getArmPosition,
      setArmPosition
    }}>
      {children}
    </UserContext.Provider>
  );
};
