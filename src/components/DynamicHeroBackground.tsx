import React from 'react';

export const DynamicHeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* 1. Deep Vivid Ambient Aurora Blobs (Rich, morphing & saturated) */}
      <div 
        className="absolute -top-24 right-[-5%] w-[62vw] h-[62vw] max-w-[780px] max-h-[780px] bg-gradient-to-br from-[#FF6B2B]/45 via-[#E11D48]/40 to-[#8B5CF6]/35 blur-[90px] animate-aurora-1" 
        style={{ mixBlendMode: 'multiply' }}
      />
      <div 
        className="absolute top-1/4 left-[-10%] w-[58vw] h-[58vw] max-w-[720px] max-h-[720px] bg-gradient-to-tr from-[#7C3AED]/40 via-[#DB2777]/38 to-[#FF7A00]/35 blur-[95px] animate-aurora-2" 
        style={{ mixBlendMode: 'multiply' }}
      />
      <div 
        className="absolute -bottom-20 left-1/3 w-[45vw] h-[45vw] max-w-[580px] max-h-[580px] bg-gradient-to-r from-[#F43F5E]/35 via-[#EA580C]/35 to-[#A855F7]/30 blur-[85px] animate-aurora-3" 
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* 2. Flowing Animated Liquid Wave Curves (SVG ribbon waves with subtle gradient strokes) */}
      <div className="absolute inset-0 opacity-40">
        <svg
          className="w-full h-full animate-wave-drift-1"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#DB2777" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M-100,280 C320,120 540,480 920,240 C1200,60 1380,380 1600,200"
            stroke="url(#wave-grad-1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="16 8"
          />
          <path
            d="M-80,480 C260,620 680,260 1020,540 C1260,720 1420,400 1620,520"
            stroke="url(#wave-grad-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute inset-0 opacity-30">
        <svg
          className="w-full h-full animate-wave-drift-2"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-50,680 C360,520 640,780 1100,600 C1340,480 1520,720 1650,580"
            stroke="url(#wave-grad-1)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 3. Sweeping Shimmering Light Beam across the grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 animate-light-beam" />
      </div>
    </div>
  );
};
