export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Personality {
  name: string;
  description: string;
  traits: string[];
  style: string;
  customInstructions: string;
}

export type AppTheme = 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky' | 'violet';

export interface ChatSession {
  id: string;
  title: string;
  personality: Personality;
  messages: Message[];
  theme?: AppTheme;
  lastUpdated: number;
}
