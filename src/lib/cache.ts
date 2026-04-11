import { getDoc, getDocs, DocumentReference, Query, DocumentData } from 'firebase/firestore';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'gims_cache_';

export const CacheService = {
  set: <T>(key: string, data: T) => {
    const item: CacheItem<T> = { data, timestamp: Date.now() };
    try {
      // Usamos sessionStorage para que se limpie al cerrar la pestaña,
      // manteniendo los datos frescos entre sesiones pero reduciendo lecturas drásticamente.
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache write failed', e);
    }
  },
  get: <T>(key: string, ttlMs: number): T | null => {
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const item: CacheItem<T> = JSON.parse(raw);
      if (Date.now() - item.timestamp > ttlMs) {
        sessionStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return item.data;
    } catch (e) {
      return null;
    }
  },
  invalidate: (key: string) => {
    sessionStorage.removeItem(CACHE_PREFIX + key);
  },
  clearAll: () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * Obtiene un documento de la caché o de Firestore si no existe/expiró.
 * @param ref Referencia al documento de Firestore
 * @param ttlMs Tiempo de vida en milisegundos (por defecto 5 minutos)
 */
export async function getCachedDoc<T = DocumentData>(
  ref: DocumentReference,
  ttlMs: number = 5 * 60 * 1000
): Promise<T | null> {
  const key = `doc_${ref.path}`;
  const cached = CacheService.get<T>(key, ttlMs);
  if (cached) return cached;

  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = { id: snap.id, ...snap.data() } as T;
    CacheService.set(key, data);
    return data;
  }
  return null;
}

/**
 * Obtiene resultados de una consulta de la caché o de Firestore si no existe/expiró.
 * @param queryRef Consulta de Firestore
 * @param cacheKey Clave única para identificar esta consulta en caché
 * @param ttlMs Tiempo de vida en milisegundos (por defecto 30 minutos)
 */
export async function getCachedQuery<T = DocumentData>(
  queryRef: Query,
  cacheKey: string,
  ttlMs: number = 30 * 60 * 1000
): Promise<T[]> {
  const key = `query_${cacheKey}`;
  const cached = CacheService.get<T[]>(key, ttlMs);
  if (cached) return cached;

  const snap = await getDocs(queryRef);
  const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
  CacheService.set(key, data);
  return data;
}
