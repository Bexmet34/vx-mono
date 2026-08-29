'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, AlertTriangle, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

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
        const activeOnly = data.filter(a => a.is_active);
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
      }, 8000);
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
  
  const title = lang === 'tr' ? current.title_tr : current.title_en;
  const content = lang === 'tr' ? current.content_tr : current.content_en;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle size={16} className="text-red-500" />,
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-500',
          iconBg: 'bg-red-500/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={16} className="text-yellow-500" />,
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-500',
          iconBg: 'bg-yellow-500/20'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={16} className="text-green-500" />,
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-500',
          iconBg: 'bg-green-500/20'
        };
      default: // info
        return {
          icon: <Info size={16} className="text-blue-500" />,
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-500',
          iconBg: 'bg-blue-500/20'
        };
    }
  };

  const styles = getTypeStyles(current.type);

  return (
    <div className="relative flex justify-end w-full sm:w-auto min-w-[280px]">
      <div 
        className={`flex flex-col w-full sm:w-[320px] rounded-2xl border ${styles.border} ${styles.bg} shadow-lg backdrop-blur-md transition-all duration-300 relative z-50`}
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer select-none group"
          onClick={() => content && setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0 pl-1">
            <div className={`w-9 h-9 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
              {styles.icon}
            </div>
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <span className={`text-[13px] font-bold truncate tracking-wide ${styles.text}`}>
                {title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pr-1">
            {announcements.length > 1 && (
              <div 
                className="flex items-center bg-black/20 rounded-lg p-0.5"
                onClick={(e) => e.stopPropagation()} // Prevent toggling expansion when clicking arrows
              >
                <button 
                  onClick={prevSlide}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ChevronLeft size={14} className="text-on-surface-variant hover:text-white" />
                </button>
                <span className="text-[10px] font-bold text-on-surface-variant px-1.5 opacity-80">
                  {currentIndex + 1} / {announcements.length}
                </span>
                <button 
                  onClick={nextSlide}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ChevronRight size={14} className="text-on-surface-variant hover:text-white" />
                </button>
              </div>
            )}
            
            {content && (
              <div className={`p-1.5 rounded-lg transition-colors ml-1 ${expanded ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
                <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                  <ChevronDown size={16} className={styles.text} />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && content && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[110%] right-0 w-full sm:w-[380px] bg-[#111214]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  {styles.icon}
                  <span className={`text-sm font-bold ${styles.text}`}>{title}</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="text-[13px] text-on-surface-variant/90 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
