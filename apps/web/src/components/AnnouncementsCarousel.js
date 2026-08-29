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
    <div className={`relative flex flex-col w-full sm:w-[350px] md:w-[400px] rounded-xl border ${styles.border} ${styles.bg} transition-all duration-300 z-50`}>
      <div className="flex items-center justify-between p-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center shrink-0`}>
            {styles.icon}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className={`text-xs font-bold truncate ${styles.text}`}>
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {announcements.length > 1 && (
            <div className="flex items-center bg-black/20 rounded-lg p-0.5">
              <button 
                onClick={prevSlide}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronLeft size={14} className="text-on-surface-variant" />
              </button>
              <span className="text-[10px] font-bold text-on-surface-variant px-1.5">
                {currentIndex + 1} / {announcements.length}
              </span>
              <button 
                onClick={nextSlide}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronRight size={14} className="text-on-surface-variant" />
              </button>
            </div>
          )}
          
          {content && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-1"
              title={lang === 'tr' ? 'Detayı Oku' : 'Read More'}
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={16} className="text-on-surface-variant" />
              </motion.div>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`p-3 pt-0 text-xs text-on-surface-variant whitespace-pre-wrap`}>
              <div className="w-full h-px bg-white/10 mb-3" />
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
