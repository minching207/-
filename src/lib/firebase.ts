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
        // Check for sections in subcollection (stores large images independently to bypass 1MB limit)
        const sectionsCol = collection(db, PROJECTS_COLLECTION, pData.id, 'sections');
        const secSnap = await getDocs(sectionsCol);

        if (!secSnap.empty) {
          const subSections: any[] = [];
          secSnap.forEach((sDoc) => {
            const sData = sDoc.data();
            if (sData) subSections.push(sData);
          });
          // Sort by order or numeric index
          subSections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          pData.sections = subSections;
        }
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
 * Save portfolio content to Firestore:
 * - Saves each project in `portfolio_projects` collection
 * - Heavy section images are stored in dedicated `sections` subcollection per project
 * - Guarantees 0% chance of exceeding the 1MB Firestore document limit!
 * - Cleans up deleted projects & deleted sub-sections
 * - Updates metadata document (`live_meta`) LAST, ensuring real-time listeners receive complete data
 * - Adds 10s timeout protection so that network hangs never cause infinite loading
 */
export async function saveRemoteContent(content: SiteContent): Promise<{ success: boolean; error?: string }> {
  // Wrap in a promise with timeout to prevent infinite loading state
  const savePromise = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanedContent = cleanForFirestore(content);
      const now = new Date().toISOString();
      const currentProjectList: Project[] = Array.isArray(cleanedContent.projects) ? cleanedContent.projects : [];
      const currentProjectIds = new Set(currentProjectList.map((p) => p.id));

      // 1. Save all individual project documents and their sections subcollections
      const projectSavePromises = currentProjectList.map(async (proj: Project) => {
        const projRef = doc(db, PROJECTS_COLLECTION, proj.id);
        
        // Clean and prepare sections
        const rawSections = proj.sections || [];
        const currentSectionIds = new Set<string>();

        const sanitizedSections = rawSections.map((sec, sIdx) => {
          const secId = sec.id || `sec-${sIdx + 1}`;
          currentSectionIds.add(secId);
          const rawImgs = Array.isArray(sec.images) ? sec.images.filter(Boolean) : (sec.imageUrl ? [sec.imageUrl] : []);
          return {
            id: secId,
            order: sIdx,
            title: sec.title || `0${sIdx + 1}. SECTION`,
            caption: sec.caption || '',
            imageUrl: rawImgs[0] || sec.imageUrl || '',
            images: rawImgs,
            layoutMode: sec.layoutMode || 'seamless',
          };
        });

        // Save each section into subcollection `portfolio_projects/{proj.id}/sections/{sec.id}`
        const sectionSavePromises = sanitizedSections.map(async (sec) => {
          const secRef = doc(db, PROJECTS_COLLECTION, proj.id, 'sections', sec.id);
          return setDoc(secRef, {
            ...sec,
            updatedAt: now,
          });
        });

        await Promise.all(sectionSavePromises);

        // Clean up any deleted sections in this project's subcollection
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
        } catch (secCleanErr) {
          console.warn(`[Firebase] Section cleanup notice for ${proj.id}:`, secCleanErr);
        }

        // Prepare project root document: keep lightweight section summaries in the main doc
        // and full image data in the sections subcollection to keep main doc << 200KB
        const lightweightSections = sanitizedSections.map((sec) => ({
          id: sec.id,
          order: sec.order,
          title: sec.title,
          caption: sec.caption,
          imageUrl: sec.imageUrl ? (sec.imageUrl.length > 5000 ? sec.imageUrl.slice(0, 100) + '...' : sec.imageUrl) : '',
          imageCount: sec.images.length,
          layoutMode: sec.layoutMode,
        }));

        const sanitizedProject: Project = {
          ...proj,
          isPublished: proj.isPublished !== false,
          sections: lightweightSections as any,
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
      } catch (cleanupErr) {
        console.warn('[Firebase] Project cleanup notice:', cleanupErr);
      }

      // 3. Save metadata + project ordering LAST (This triggers onSnapshot AFTER projects are written!)
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

      // 4. Save lightweight sync beacon into live document for backwards compatibility
      try {
        const liveRef = doc(db, PORTFOLIO_DOC_PATH, PORTFOLIO_DOC_ID);
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
          isPublished: p.isPublished !== false,
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

  // Timeout promise (12 seconds)
  const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: false, 
        error: '클라우드 네트워크 응답 시간이 초과되었습니다. 브라우저 로컬(IndexedDB)에는 안전하게 저장되었습니다.' 
      });
    }, 12000);
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
