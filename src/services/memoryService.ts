// src/services/memoryService.ts
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { getCachedDoc, CacheService } from '../lib/cache';

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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
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
      { role: 'user' as const, content: userMessage, timestamp: Date.now() },
      { role: 'assistant' as const, content: aiResponse, timestamp: Date.now() }
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

// Funciones auxiliares (simplificadas, llama a DeepSeek)
async function generateSummaryFromMessages(messages: Message[], oldSummary?: string): Promise<string> {
  const prompt = `
    Resumen anterior: ${oldSummary || 'Ninguno'}
    Mensajes recientes: ${JSON.stringify(messages)}
    Genera un resumen de la conversación (máx 200 palabras).
  `;
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.summary || '';
  } catch (e) {
    console.error(e);
    return oldSummary || '';
  }
}

async function extractNewMemories(newText: string, current: CentralMemory | null) {
  const prompt = `
    Basado en: "${newText}"
    Recuerdos actuales: ${JSON.stringify(current?.coreMemories || [])}
    Extrae información NUEVA importante (nombre, gustos, eventos).
    Devuelve JSON: { "newMemories": [], "newTraits": [], "newRelationshipStatus": null }
  `;
  try {
    const response = await fetch('/api/extract-memories', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return await response.json();
  } catch (e) {
    console.error(e);
    return { newMemories: [], newTraits: [], newRelationshipStatus: null };
  }
}
