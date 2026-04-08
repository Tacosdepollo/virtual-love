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

export interface ChatSession {
  id: string;
  title: string;
  personality: Personality;
  messages: Message[];
  lastUpdated: number;
}
