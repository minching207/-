import React from 'react';
import { ArrowDown, Sparkles, Eye, Compass, Layers, Play, CheckCircle2, Lightbulb, ShoppingBag, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteContent, Project } from '../types';
import { DynamicHeroBackground } from './DynamicHeroBackground';

interface HeroProps {
  content: SiteContent;
  onSelectProject: (project: Project) => void;
}

export const Hero: React.FC<HeroProps> = ({ content, onSelectProject }) => {
  const publishedProjects = (content.projects || []).filter((p) => p.isPublished !== false);
  const featuredProject = publishedProjects.find((p) => p.featuredInHero) || publishedProjects[0] || (content.projects && content.projects[0]);

  const featuredIndex = featuredProject ? Math.max(0, publishedProjects.findIndex((p) => p.id === featuredProject.id)) : 0;
  const currentNumStr = String(featuredIndex + 1).padStart(2, '0');
  const totalCountStr = String(publishedProjects.length).padStart(2, '0');

  const getTagBadgeStyle = (tag: string, index: number) => {
    const lower = tag.toLowerCase();
    if (lower.includes('상세페이지') || lower.includes('detail')) {
      return {
        bg: 'bg-[#FDF2F8]',
        text: 'text-[#DB2777]',
        border: 'border-[#FBCFE8]',
        dot: 'bg-[#EC4899]'
      };
    }
    if (lower.includes('제품') || lower.includes('product')) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    }
    if (lower.includes('sns') || lower.includes('콘텐츠') || lower.includes('카드뉴스') || lower.includes('content')) {
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    }
    if (lower.includes('배너') || lower.includes('banner')) {
      return {
        bg: 'bg-fuchsia-50',
        text: 'text-fuchsia-700',
        border: 'border-fuchsia-200',
        dot: 'bg-fuchsia-500'
      };
    }
    if (lower.includes('영상') || lower.includes('모션') || lower.includes('video') || lower.includes('motion')) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500'
      };
    }
    const fallbacks = [
      { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
      { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
      { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-500' },
      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    ];
    return fallbacks[index % fallbacks.length];
  };

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] pt-32 pb-14 flex flex-col justify-between overflow-hidden bg-white bg-grid-pattern"
    >
      {/* Rich Dynamic Animated Background System (Morphing Auroras, SVG Wave Ribbons & Shimmer Light Beams) */}
      <DynamicHeroBackground />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-grow">
        {/* Left Column: Editorial Typography & Positioning */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-7 z-10">
          {/* Dynamic Category Badges - ALL in Distinct Harmonious Colors */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-wider"
          >
            {content.hero.tags.map((tag, idx) => {
              const style = getTagBadgeStyle(tag, idx);
              return (
                <span
                  key={idx}
                  className={`px-3.5 py-1.5 rounded-xl ${style.bg} ${style.text} border ${style.border} font-bold shadow-2xs flex items-center gap-1.5 transition-all duration-300 hover:scale-105`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></span>
                  <span>{tag}</span>
                </span>
              );
            })}
          </motion.div>

          {/* Main Headline with Selective Gradient Focal Point */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#0F172A] leading-[1.15] tracking-[-0.035em]">
              <span className="block">{content.hero.mainCopyLine1}</span>
              <span className="block bg-gradient-to-r from-[#EA580C] via-[#DB2777] to-[#7C3AED] bg-clip-text text-transparent font-extrabold">
                {content.hero.mainCopyLine2}
              </span>
            </h1>
          </motion.div>

          {/* Sub Copy with strong legibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-[#334155] leading-[1.7] font-normal max-w-xl space-y-1.5"
          >
            <p className="font-semibold text-[#0F172A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EC4899]"></span>
              {content.hero.subCopyLine1}
            </p>
            <p className="text-[#64748B] pl-4 border-l-2 border-[#EC4899]/40">{content.hero.subCopyLine2}</p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2 flex flex-wrap items-center gap-4 sm:gap-5"
          >
            <a
              id="hero-cta-btn"
              href="#work"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#EA580C] via-[#DB2777] to-[#7C3AED] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]"
            >
              <span>{content.hero.ctaText}</span>
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
            </a>

            <a
              href="#approach"
              className="inline-flex items-center gap-2.5 text-xs font-mono font-bold tracking-wider text-[#334155] hover:text-[#EC4899] px-5 py-4 rounded-xl bg-white hover:bg-[#FDF2F8] transition-all border border-slate-200 hover:border-[#EC4899] shadow-2xs hover:shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#EC4899]" />
              <span>DESIGN APPROACH →</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Dynamic Showcase Visual Composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative flex justify-center items-center"
        >
          {/* Main Visual Board Frame */}
          <div
            id="hero-featured-showcase"
            onClick={() => featuredProject && onSelectProject(featuredProject)}
            className="group relative w-full cursor-pointer rounded-3xl bg-white p-5 sm:p-7 border-2 border-slate-200 hover:border-[#EC4899] luxury-card-shadow transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5"
          >
            {/* Top metadata strip */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EC4899]"></span>
                </span>
                <span className="font-bold text-[#EC4899] tracking-wider">FEATURED PROJECT</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-500">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">2026 RELEASE</span>
              </div>
            </div>

            {/* Main Featured Project Showcase Image Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] sm:aspect-[16/9] border border-slate-100">
              <img
                src={featuredProject?.coverImage || 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1200&q=85'}
                alt={featuredProject?.title || 'Featured Work'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85';
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/25 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-[#EC4899] text-white font-bold">
                    {featuredProject?.category}
                  </span>
                  {featuredProject?.client && (
                    <span className="text-[10px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {featuredProject.client}
                    </span>
                  )}
                </div>
                <p className="text-base sm:text-xl font-bold leading-snug tracking-tight group-hover:text-[#FBCFE8] transition-colors">
                  {featuredProject?.title}
                </p>
                {featuredProject?.summary && (
                  <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-normal max-w-xl">
                    {featuredProject.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Hover Floating Prompt */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#EC4899] transition-colors">
                <Eye className="w-4 h-4 text-[#EC4899] group-hover:scale-110 transition-transform" />
                클릭하여 디자인 스토리 확인
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDF2F8] text-[#DB2777] font-bold border border-[#FBCFE8]">
                PROJECT {currentNumStr} / {totalCountStr}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sleek Compact Highlights Ribbon: 기획 가능, 스마트스토어/오픈마켓 운영, 인하우스 마케팅 & 틱톡 광고 경험 */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-10 pb-2 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="rounded-2xl bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5 p-4 sm:p-5 border border-pink-200/80 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-pink-100/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EC4899]" />
              <span className="text-xs font-mono font-bold tracking-wider text-[#0F172A]">
                CORE CAPABILITIES & PRACTICAL EXPERIENCE
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#DB2777] bg-[#FDF2F8] px-2.5 py-0.5 rounded-full border border-[#FBCFE8] font-bold w-fit">
              100% 자체 기획 · 실무 운영 · 마케팅 광고 집행
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Highlight 1: 100% 기획 가능 */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/90 flex items-start gap-3 shadow-2xs hover:border-pink-300 transition-colors">
              <div className="p-2 rounded-lg bg-pink-50 text-[#DB2777] shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span>전 작업물 100% 직접 기획</span>
                  <span className="text-[10px] text-[#DB2777] font-mono font-bold bg-pink-50 px-1.5 py-0.2 rounded">기획+디자인</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  단순 툴 작업을 넘어 시장·타깃 분석부터 셀링 훅 카피라이팅까지 직접 기획하고 시각화합니다.
                </p>
              </div>
            </div>

            {/* Highlight 2: 스마트스토어 & 오픈마켓 운영 */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/90 flex items-start gap-3 shadow-2xs hover:border-orange-300 transition-colors">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span>스마트스토어·오픈마켓 운영 경험</span>
                  <span className="text-[10px] text-orange-600 font-mono font-bold bg-orange-50 px-1.5 py-0.2 rounded">이커머스 셀러</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  직접 스토어를 운영해본 경험으로 상품 등록, 옵션 구성, 유입-구매전환 구조를 정확히 이해합니다.
                </p>
              </div>
            </div>

            {/* Highlight 3: 인하우스 마케팅사 & 틱톡 광고 운영 */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-slate-200/90 flex items-start gap-3 shadow-2xs hover:border-purple-300 transition-colors">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span>인하우스 마케팅사 & 틱톡 광고 운영</span>
                  <span className="text-[10px] text-purple-600 font-mono font-bold bg-purple-50 px-1.5 py-0.2 rounded">퍼포먼스 ROAS</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  마케팅사 실무 및 숏폼 릴스·틱톡 광고 운영 경험을 기반으로 클릭률과 전환을 높이는 비주얼을 만듭니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Editorial Accent Line */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full pt-4">
        <div className="flex items-center justify-center text-xs font-mono text-slate-500 pt-3 border-t border-slate-200">
          <a
            href="#work"
            className="group hover:text-[#EC4899] transition-colors flex items-center gap-2 font-bold px-4 py-2 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 shadow-2xs"
          >
            <span>SCROLL DOWN TO PROJECTS</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#EC4899] animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};


