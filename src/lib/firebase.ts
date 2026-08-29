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
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import {
  getAuth,
  signInAnonymously
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SiteContent, Project } from '../types';
import { optimizeDataUrl } from '../utils/imageOptimizer';

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firebase Auth (sign-in anonymously for secure rule evaluation)
export const auth = getAuth(app);
try {
  signInAnonymously(auth).catch((authErr) => {
    console.warn('[Firebase Auth] Anonymous sign-in notice:', authErr);
  });
} catch (e) {}

// 3. Initialize Firestore
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

// 4. Initialize Firebase Cloud Storage
export const storage = getStorage(app, firebaseConfig.storageBucket);

const PORTFOLIO_DOC_PATH = 'portfolio_content';
const PORTFOLIO_DOC_ID = 'live';
const PORTFOLIO_META_DOC_ID = 'live_meta';
const PROJECTS_COLLECTION = 'portfolio_projects';

/**
 * Convert a base64 dataUrl string to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) return null;
    const contentType = parts[0].split(':')[1] || 'image/jpeg';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (e) {
    console.warn('dataUrlToBlob parsing error:', e);
    return null;
  }
}

/**
 * Fast-fail media upload helper.
 * Tries Firebase Storage first with short timeout; if unavailable, falls back cleanly to compressed base64.
 */
export async function uploadMediaToStorage(
  fileOrBlobOrDataUrl: File | Blob | string, 
  customFileName?: string,
  folder: string = 'portfolio_media'
): Promise<string> {
  const uploadTask = async (): Promise<string> => {
    try {
      let targetBlob: Blob;
      let ext = 'webp';
      let mimeType = 'image/webp';

      if (typeof fileOrBlobOrDataUrl === 'string') {
        if (fileOrBlobOrDataUrl.startsWith('http://') || fileOrBlobOrDataUrl.startsWith('https://')) {
          return fileOrBlobOrDataUrl;
        }
        const converted = dataUrlToBlob(fileOrBlobOrDataUrl);
        if (!converted) {
          throw new Error('Invalid image data format');
        }
        targetBlob = converted;
        mimeType = targetBlob.type;
        ext = mimeType.includes('gif') ? 'gif' : mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      } else if (fileOrBlobOrDataUrl instanceof File) {
        targetBlob = fileOrBlobOrDataUrl;
        mimeType = fileOrBlobOrDataUrl.type;
        const fileExt = fileOrBlobOrDataUrl.name.split('.').pop();
        if (fileExt) ext = fileExt.toLowerCase();
      } else {
        targetBlob = fileOrBlobOrDataUrl;
        mimeType = fileOrBlobOrDataUrl.type || 'image/webp';
        ext = mimeType.includes('gif') ? 'gif' : mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
      }

      const cleanName = customFileName 
        ? customFileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const fullPath = `${folder}/${cleanName}`;
      const storageRef = ref(storage, fullPath);
      
      const snapshot = await uploadBytes(storageRef, targetBlob, {
        contentType: mimeType || 'image/webp',
      });
      
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      throw error;
    }
  };

  // 1.5s timeout per storage upload
  const timeout = new Promise<string>((_, reject) => 
    setTimeout(() => reject(new Error('Storage upload timeout')), 1500)
  );

  return Promise.race([uploadTask(), timeout]);
}

/**
 * Concurrency helper to run async tasks in parallel
 */
