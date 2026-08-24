import React from 'react';
import { motion } from 'motion/react';
import { FileText, Award, Eye, Layers, CheckSquare, Sparkles, ArrowDown, Lightbulb, ShoppingBag, TrendingUp, Zap, Shield, Heart } from 'lucide-react';
import { SiteContent } from '../types';

interface AboutSectionProps {
  content: SiteContent;
  onOpenResume: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content, onOpenResume }) => {
  const { about, meta } = content;

  return (
    <section id="about" className="py-24 sm:py-32 bg-white hairline-b relative overflow-hidden bg-grid-pattern">
      {/* Rich ambient background glow */}
      <div 
        className="absolute top-1/4 -left-16 w-[52vw] h-[52vw] max-w-[660px] max-h-[660px] rounded-full bg-gradient-to-br from-[#EA580C]/30 via-[#DB2777]/26 to-[#7C3AED]/20 blur-3xl pointer-events-none animate-aurora-2" 
        style={{ mixBlendMode: 'multiply' }}
      />
      <div 
        className="absolute bottom-10 right-[-8%] w-[48vw] h-[48vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-[#7C3AED]/30 via-[#DB2777]/24 to-[#EA580C]/20 blur-3xl pointer-events-none animate-aurora-1" 
        style={{ mixBlendMode: 'multiply' }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-20 relative z-10">
        {/* Section Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#EC4899]">
            <span className="font-bold px-2.5 py-1 rounded-md bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] shadow-2xs">{about.sectionNumber}</span>
            <span>/</span>
            <span className="font-bold tracking-wider">{about.sectionTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
            {about.greeting}
          </h2>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed pt-2">
            {about.intro}
          </p>
        </div>

        {/* 3 Core Strengths (MY STRENGTHS) */}
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <span className="text-xs font-mono tracking-widest text-[#EC4899] font-bold">
              {about.strengthsTitle}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">3 CORE PILLARS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {about.strengths.map((st, idx) => {
              const icons = [Lightbulb, ShoppingBag, TrendingUp, Zap, Shield, Heart];
              const IconComp = icons[idx % icons.length];
              return (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-8 rounded-3xl bg-white border-2 border-slate-200 space-y-4 luxury-card-shadow hover:border-[#EC4899] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold px-3 py-1 rounded-lg bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] shadow-2xs">
                      {st.tag}
                    </span>
                    <IconComp className="w-4 h-4 text-[#EC4899]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0F172A]">{st.title}</h3>
                    <span className="text-xs text-slate-500 font-bold block mt-1">
                      {st.subtitle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {st.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Grid: SKILLS & EXPERIENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8">
          {/* Left: SKILLS */}
          <div className="lg:col-span-5 space-y-8">
            <div className="pb-3 border-b-2 border-slate-200">
              <span className="text-xs font-mono tracking-widest text-[#EC4899] font-bold">
                SKILLS & CAPABILITIES
              </span>
            </div>

            <div className="space-y-8">
              {about.skills.map((skillGroup, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <h4 className="text-xs font-mono font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
                    {skillGroup.category}
                  </h4>
                  <div className="space-y-2">
                    {skillGroup.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#EC4899] text-xs sm:text-sm font-semibold text-[#0F172A] flex items-center justify-between shadow-2xs transition-colors"
                      >
                        <span>{item}</span>
                        <CheckSquare className="w-4 h-4 text-[#EC4899]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Resume Callout Card */}
            <div className="p-8 rounded-3xl bg-[#0F172A] text-white space-y-4 shadow-xl border-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-[#FBCFE8]">
                <span className="font-bold">✦ OFFICIAL DOCUMENT</span>
                <span>PDF / PRINTABLE</span>
              </div>
              <h4 className="text-lg font-bold text-white">상세 이력서 확인하기</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                상세 프로젝트 기여도, 협업 경험 및 교육 이력이 정리된 이력서입니다.
              </p>
              <button
                id="view-resume-btn"
                onClick={onOpenResume}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#DB2777] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02]"
              >
                <FileText className="w-4 h-4" />
                <span>VIEW RESUME</span>
              </button>
            </div>
          </div>

          {/* Right: EXPERIENCE (Chronological timeline) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <span className="text-xs font-mono tracking-widest text-[#EC4899] font-bold">
                EXPERIENCE
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">CHRONOLOGICAL</span>
            </div>

            <div className="space-y-6">
              {about.experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 hover:border-[#EC4899] space-y-4 luxury-card-shadow transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-[#EC4899] bg-[#FDF2F8] px-3.5 py-1 rounded-md border border-[#FBCFE8] w-fit shadow-2xs">
                      {exp.year}
                    </span>
                    <span className="text-xs font-mono text-[#475569] font-bold">
                      {exp.role}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                      {exp.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mt-2">
                      {exp.responsibility}
                    </p>
                  </div>

                  <div className="pt-2.5 text-xs font-mono text-[#64748B] flex items-center gap-2 border-t border-slate-100">
                    <span className="font-bold text-[#0F172A]">Main Project:</span>
                    <span className="text-[#EC4899] font-bold">{exp.project}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

