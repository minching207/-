import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, ArrowRight, Lightbulb, Compass, Target, Award } from 'lucide-react';
import { SiteContent } from '../types';

interface DesignApproachProps {
  content: SiteContent;
}

export const DesignApproach: React.FC<DesignApproachProps> = ({ content }) => {
  const { approach } = content;

  return (
    <section id="approach" className="py-24 sm:py-32 bg-[#F8FAFC] hairline-b relative overflow-hidden bg-grid-pattern">
      {/* Decorative ambient orbs */}
      <div className="absolute top-1/3 -right-24 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-br from-[#EA580C]/8 via-[#DB2777]/8 to-transparent blur-3xl pointer-events-none animate-orb-1" />
      <div className="absolute -bottom-20 -left-20 w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-gradient-to-tr from-[#7C3AED]/8 via-[#DB2777]/6 to-transparent blur-3xl pointer-events-none animate-orb-2" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#EC4899]">
            <span className="font-bold px-2.5 py-1 rounded-md bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] shadow-2xs">{approach.sectionNumber}</span>
            <span>/</span>
            <span className="font-bold tracking-wider">DESIGN APPROACH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0F172A] tracking-tight">
            {approach.sectionTitle}<span className="text-[#EC4899]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            단순히 예쁜 그래픽을 만드는 것에 그치지 않고, 상품의 목적과 고객의 시선을 고려하여
            체계적인 <strong className="text-[#0F172A]">4단계 프로세스</strong>로 완성도 높은 디자인을 만듭니다.
          </p>
        </div>

        {/* Marketing Philosophy Quote Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl bg-[#0F172A] p-8 sm:p-12 text-white shadow-2xl border-2 border-slate-800"
        >
          <div className="absolute top-4 left-6 text-6xl text-[#EC4899]/40 font-serif select-none">
            “
          </div>
          <div className="relative space-y-4 max-w-3xl pl-4 sm:pl-10">
            <blockquote className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white leading-[1.4] tracking-tight">
              {approach.coreQuote}
            </blockquote>
            <p className="text-xs sm:text-sm text-[#FBCFE8] font-mono font-bold tracking-wider">
              ✦ DETAIL PAGE DESIGN PHILOSOPHY
            </p>
          </div>
        </motion.div>

        {/* 4-Step Process Grid - Unified Colors for 01, 02, 03, 04 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approach.steps.map((step, idx) => {
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-white border-2 border-slate-200 hover:border-[#EC4899] transition-all duration-300 flex flex-col justify-between space-y-6 luxury-card-shadow hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Top Step Number & English Title - Unified for all steps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold bg-[#FDF2F8] text-[#DB2777] px-3 py-1 rounded-md border border-[#FBCFE8] shadow-2xs">
                      0{idx + 1}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                      {step.enTitle}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0F172A] pt-1 leading-snug group-hover:text-[#EC4899] transition-colors">
                    {step.koTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Sub Points - Unified dot color */}
                {step.points && step.points.length > 0 && (
                  <ul className="space-y-2 pt-4 border-t border-slate-100 text-[11px] sm:text-xs text-[#64748B]">
                    {step.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mt-1.5 flex-shrink-0" />
                        <span className="leading-tight">{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

