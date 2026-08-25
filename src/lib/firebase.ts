import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SiteContent } from '../types';

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore with ignoreUndefinedProperties to prevent Firestore undefined serialization crashes
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  }, dbId);
} catch (e) {
  // If already initialized, get existing instance
  firestoreInstance = getFirestore(app, dbId);
}

export const db = firestoreInstance;

const PORTFOLIO_DOC_PATH = 'portfolio_content';
const PORTFOLIO_DOC_ID = 'live';

/**
 * Clean data for Firestore serialization (strip undefined, functions, prototype keys)
 */
function cleanForFirestore(obj: any): any {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value === undefined) return null;
    return value;
  }));
}

/**
 * Fetch remote portfolio content from Firestore
 */
export async function getRemoteContent(): Promise<SiteContent | null> {
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.content) {
        return data.content as SiteContent;
      }
    }
  } catch (error) {
    console.warn('[Firebase] Remote content fetch warning:', error);
  }
  return null;
}

/**
 * Save portfolio content to Firestore so all visitors across the globe see updates
 */
export async function saveRemoteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const cleanedContent = cleanForFirestore(content);
    
    await setDoc(docRef, {
      content: cleanedContent,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    console.log('[Firebase] Successfully synced portfolio content to Firestore cloud!');
    return { success: true };
  } catch (error: any) {
    console.error('[Firebase] Save to Firestore failed:', error);
    const errMsg = error?.message || '클라우드 데이터베이스 저장 중 오류가 발생했습니다.';
    return { success: false, error: errMsg };
  }
}

/**
 * Subscribe to real-time updates from Firestore
 */
export function subscribeToRemoteContent(onUpdate: (content: SiteContent) => void): () => void {
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.content) {
          onUpdate(data.content as SiteContent);
        }
      }
    }, (error) => {
      console.warn('[Firebase] Real-time subscription error:', error);
    });
    return unsubscribe;
  } catch (error) {
    console.warn('[Firebase] Setup real-time listener error:', error);
    return () => {};
  }
}
