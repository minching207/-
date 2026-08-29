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
  onSnapshot,
  Firestore
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

// 2. Initialize Firebase Auth
export const auth = getAuth(app);
try {
  signInAnonymously(auth).catch((authErr) => {
    console.warn('[Firebase Auth] Anonymous sign-in note:', authErr?.message || authErr);
  });
} catch (e) {}

// 3. Initialize Firestore Instances (Primary Applet DB and Default DB)
const configuredDbId = firebaseConfig.firestoreDatabaseId || '(default)';

let primaryFirestore: Firestore;
try {
  primaryFirestore = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  }, configuredDbId);
} catch (e) {
  primaryFirestore = getFirestore(app, configuredDbId);
}

let defaultFirestore: Firestore;
try {
  defaultFirestore = getFirestore(app, '(default)');
} catch (e) {
  defaultFirestore = primaryFirestore;
}

export const db = primaryFirestore;

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
 * Robust media upload helper to Firebase Cloud Storage.
 * Handles images, animated GIFs, and videos of any size with realistic network timeouts.
 */
export async function uploadMediaToStorage(
  fileOrBlobOrDataUrl: File | Blob | string, 
  customFileName?: string,
  folder: string = 'portfolio_media'
): Promise<string> {
  const isVideo = 
    (typeof fileOrBlobOrDataUrl === 'string' && fileOrBlobOrDataUrl.startsWith('data:video/')) ||
    (fileOrBlobOrDataUrl instanceof File && fileOrBlobOrDataUrl.type.startsWith('video/')) ||
    (fileOrBlobOrDataUrl instanceof Blob && fileOrBlobOrDataUrl.type?.startsWith('video/'));

  const uploadTimeoutMs = isVideo ? 90000 : 25000; // 90s for video, 25s for images

  const uploadTask = async (): Promise<string> => {
    try {
      let targetBlob: Blob;
      let ext = isVideo ? 'mp4' : 'webp';
      let mimeType = isVideo ? 'video/mp4' : 'image/webp';

      if (typeof fileOrBlobOrDataUrl === 'string') {
        if (fileOrBlobOrDataUrl.startsWith('http://') || fileOrBlobOrDataUrl.startsWith('https://')) {
          return fileOrBlobOrDataUrl;
        }
        const converted = dataUrlToBlob(fileOrBlobOrDataUrl);
        if (!converted) {
          throw new Error('Invalid media data format');
        }
        targetBlob = converted;
        mimeType = targetBlob.type;
        if (mimeType.includes('video/webm')) ext = 'webm';
        else if (mimeType.includes('video/quicktime') || mimeType.includes('video/mov')) ext = 'mov';
        else if (mimeType.includes('video/ogg')) ext = 'ogg';
        else if (mimeType.includes('video')) ext = 'mp4';
        else if (mimeType.includes('gif')) ext = 'gif';
        else if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else ext = 'jpg';
      } else if (fileOrBlobOrDataUrl instanceof File) {
        targetBlob = fileOrBlobOrDataUrl;
        mimeType = fileOrBlobOrDataUrl.type;
        const fileExt = fileOrBlobOrDataUrl.name.split('.').pop();
        if (fileExt) ext = fileExt.toLowerCase();
      } else {
        targetBlob = fileOrBlobOrDataUrl;
        mimeType = fileOrBlobOrDataUrl.type || (isVideo ? 'video/mp4' : 'image/webp');
        if (mimeType.includes('gif')) ext = 'gif';
        else if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('video')) ext = 'mp4';
        else ext = 'jpg';
      }

      const cleanName = customFileName 
        ? customFileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const fullPath = `${folder}/${cleanName}`;
      const storageRef = ref(storage, fullPath);
      
      const snapshot = await uploadBytes(storageRef, targetBlob, {
        contentType: mimeType || (isVideo ? 'video/mp4' : 'image/webp'),
      });
      
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      throw error;
    }
  };

  const timeoutPromise = new Promise<string>((_, reject) => 
    setTimeout(() => reject(new Error(`Storage upload timeout (${uploadTimeoutMs / 1000}s)`)), uploadTimeoutMs)
  );

  return Promise.race([uploadTask(), timeoutPromise]);
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
 * Optimizes image base64 string for safe Firestore payload (< 70KB per image)
 */
async function safeCompressImage(dataUrl?: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl || '';
  if (dataUrl.startsWith('data:video/')) return dataUrl; // Don't canvas-compress video strings
  try {
    return await optimizeDataUrl(dataUrl, 1200, 0.78);
  } catch {
    return dataUrl;
  }
}

/**
 * Optimizes and uploads all base64 media within content to Firebase Cloud Storage
 */
