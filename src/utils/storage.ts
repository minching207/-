import { SiteContent } from '../types';
import { initialSiteContent } from '../data/defaultData';

const STORAGE_KEY = 'designer_portfolio_content_v5';
const LEGACY_STORAGE_KEYS = [
  'designer_portfolio_content_v4',
  'designer_portfolio_content_v3',
  'designer_portfolio_content_v2',
  'designer_portfolio_content_v1'
];
const ADMIN_AUTH_KEY = 'designer_portfolio_admin_auth';
export const ADMIN_PASSWORD = '1111';

// Replace any broken/deprecated Unsplash assets and clean tools references
function sanitizeProjectImagesAndTools(projects: any[]) {
  if (!Array.isArray(projects) || projects.length === 0) return initialSiteContent.projects;
  
  // Check if saved projects include diverse categories, if not merge with default
  const hasMultipleCategories = projects.some(p => 
    p.category?.includes('SNS') || p.category?.includes('BANNER') || p.category?.includes('VIDEO')
  );
  if (!hasMultipleCategories) {
    return initialSiteContent.projects;
  }

  return projects.map((p) => {
    let cover = p.coverImage;
    if (cover && cover.includes('photo-1608248597359-0a56e0766324')) {
      cover = 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1200&q=85';
    }
    const sections = (p.sections || []).map((sec: any) => {
      let img = sec.imageUrl;
      if (img && img.includes('photo-1550572017-edd951aa8f72')) {
        img = 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=1200&q=85';
      }
      return { ...sec, imageUrl: img };
    });
    // Clean tools string
    let tools = p.tools || '';
    tools = tools.replace(/Figma\s*\/\s*/gi, '').replace(/\/\s*Figma/gi, '').replace(/Figma/gi, 'Photoshop / Illustrator');
    if (!tools.trim()) tools = 'Photoshop / Illustrator';

    return { ...p, coverImage: cover, sections, tools };
  });
}

function sanitizeAboutSkills(about: any) {
  if (!about || !about.skills) return initialSiteContent.about;
  const updatedSkills = initialSiteContent.about.skills;
  return {
    ...about,
    skills: updatedSkills
  };
}

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
      const cleanedProjects = sanitizeProjectImagesAndTools(
        parsed.projects && parsed.projects.length > 0 ? parsed.projects : initialSiteContent.projects
      );
      const cleanedAbout = sanitizeAboutSkills(parsed.about || initialSiteContent.about);

      // Ensure merged with initial in case schema or core profile updated
      const merged: SiteContent = {
        ...initialSiteContent,
        ...parsed,
        meta: {
          ...initialSiteContent.meta,
          ...(parsed.meta && parsed.meta.designerName && parsed.meta.designerName !== '김서연' ? parsed.meta : initialSiteContent.meta)
        },
        hero: { ...initialSiteContent.hero, ...(parsed.hero || {}) },
        approach: { ...initialSiteContent.approach, ...(parsed.approach || {}) },
        about: {
          ...cleanedAbout,
          greeting: cleanedAbout.greeting && !cleanedAbout.greeting.includes('김서연') ? cleanedAbout.greeting : initialSiteContent.about.greeting
        },
        contact: { ...initialSiteContent.contact, ...(parsed.contact || {}) },
        projects: cleanedProjects,
      };
      // Save sanitized version to new key
      saveSiteContent(merged);
      return merged;
    }
  } catch (err) {
    console.error('Failed to load portfolio content from localStorage', err);
  }
  return initialSiteContent;
}

export function saveSiteContent(content: SiteContent): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (err) {
    console.error('Failed to save portfolio content to localStorage', err);
    return false;
  }
}

export function resetToDefaultContent(): SiteContent {
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(legacyKey);
    }
  } catch (err) {
    console.error('Failed to reset localStorage', err);
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
