import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface InitialPreloaderProps {
  isLoading: boolean;
}

export const InitialPreloader: React.FC<InitialPreloaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          id="initial-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Subtle Dynamic Ambient Background Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none -top-12 -left-12 animate-pulse" />
          <div className="absolute w-72 h-72 rounded-full bg-amber-100/60 blur-3xl pointer-events-none -bottom-12 -right-12 animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
            {/* Minimal Brand Monogram Badge */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] text-white flex items-center justify-center shadow-xl border border-slate-700/30 relative"
            >
              <span className="font-mono font-bold text-sm tracking-widest text-[#FBCFE8]">MK</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#EC4899] animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#EC4899]" />
            </motion.div>

            {/* Typography Header */}
            <div className="space-y-1.5">
              <motion.h1
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg font-bold tracking-tight text-[#0F172A]"
              >
                MINKYEONG KIM
              </motion.h1>
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[11px] font-mono tracking-widest uppercase text-slate-500 font-semibold"
              >
                E-Commerce & Visual Content Portfolio
              </motion.p>
            </div>

            {/* Luxury Minimalist Progress Line */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '140px' }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="h-0.5 bg-slate-100 rounded-full overflow-hidden relative"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: 'easeInOut'
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-[#EC4899] to-transparent"
              />
            </motion.div>

            {/* Subtle Loading Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400"
            >
              <Sparkles className="w-3 h-3 text-[#EC4899] animate-spin" style={{ animationDuration: '3s' }} />
              <span>최신 포트폴리오를 불러오는 중입니다...</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