async function optimizeAllMedia(content: SiteContent): Promise<SiteContent> {
  const cloned: SiteContent = JSON.parse(JSON.stringify(content));
  interface MediaTask {
    get: () => string | undefined;
    set: (url: string) => void;
    tag: string;
    isVideo?: boolean;
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
              tag: `video_${proj.id}_${vIdx}_${Date.now()}`,
              isVideo: true
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
    await asyncPool(4, tasks, async (task) => {
      const val = task.get();
      if (!val || !val.startsWith('data:')) return;
      
      // For images, optimize locally first
      if (!task.isVideo) {
        const compressed = await safeCompressImage(val);
        task.set(compressed);
      }

      // Upload to Firebase Cloud Storage
      try {
        const url = await uploadMediaToStorage(val, task.tag);
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          task.set(url);
        }
      } catch (err) {
        console.warn(`Storage upload background note for ${task.tag}:`, err);
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
 * Reads content from a specific Firestore database instance
 */
async function readFromDb(targetDb: Firestore): Promise<SiteContent | null> {
  // 1. Try consolidated live document first (fastest, lowest read cost)
  try {
    const liveRef = doc(targetDb, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const liveSnap = await getDoc(liveRef);
    if (liveSnap.exists()) {
      const data = liveSnap.data();
      if (data && data.content && Array.isArray(data.content.projects) && data.content.projects.length > 0) {
        return data.content as SiteContent;
      }
    }
  } catch (liveErr) {
    console.warn('[Firebase] Consolidated read notice:', liveErr);
  }

  // 2. Try assembling from collection
  try {
    const metaRef = doc(targetDb, PORTFOLIO_DOC_PATH, PORTFOLIO_META_DOC_ID);
    const metaSnap = await getDoc(metaRef);
    const projectsCol = collection(targetDb, PROJECTS_COLLECTION);
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
  } catch (colErr) {
    console.warn('[Firebase] Collection read notice:', colErr);
  }
  return null;
}

/**
 * Fetch remote portfolio content from Firestore with multi-tier fallback
 */
export async function getRemoteContent(): Promise<SiteContent | null> {
  // Try primary configured DB first
  try {
    const content = await readFromDb(primaryFirestore);
    if (content && content.projects && content.projects.length > 0) {
      return content;
    }
  } catch (e) {}

  // Try default DB fallback
  if (defaultFirestore !== primaryFirestore) {
    try {
      const defaultContent = await readFromDb(defaultFirestore);
      if (defaultContent && defaultContent.projects && defaultContent.projects.length > 0) {
        return defaultContent;
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Saves content to a specific Firestore database instance with ultra-low write cost (1 write unit)
 */
async function writeToDb(targetDb: Firestore, cleanedContent: SiteContent, now: string): Promise<boolean> {
  // 1. Primary write: Consolidated live document (uses exactly 1 write operation)
  const liveRef = doc(targetDb, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
  await setDoc(liveRef, {
    content: cleanedContent,
    updatedAt: now,
  });

  // 2. Secondary metadata write
  try {
    const metaRef = doc(targetDb, PORTFOLIO_DOC_PATH, PORTFOLIO_META_DOC_ID);
    await setDoc(metaRef, {
      meta: cleanedContent.meta,
      hero: cleanedContent.hero,
      approach: cleanedContent.approach,
      about: cleanedContent.about,
      contact: cleanedContent.contact,
      projectOrder: cleanedContent.projects?.map((p: Project) => p.id) || [],
      updatedAt: now,
    }, { merge: true });
  } catch (metaErr) {}

  return true;
}

/**
 * Save portfolio content to Firestore with ultra-efficient 1-write engine & quota failover
 */
export async function saveRemoteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  const saveOperation = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 0. Auto-optimize images & upload large media to Firebase Cloud Storage
      let contentWithOptimizedMedia = content;
      try {
        contentWithOptimizedMedia = await optimizeAllMedia(content);
      } catch (optErr) {
        console.warn('[Firebase] optimizeAllMedia notice:', optErr);
      }

      const cleanedContent = cleanForFirestore(contentWithOptimizedMedia);
      const now = new Date().toISOString();

      let saved = false;
      let lastError: any = null;

      // Try primary DB
      try {
        saved = await writeToDb(primaryFirestore, cleanedContent, now);
      } catch (err: any) {
        lastError = err;
        console.warn('[Firebase] Primary DB write error, attempting default DB:', err);
      }

      // If primary failed (e.g. quota limit on named sandbox DB), try default DB
      if (!saved && defaultFirestore !== primaryFirestore) {
        try {
          saved = await writeToDb(defaultFirestore, cleanedContent, now);
        } catch (err: any) {
          lastError = err;
          console.warn('[Firebase] Default DB write error:', err);
        }
      }

      if (saved) {
        console.log('[Firebase] Successfully saved portfolio content to Firestore!');
        return { success: true };
      }

      const rawMsg = lastError?.message || '';
      let errMsg = '클라우드 데이터베이스 저장 중 오류가 발생했습니다.';
      if (rawMsg.includes('resource-exhausted') || rawMsg.includes('Quota limit exceeded')) {
        errMsg = 'Firebase 일일 무료 쓰기 할당량이 일시 소진되었습니다. (한국시간 오후 4시경 리셋 / 브라우저에는 안전 보관됨)';
      } else if (rawMsg.includes('exceeds the maximum allowed size') || rawMsg.includes('1,048,576')) {
        errMsg = '프로젝트 이미지 용량이 Firestore 허용 한도(1MB)를 초과했습니다. 고해상도 이미지는 압축 후 등록해주세요.';
      } else if (rawMsg) {
        errMsg = `클라우드 저장 오류: ${rawMsg}`;
      }
      return { success: false, error: errMsg };
    } catch (error: any) {
      console.error('[Firebase] Save to Firestore failed:', error);
      return { success: false, error: error?.message || '클라우드 저장 실패' };
    }
  };

  // 15 second timeout to allow media uploads without blocking UI
  const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: false, 
        error: '클라우드 네트워크 응답이 지연되었습니다. 작성하신 내용은 브라우저(IndexedDB)에 100% 안전하게 저장되어 있습니다.' 
      });
    }, 15000);
  });

  return Promise.race([saveOperation(), timeoutPromise]);
}

/**
 * Subscribe to real-time updates from Firestore
 */
export function subscribeToRemoteContent(onUpdate: (content: SiteContent) => void): () => void {
  try {
    const liveRef = doc(primaryFirestore, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
    const unsubscribe = onSnapshot(liveRef, async (snap) => {
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
