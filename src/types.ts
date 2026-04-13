export type Language = 'es' | 'en';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  style: string;
  customInstructions: string;
  creatorId: string;
  creatorName: string;
  avatarUrl?: string;
  isPublic: boolean;
  isNSFW: boolean;
  tags: string[];
  chatCount: number;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  characterId: string;
  characterName: string;
  messages: Message[];
  coreThoughts?: string[];
  summary?: string;
  theme?: string;
  lastUpdated: number;
}

export interface Personality {
  name: string;
  traits: string[];
  tags: string[];
  style: string;
  description: string;
  customInstructions?: string;
  avatarUrl?: string;
  isPublic: boolean;
  isNSFW: boolean;
}

export type AppTheme = 'rose' | 'emerald' | 'amber' | 'sky' | 'space' | 'retro' | 'storm' | 'stone' | 'brick' | 'clouds' | 'whitewood' | 'bluewood' | 'nostalgia' | 'calma' | 'proteccion' | 'cyberpunk' | 'midnight' | 'forest' | 'sunset' | 'ocean' | 'lava' | 'neon' | 'sakura' | 'gold' | 'mint' | 'violet';

export type AppFont = 'sans' | 'audiowide' | 'jacquard' | 'montecarlo' | 'saira' | 'silkscreen' | 'playfair' | 'montserrat' | 'oswald' | 'lobster' | 'pacifico' | 'righteous' | 'bangers' | 'orbitron' | 'press-start' | 'dancing-script';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'theme' | 'font' | 'sound';
  value: string; // The theme name, font family, or sound URL
  previewColor?: string;
}

export interface Subscription {
  active: boolean;
  startDate: number;
  lastClaimDate: number;
  type: 'monthly';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'moderation';
  read: boolean;
  createdAt: number;
}

export interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  persona?: string; // Description for the bot
}

export interface UserStats {
  coins: number;
  purchasedItems: string[]; // IDs of ShopItems
  currentFont: AppFont;
  unlockedThemes: AppTheme[];
  themeOpacity?: number;
  subscription?: Subscription;
  profile?: UserProfile;
}

export type Intensity = 'low' | 'medium' | 'high' | 'extreme';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
