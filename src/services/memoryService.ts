// src/services/memoryService.ts
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { getCachedDoc, CacheService } from '../lib/cache';
import OpenAI from "openai";
import { Message } from '../types';

export interface CentralMemory {
  userId: string;
  characterId: string;
  coreMemories: string[];       // Frases importantes
  relationshipStatus: string;    // "amigos", "pareja", etc.
  userTraits: string[];          // Características del usuario
  importantDates: string[];      // Eventos relevantes
  lastUpdated: Timestamp;
}

export interface ConversationContext {
  userId: string;
  characterId: string;
  lastMessages: Message[];       // Solo últimos 15 mensajes
  summary: string;               // Resumen generado por DeepSeek
  messageCount: number;
  lastUpdated: Timestamp;
}

// Obtener contexto completo para la IA (solo 2 lecturas o desde caché)
export async function getFullContext(characterId: string, userId: string) {
  const centralRef = doc(db, 'centralMemories', `${userId}_${characterId}`);
  const contextRef = doc(db, 'conversationContext', `${userId}_${characterId}`);
  
  // Usamos caché con TTL de 5 minutos. Se invalidará manualmente al escribir.
  const [central, context] = await Promise.all([
    getCachedDoc<CentralMemory>(centralRef, 5 * 60 * 1000),
    getCachedDoc<ConversationContext>(contextRef, 5 * 60 * 1000)
  ]);

  return {
    centralMemories: central?.coreMemories || [],
    relationshipStatus: central?.relationshipStatus || 'desconocida',
    userTraits: central?.userTraits || [],
    recentMessages: context?.lastMessages || [],
    summary: context?.summary || '',
    messageCount: context?.messageCount || 0
  };
}

// Guardar nuevos mensajes (actualiza solo contexto reciente)
export async function updateConversationContext(
  characterId: string,
  userId: string,
  userMessage: string,
  aiResponse: string,
  oldSummary?: string
) {
  const contextRef = doc(db, 'conversationContext', `${userId}_${characterId}`);
  
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(contextRef);
    const current = snap.exists() ? snap.data() as ConversationContext : null;
    
    const newMessages = [
      { id: Date.now().toString() + '-u', role: 'user' as const, content: userMessage, timestamp: Date.now() },
      { id: Date.now().toString() + '-a', role: 'assistant' as const, content: aiResponse, timestamp: Date.now() }
    ];
    const updatedMessages = current
      ? [...current.lastMessages, ...newMessages].slice(-15)
      : newMessages;
    
    const newCount = (current?.messageCount || 0) + 2;
    let newSummary = current?.summary || '';
    
    // Cada 10 mensajes, regenerar resumen (opcional)
    if (newCount % 10 === 0 || !current) {
      // Llamada a DeepSeek para resumir (puede ser async después)
      newSummary = await generateSummaryFromMessages(updatedMessages, oldSummary);
    }
    
    transaction.set(contextRef, {
      userId,
      characterId,
      lastMessages: updatedMessages,
      summary: newSummary,
      messageCount: newCount,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  });

  // Invalidar caché después de escribir
  CacheService.invalidate(`doc_conversationContext/${userId}_${characterId}`);
}

// Actualizar recuerdos centrales (solo cuando hay info nueva)
export async function updateCentralMemories(
  characterId: string,
  userId: string,
  newInfo: string,
  currentMemories: CentralMemory | null
) {
  const centralRef = doc(db, 'centralMemories', `${userId}_${characterId}`);
  // Usar DeepSeek para extraer información relevante (implementa aparte)
  const extracted = await extractNewMemories(newInfo, currentMemories);
  
  if (!extracted.newMemories.length && !extracted.newTraits.length && !extracted.newRelationshipStatus) {
    return; // Nada nuevo
  }
  
  await setDoc(centralRef, {
    userId,
    characterId,
    coreMemories: [...(currentMemories?.coreMemories || []), ...extracted.newMemories],
    userTraits: [...new Set([...(currentMemories?.userTraits || []), ...extracted.newTraits])],
    relationshipStatus: extracted.newRelationshipStatus || currentMemories?.relationshipStatus || 'desconocida',
    importantDates: currentMemories?.importantDates || [],
    lastUpdated: Timestamp.now()
  }, { merge: true });

  // Invalidar caché después de escribir
  CacheService.invalidate(`doc_centralMemories/${userId}_${characterId}`);
}

const apiKey = (import.meta as any).env.VITE_DEEPSEEK_API_KEY || "";
const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true
});

// Funciones auxiliares (simplificadas, llama a DeepSeek)
async function generateSummaryFromMessages(messages: Message[], oldSummary?: string): Promise<string> {
  if (!apiKey) return oldSummary || '';
  
  const prompt = `
    Resumen anterior: ${oldSummary || 'Ninguno'}
    Mensajes recientes: ${JSON.stringify(messages)}
    Genera un resumen de la conversación (máx 200 palabras).
  `;
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0].message.content || oldSummary || '';
  } catch (e) {
    console.error(e);
    return oldSummary || '';
  }
}

async function extractNewMemories(newText: string, current: CentralMemory | null) {
  if (!apiKey) return { newMemories: [], newTraits: [], newRelationshipStatus: null };

  const prompt = `
    Basado en: "${newText}"
    Recuerdos actuales: ${JSON.stringify(current?.coreMemories || [])}
    Extrae información NUEVA importante (nombre, gustos, eventos).
    Devuelve JSON estrictamente con este formato: { "newMemories": ["str"], "newTraits": ["str"], "newRelationshipStatus": "str" }
  `;
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (e) {
    console.error(e);
    return { newMemories: [], newTraits: [], newRelationshipStatus: null };
  }
}
