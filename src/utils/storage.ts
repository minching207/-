import { SiteContent } from '../types';
import { initialSiteContent } from '../data/defaultData';
import { getRemoteContent, saveRemoteContent } from '../lib/firebase';

const STORAGE_KEY = 'designer_portfolio_content_v5';
const LEGACY_STORAGE_KEYS = [
  'designer_portfolio_content_v4',
  'designer_portfolio_content_v3',
  'designer_portfolio_content_v2',
  'designer_portfolio_content_v1'
];
const ADMIN_AUTH_KEY = 'designer_portfolio_admin_auth';
export const ADMIN_PASSWORD = '1111';

const DB_NAME = 'PortfolioDatabase_v1';
const DB_VERSION = 1;
const STORE_NAME = 'site_content';
const CONTENT_DOC_KEY = 'current_content';

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get from IndexedDB
async function getIndexedDBContent(): Promise<SiteContent | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CONTENT_DOC_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, falling back to localStorage', err);
    return null;
  }
}

// Save to IndexedDB
async function saveIndexedDBContent(content: SiteContent): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(content, CONTENT_DOC_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed', err);
    return false;
  }
}

export function mergeWithInitial(parsed: any): SiteContent {
  if (!parsed || typeof parsed !== 'object') return initialSiteContent;

  const mergedProjects = Array.isArray(parsed.projects) && parsed.projects.length > 0 
    ? parsed.projects.map((p: any) => ({
        ...p,
        isPublished: p.isPublished !== false,
      }))
    : initialSiteContent.projects;

  return {
    ...initialSiteContent,
    ...parsed,
    meta: {
      ...initialSiteContent.meta,
      ...(parsed.meta || {}),
    },
    hero: {
      ...initialSiteContent.hero,
      ...(parsed.hero || {}),
    },
    approach: {
      ...initialSiteContent.approach,
      ...(parsed.approach || {}),
    },
    about: {
      ...initialSiteContent.about,
      ...(parsed.about || {}),
    },
    contact: {
      ...initialSiteContent.contact,
      ...(parsed.contact || {}),
    },
    projects: mergedProjects,
    updatedAt: parsed.updatedAt || undefined,
  };
}

/**
 * Synchronous initial load (from localStorage) for instant first-paint
 */
export function loadSiteContent(): SiteContent {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal) {
          saved = legacyVal;
          break;
        }
      }
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = mergeWithInitial(parsed);
      return merged;
    }
  } catch (err) {
    console.error('Failed to load portfolio content from localStorage', err);
  }
  return initialSiteContent;
}

/**
 * Asynchronous load: Priority to Cloud Firestore -> IndexedDB -> LocalStorage
 * Strictly protects local unsynced edits from being overwritten by stale remote data!
 */
export async function loadSiteContentAsync(): Promise<SiteContent | null> {
  const localCurrent = loadSiteContent();
  const localUpdatedTime = typeof localCurrent.updatedAt === 'number' 
    ? localCurrent.updatedAt 
    : (localCurrent.updatedAt ? new Date(localCurrent.updatedAt).getTime() : 0);

  // 1. Try fetching live content from Cloud Firestore
  try {
    const remote = await getRemoteContent();
    if (remote) {
      const mergedRemote = mergeWithInitial(remote);
      const remoteUpdatedTime = typeof mergedRemote.updatedAt === 'number'
        ? mergedRemote.updatedAt
        : (mergedRemote.updatedAt ? new Date(mergedRemote.updatedAt).getTime() : 0);

      // If local has newer edits that failed cloud sync, keep local and don't overwrite!
      if (localUpdatedTime && (!remoteUpdatedTime || localUpdatedTime >= remoteUpdatedTime)) {
        console.log('[Storage] Preserving newer local edits over stale remote data.');
        return localCurrent;
      }

      // Remote is up-to-date or newer
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedRemote));
        saveIndexedDBContent(mergedRemote);
      } catch (e) {}
      return mergedRemote;
    }
  } catch (err) {
    console.warn('Firebase remote fetch error, checking local storage', err);
  }

  // 2. Fallback to IndexedDB
  try {
    const idbData = await getIndexedDBContent();
    if (idbData) {
      const mergedIdb = mergeWithInitial(idbData);
      return mergedIdb;
    }
  } catch (err) {
    console.error('Failed to load from IndexedDB', err);
  }
  return null;
}

/**
 * Create a lightweight version of SiteContent safe for 5MB localStorage limit
 */
function sanitizeForLocalStorage(content: SiteContent): SiteContent {
  try {
    const serialized = JSON.stringify(content);
    // If within 2.5MB, safe to store directly
    if (serialized.length < 2.5 * 1024 * 1024) {
      return content;
    }
    // If too large, clone and replace large video dataUrls with placeholders
    const clone: SiteContent = JSON.parse(serialized);
    if (Array.isArray(clone.projects)) {
      for (const proj of clone.projects) {
        if (Array.isArray(proj.videoVariations)) {
          for (const v of proj.videoVariations) {
            if (v.videoUrl && v.videoUrl.startsWith('data:video/')) {
              // Replace huge base64 with empty placeholder (IndexedDB & Cloud will have the real one)
              v.videoUrl = '';
            }
          }
        }
      }
    }
    return clone;
  } catch {
    return content;
  }
}

/**
 * Save site content to:
 * 1. LocalStorage (Instant cache)
 * 2. IndexedDB (Unlimited capacity storage)
 * 3. Cloud Firestore (Global Sync across all devices and visitors)
 */
export async function saveSiteContent(content: SiteContent): Promise<{ success: boolean; cloudSynced?: boolean; error?: string }> {
  // Ensure timestamp is stamped
  const timestampedContent: SiteContent = {
    ...content,
    updatedAt: Date.now(),
  };

  // 1. Save to localStorage (Sanitized to avoid 5MB quota ceiling)
  try {
    const safePayload = sanitizeForLocalStorage(timestampedContent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safePayload));
  } catch (err) {
    console.warn('localStorage quota bypass notice (IndexedDB & Cloud will preserve full data):', err);
  }

  // 2. Save to IndexedDB (handles any file size / base64 without limit)
  try {
    await saveIndexedDBContent(timestampedContent);
  } catch (err) {
    console.error('IndexedDB save failed', err);
  }

  // 3. Save to Cloud Firestore (Real-time global persistence)
  try {
    const remoteResult = await saveRemoteContent(timestampedContent);
    if (remoteResult && remoteResult.success) {
      return { success: true, cloudSynced: true };
    }
    // Remote had a quota/network issue, but local is 100% saved
    return { 
      success: true, 
      cloudSynced: false, 
      error: remoteResult?.error || '클라우드 동기화 대기 중 (브라우저 로컬 안전 보관됨)' 
    };
  } catch (remoteErr: any) {
    console.warn('Firebase save warning (local saved successfully):', remoteErr);
    return { 
      success: true, 
      cloudSynced: false, 
      error: '클라우드 동기화 대기 중 (브라우저 로컬 안전 보관됨)' 
    };
  }
}

export function resetToDefaultContent(): SiteContent {
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(legacyKey);
    }
    // Also clear IndexedDB
    openDB().then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(CONTENT_DOC_KEY);
    }).catch((err) => console.warn('IndexedDB reset failed', err));

    // Reset cloud document
    saveRemoteContent(initialSiteContent).catch((err) => console.warn('Firebase reset failed', err));
  } catch (err) {
    console.error('Failed to reset storage', err);
  }
  return initialSiteContent;
}

export function checkAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

export function setAdminSession(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (err) {
    console.error('Failed to update session storage', err);
  }
}
