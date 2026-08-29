import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Smartphone, 
  Package,
  Instagram, 
  Layout, 
  PlayCircle, 
  Layers, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';

interface SelectedWorksProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

interface CategoryTab {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INITIAL_VISIBLE_COUNT = 12;

export const SelectedWorks: React.FC<SelectedWorksProps> = ({ projects, onSelectProject }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const categories: CategoryTab[] = [
    { id: 'ALL', label: '전체', subLabel: 'ALL', icon: Layers },
    { id: 'DETAIL PAGE', label: '상세페이지', subLabel: 'DETAIL PAGE', icon: Smartphone },
    { id: 'PRODUCT', label: '제품', subLabel: 'PRODUCT', icon: Package },
    { id: 'SNS CONTENT', label: 'SNS 콘텐츠', subLabel: 'SNS CONTENT', icon: Instagram },
    { id: 'MAIN BANNER', label: '배너', subLabel: 'BANNER', icon: Layout },
    { id: 'VIDEO & MOTION', label: '영상·모션', subLabel: 'VIDEO & MOTION', icon: PlayCircle },
  ];

  const publishedProjects = projects.filter((p) => p.isPublished !== false);

  const filteredProjects = publishedProjects.filter((p) => {
    if (activeFilter === 'ALL') return true;
    const cat = (p.category || '').toUpperCase();
    const type = p.projectType || '';
    
    if (activeFilter === 'DETAIL PAGE') {
      return cat.includes('DETAIL') || type === 'detail-page';
    }
    if (activeFilter === 'PRODUCT') {
      return cat.includes('PRODUCT') || cat.includes('제품') || type === 'product';
    }
    if (activeFilter === 'SNS CONTENT') {
      return cat.includes('SNS') || type === 'sns-content';
    }
    if (activeFilter === 'MAIN BANNER') {
      return cat.includes('BANNER') || type === 'main-banner';
    }
    if (activeFilter === 'VIDEO & MOTION') {
      return cat.includes('VIDEO') || cat.includes('MOTION') || type === 'video-motion';
    }
    return cat.includes(activeFilter);
  });

  const hasMoreThanLimit = filteredProjects.length > INITIAL_VISIBLE_COUNT;
  const displayedProjects = isExpanded || !hasMoreThanLimit
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_VISIBLE_COUNT);
  const remainingCount = filteredProjects.length - INITIAL_VISIBLE_COUNT;

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    // Keep expanded or reset if needed, resetting gives clean pagination feel
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      // Smooth scroll back to top of work section
      const workEl = document.getElementById('work');
      if (workEl) {
        workEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setIsExpanded(true);
    }
  };

  const getCategoryBadge = (project: Project) => {
    const cat = (project.category || '').toUpperCase();
    const type = project.projectType;

    if (cat.includes('DETAIL') || type === 'detail-page') {
      return {
        label: '상세페이지 · DETAIL PAGE',
        icon: Smartphone,
        colorClass: 'bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8]',
      };
    }
    if (cat.includes('PRODUCT') || cat.includes('제품') || type === 'product') {
      return {
        label: '제품 · PRODUCT',
        icon: Package,
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    }
    if (cat.includes('SNS') || type === 'sns-content') {
      return {
        label: 'SNS 콘텐츠 · SNS',
        icon: Instagram,
        colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (cat.includes('BANNER') || type === 'main-banner') {
      return {
        label: '배너 · BANNER',
        icon: Layout,
        colorClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      };
    }
    if (cat.includes('VIDEO') || cat.includes('MOTION') || type === 'video-motion') {
      return {
        label: '영상·모션 그래픽',
        icon: PlayCircle,
        colorClass: 'bg-pink-50 text-pink-700 border-pink-200',
      };
    }
    return {
      label: project.category,
      icon: Sparkles,
      colorClass: 'bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8]',
    };
  };

  return (
    <section id="work" className="py-24 sm:py-32 bg-white hairline-b relative overflow-hidden bg-grid-pattern scroll-mt-20">
      {/* Subtle ambient floating orbs */}
      <div className="absolute top-1/4 right-[-6%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-br from-[#EA580C]/10 via-[#DB2777]/10 to-transparent blur-3xl pointer-events-none animate-orb-2" />
      <div className="absolute bottom-1/4 left-[-8%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tr from-[#7C3AED]/10 via-[#DB2777]/8 to-transparent blur-3xl pointer-events-none animate-orb-1" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-slate-200">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#EC4899]">
              <span className="font-bold px-2.5 py-1 rounded-md bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] shadow-2xs">01</span>
              <span>/</span>
              <span className="font-bold tracking-wider">SELECTED WORKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0F172A] tracking-tight">
              선별된 프로젝트<span className="text-[#EC4899]">.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              상세페이지부터 SNS 카드뉴스, 쇼핑몰 메인 와이드 배너, 숏폼 모션 영상까지 매체의 특성과 고객의 반응에 최적화된 결과물들입니다.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeFilter === cat.id;
              const count = publishedProjects.filter((p) => {
                if (cat.id === 'ALL') return true;
                const pCat = (p.category || '').toUpperCase();
                const pType = p.projectType || '';
                if (cat.id === 'DETAIL PAGE') return pCat.includes('DETAIL') || pType === 'detail-page';
                if (cat.id === 'PRODUCT') return pCat.includes('PRODUCT') || pCat.includes('제품') || pType === 'product';
                if (cat.id === 'SNS CONTENT') return pCat.includes('SNS') || pType === 'sns-content';
                if (cat.id === 'MAIN BANNER') return pCat.includes('BANNER') || pType === 'main-banner';
                if (cat.id === 'VIDEO & MOTION') return pCat.includes('VIDEO') || pCat.includes('MOTION') || pType === 'video-motion';
                return pCat.includes(cat.id);
              }).length;

              return (
                <button
                  key={cat.id}
                  id={`filter-tab-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => handleFilterChange(cat.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 text-xs ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-md font-bold scale-[1.02]'
                      : 'bg-white text-slate-600 hover:text-[#EC4899] hover:bg-[#FDF2F8] border border-slate-200 shadow-2xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#EC4899]' : 'text-slate-400'}`} />
                  <span className="font-sans font-bold">{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Works Grid Container with natural height cards without artificial empty space */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-start">
            <AnimatePresence mode="popLayout">
              {displayedProjects.map((project, index) => {
                const badge = getCategoryBadge(project);
                const BadgeIcon = badge.icon;
                const isVideo = project.projectType === 'video-motion' || project.category.includes('VIDEO');
                const isBanner = project.projectType === 'main-banner' || project.category.includes('BANNER');
                const isSns = project.projectType === 'sns-content' || project.category.includes('SNS');

                return (
                  <motion.article
                    key={project.id}
                    id={`project-card-${project.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: index >= INITIAL_VISIBLE_COUNT ? (index - INITIAL_VISIBLE_COUNT) * 0.08 : index * 0.05 }}
                    onClick={() => onSelectProject(project)}
                    className="group cursor-pointer flex flex-col"
                  >
                    {/* Image / Media Container with rich visual cues */}
                    <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200 hover:border-[#EC4899] luxury-card-shadow transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1.5 shrink-0">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85';
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106 opacity-95 group-hover:opacity-100"
                      />

                      {/* Dynamic Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-transparent to-black/20 pointer-events-none" />

                      {/* Top Corner Project Number */}
                      <div className="absolute top-4 left-4 bg-[#0F172A]/90 backdrop-blur-md text-white font-mono text-xs px-3.5 py-1.5 rounded-lg border border-white/20 font-bold shadow-md">
                        {project.number}
                      </div>

                      {/* Video Play Badge or Multi-slide Badge indicator */}
                      {isVideo && (
                        <div className="absolute top-4 right-4 bg-[#0F172A]/90 backdrop-blur-md text-white font-mono text-[11px] px-3 py-1.5 rounded-lg border border-pink-400/40 font-bold shadow-md flex items-center gap-1.5 animate-pulse">
                          <PlayCircle className="w-3.5 h-3.5 text-[#EC4899]" />
                          <span>{project.videoVariations && project.videoVariations.length > 1 ? `${project.videoVariations.length}-SIZES MULTI VIDEO` : 'MOTION & VIDEO'}</span>
                        </div>
                      )}

                      {isSns && (
                        <div className="absolute top-4 right-4 bg-[#0F172A]/90 backdrop-blur-md text-white font-mono text-[11px] px-3 py-1.5 rounded-lg border border-rose-400/40 font-bold shadow-md flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-rose-400" />
                          <span>5 SLIDES CAROUSEL</span>
                        </div>
                      )}

                      {isBanner && (
                        <div className="absolute top-4 right-4 bg-[#0F172A]/90 backdrop-blur-md text-white font-mono text-[11px] px-3 py-1.5 rounded-lg border border-fuchsia-400/40 font-bold shadow-md flex items-center gap-1.5">
                          <Layout className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>1920x600 WIDE BANNER</span>
                        </div>
                      )}

                      {!isVideo && !isSns && !isBanner && (
                        <div className="absolute top-4 right-4 bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8] backdrop-blur-md font-mono text-[11px] px-3 py-1.5 rounded-lg border font-bold shadow-sm hidden sm:flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#EC4899]" />
                          <span>DETAIL PAGE</span>
                        </div>
                      )}

                      {/* Hover overlay hint */}
                      <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2.5 bg-white text-[#0F172A] font-bold text-xs px-6 py-3 rounded-full shadow-2xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 border border-slate-200">
                          <span>VIEW PROJECT STORY & PREVIEW</span>
                          <ArrowUpRight className="w-4 h-4 text-[#EC4899]" />
                        </span>
                      </div>
                    </div>

                    {/* Card Meta Content with natural content-fitting height */}
                    <div className="mt-5 space-y-3 px-1">
                      {/* Category & Badge */}
                      <div className="flex items-center justify-between text-xs">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${badge.colorClass}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </div>
                        <span className="text-slate-400 font-mono font-medium">{project.period}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#EC4899] transition-colors flex items-center justify-between">
                        <span>{project.title}</span>
                        <div className="p-2 rounded-full bg-white group-hover:bg-[#FDF2F8] transition-colors border border-slate-200 shadow-2xs shrink-0 ml-2">
                          <ArrowUpRight className="w-4 h-4 text-[#EC4899] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </h3>

                      {/* Summary */}
                      {project.summary && (
                        <p className="text-sm text-[#475569] leading-relaxed line-clamp-2 font-normal">
                          {project.summary}
                        </p>
                      )}

                      {/* Tags */}
                      {(project.tags || []).length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-mono font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Link tightly placed after tags/summary without forced spacing */}
                      <div className="pt-3.5 mt-3 flex items-center gap-2 text-xs font-bold tracking-wider text-[#0F172A] group-hover:text-[#EC4899] transition-colors border-t border-slate-100">
                        <span>상세 기획 및 작업물 확인하기</span>
                        <span className="font-mono text-[#EC4899] text-sm">→</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Fade Gradient Overlay when not expanded and more items exist */}
          {!isExpanded && hasMoreThanLimit && (
            <div className="absolute -bottom-6 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10" />
          )}
        </div>

        {/* Expand / Collapse Action Area with 3-color gradient styling */}
        {hasMoreThanLimit && (
          <div className="relative z-20 flex flex-col items-center justify-center pt-4 sm:pt-6">
            <button
              id="toggle-all-works-btn"
              onClick={toggleExpand}
              className="group relative inline-flex items-center gap-3.5 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full text-white font-extrabold text-sm sm:text-base tracking-wide bg-gradient-to-r from-[#EA580C] via-[#EC4899] to-[#7C3AED] hover:opacity-95 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-white/30"
            >
              <span>
                {isExpanded
                  ? '작업물 접기 (COLLAPSE WORKS)'
                  : `전체 작업물 더보기 (+${remainingCount}개 더보기)`}
              </span>
              <div className="p-1 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white group-hover:-translate-y-0.5 transition-transform" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
                )}
              </div>
            </button>

            {/* Subtitle helper text */}
            <p className="mt-3 text-xs font-mono text-slate-500 font-medium">
              {isExpanded
                ? `전체 ${filteredProjects.length}개의 프로젝트를 모두 표시 중입니다.`
                : `현재 6개 표시 중 · 전체 ${filteredProjects.length}개의 상세페이지, 배너, SNS, 영상 포트폴리오`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
