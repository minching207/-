import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SiteContent } from '../types';

interface HeaderProps {
  content: SiteContent;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ content }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'WORK', href: '#work' },
    { name: 'APPROACH', href: '#approach' },
    { name: 'ABOUT', href: '#about' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md hairline-b py-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          id="nav-logo"
          href="#"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="w-2.5 h-2.5 bg-[#EC4899] rounded-full transition-transform duration-300 group-hover:scale-125 shadow-sm"></div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5">
            <span className="font-bold text-base tracking-tight text-[#0F172A]">
              {content.meta.designerName}
            </span>
            <span className="text-xs uppercase tracking-wider text-[#EC4899] font-mono font-bold">
              {content.meta.designerTitle}
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8 text-xs uppercase font-bold tracking-widest text-[#475569]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative py-1 hover:text-[#EC4899] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#EC4899] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-[#E2E8F0]"></div>

          {/* Availability status badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FDF2F8] text-[#DB2777] text-xs font-bold border border-[#FBCFE8] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse"></span>
            <span className="tracking-tight">{content.contact.availableBadgeText}</span>
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-[#0F172A] hover:bg-[#F1F5F9]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white hairline-b px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium tracking-wide">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded hover:bg-[#F8FAFC] text-[#334155] flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-4 h-4 opacity-40" />
              </a>
            ))}
          </div>
          
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#EC4899] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
              <span>{content.contact.availableBadgeText}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
