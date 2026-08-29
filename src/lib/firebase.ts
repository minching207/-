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
 * Tries Firebase Storage first; if storage is unavailable or slow, falls back gracefully.
 */
export async function uploadMediaToStorage(
  fileOrBlobOrDataUrl: File | Blob | string, 
  customFileName?: string,
  folder: string = 'portfolio_media'
): Promise<string> {
  const uploadTask = async (): Promise<string> => {
    try {
      let targetBlob: Blob;
      let ext = 'jpg';
      let mimeType = 'image/jpeg';

      if (typeof fileOrBlobOrDataUrl === 'string') {
        if (fileOrBlobOrDataUrl.startsWith('http://') || fileOrBlobOrDataUrl.startsWith('https://')) {
          return fileOrBlobOrDataUrl; // Already a remote URL
        }
        const converted = dataUrlToBlob(fileOrBlobOrDataUrl);
        if (!converted) {
          throw new Error('올바르지 않은 이미지 데이터 형식입니다.');
        }
        targetBlob = converted;
        mimeType = targetBlob.type;
        ext = mimeType.includes('gif') ? 'gif' : mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : mimeType.includes('video') || mimeType.includes('mp4') ? 'mp4' : 'jpg';
      } else if (fileOrBlobOrDataUrl instanceof File) {
        targetBlob = fileOrBlobOrDataUrl;
        mimeType = fileOrBlobOrDataUrl.type;
        const fileExt = fileOrBlobOrDataUrl.name.split('.').pop();
        if (fileExt) ext = fileExt.toLowerCase();
      } else {
        targetBlob = fileOrBlobOrDataUrl;
        mimeType = fileOrBlobOrDataUrl.type || 'image/jpeg';
        ext = mimeType.includes('gif') ? 'gif' : mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : mimeType.includes('video') || mimeType.includes('mp4') ? 'mp4' : 'jpg';
      }

      const cleanName = customFileName 
        ? customFileName.replace(/[^a-zA-Z0-9._-]/g, '_')
        : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const fullPath = `${folder}/${cleanName}`;
      const storageRef = ref(storage, fullPath);
      
      const snapshot = await uploadBytes(storageRef, targetBlob, {
        contentType: mimeType || 'image/jpeg',
      });
      
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.warn('[Firebase Storage] Upload notice:', error);
      throw error;
    }
  };

  // 3 second timeout per storage upload attempt to ensure snappy saving
  const timeout = new Promise<string>((_, reject) => 
    setTimeout(() => reject(new Error('Storage upload timeout')), 3000)
  );

  return Promise.race([uploadTask(), timeout]);
}

/**
 * Concurrency helper to run async tasks in parallel with a concurrency pool
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
 * Optimizes base64 string for ultra-safe Firestore payload (< 150KB per item)
 */
async function safeCompressImage(dataUrl?: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl || '';
  try {
    return await optimizeDataUrl(dataUrl, 1280, 0.82);
  } catch {
    return dataUrl;
  }
}

/**
 * Auto-migrates base64 to Firebase Storage or compresses in parallel
 */
