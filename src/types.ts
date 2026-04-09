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
  chatCount: number;
  createdAt: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  characterId: string;
  characterName: string;
  messages: Message[];
  theme?: string;
  lastUpdated: number;
}

export interface Personality {
  name: string;
  traits: string[];
  style: string;
  description: string;
  customInstructions?: string;
}

export type AppTheme = 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky' | 'violet';
