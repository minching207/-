import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection,
  getDocs,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SiteContent, Project } from '../types';

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  }, dbId);
} catch (e) {
  firestoreInstance = getFirestore(app, dbId);
}

export const db = firestoreInstance;

const PORTFOLIO_DOC_PATH = 'portfolio_content';
const PORTFOLIO_DOC_ID = 'live';
const PORTFOLIO_META_DOC_ID = 'live_meta';
const PROJECTS_COLLECTION = 'portfolio_projects';

/**
 * Clean data for Firestore serialization (strip undefined, functions, non-serializable properties)
 */
function cleanForFirestore(obj: any): any {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value === undefined) return null;
    return value;
  }));
}

/**
 * Reassemble full SiteContent from metadata + individual project collection
 */
async function assembleFromCollection(): Promise<SiteContent | null> {
  try {
    const metaRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_META_DOC_ID);
    const metaSnap = await getDoc(metaRef);
    const projectsCol = collection(db, PROJECTS_COLLECTION);
    const projectsSnap = await getDocs(projectsCol);

    const fetchedProjects: Project[] = [];
    projectsSnap.forEach((docItem) => {
      const pData = docItem.data();
      if (pData && pData.id) {
        fetchedProjects.push(pData as Project);
      }
    });

    let metaData: any = {};
    if (metaSnap.exists()) {
      metaData = metaSnap.data() || {};
    }

    if (fetchedProjects.length > 0 || metaSnap.exists()) {
      // Sort projects according to projectOrder if available
      if (Array.isArray(metaData.projectOrder)) {
        fetchedProjects.sort((a, b) => {
          const indexA = metaData.projectOrder.indexOf(a.id);
          const indexB = metaData.projectOrder.indexOf(b.id);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        });
      }

      const assembledContent: Partial<SiteContent> = {
        meta: metaData.meta,
        hero: metaData.hero,
        approach: metaData.approach,
        about: metaData.about,
        contact: metaData.contact,
        projects: fetchedProjects,
      };

      return assembledContent as SiteContent;
    }
  } catch (error) {
    console.warn('[Firebase] assembleFromCollection error:', error);
  }
  return null;
}

/**
 * Fetch remote portfolio content from Firestore with multi-tier fallback
 */
export async function getRemoteContent(): Promise<SiteContent | null> {
  // 1. Primary approach: Assemble from modular project collection + metadata
  // This completely bypasses the 1MB single-document limit
  const collectionContent = await assembleFromCollection();
  if (collectionContent && collectionContent.projects && collectionContent.projects.length > 0) {
    return collectionContent;
  }

  // 2. Fallback attempt: Read legacy consolidated document if collection is not yet populated
  try {
    const docRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.content && Array.isArray(data.content.projects) && data.content.projects.length > 0) {
        return data.content as SiteContent;
      }
    }
  } catch (error) {
    console.warn('[Firebase] Consolidated document fallback warning:', error);
  }

  return collectionContent;
}

/**
 * Save portfolio content to Firestore:
 * - Saves metadata document (live_meta) with site settings & project order
 * - Saves each project as an independent document in `portfolio_projects` collection
 * - Automatically cleans up deleted projects from the collection
 * - Prevents the Firestore 1MB single document size limit entirely!
 */
export async function saveRemoteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanedContent = cleanForFirestore(content);
    const now = new Date().toISOString();
    const currentProjectList: Project[] = Array.isArray(cleanedContent.projects) ? cleanedContent.projects : [];
    const currentProjectIds = new Set(currentProjectList.map((p) => p.id));

    // 1. Save metadata + project ordering
    const metaRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_META_DOC_ID);
    await setDoc(metaRef, {
      meta: cleanedContent.meta,
      hero: cleanedContent.hero,
      approach: cleanedContent.approach,
      about: cleanedContent.about,
      contact: cleanedContent.contact,
      projectOrder: currentProjectList.map((p: Project) => p.id),
      updatedAt: now,
    }, { merge: true });

    // 2. Save individual project documents into portfolio_projects collection
    const projectSavePromises = currentProjectList.map((proj: Project) => {
      const projRef = doc(db, PROJECTS_COLLECTION, proj.id);
      return setDoc(projRef, {
        ...proj,
        updatedAt: now,
      }, { merge: true });
    });
    await Promise.all(projectSavePromises);

    // 3. Clean up any deleted projects from the collection
    try {
      const projectsCol = collection(db, PROJECTS_COLLECTION);
      const existingSnap = await getDocs(projectsCol);
      const deletePromises: Promise<any>[] = [];
      existingSnap.forEach((docItem) => {
        if (!currentProjectIds.has(docItem.id)) {
          deletePromises.push(deleteDoc(doc(db, PROJECTS_COLLECTION, docItem.id)));
        }
      });
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    } catch (cleanupErr) {
      console.warn('[Firebase] Project cleanup notice:', cleanupErr);
    }

    // 4. Save lightweight sync beacon into live document without heavy image bloat
    try {
      const liveRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
      // Lightweight version without huge sliced images to guarantee < 50KB size
      const lightweightProjects = currentProjectList.map((p: Project) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        category: p.category,
        projectType: p.projectType,
        summary: p.summary,
        coverImage: p.coverImage,
        tags: p.tags,
        role: p.role,
        period: p.period,
        tools: p.tools,
        client: p.client,
        featuredInHero: p.featuredInHero,
      }));

      await setDoc(liveRef, {
        meta: cleanedContent.meta,
        hero: cleanedContent.hero,
        projectSummaries: lightweightProjects,
        updatedAt: now,
      }, { merge: true });
    } catch (beaconErr) {
      console.warn('[Firebase] Live sync beacon notice:', beaconErr);
    }

    console.log('[Firebase] Successfully saved modular portfolio content to Firestore!');
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
    const metaRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_META_DOC_ID);
    const unsubscribe = onSnapshot(metaRef, async (snap) => {
      if (snap.exists()) {
        const fullContent = await assembleFromCollection();
        if (fullContent) {
          onUpdate(fullContent);
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
