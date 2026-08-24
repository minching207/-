import React from 'react';
import { ArrowUp, Lock, ShieldCheck } from 'lucide-react';
import { SiteContent } from '../types';

interface FooterProps {
  content: SiteContent;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ content, onOpenAdmin, isAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-white py-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-slate-500">
        {/* Left: Designer info */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-bold text-[#0F172A]">
            © {new Date().getFullYear()} {content.meta.designerName}
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-[#EC4899] font-bold">{content.meta.designerTitle}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button
            id="footer-admin-btn"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 hover:text-[#EC4899] transition-colors"
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#EC4899]" />
                <span className="font-semibold text-[#EC4899]">관리</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 opacity-70" />
                <span>관리</span>
              </>
            )}
          </button>

          <button
            id="back-to-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-[#EC4899] transition-colors"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