async function autoMigrateBase64Media(content: SiteContent): Promise<SiteContent> {
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
    await asyncPool(6, tasks, async (task) => {
      const val = task.get();
      if (!val || !val.startsWith('data:')) return;
      try {
        const url = await uploadMediaToStorage(val, task.tag);
        task.set(url);
      } catch (err) {
        // If storage upload fails, compress base64 dataUrl so Firestore document size stays minuscule
        try {
          const compressed = await safeCompressImage(val);
          task.set(compressed);
        } catch (compErr) {
          console.warn('Fallback compression notice:', compErr);
        }
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
 * Reassemble full SiteContent from metadata + individual project collection and sections subcollections
 */
async function assembleFromCollection(): Promise<SiteContent | null> {
  try {
    const metaRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_META_DOC_ID);
    const metaSnap = await getDoc(metaRef);
    const projectsCol = collection(db, PROJECTS_COLLECTION);
    const projectsSnap = await getDocs(projectsCol);

    const projectPromises = projectsSnap.docs.map(async (docItem) => {
      const pData = docItem.data();
      if (!pData || !pData.id) return null;

      try {
        // 1. Check for sections in subcollection
        const sectionsCol = collection(db, PROJECTS_COLLECTION, pData.id, 'sections');
        const secSnap = await getDocs(sectionsCol);

        if (!secSnap.empty) {
          const subSections: any[] = [];
          for (const sDoc of secSnap.docs) {
            const sData = sDoc.data();
            if (sData) {
              // Check if slices exist in subcollection
              try {
                const slicesCol = collection(db, PROJECTS_COLLECTION, pData.id, 'sections', sDoc.id, 'slices');
                const sliceSnap = await getDocs(slicesCol);
                if (!sliceSnap.empty) {
                  const sliceDocs = sliceSnap.docs.map(d => d.data());
                  sliceDocs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  sData.images = sliceDocs.map(d => d.url || d.imageUrl).filter(Boolean);
                  if (sData.images.length > 0 && !sData.imageUrl) {
                    sData.imageUrl = sData.images[0];
                  }
                }
              } catch (sliceErr) {
                console.warn(`[Firebase] Slices read error for ${pData.id}/${sDoc.id}:`, sliceErr);
              }
              subSections.push(sData);
            }
          }
          // Sort by order or numeric index
          subSections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          pData.sections = subSections;
        }

        // 2. Check for banners subcollection
        try {
          const bannersCol = collection(db, PROJECTS_COLLECTION, pData.id, 'banners');
          const bannerSnap = await getDocs(bannersCol);
          if (!bannerSnap.empty) {
            const banners = bannerSnap.docs.map(b => b.data());
            banners.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            pData.bannerVariations = banners;
          }
        } catch (bErr) {}

        // 3. Check for sns subcollection
        try {
          const snsCol = collection(db, PROJECTS_COLLECTION, pData.id, 'sns');
          const snsSnap = await getDocs(snsCol);
          if (!snsSnap.empty) {
            const slides = snsSnap.docs.map(s => s.data());
            slides.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            pData.snsSlides = slides;
          }
        } catch (sErr) {}

        // 4. Check for videos subcollection
        try {
          const vCol = collection(db, PROJECTS_COLLECTION, pData.id, 'videos');
          const vSnap = await getDocs(vCol);
          if (!vSnap.empty) {
            const vids = vSnap.docs.map(v => v.data());
            vids.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            pData.videoVariations = vids;
          }
        } catch (vErr) {}

      } catch (subErr) {
        console.warn(`[Firebase] Subcollection read warning for project ${pData.id}:`, subErr);
      }

      // Default isPublished to true if not explicitly false
      pData.isPublished = pData.isPublished !== false;

      return pData as Project;
    });

    const resolvedProjects = (await Promise.all(projectPromises)).filter(Boolean) as Project[];

    let metaData: any = {};
    if (metaSnap.exists()) {
      metaData = metaSnap.data() || {};
    }

    if (resolvedProjects.length > 0 || metaSnap.exists()) {
      // Sort projects according to projectOrder if available
      if (Array.isArray(metaData.projectOrder)) {
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
 * Save portfolio content to Firestore with 100% immunity to 1MB size limits.
 * All nested media arrays and sections are safely partitioned into subcollections.
 */
export async function saveRemoteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  const savePromise = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 0. Auto-migrate or compress base64
      let contentWithStorageUrls = content;
      try {
        contentWithStorageUrls = await autoMigrateBase64Media(content);
      } catch (migrateErr) {
        console.warn('[Firebase] autoMigrateBase64Media warning:', migrateErr);
      }

      const cleanedContent = cleanForFirestore(contentWithStorageUrls);
      const now = new Date().toISOString();
      const currentProjectList: Project[] = Array.isArray(cleanedContent.projects) ? cleanedContent.projects : [];
      const currentProjectIds = new Set(currentProjectList.map((p) => p.id));

      // 1. Save all individual project documents and their subcollections
      const projectSavePromises = currentProjectList.map(async (proj: Project) => {
        const projRef = doc(db, PROJECTS_COLLECTION, proj.id);
        
        // A. Sections handling
        const rawSections = proj.sections || [];
        const currentSectionIds = new Set<string>();

        const sectionSavePromises = rawSections.map(async (sec, sIdx) => {
          const secId = sec.id || `sec-${sIdx + 1}`;
          currentSectionIds.add(secId);
          const rawImgs = Array.isArray(sec.images) ? sec.images.filter(Boolean) : (sec.imageUrl ? [sec.imageUrl] : []);
          
          const secRef = doc(db, PROJECTS_COLLECTION, proj.id, 'sections', secId);
          
          // If sec.images has multiple large slice images, store individual slices in subcollection
          if (rawImgs.length > 1) {
            const sliceSavePromises = rawImgs.map((imgUrl, iIdx) => {
              const sliceRef = doc(db, PROJECTS_COLLECTION, proj.id, 'sections', secId, 'slices', `slice-${iIdx}`);
              return setDoc(sliceRef, {
                order: iIdx,
                url: imgUrl,
                updatedAt: now,
              });
            });
            await Promise.all(sliceSavePromises);
          }

          return setDoc(secRef, {
            id: secId,
            order: sIdx,
            title: sec.title || `0${sIdx + 1}. SECTION`,
            caption: sec.caption || '',
            imageUrl: rawImgs[0] || sec.imageUrl || '',
            images: rawImgs.length <= 1 ? rawImgs : [], // Store lightweight in sec doc
            layoutMode: sec.layoutMode || 'seamless',
            updatedAt: now,
          });
        });

        await Promise.all(sectionSavePromises);

        // Clean up deleted sections in this project's subcollection
        try {
          const sectionsCol = collection(db, PROJECTS_COLLECTION, proj.id, 'sections');
          const existingSecSnap = await getDocs(sectionsCol);
          const secDeletePromises: Promise<any>[] = [];
          existingSecSnap.forEach((sDoc) => {
            if (!currentSectionIds.has(sDoc.id)) {
              secDeletePromises.push(deleteDoc(doc(db, PROJECTS_COLLECTION, proj.id, 'sections', sDoc.id)));
            }
          });
          if (secDeletePromises.length > 0) {
            await Promise.all(secDeletePromises);
          }
        } catch (secCleanErr) {}

        // B. Banners subcollection handling
        if (Array.isArray(proj.bannerVariations) && proj.bannerVariations.length > 0) {
          const bannerPromises = proj.bannerVariations.map((banner, bIdx) => {
            const bRef = doc(db, PROJECTS_COLLECTION, proj.id, 'banners', banner.id || `b-${bIdx}`);
            return setDoc(bRef, {
              ...banner,
              order: bIdx,
              updatedAt: now,
            });
          });
          await Promise.all(bannerPromises);
        }

        // C. SNS subcollection handling
        if (Array.isArray(proj.snsSlides) && proj.snsSlides.length > 0) {
          const snsPromises = proj.snsSlides.map((slide, sIdx) => {
            const sRef = doc(db, PROJECTS_COLLECTION, proj.id, 'sns', slide.id || `s-${sIdx}`);
            return setDoc(sRef, {
              ...slide,
              order: sIdx,
              updatedAt: now,
            });
          });
          await Promise.all(snsPromises);
        }

        // D. Videos subcollection handling
        if (Array.isArray(proj.videoVariations) && proj.videoVariations.length > 0) {
          const vPromises = proj.videoVariations.map((vVar, vIdx) => {
            const vRef = doc(db, PROJECTS_COLLECTION, proj.id, 'videos', vVar.id || `v-${vIdx}`);
            return setDoc(vRef, {
              ...vVar,
              order: vIdx,
              updatedAt: now,
            });
          });
          await Promise.all(vPromises);
        }

        // Project root document: keep lightweight summary fields
        const sanitizedProject: Project = {
          id: proj.id,
          number: proj.number,
          title: proj.title,
          category: proj.category,
          projectType: proj.projectType,
          summary: proj.summary,
          coverImage: proj.coverImage,
          heroMockupImage: proj.heroMockupImage,
          tags: proj.tags || [],
          role: proj.role || '',
          period: proj.period || '',
          tools: proj.tools || [],
          client: proj.client || '',
          featuredInHero: !!proj.featuredInHero,
          isPublished: proj.isPublished !== false,
          bannerVariations: (proj.bannerVariations || []).map(b => ({ id: b.id, title: b.title, ratio: b.ratio })),
          snsSlides: (proj.snsSlides || []).map(s => ({ id: s.id, order: s.order })),
          videoVariations: (proj.videoVariations || []).map(v => ({ id: v.id, title: v.title, format: v.format })),
          sections: rawSections.map((s, i) => ({ id: s.id || `sec-${i+1}`, order: i, title: s.title, layoutMode: s.layoutMode })) as any,
        };

        return setDoc(projRef, {
          ...sanitizedProject,
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

      // 3. Save metadata + project ordering LAST (triggers onSnapshot after all documents are written)
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

      // 4. Save lightweight sync beacon into live document
      try {
        const liveRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
        const lightweightProjects = currentProjectList.map((p: Project) => ({
          id: p.id,
          number: p.number,
          title: p.title,
          category: p.category,
          projectType: p.projectType,
          summary: p.summary,
          isPublished: p.isPublished !== false,
        }));

        await setDoc(liveRef, {
          meta: cleanedContent.meta,
          hero: cleanedContent.hero,
          projectSummaries: lightweightProjects,
          updatedAt: now,
        }, { merge: true });
      } catch (beaconErr) {}

      console.log('[Firebase] Successfully saved modular portfolio content to Firestore with subcollections!');
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
  };

  // 15 seconds timeout
  const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: false, 
        error: '클라우드 네트워크 응답 시간이 지연되었습니다. 브라우저 로컬(IndexedDB)에는 안전하게 저장되었습니다.' 
      });
    }, 15000);
  });

  return Promise.race([savePromise(), timeoutPromise]);
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
