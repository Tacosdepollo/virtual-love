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

export type AppTheme = 'rose' | 'emerald' | 'amber' | 'sky' | 'space' | 'retro' | 'storm' | 'stone' | 'brick' | 'clouds' | 'whitewood' | 'bluewood';

export type AppFont = 'sans' | 'audiowide' | 'jacquard' | 'montecarlo' | 'saira' | 'silkscreen';

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

export interface UserStats {
  coins: number;
  purchasedItems: string[]; // IDs of ShopItems
  currentFont: AppFont;
  unlockedThemes: AppTheme[];
  themeOpacity?: number;
  subscription?: Subscription;
}

export type Intensity = 'low' | 'medium' | 'high' | 'extreme';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
