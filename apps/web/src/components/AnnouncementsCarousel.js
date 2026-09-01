'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Info, AlertTriangle, AlertCircle, 
  CheckCircle2, ChevronDown, Megaphone, Sparkles, Wrench, ArrowUpRight 
} from 'lucide-react';

export default function AnnouncementsCarousel({ lang = 'tr' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-slide reference
  const autoSlideRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        const activeOnly = (data || []).filter(a => a.is_active);
        setAnnouncements(activeOnly);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (announcements.length > 1 && !expanded) {
      autoSlideRef.current = setInterval(() => {
        nextSlide();
      }, 9000);
    }
    return () => clearInterval(autoSlideRef.current);
  }, [currentIndex, announcements.length, expanded]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setExpanded(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
    setExpanded(false);
  };

  if (loading || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  
  const title = (lang === 'tr' ? current.title_tr : current.title_en) || current.title_tr || current.title_en || '';
  const content = (lang === 'tr' ? current.content_tr : current.content_en) || current.content_tr || current.content_en || '';

  const getTypeStyles = (type) => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle size={18} className="text-rose-400 shrink-0" />,
          badge: lang === 'tr' ? 'KRİTİK UYARI' : 'CRITICAL ALERT',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          containerBg: 'from-rose-950/40 via-surface-container/90 to-surface-container-high/90',
          border: 'border-rose-500/40 hover:border-rose-400/70',
          glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]',
          text: 'text-rose-200',
          iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          accent: 'bg-rose-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
          badge: lang === 'tr' ? 'BİLGİLENDİRME' : 'MAINTENANCE',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          containerBg: 'from-amber-950/40 via-surface-container/90 to-surface-container-high/90',
          border: 'border-amber-500/40 hover:border-amber-400/70',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
          text: 'text-amber-200',
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          accent: 'bg-amber-500'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
          badge: lang === 'tr' ? 'SİSTEM GÜNCELLEMESİ' : 'SYSTEM UPDATE',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          containerBg: 'from-emerald-950/40 via-surface-container/90 to-surface-container-high/90',
          border: 'border-emerald-500/40 hover:border-emerald-400/70',
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          text: 'text-emerald-200',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
          accent: 'bg-emerald-500'
        };
      default: // info
        return {
          icon: <Sparkles size={18} className="text-primary-container shrink-0" />,
          badge: lang === 'tr' ? 'DUYURU & BİLGİ' : 'ANNOUNCEMENT',
          badgeBg: 'bg-primary-container/20 text-primary-container border-primary-container/30',
          containerBg: 'from-[#0d1c33]/90 via-surface-container/90 to-surface-container-high/90',
          border: 'border-primary-container/40 hover:border-primary-container/70',
          glow: 'shadow-[0_0_25px_rgba(255,215,0,0.12)] hover:shadow-[0_0_30px_rgba(255,215,0,0.25)]',
          text: 'text-primary-container',
          iconBg: 'bg-primary-container/20 text-primary-container border border-primary-container/30',
          accent: 'bg-primary-container'
        };
    }
  };

  const styles = getTypeStyles(current.type);

  return (
    <div className="relative w-full flex justify-end">
      {/* Main Wide Card Container */}
      <div 
        className={`w-full sm:w-[380px] md:w-[440px] lg:w-[480px] rounded-2xl border ${styles.border} bg-gradient-to-r ${styles.containerBg} ${styles.glow} backdrop-blur-2xl transition-all duration-300 relative z-30 group`}
      >
        <div 
          className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer select-none gap-2.5"
          onClick={() => content && setExpanded(!expanded)}
        >
          {/* Left: Glowing Icon + Content Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0 shadow-lg relative`}>
              {styles.icon}
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${styles.accent} animate-ping opacity-75`}></span>
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${styles.accent}`}></span>
            </div>

            <div className="flex flex-col min-w-0 flex-1 justify-center gap-0.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles.badgeBg}`}>
                  {styles.badge}
                </span>
                {content && (
                  <span className="text-[10px] text-on-surface-variant/70 hidden sm:inline-flex items-center gap-1 hover:text-white transition-colors">
                    {lang === 'tr' ? 'Detaylar' : 'Details'} <ArrowUpRight size={11} className="opacity-70" />
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-on-surface group-hover:text-white truncate transition-colors">
                {title}
              </span>
            </div>
          </div>

          {/* Right: Controls (Pagination + Expand Button) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {announcements.length > 1 && (
              <div 
                className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 backdrop-blur-md shadow-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={prevSlide}
                  className="p-1 hover:bg-white/15 rounded-lg text-on-surface-variant hover:text-white transition-colors active:scale-90"
                  title="Önceki / Previous"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] font-mono font-bold text-on-surface-variant px-1.5 opacity-90 select-none">
                  {currentIndex + 1}/{announcements.length}
                </span>
                <button 
                  onClick={nextSlide}
                  className="p-1 hover:bg-white/15 rounded-lg text-on-surface-variant hover:text-white transition-colors active:scale-90"
                  title="Sonraki / Next"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
            
            {content && (
              <div className={`p-2 rounded-xl transition-all ${expanded ? 'bg-white/15 text-white' : 'bg-white/5 text-on-surface-variant group-hover:bg-white/10 group-hover:text-white'}`}>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={15} />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Popover with Full Content */}
        <AnimatePresence>
          {expanded && content && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+8px)] right-0 w-full sm:w-[440px] md:w-[480px] bg-[#090e17]/95 backdrop-blur-2xl border border-outline-variant/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.5)] overflow-hidden z-[110]"
            >
              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                      {styles.icon}
                    </div>
                    <span className="text-sm font-bold text-on-surface">{title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles.badgeBg}`}>
                    {styles.badge}
                  </span>
                </div>

                <div className="text-[13px] text-on-surface-variant/90 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar pr-1 bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/20">
                  {content}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-on-surface-variant/60">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-primary-container" />
                    Veyronix Canlı Bilgi Akışı
                  </span>
                  <button
                    onClick={() => setExpanded(false)}
                    className="px-3 py-1 bg-surface-container-high/80 hover:bg-surface-container-highest text-on-surface text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    {lang === 'tr' ? 'Kapat' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

