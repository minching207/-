import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SiteContent } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the database specified in config (or default)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const PORTFOLIO_DOC_PATH = 'portfolio_content';
const PORTFOLIO_DOC_ID = 'live';

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
    console.warn('Failed to load content from Firebase Firestore:', error);
  }
  return null;
}

/**
 * Save portfolio content to Firestore so all visitors across the globe see updates
 */
export async function saveRemoteContent(content: SiteContent): Promise<boolean> {
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    await setDoc(docRef, {
      content,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to save content to Firebase Firestore:', error);
    return false;
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
      console.warn('Real-time subscription warning:', error);
    });
    return unsubscribe;
  } catch (error) {
    console.warn('Failed to setup Firebase real-time subscription:', error);
    return () => {};
  }
}
