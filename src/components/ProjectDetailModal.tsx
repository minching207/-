import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ZoomIn, 
  Smartphone, 
  Monitor, 
  Instagram, 
  Layout, 
  PlayCircle, 
  Pause, 
  Play, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Square,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  EyeOff,
  Minimize2,
  Scan
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, VideoVariation } from '../types';
import { isVideoMedia } from './MediaFileUpload';

interface ProjectDetailModalProps {
  project: Project | null;
  allProjects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

interface SectionSlideViewerProps {
  images: string[];
  title: string;
  onZoom: (url: string) => void;
  compact?: boolean;
}

const SectionSlideViewer: React.FC<SectionSlideViewerProps> = ({
  images,
  title,
  onZoom,
  compact = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentImage = images[currentIndex] || images[0];

  if (compact) {
    // Compact mobile slider for inside mobile device simulator (100% width of device screen)
    return (
      <div className="relative w-full bg-slate-950 flex flex-col overflow-hidden">
        {/* Mobile slide header */}
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 text-white text-[10px] font-mono border-b border-slate-800 shrink-0">
          <span className="font-bold text-pink-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] animate-pulse" />
            <span>SLIDE {currentIndex + 1} / {images.length}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              aria-label="이전 슬라이드"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white active:scale-95 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="다음 슬라이드"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white active:scale-95 transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mobile slide image - Full Width 100% */}
        <div 
          className="relative w-full bg-white flex items-center justify-center overflow-hidden cursor-zoom-in group/mobslide"
          onClick={() => onZoom(currentImage)}
        >
          <img
            key={currentIndex}
            src={currentImage}
            alt={`${title} - slide ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            className="w-full h-auto block select-none"
          />

          {/* Quick Tap Navigation Side Arrows */}
          <button
            onClick={prevSlide}
            aria-label="이전 슬라이드"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 shadow-lg active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="다음 슬라이드"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 shadow-lg active:scale-90 transition-transform"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile pagination dots */}
        <div className="py-2 bg-slate-900 flex items-center justify-center gap-1.5 shrink-0 border-t border-slate-800">
          {images.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-1.5 rounded-full transition-all ${
                dotIdx === currentIndex ? 'w-5 bg-[#EC4899]' : 'w-1.5 bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 luxury-card-shadow flex flex-col">
      {/* Top Slide Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
          <span className="font-bold text-slate-200">SLIDE CAROUSEL</span>
          <span className="text-[#EC4899] font-bold">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">
            {String(images.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              aria-label="이전 슬라이드"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 active:scale-95 flex items-center gap-1 text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">이전</span>
            </button>
            <button
              onClick={nextSlide}
              aria-label="다음 슬라이드"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 active:scale-95 flex items-center gap-1 text-xs font-mono"
            >
              <span className="hidden sm:inline">다음</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onZoom(currentImage)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EC4899] hover:bg-[#DB2777] text-white text-xs font-bold transition-all shadow-sm active:scale-95 ml-1"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>확대보기</span>
          </button>
        </div>
      </div>

      {/* Main Slide Image Display */}
      <div
        className="relative bg-slate-950 flex items-center justify-center min-h-[360px] max-h-[720px] overflow-hidden cursor-zoom-in group/slide"
        onClick={() => onZoom(currentImage)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`${title} - slide ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full h-auto max-h-[720px] object-contain block mx-auto select-none"
          />
        </AnimatePresence>

        {/* Floating Side Arrow Buttons on Hover */}
        <button
          onClick={prevSlide}
          aria-label="이전 슬라이드"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-all border border-white/20 shadow-xl hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="다음 슬라이드"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-all border border-white/20 shadow-xl hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Floating zoom indicator hint */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono px-3 py-1 rounded-md opacity-0 group-hover/slide:opacity-100 transition-opacity border border-white/20 pointer-events-none">
          CLICK TO EXPAND
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2.5 overflow-x-auto">
        {images.map((img, tIdx) => (
          <button
            key={tIdx}
            onClick={() => setCurrentIndex(tIdx)}
            className={`relative rounded-lg overflow-hidden transition-all shrink-0 ${
              tIdx === currentIndex
                ? 'ring-2 ring-[#EC4899] scale-105 shadow-md opacity-100'
                : 'opacity-50 hover:opacity-85 border border-slate-700'
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${tIdx + 1}`}
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[10px] font-mono text-center text-white py-0.5 font-bold">
              0{tIdx + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  allProjects,
  onClose,
  onSelectProject,
}) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // SNS Carousel state
  const [activeSnsSlide, setActiveSnsSlide] = useState<number>(0);
  
  // Banner simulator tab
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  
  // Video player state & variations
  const [activeVideoVarIndex, setActiveVideoVarIndex] = useState<number>(0);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [showReelsOverlay, setShowReelsOverlay] = useState<boolean>(true);
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover'>('contain');

  if (!project) return null;

  const isSns = (project.projectType === 'sns-content' || project.category.toUpperCase().includes('SNS')) && Boolean(project.snsSlides && project.snsSlides.length > 0);
  const isBanner = (project.projectType === 'main-banner' || project.category.toUpperCase().includes('BANNER')) && Boolean(project.bannerVariations && project.bannerVariations.length > 0);
  const isVideo = (project.projectType === 'video-motion' || project.category.toUpperCase().includes('VIDEO')) && Boolean(project.videoUrl || project.videoKeyframes || (project.videoVariations && project.videoVariations.length > 0));

  // Find previous and next project for navigation
  const navProjects = allProjects.filter((p) => p.isPublished !== false || p.id === project.id);
  const currentIndex = navProjects.findIndex((p) => p.id === project.id);
  const prevProject = navProjects[(currentIndex - 1 + navProjects.length) % navProjects.length];
  const nextProject = navProjects[(currentIndex + 1) % navProjects.length];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 lg:p-8">
        {/* Modal Backdrop click to close */}
        <div 
          className="fixed inset-0" 
          onClick={onClose} 
          aria-hidden="true" 
        />

        {/* Modal Window */}
        <motion.div
          id="project-detail-modal-window"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl h-[94vh] sm:h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 z-10"
        >
          {/* Sticky Top Header Bar */}
          <div className="shrink-0 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-slate-200 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#EC4899] px-2.5 py-1 rounded-md bg-[#FDF2F8] border border-[#FBCFE8]">
                PROJECT {project.number}
              </span>
              <span className="text-xs uppercase font-mono text-slate-500 hidden sm:inline tracking-wider font-bold">
                {project.category}
              </span>
            </div>

            {/* View Mode Toggle & Close */}
            <div className="flex items-center gap-3">
              {!isSns && !isBanner && !isVideo && (
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg text-xs font-mono border border-slate-200">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      viewMode === 'desktop'
                        ? 'bg-[#0F172A] text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="에디토리얼 전체보기"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>EDITORIAL</span>
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      viewMode === 'mobile'
                        ? 'bg-[#EC4899] text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-[#EC4899]'
                    }`}
                    title="모바일 상세페이지 뷰"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>MOBILE VIEW</span>
                  </button>
                </div>
              )}

              <button
                id="close-project-modal-btn"
                onClick={onClose}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-[#FDF2F8] text-slate-600 hover:text-[#EC4899] transition-colors border border-slate-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-12 lg:p-14 space-y-16">
            {/* Title & Header Section */}
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] text-[#DB2777] text-xs font-mono border border-[#FBCFE8] font-bold">
                {isSns && <Instagram className="w-3.5 h-3.5 text-rose-500" />}
                {isBanner && <Layout className="w-3.5 h-3.5 text-fuchsia-500" />}
                {isVideo && <PlayCircle className="w-3.5 h-3.5 text-pink-500" />}
                {!isSns && !isBanner && !isVideo && <Smartphone className="w-3.5 h-3.5 text-[#EC4899]" />}
                <span>{project.category}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0F172A] tracking-tight leading-snug">
                {project.title}
              </h1>
              <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
                {project.summary}
              </p>
            </div>

            {/* PROJECT INFO GRID */}
            <div className="rounded-2xl bg-[#F8FAFC] p-6 sm:p-8 border border-slate-200 luxury-card-shadow">
              <div className="text-[11px] font-mono font-bold tracking-widest text-[#EC4899] uppercase mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>PROJECT INFO</span>
                <span className="text-[10px] text-slate-400 font-normal">SPECIFICATIONS</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs sm:text-sm">
                <div>
                  <span className="block font-mono text-[11px] text-slate-400 mb-1 font-bold">Project Category</span>
                  <span className="font-semibold text-slate-800">{project.category}</span>
                </div>
                <div>
                  <span className="block font-mono text-[11px] text-slate-400 mb-1 font-bold">Role</span>
                  <span className="font-semibold text-[#EC4899]">{project.role}</span>
                </div>
                <div>
                  <span className="block font-mono text-[11px] text-slate-400 mb-1 font-bold">Period</span>
                  <span className="font-semibold text-slate-800">{project.period}</span>
                </div>
                <div>
                  <span className="block font-mono text-[11px] text-slate-400 mb-1 font-bold">Tools</span>
                  <span className="font-semibold text-slate-800">{project.tools}</span>
                </div>
              </div>
            </div>

            {/* 01. BACKGROUND & CHALLENGE */}
            <div className="space-y-6 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 luxury-card-shadow">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EC4899]">
                <span className="font-bold px-2 py-0.5 rounded bg-[#FDF2F8] border border-[#FBCFE8]">01</span>
                <span className="font-bold">BACKGROUND & DESIGN STRATEGY</span>
              </div>
              <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
                {project.background}
              </p>

              {/* Key Design Focus Points (For Detail Page / Non-Video Projects) */}
              {!isVideo && project.designFocus && project.designFocus.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-mono font-bold text-slate-500 block tracking-wider">
                    KEY DESIGN FOCUS POINTS
                  </span>

                  {project.designFocus.length === 1 ? (
                    /* Single Focus Point - Expansive Horizontal Banner Layout */
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#FDF2F8]/80 via-slate-50 to-white border border-[#FBCFE8]/90 luxury-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                      <div className="flex items-center gap-3.5 shrink-0 sm:border-r sm:border-pink-200/80 sm:pr-6">
                        <div className="w-9 h-9 rounded-xl bg-pink-100/90 text-[#EC4899] flex items-center justify-center font-mono font-extrabold text-xs shrink-0 border border-pink-200">
                          01
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-pink-600 font-bold uppercase tracking-wider block">
                            CORE DESIGN STRATEGY
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-[#0F172A] font-mono">
                            {project.designFocus[0].title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1 font-sans">
                        {project.designFocus[0].description}
                      </p>
                    </div>
                  ) : (
                    /* Multi Focus Points - Balanced Responsive Grid */
                    <div className={`grid gap-3.5 ${
                      project.designFocus.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {project.designFocus.map((df, dfIdx) => (
                        <div key={df.id || dfIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 flex flex-col justify-between">
                          <div className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                            <span>{df.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pt-1">
                            {df.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 02. SPECIALIZED INTERACTIVE SHOWCASE BY PROJECT TYPE */}

            {/* --- CASE A: SNS CONTENT / CARD NEWS SWIPE SIMULATOR --- */}
            {isSns && project.snsSlides && project.snsSlides.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EC4899]">
                    <span className="font-bold px-2 py-0.5 rounded bg-[#FDF2F8] border border-[#FBCFE8]">02</span>
                    <span className="font-bold">INSTAGRAM CARD NEWS INTERACTIVE CAROUSEL</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-bold">
                    {project.snsSlides.length} SLIDES PACK
                  </span>
                </div>

                {/* Instagram Mockup Frame */}
                <div className="flex flex-col items-center justify-center py-8 bg-[#F8FAFC] rounded-3xl border border-slate-200 p-4 sm:p-8 overflow-hidden">
                  <div className="w-full max-w-[440px] bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col [transform:translateZ(0)] isolate">
                    {/* Instagram Post Header */}
                    <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#EC4899] to-[#7C3AED] p-0.5">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-800">
                            KM
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">aube.botanical_official</span>
                          <span className="text-[10px] text-slate-400">Sponsored · Clean Beauty Routine</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                        {activeSnsSlide + 1} / {project.snsSlides.length}
                      </span>
                    </div>

                    {/* Active Slide Image Container */}
                    <div className="relative aspect-square bg-slate-900 overflow-hidden">
                      <img
                        src={project.snsSlides[activeSnsSlide].imageUrl}
                        alt={project.snsSlides[activeSnsSlide].title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />

                      {/* Previous Slide Button */}
                      {activeSnsSlide > 0 && (
                        <button
                          onClick={() => setActiveSnsSlide((prev) => Math.max(0, prev - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-lg"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}

                      {/* Next Slide Button */}
                      {activeSnsSlide < project.snsSlides.length - 1 && (
                        <button
                          onClick={() => setActiveSnsSlide((prev) => Math.min(project.snsSlides!.length - 1, prev + 1))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-lg"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      {/* Zoom Trigger Button */}
                      <button
                        onClick={() => setZoomImage(project.snsSlides![activeSnsSlide].imageUrl)}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors text-xs flex items-center gap-1"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Instagram Post Action & Indicators */}
                    <div className="p-4 space-y-3 bg-white">
                      {/* Dots indicators */}
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {project.snsSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSnsSlide(idx)}
                            className={`h-2 rounded-full transition-all ${
                              activeSnsSlide === idx ? 'w-6 bg-[#EC4899]' : 'w-2 bg-slate-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Slide Title & Caption */}
                      <div className="space-y-1 border-t border-slate-100 pt-3">
                        <h4 className="text-xs font-bold text-[#0F172A]">
                          {project.snsSlides[activeSnsSlide].title}
                        </h4>
                        {project.snsSlides[activeSnsSlide].caption && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {project.snsSlides[activeSnsSlide].caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="mt-6 flex items-center gap-2 overflow-x-auto max-w-full pb-2">
                    {project.snsSlides.map((slide, idx) => (
                      <button
                        key={slide.id || idx}
                        onClick={() => setActiveSnsSlide(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          activeSnsSlide === idx ? 'border-[#EC4899] ring-2 ring-pink-200 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- CASE B: SHOPPING MALL MAIN HERO BANNER SIMULATOR --- */}
            {isBanner && project.bannerVariations && project.bannerVariations.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EC4899]">
                    <span className="font-bold px-2 py-0.5 rounded bg-[#FDF2F8] border border-[#FBCFE8]">02</span>
                    <span className="font-bold">E-COMMERCE BANNER VARIATIONS</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-bold">
                    {project.bannerVariations.length} RESOLUTION PACKS
                  </span>
                </div>

                {/* Banner Resolution Selector Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  {project.bannerVariations.map((banner, idx) => (
                    <button
                      key={banner.id || idx}
                      onClick={() => setActiveBannerIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        activeBannerIndex === idx
                          ? 'bg-[#0F172A] text-white shadow-md'
                          : 'bg-[#F8FAFC] text-slate-600 hover:text-[#EC4899] border border-slate-200'
                      }`}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      <span>{banner.label}</span>
                      <span className="text-[10px] font-mono text-pink-400">({banner.dimension})</span>
                    </button>
                  ))}
                </div>

                {/* Simulated Web Mall Hero Viewport Container */}
                <div className="rounded-3xl bg-slate-900 p-4 sm:p-8 shadow-2xl border-2 border-slate-800 space-y-4">
                  {/* Browser Chrome Simulation Header */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="ml-2 text-slate-300 hidden sm:inline">https://brand-mall.com/main</span>
                    </div>
                    <div className="text-[11px] font-bold text-pink-400">
                      {project.bannerVariations[activeBannerIndex].dimension}
                    </div>
                  </div>

                  {/* Banner Display with Zoom */}
                  <div 
                    onClick={() => setZoomImage(project.bannerVariations![activeBannerIndex].imageUrl)}
                    className="relative rounded-2xl overflow-hidden bg-slate-950 cursor-zoom-in group border border-slate-700"
                  >
                    <img
                      src={project.bannerVariations[activeBannerIndex].imageUrl}
                      alt={project.bannerVariations[activeBannerIndex].label}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-mono px-3.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#EC4899]" />
                      <span>CLICK TO ZOOM BANNER</span>
                    </div>
                  </div>

                  {/* Banner Description Note */}
                  {project.bannerVariations[activeBannerIndex].description && (
                    <div className="p-4 rounded-xl bg-slate-800/80 text-slate-300 text-xs sm:text-sm leading-relaxed border border-slate-700">
                      <strong className="text-white block mb-1">기획 의도 및 배치 가이드</strong>
                      {project.bannerVariations[activeBannerIndex].description}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- CASE C: MULTI-SIZE VIDEO & MOTION GRAPHICS SHOWCASE --- */}
            {isVideo && (() => {
              // Prepare variations array: if project.videoVariations is supplied, use it; otherwise fallback to default single variation
              const rawVariations = (project.videoVariations && project.videoVariations.length > 0)
                ? project.videoVariations
                : [
                    {
                      id: 'default-var',
                      type: project.aspectRatio || '9:16',
                      label: (project.aspectRatio === '16:9') ? 'PC 와이드 버전 (16:9)' : (project.aspectRatio === '1:1') ? '정사각형 타입 (1:1)' : '모바일 숏폼 버전 (9:16)',
                      dimension: (project.aspectRatio === '16:9') ? '1920 x 1080 px (16:9)' : (project.aspectRatio === '1:1') ? '1080 x 1080 px (1:1)' : '1080 x 1920 px (9:16)',
                      videoUrl: project.videoUrl,
                      coverImage: project.coverImage,
                      description: project.summary
                    }
                  ];

              const variations: VideoVariation[] = rawVariations.filter(Boolean);
              const safeVarIndex = (activeVideoVarIndex >= 0 && activeVideoVarIndex < variations.length) ? activeVideoVarIndex : 0;
              const currentVar = variations[safeVarIndex] || variations[0];
              const isShortform = currentVar.type === '9:16' || (!currentVar.type.includes('16:9') && !currentVar.type.includes('1:1'));
              const isPcWide = currentVar.type === '16:9';
              const isSquare = currentVar.type === '1:1';
              const hasMultiSizes = variations.length > 1;

              // Only display Storyboard Keyframes if explicitly provided and not empty
              const validKeyframes = (project.videoKeyframes || []).filter(
                (frame) => (frame.title && frame.title.trim().length > 0) || (frame.description && frame.description.trim().length > 0)
              );
              const hasKeyframes = validKeyframes.length > 0;

              return (
                <div className="space-y-8">
                  {/* Section Title Bar with Format Switcher / Tag */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EC4899]">
                      <span className="font-bold px-2 py-0.5 rounded bg-[#FDF2F8] border border-[#FBCFE8]">02</span>
                      <span className="font-bold">VIDEO & MOTION GRAPHICS SHOWCASE</span>
                    </div>
                    
                    {/* Multi-Size Mode Indicator Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-bold border border-slate-200">
                        {hasMultiSizes ? `${variations.length}가지 멀티 사이즈 지원 (${variations.length} FORMATS)` : `단독 포맷 (${currentVar.label})`}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Size Selection Tabs (if multi sizes exist) */}
                  {hasMultiSizes && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-500 font-bold">
                          확인할 영상 사이즈를 선택하세요:
                        </span>
                        <span className="text-[11px] font-mono text-pink-600 font-semibold">
                          {currentVar.dimension}
                        </span>
                      </div>
                      <div className={`grid gap-2.5 ${
                        variations.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : variations.length === 3
                          ? 'grid-cols-1 sm:grid-cols-3'
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                      }`}>
                        {variations.map((v, idx) => {
                          const isSelected = safeVarIndex === idx;
                          const IconComp = v.type === '16:9' ? Monitor : v.type === '1:1' ? Square : Smartphone;
                          return (
                            <button
                              key={v.id || idx}
                              type="button"
                              onClick={() => setActiveVideoVarIndex(idx)}
                              className={`p-3 rounded-2xl text-left border transition-all duration-300 flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg scale-[1.01]'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-pink-300 hover:bg-[#FDF2F8]/50'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/15 text-pink-400' : 'bg-slate-100 text-slate-600'}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold truncate">{v.label}</div>
                                <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {v.dimension}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Variation Description Note */}
                  {currentVar.description && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#EC4899] shrink-0" />
                      <span><strong className="text-slate-800 font-bold">{currentVar.label}:</strong> {currentVar.description}</span>
                    </div>
                  )}

                  {/* Video Player Display Area (Adapted to selected aspect ratio) */}
                  <div className="bg-[#F8FAFC] p-6 sm:p-10 rounded-3xl border border-slate-200">
                    {/* CASE 1: 9:16 Mobile Shortform Smartphone Mockup */}
                    {isShortform && (
                      <div className={`flex flex-col ${hasKeyframes ? 'lg:flex-row gap-8' : 'gap-6'} items-center justify-center`}>
                        {/* Smartphone outer shell with authentic phone curves */}
                        <div className="w-[290px] sm:w-[325px] md:w-[340px] bg-slate-900 rounded-[46px] sm:rounded-[52px] p-2.5 sm:p-3 shadow-2xl border-[3px] border-slate-700/80 flex-shrink-0 flex flex-col relative overflow-hidden [transform:translateZ(0)] isolate">
                          {/* Top Speaker notch / Dynamic Island bar */}
                          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center pointer-events-none">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 mr-2" />
                            <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
                          </div>

                          {/* Inner Screen with True 9:16 Aspect Ratio (1080 x 1920) */}
                          <div className="w-full aspect-[9/16] bg-black rounded-[36px] sm:rounded-[42px] overflow-hidden relative flex flex-col justify-between [transform:translateZ(0)] isolate select-none">
                            {/* Top status bar */}
                            {showReelsOverlay && (
                              <div className="z-10 px-5 pt-3.5 pb-2 flex items-center justify-between text-[10px] text-white font-mono bg-gradient-to-b from-black/75 to-transparent shrink-0">
                                <span>09:41</span>
                                <span className="text-pink-400 font-bold flex items-center gap-1">
                                  <Smartphone className="w-3 h-3" />
                                  <span>REELS / 9:16</span>
                                </span>
                              </div>
                            )}

                            {/* Video Player / Media - 100% 9:16 Frame without left/right clipping */}
                            <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
                              {currentVar.videoUrl || project.videoUrl ? (
                                <video
                                  src={currentVar.videoUrl || project.videoUrl}
                                  autoPlay
                                  loop
                                  muted={isVideoMuted}
                                  playsInline
                                  className={`w-full h-full ${videoFitMode === 'contain' ? 'object-contain' : 'object-cover'} bg-black`}
                                />
                              ) : (
                                <img
                                  src={currentVar.coverImage || project.coverImage}
                                  alt={project.title}
                                  referrerPolicy="no-referrer"
                                  className={`w-full h-full ${videoFitMode === 'contain' ? 'object-contain' : 'object-cover'} bg-black`}
                                />
                              )}
                              {showReelsOverlay && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />
                              )}
                            </div>

                            {/* Floating Mockup Control Buttons */}
                            <div className="absolute top-12 right-3 z-20 flex flex-col gap-1.5">
                              {/* Sound toggle button */}
                              <button
                                type="button"
                                onClick={() => setIsVideoMuted(!isVideoMuted)}
                                className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm border border-white/10 hover:scale-105 shadow-md"
                                title={isVideoMuted ? "소리 켜기" : "소리 끄기"}
                              >
                                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-300" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
                              </button>

                              {/* Lightbox full-size video expansion */}
                              <button
                                type="button"
                                onClick={() => setZoomImage(currentVar.videoUrl || project.videoUrl || currentVar.coverImage || project.coverImage || null)}
                                className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm border border-white/10 hover:scale-105 shadow-md"
                                title="전체화면 확대 보기"
                              >
                                <Maximize2 className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
                              </button>

                              {/* Reels UI Overlay toggle */}
                              <button
                                type="button"
                                onClick={() => setShowReelsOverlay(!showReelsOverlay)}
                                className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm border border-white/10 hover:scale-105 shadow-md"
                                title={showReelsOverlay ? "목업 UI 숨기기 (원작 영상만 보기)" : "목업 UI 표시"}
                              >
                                {showReelsOverlay ? <EyeOff className="w-3.5 h-3.5 text-slate-300" /> : <Eye className="w-3.5 h-3.5 text-pink-400" />}
                              </button>

                              {/* Fit Mode Toggle */}
                              <button
                                type="button"
                                onClick={() => setVideoFitMode(videoFitMode === 'contain' ? 'cover' : 'contain')}
                                className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm border border-white/10 hover:scale-105 shadow-md"
                                title={videoFitMode === 'contain' ? "100% 원본 비율 (좌우 잘림 방지 모드) - 꽉 채우기로 전환" : "화면 꽉 채움 모드 - 100% 원본 비율로 전환"}
                              >
                                <Scan className={`w-3.5 h-3.5 ${videoFitMode === 'contain' ? 'text-pink-400' : 'text-slate-300'}`} />
                              </button>
                            </div>

                            {/* Bottom Reel Caption Simulation */}
                            {showReelsOverlay && (
                              <div className="z-10 p-4 sm:p-5 space-y-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-white shrink-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold">
                                    LM
                                  </div>
                                  <span className="text-xs font-bold">lumiere_official</span>
                                </div>
                                <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                                  {project.summary}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-pink-300">
                                  <Sparkles className="w-3 h-3" />
                                  <span>After Effects Motion Graphic · Sound Sync</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Sizing Label */}
                          <div className="mt-2 text-center text-[10px] font-mono text-slate-400">
                            <span>1080 x 1920 px · 9:16 Shortform Format</span>
                          </div>
                        </div>

                        {/* Storyboard Keyframes Breakdown - Only shown if written in admin */}
                        {hasKeyframes && (
                          <div className="flex-1 space-y-4 w-full">
                            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#EC4899]" />
                              <span>타임라인 & 스토리보드 씬 구성 (Timeline & Storyboard)</span>
                            </h3>

                            <div className="space-y-3">
                              {validKeyframes.map((frame, fIdx) => (
                                <div key={fIdx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="font-bold text-[#0F172A]">{frame.title}</span>
                                    {frame.timestamp && (
                                      <span className="text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded">{frame.timestamp}</span>
                                    )}
                                  </div>
                                  {frame.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                                      {frame.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 2: 16:9 PC / Web Cinema Wide Player */}
                    {isPcWide && (
                      <div className="space-y-8">
                        <div className="rounded-3xl bg-slate-950 p-4 sm:p-6 shadow-2xl border-2 border-slate-800 space-y-4">
                          {/* Cinema Player Chrome Bar */}
                          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                              <span className="ml-2 text-slate-300 font-bold flex items-center gap-1.5">
                                <Monitor className="w-3.5 h-3.5 text-pink-400" />
                                <span>PC WIDE SCREEN PLAYER (1920x1080)</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                1080P FULL HD
                              </span>
                              <span className="text-[11px] text-pink-400 font-bold font-mono">16:9 RATIO</span>
                            </div>
                          </div>

                          {/* Video Container 16:9 */}
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
                            {currentVar.videoUrl || project.videoUrl ? (
                              <video
                                src={currentVar.videoUrl || project.videoUrl}
                                autoPlay
                                loop
                                muted={isVideoMuted}
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={currentVar.coverImage || project.coverImage}
                                alt={project.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            )}

                            {/* Controls */}
                            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                              <button
                                onClick={() => setZoomImage(currentVar.videoUrl || project.videoUrl || currentVar.coverImage || project.coverImage || null)}
                                className="p-2.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm border border-white/20 hover:scale-105"
                                title="전체화면 확대 보기"
                              >
                                <Maximize2 className="w-4 h-4 text-slate-300 hover:text-white" />
                              </button>
                              <button
                                onClick={() => setIsVideoMuted(!isVideoMuted)}
                                className="p-2.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-all backdrop-blur-sm border border-white/20 hover:scale-105"
                                title={isVideoMuted ? "소리 켜기" : "소리 끄기"}
                              >
                                {isVideoMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
                              </button>
                            </div>
                          </div>

                          {/* Cinema Footer Controls Simulation */}
                          <div className="px-2 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">{project.title} — PC Web Motion</span>
                              <span className="text-slate-500">|</span>
                              <span className="text-pink-400 font-semibold">1080P FULL HD · 60FPS</span>
                            </div>
                            <div className="text-[11px] text-pink-400">
                              웹사이트 메인 히어로 비디오 & 브랜드 유튜브 최적화
                            </div>
                          </div>
                        </div>

                        {/* Storyboard Keyframes for PC Wide - Only shown if written in admin */}
                        {hasKeyframes && (
                          <div className="space-y-4 pt-2">
                            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#EC4899]" />
                              <span>타임라인 & 스토리보드 씬 구성 (Timeline & Storyboard)</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                              {validKeyframes.map((frame, fIdx) => (
                                <div key={fIdx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="font-bold text-[#0F172A]">{frame.title}</span>
                                    {frame.timestamp && (
                                      <span className="text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded">{frame.timestamp}</span>
                                    )}
                                  </div>
                                  {frame.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                      {frame.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CASE 3: 1:1 Square SNS Feed / Ad Player */}
                    {isSquare && (
                      <div className="flex flex-col items-center justify-center space-y-8">
                        <div className="w-full max-w-[460px] bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                          {/* Square Post Header */}
                          <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#EC4899] to-[#7C3AED] p-0.5">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-800">
                                  LM
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block leading-tight">lumiere_official</span>
                                <span className="text-[10px] text-slate-400 font-mono">Sponsored · 1:1 Square Feed Video</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                              1:1 SQUARE
                            </span>
                          </div>

                          {/* Active Square Video Container */}
                          <div className="relative aspect-square bg-slate-950 overflow-hidden">
                            {currentVar.videoUrl || project.videoUrl ? (
                              <video
                                src={currentVar.videoUrl || project.videoUrl}
                                autoPlay
                                loop
                                muted={isVideoMuted}
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={currentVar.coverImage || project.coverImage}
                                alt={project.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            )}

                            {/* Controls */}
                            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                              <button
                                onClick={() => setZoomImage(currentVar.videoUrl || project.videoUrl || currentVar.coverImage || project.coverImage || null)}
                                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all backdrop-blur-sm border border-white/20 hover:scale-105"
                                title="전체화면 확대 보기"
                              >
                                <Maximize2 className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
                              </button>
                              <button
                                onClick={() => setIsVideoMuted(!isVideoMuted)}
                                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all backdrop-blur-sm border border-white/20 hover:scale-105"
                                title={isVideoMuted ? "소리 켜기" : "소리 끄기"}
                              >
                                {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-300" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
                              </button>
                            </div>
                          </div>

                          {/* Social Actions & Caption */}
                          <div className="p-4 space-y-2 bg-white">
                            <div className="flex items-center justify-between text-slate-800 pb-1">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-rose-500">❤️ 2,450 likes</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">1080 x 1080 px</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              <strong className="text-slate-900 mr-1.5">lumiere_official</strong>
                              {project.summary}
                            </p>
                          </div>
                        </div>

                        {/* Storyboard Keyframes for Square - Only shown if written in admin */}
                        {hasKeyframes && (
                          <div className="w-full space-y-4 pt-2">
                            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#EC4899]" />
                              <span>타임라인 & 스토리보드 씬 구성 (Timeline & Storyboard)</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                              {validKeyframes.map((frame, fIdx) => (
                                <div key={fIdx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="font-bold text-[#0F172A]">{frame.title}</span>
                                    {frame.timestamp && (
                                      <span className="text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded">{frame.timestamp}</span>
                                    )}
                                  </div>
                                  {frame.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                      {frame.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* --- CASE D: DEFAULT DETAIL PAGE SECTIONS (OR EDITORIAL VIEW) --- */}
            {(!isSns && !isBanner && !isVideo) && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EC4899]">
                    <span className="font-bold px-2 py-0.5 rounded bg-[#FDF2F8] border border-[#FBCFE8]">02</span>
                    <span className="font-bold">DETAILED SECTIONS & VISUALS</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-bold">
                    {(project.sections || []).length} KEY SECTIONS
                  </span>
                </div>

                {/* View Mode: Mobile Simulator vs Editorial Full Width */}
                {viewMode === 'mobile' ? (
                  /* Mobile Device Simulator Frame */
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 bg-[#0F172A] rounded-2xl border border-slate-800 p-3 sm:p-6 overflow-hidden">
                    <div className="text-xs font-mono text-slate-400 mb-4 flex items-center gap-2 font-bold">
                      <Smartphone className="w-4 h-4 text-[#EC4899]" />
                      <span>MOBILE DETAIL PAGE SCROLL PREVIEW</span>
                    </div>

                    {/* Outer Phone Shell (Strictly clipped with hardware acceleration) */}
                    <div className="relative w-full max-w-[340px] sm:max-w-[375px] h-[660px] sm:h-[700px] bg-slate-950 rounded-[44px] sm:rounded-[48px] p-2.5 sm:p-3 shadow-2xl border-[3px] border-slate-700/80 flex flex-col overflow-hidden [transform:translateZ(0)] isolate select-none">
                      {/* Inner Screen Display (Hard clipped with rounded corners) */}
                      <div className="relative w-full h-full bg-white rounded-[34px] sm:rounded-[38px] overflow-hidden flex flex-col [transform:translateZ(0)] isolate">
                        {/* Sleek Compact Dark Status Bar (Single Line with Integrated Notch) */}
                        <div className="shrink-0 bg-slate-950 text-white z-20 px-4 py-2 flex items-center justify-between border-b border-slate-800/80 select-none">
                          <span className="text-[11px] font-mono font-bold tracking-tight text-slate-200">09:41</span>
                          
                          {/* Compact Dynamic Island Notch Pill */}
                          <div className="w-20 h-3 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 border border-slate-800 pointer-events-none">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            <div className="w-6 h-1 bg-slate-800 rounded-full" />
                          </div>

                          <div className="text-[10px] font-mono font-bold text-pink-400 flex items-center gap-1">
                            <span className="text-slate-300">5G</span>
                            <span>100%</span>
                          </div>
                        </div>

                        {/* Screen Scrollable Viewport (Scrollbar is fully enclosed between top notch and bottom bar) */}
                        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin [overscroll-behavior:contain]">
                          {/* Sequential detail page slices inside mobile container */}
                          <div className="flex flex-col">
                            {(project.sections || []).map((section, sIdx) => {
                              const rawImages = (section.images && section.images.length > 0)
                                ? section.images
                                : (section.imageUrl ? [section.imageUrl] : []);
                              const sliceImages = rawImages.filter(Boolean);

                              if (sliceImages.length === 0) return null;

                              const isSlide = (section.layoutMode === 'slide' || section.layoutMode === 'carousel') && sliceImages.length > 1;

                              if (isSlide) {
                                return (
                                  <div key={section.id || sIdx} className="p-0 flex flex-col border-b border-slate-100">
                                    <SectionSlideViewer
                                      images={sliceImages}
                                      title={section.title}
                                      onZoom={setZoomImage}
                                      compact={true}
                                    />
                                    {section.caption && (
                                      <div className="p-3 bg-[#F8FAFC] text-[11px] text-slate-600 border-t border-slate-100 font-sans leading-relaxed">
                                        {section.caption}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div key={section.id || sIdx} className="p-0 flex flex-col">
                                  {/* Seamless sliced images stacking */}
                                  <div className="flex flex-col">
                                    {sliceImages.map((cutUrl, cIdx) => (
                                      <img
                                        key={cIdx}
                                        src={cutUrl}
                                        alt={`${section.title} cut ${cIdx + 1}`}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-auto block object-cover"
                                      />
                                    ))}
                                  </div>
                                  {section.caption && (
                                    <div className="p-3.5 bg-[#F8FAFC] text-[11px] text-slate-600 border-t border-b border-slate-100 font-sans leading-relaxed">
                                      {section.caption}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {/* Safe spacing at bottom */}
                          <div className="h-3 bg-white" />
                        </div>

                        {/* Bottom Home Indicator Bar (Dark theme matching bezel) */}
                        <div className="shrink-0 bg-slate-950 py-2 flex items-center justify-center border-t border-slate-800/80 z-20">
                          <div className="w-20 h-1 bg-slate-600 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Editorial Desktop Layout */
                  <div className="space-y-14">
                    {(project.sections || []).map((section, idx) => {
                      const rawImages = (section.images && section.images.length > 0)
                        ? section.images
                        : (section.imageUrl ? [section.imageUrl] : []);
                      const sliceImages = rawImages.filter(Boolean);
                      const isMultiCut = sliceImages.length > 1;
                      const mode = section.layoutMode || (isMultiCut ? 'seamless' : 'spaced');

                      return (
                        <div
                          key={section.id || idx}
                          className="space-y-3 group"
                        >
                          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                            <span className="font-bold text-[#0F172A] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
                              <span>{section.title}</span>
                            </span>
                            {sliceImages.length > 0 && (
                              <button
                                onClick={() => setZoomImage(sliceImages[0])}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FDF2F8] text-[#DB2777] hover:bg-[#FBCFE8] text-[11px] transition-colors border border-[#FBCFE8] font-bold"
                              >
                                <ZoomIn className="w-3.5 h-3.5 text-[#EC4899]" />
                                <span>확대보기 (ZOOM)</span>
                              </button>
                            )}
                          </div>

                          {/* Section Image Layouts based on layoutMode */}
                          {sliceImages.length > 0 && (
                            (mode === 'slide' || mode === 'carousel') ? (
                              /* Interactive Horizontal Slide / Carousel Layout */
                              <SectionSlideViewer
                                images={sliceImages}
                                title={section.title}
                                onZoom={setZoomImage}
                              />
                            ) : mode === 'seamless' ? (
                              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 luxury-card-shadow flex flex-col">
                                {sliceImages.map((cutUrl, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => setZoomImage(cutUrl)}
                                    className="relative cursor-zoom-in group/cut"
                                  >
                                    <img
                                      src={cutUrl}
                                      alt={`${section.title} - cut ${cIdx + 1}`}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-auto block object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded-md opacity-0 group-hover/cut:opacity-100 transition-opacity border border-white/20">
                                      클릭하여 확대
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : mode === 'grid' ? (
                              /* 2-Columns Grid Layout */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sliceImages.map((cutUrl, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => setZoomImage(cutUrl)}
                                    className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in luxury-card-shadow group/card"
                                  >
                                    <img
                                      src={cutUrl}
                                      alt={`${section.title} - cut ${cIdx + 1}`}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-auto object-cover transition-transform duration-500 group-hover/card:scale-[1.01]"
                                    />
                                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-mono px-3 py-1 rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity border border-white/20">
                                      CLICK TO EXPAND
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Spaced Layout */
                              <div className="space-y-4">
                                {sliceImages.map((cutUrl, cIdx) => (
                                  <div
                                    key={cIdx}
                                    onClick={() => setZoomImage(cutUrl)}
                                    className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in luxury-card-shadow group/card"
                                  >
                                    <img
                                      src={cutUrl}
                                      alt={`${section.title} - cut ${cIdx + 1}`}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-auto object-cover transition-transform duration-500 group-hover/card:scale-[1.01]"
                                    />
                                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-mono px-3 py-1 rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity border border-white/20">
                                      CLICK TO EXPAND
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          )}

                          {/* Section Caption Note */}
                          {section.caption && (
                            <p className="text-xs sm:text-sm text-slate-600 pl-3 border-l-2 border-[#EC4899] leading-relaxed font-sans">
                              {section.caption}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 03. OUTCOME & RESULT */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 luxury-card-shadow">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EC4899]">
                <CheckCircle2 className="w-4 h-4 text-[#EC4899]" />
                <span className="font-bold">03. OUTCOME & RESULT</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  {project.outcome.result}
                </h4>
                {project.outcome.details && (
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {project.outcome.details}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Navigation Between Projects */}
            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => onSelectProject(prevProject)}
                className="group flex items-center gap-3 text-xs font-mono text-slate-600 hover:text-[#EC4899]"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-400">PREVIOUS</span>
                  <span className="font-semibold text-slate-800 group-hover:text-[#EC4899]">{prevProject.title}</span>
                </div>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-colors"
              >
                CLOSE TO OVERVIEW
              </button>

              <button
                onClick={() => onSelectProject(nextProject)}
                className="group flex items-center gap-3 text-xs font-mono text-slate-600 hover:text-[#EC4899]"
              >
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400">NEXT</span>
                  <span className="font-semibold text-slate-800 group-hover:text-[#EC4899]">{nextProject.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Full Image / Video Zoom Lightbox Overlay */}
        {zoomImage && (
          <div
            className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            onClick={() => setZoomImage(null)}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
            <div 
              className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideoMedia(zoomImage) ? (
                <video
                  src={zoomImage}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain bg-black"
                />
              ) : (
                <img
                  src={zoomImage}
                  alt="Zoomed Detail"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
