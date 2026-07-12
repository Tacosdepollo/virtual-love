export type Language = 'es' | 'en';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  name?: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  expandedLore: string;
  creatorId: string;
  creatorName: string;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
  createdAt: any;
  bannerUrl?: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  style: string;
  customInstructions: string;
  prompts?: { id: string; name: string; content: string; avatarUrl?: string }[];
  creatorId: string;
  creatorName: string;
  avatarUrl?: string;
  isPublic: boolean;
  isNSFW: boolean;
  tags: string[];
  worldId?: string;
  worldName?: string;
  chatCount: number;
  createdAt: any;
  voiceConfig?: VoiceConfig;
  initialMessage?: string;
  systemPrompt?: string;
  bgImageUrl?: string;
}

export interface VoiceConfig {
  gender?: string;
  age?: string;
  pitch?: string;
  pace?: string;
  emotion?: string;
  characteristics?: string[];
  purpose?: string;
  description?: string;
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
  prompts?: { id: string; name: string; content: string; avatarUrl?: string }[];
  avatarUrl?: string;
  isPublic: boolean;
  isNSFW: boolean;
  worldId?: string;
  worldName?: string;
  voiceConfig?: VoiceConfig;
  initialMessage?: string;
  systemPrompt?: string;
  bgImageUrl?: string;
}

export type AppTheme = 'rose' | 'emerald' | 'amber' | 'sky' | 'space' | 'retro' | 'storm' | 'stone' | 'brick' | 'clouds' | 'whitewood' | 'bluewood' | 'nostalgia' | 'calma' | 'proteccion' | 'cyberpunk' | 'frutiger' | 'midnight' | 'forest' | 'sunset' | 'ocean' | 'lava' | 'neon' | 'sakura' | 'gold' | 'mint' | 'violet';

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

export interface UserPersona {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
}

export interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  personas?: UserPersona[];
  activePersonaId?: string;
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
