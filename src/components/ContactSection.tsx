import React, { useState } from 'react';
import { Mail, Phone, MapPin, Copy, Check, ArrowUpRight, FileText, Sparkles, MessageCircle, Clock, Calendar, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteContent } from '../types';

interface ContactSectionProps {
  content: SiteContent;
  onOpenResume: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ content, onOpenResume }) => {
  const { contact, meta } = content;
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#F8FAFC] hairline-b relative overflow-hidden bg-grid-pattern">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/3 left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-tr from-[#EA580C]/10 via-[#DB2777]/8 to-transparent blur-3xl pointer-events-none animate-orb-1" />
      <div className="absolute bottom-10 right-[-8%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-bl from-[#7C3AED]/10 via-[#DB2777]/8 to-transparent blur-3xl pointer-events-none animate-orb-2" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#EC4899]">
            <span className="font-bold px-2.5 py-1 rounded-md bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8] shadow-2xs">{contact.sectionNumber}</span>
            <span>/</span>
            <span className="font-bold tracking-wider">{contact.sectionTitle}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            {contact.heading}<span className="text-[#EC4899]">.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            {contact.subHeading}
          </p>
        </div>

        {/* Clean Luxury Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Direct Email & Action Card (Col 7) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 rounded-3xl bg-white border-2 border-slate-200 luxury-card-shadow space-y-8 relative overflow-hidden hover:border-[#EC4899] transition-all duration-300">
            {/* Top focal color bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#EA580C] via-[#DB2777] to-[#7C3AED]" />

            <div className="space-y-6">
              {/* Availability Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FDF2F8] text-[#DB2777] text-xs font-bold border border-[#FBCFE8] shadow-2xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EC4899]"></span>
                </span>
                <span>{contact.availableBadgeText}</span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono tracking-widest text-slate-400 font-bold uppercase block">
                  PRIMARY EMAIL CONTACT
                </span>
                <a
                  href={`mailto:${meta.email}`}
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] font-mono break-all hover:text-[#EC4899] transition-colors inline-block group"
                >
                  <span>{meta.email}</span>
                </a>
                <p className="text-sm text-[#475569] leading-relaxed">
                  프로젝트 협업 제안, 상세페이지 리뉴얼, 채용 관련 문의는 이메일로 편하게 연락 주시면 확인 후 신속하게 회신드립니다.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button
                id="copy-email-btn"
                onClick={() => copyToClipboard(meta.email, 'email')}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white hover:bg-[#FDF2F8] text-[#EC4899] text-xs font-bold tracking-wider transition-all border-2 border-[#FBCFE8] shadow-2xs hover:shadow-md"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-[#EC4899]" />
                    <span>이메일 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>이메일 주소 복사하기</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${meta.email}?subject=[디자인 문의] 프로젝트 협업 문의&body=안녕하세요, 포트폴리오를 보고 연락드립니다.`}
                className="flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-[#EA580C] via-[#DB2777] to-[#7C3AED] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]"
              >
                <Mail className="w-4 h-4" />
                <span>메일 바로 보내기</span>
                <ArrowUpRight className="w-4 h-4 opacity-80" />
              </a>
            </div>
          </div>

          {/* Right Column: Work Mode & Details & Resume Card (Col 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Contact Details Bento Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 space-y-2 luxury-card-shadow hover:border-[#EC4899] transition-colors">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold">
                  <span>PHONE</span>
                  <Phone className="w-3.5 h-3.5 text-[#EC4899]" />
                </div>
                <span className="text-sm sm:text-base font-bold text-[#0F172A] block font-mono">
                  {meta.phone}
                </span>
                <button
                  onClick={() => copyToClipboard(meta.phone, 'phone')}
                  className="text-[11px] text-[#EC4899] font-bold hover:underline font-mono"
                >
                  {copiedPhone ? '복사됨 ✓' : '번호 복사'}
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 space-y-2 luxury-card-shadow hover:border-[#EC4899] transition-colors">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold">
                  <span>LOCATION</span>
                  <MapPin className="w-3.5 h-3.5 text-[#EC4899]" />
                </div>
                <span className="text-sm sm:text-base font-bold text-[#0F172A] block">
                  {meta.location}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">대한민국 부천/서울 · 재택/출근 협의</span>
              </div>
            </div>

            {/* Collaboration Checklist Box */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 space-y-3 luxury-card-shadow hover:border-[#EC4899] transition-colors">
              <div className="flex items-center gap-2 text-xs font-mono text-[#EC4899] font-extrabold pb-2 border-b border-slate-100">
                <Clock className="w-4 h-4" />
                <span>RESPONSE TIME & WORK SCOPE</span>
              </div>
              <ul className="space-y-2 text-xs text-[#475569]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mt-1.5 flex-shrink-0" />
                  <span>문의 접수 시 <strong className="text-[#0F172A]">24시간 이내</strong> 피드백 및 견적/일정 안내</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mt-1.5 flex-shrink-0" />
                  <span>신규 런칭 상세페이지, 리뉴얼, 프로모션 기획전, 브랜드 비주얼</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mt-1.5 flex-shrink-0" />
                  <span>PSD / AI 원본 작업 파일 및 상세페이지 슬라이스·영상 에셋 완벽 제공</span>
                </li>
              </ul>
            </div>

            {/* Official Resume Callout Button */}
            <button
              id="contact-resume-btn"
              onClick={onOpenResume}
              className="w-full inline-flex items-center justify-between p-5 rounded-2xl bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#EC4899] transition-all duration-300 shadow-xl group hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-white group-hover:bg-white/20">
                  <FileText className="w-4 h-4 text-[#FBCFE8]" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] text-[#FBCFE8] font-mono font-bold">OFFICIAL RESUME</span>
                  <span className="text-xs sm:text-sm font-bold text-white">디자이너 공식 이력서 열기</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


