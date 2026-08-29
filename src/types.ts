export interface DesignFocusItem {
  id: string;
  title: string;
  description: string;
}

export interface ProjectSection {
  id: string;
  title: string;
  caption?: string;
  imageUrl: string;
  images?: string[]; // Multiple sliced images/cuts for detailed pages
  layoutMode?: 'seamless' | 'spaced' | 'grid' | 'slide' | 'carousel'; // Sliced continuous seamless stacking, spaced, 2-col grid, or horizontal slider
  type?: 'full' | 'split' | 'mobile' | 'grid';
  aspectRatio?: string;
  alt?: string;
}

export interface BannerVariation {
  id: string;
  label: string; // e.g. "PC 메인 와이드 배너 (1920x600)"
  dimension: string; // e.g. "1920 x 600 px"
  imageUrl: string;
  description?: string;
}

export interface SnsSlideItem {
  id: string;
  slideNumber: number;
  title: string;
  imageUrl: string;
  caption?: string;
}

export interface VideoKeyframe {
  timestamp: string; // e.g. "00:00"
  title: string;
  description: string;
  imageUrl?: string;
}

export interface VideoVariation {
  id: string;
  type: '9:16' | '16:9' | '1:1' | string;
  label: string; // e.g. "모바일 숏폼 릴스 (9:16)", "PC 와이드 영상 (16:9)", "SNS 피드 정방형 (1:1)"
  dimension: string; // e.g. "1080 x 1920 px (9:16)", "1920 x 1080 px (16:9)", "1080 x 1080 px (1:1)"
  videoUrl?: string;
  coverImage?: string;
  description?: string;
}

export interface Project {
  id: string;
  number: string; // e.g. "01"
  title: string;
  category: string; // e.g. "DETAIL PAGE", "PRODUCT", "SNS CONTENT", "MAIN BANNER", "VIDEO & MOTION"
  projectType?: 'detail-page' | 'product' | 'sns-content' | 'main-banner' | 'video-motion';
  summary: string;
  coverImage: string;
  heroMockupImage?: string;
  tags: string[];
  
  // Media extensions
  videoUrl?: string; // default video link
  aspectRatio?: string; // e.g. "16:9", "1:1", "9:16", "21:9"
  bannerVariations?: BannerVariation[];
  snsSlides?: SnsSlideItem[];
  videoKeyframes?: VideoKeyframe[];
  videoVariations?: VideoVariation[];
  
  // Project Info
  role: string;
  period: string;
  tools: string;
  client?: string;
  
  // Design Story
  background: string;
  designFocus: DesignFocusItem[];
  sections: ProjectSection[];
  outcome: {
    result: string;
    details?: string;
  };
  
  featuredInHero?: boolean;
  isPublished?: boolean; // Visibility toggle: true/undefined for published (노출), false for hidden (숨김)
}

export interface ApproachStep {
  step: string; // "01", "02", etc.
  enTitle: string; // "Understand", "Organize", etc.
  koTitle: string; // "먼저 내용을 이해합니다."
  description: string;
  points?: string[];
}

export interface StrengthItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  id: string;
  year: string;
  title: string;
  role: string;
  responsibility: string;
  project: string;
}

export interface SiteContent {
  meta: {
    designerName: string;
    designerTitle: string;
    email: string;
    phone: string;
    location: string;
    isAvailableForWork: boolean;
  };
  hero: {
    mainCopyLine1: string;
    mainCopyLine2: string;
    subCopyLine1: string;
    subCopyLine2: string;
    tags: string[];
    ctaText: string;
    featuredVisualTitle: string;
    featuredVisualSubtitle: string;
  };
  approach: {
    sectionNumber: string;
    sectionTitle: string;
    coreQuote: string;
    quoteSubtext: string;
    steps: ApproachStep[];
  };
  about: {
    sectionNumber: string;
    sectionTitle: string;
    greeting: string;
    intro: string;
    strengthsTitle: string;
    strengths: StrengthItem[];
    skills: SkillCategory[];
    experiences: ExperienceItem[];
    resumeUrl?: string;
  };
  contact: {
    sectionNumber: string;
    sectionTitle: string;
    heading: string;
    subHeading: string;
    emailNote: string;
    availableBadgeText: string;
  };
  projects: Project[];
  updatedAt?: number | string;
}