async function asyncPool<T>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T) => Promise<any>
): Promise<void> {
  const ret: Promise<any>[] = [];
  const executing: Promise<any>[] = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    if (poolLimit <= array.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  await Promise.all(ret);
}

/**
 * Optimizes base64 string for ultra-safe Firestore payload (< 80KB per item)
 */
async function safeCompressImage(dataUrl?: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl || '';
  try {
    return await optimizeDataUrl(dataUrl, 1400, 0.82);
  } catch {
    return dataUrl;
  }
}

/**
 * Optimizes all base64 media within content in parallel
 */
async function optimizeAllMedia(content: SiteContent): Promise<SiteContent> {
  const cloned: SiteContent = JSON.parse(JSON.stringify(content));
  interface MediaTask {
    get: () => string | undefined;
    set: (url: string) => void;
    tag: string;
  }

  const tasks: MediaTask[] = [];

  // Hero mockup
  if (cloned.hero?.heroImage && cloned.hero.heroImage.startsWith('data:')) {
    tasks.push({
      get: () => cloned.hero?.heroImage,
      set: (url) => { if (cloned.hero) cloned.hero.heroImage = url; },
      tag: `hero_main_${Date.now()}`
    });
  }

  // Projects
  if (Array.isArray(cloned.projects)) {
    for (let pIdx = 0; pIdx < cloned.projects.length; pIdx++) {
      const proj = cloned.projects[pIdx];

      // Cover image
      if (proj.coverImage && proj.coverImage.startsWith('data:')) {
        tasks.push({
          get: () => proj.coverImage,
          set: (url) => { proj.coverImage = url; },
          tag: `cover_${proj.id}_${Date.now()}`
        });
      }

      // Hero Mockup Image
      if (proj.heroMockupImage && proj.heroMockupImage.startsWith('data:')) {
        tasks.push({
          get: () => proj.heroMockupImage,
          set: (url) => { proj.heroMockupImage = url; },
          tag: `mockup_${proj.id}_${Date.now()}`
        });
      }

      // Banner variations
      if (Array.isArray(proj.bannerVariations)) {
        for (let bIdx = 0; bIdx < proj.bannerVariations.length; bIdx++) {
          const banner = proj.bannerVariations[bIdx];
          if (banner.imageUrl && banner.imageUrl.startsWith('data:')) {
            tasks.push({
              get: () => banner.imageUrl,
              set: (url) => { banner.imageUrl = url; },
              tag: `banner_${proj.id}_${bIdx}_${Date.now()}`
            });
          }
        }
      }

      // SNS slides
      if (Array.isArray(proj.snsSlides)) {
        for (let sIdx = 0; sIdx < proj.snsSlides.length; sIdx++) {
          const slide = proj.snsSlides[sIdx];
          if (slide.imageUrl && slide.imageUrl.startsWith('data:')) {
            tasks.push({
              get: () => slide.imageUrl,
              set: (url) => { slide.imageUrl = url; },
              tag: `sns_${proj.id}_${sIdx}_${Date.now()}`
            });
          }
        }
      }

      // Video variations
      if (Array.isArray(proj.videoVariations)) {
        for (let vIdx = 0; vIdx < proj.videoVariations.length; vIdx++) {
          const vVar = proj.videoVariations[vIdx];
          if (vVar.videoUrl && vVar.videoUrl.startsWith('data:')) {
            tasks.push({
              get: () => vVar.videoUrl,
              set: (url) => { vVar.videoUrl = url; },
              tag: `video_${proj.id}_${vIdx}_${Date.now()}`
            });
          }
          if (vVar.coverImage && vVar.coverImage.startsWith('data:')) {
            tasks.push({
              get: () => vVar.coverImage,
              set: (url) => { vVar.coverImage = url; },
              tag: `vcover_${proj.id}_${vIdx}_${Date.now()}`
            });
          }
        }
      }

      // Sections
      if (Array.isArray(proj.sections)) {
        for (let sIdx = 0; sIdx < proj.sections.length; sIdx++) {
          const sec = proj.sections[sIdx];

          if (sec.imageUrl && sec.imageUrl.startsWith('data:')) {
            tasks.push({
              get: () => sec.imageUrl,
              set: (url) => { sec.imageUrl = url; },
              tag: `sec_${proj.id}_${sIdx}_${Date.now()}`
            });
          }

          if (Array.isArray(sec.images)) {
            for (let iIdx = 0; iIdx < sec.images.length; iIdx++) {
              const img = sec.images[iIdx];
              if (img && img.startsWith('data:')) {
                tasks.push({
                  get: () => sec.images[iIdx],
                  set: (url) => { sec.images[iIdx] = url; },
                  tag: `slice_${proj.id}_${sIdx}_${iIdx}_${Date.now()}`
                });
              }
            }
          }
        }
      }
    }
  }

  if (tasks.length > 0) {
    await asyncPool(8, tasks, async (task) => {
      const val = task.get();
      if (!val || !val.startsWith('data:')) return;
      
      // Fast compress first to ensure minimal payload
      const compressed = await safeCompressImage(val);
      task.set(compressed);

      // Attempt background upload to storage
      try {
        const url = await uploadMediaToStorage(compressed, task.tag);
        if (url) {
          task.set(url);
        }
      } catch (err) {
        // Fallback to compressed base64 is already set
      }
    });
  }

  return cloned;
}

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

    const resolvedProjects: Project[] = [];
    
    for (const docItem of projectsSnap.docs) {
      const pData = docItem.data() as any;
      if (pData && pData.id) {
        pData.isPublished = pData.isPublished !== false;
        resolvedProjects.push(pData as Project);
      }
    }

    let metaData: any = {};
    if (metaSnap.exists()) {
      metaData = metaSnap.data() || {};
    }

    if (resolvedProjects.length > 0 || metaSnap.exists()) {
      // Sort projects according to projectOrder if available
      if (Array.isArray(metaData.projectOrder) && metaData.projectOrder.length > 0) {
        resolvedProjects.sort((a, b) => {
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
        projects: resolvedProjects,
        updatedAt: metaData.updatedAt || undefined,
      };

      return assembledContent as SiteContent;
    }
  } catch (error) {
    console.warn('[Firebase] assembleFromCollection warning:', error);
  }
  return null;
}

/**
 * Fetch remote portfolio content from Firestore with multi-tier fallback
 */
export async function getRemoteContent(): Promise<SiteContent | null> {
  // 1. Primary approach: Assemble from modular project collection + metadata
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
 * Save portfolio content to Firestore with per-project partitioning and image optimization.
 */
export async function saveRemoteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  try {
    // 0. Auto-optimize images
    let contentWithOptimizedMedia = content;
    try {
      contentWithOptimizedMedia = await optimizeAllMedia(content);
    } catch (optErr) {
      console.warn('[Firebase] optimizeAllMedia notice:', optErr);
    }

    const cleanedContent = cleanForFirestore(contentWithOptimizedMedia);
    const now = new Date().toISOString();
    const currentProjectList: Project[] = Array.isArray(cleanedContent.projects) ? cleanedContent.projects : [];
    const currentProjectIds = new Set(currentProjectList.map((p) => p.id));

    // 1. Save all individual project documents in parallel
    const projectSavePromises = currentProjectList.map((proj: Project) => {
      const projRef = doc(db, PROJECTS_COLLECTION, proj.id);
      return setDoc(projRef, {
        ...proj,
        isPublished: proj.isPublished !== false,
        updatedAt: now,
      });
    });

    await Promise.all(projectSavePromises);

    // 2. Clean up any deleted projects from the collection
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
    } catch (cleanupErr) {}

    // 3. Save metadata + project ordering
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

    // 4. Save live backup document
    try {
      const liveRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
      await setDoc(liveRef, {
        content: cleanedContent,
        updatedAt: now,
      }, { merge: true });
    } catch (liveErr) {}

    console.log('[Firebase] Successfully saved portfolio content to Firestore!');
    return { success: true };
  } catch (error: any) {
    console.error('[Firebase] Save to Firestore failed:', error);
    const rawMsg = error?.message || '';
    let errMsg = '클라우드 데이터베이스 저장 중 오류가 발생했습니다.';
    if (rawMsg.includes('exceeds the maximum allowed size') || rawMsg.includes('1,048,576')) {
      errMsg = '프로젝트 이미지 용량이 Firestore 허용 한도(1MB)를 초과했습니다. 고해상도 이미지는 압축 후 등록해주세요.';
    } else if (rawMsg) {
      errMsg = `클라우드 저장 오류: ${rawMsg}`;
    }
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
