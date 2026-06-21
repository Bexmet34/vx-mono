"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const [isAtBottom, setIsAtBottom] = useState(false);

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      // 300 piksel aşağı kaydırıldığında göster
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Sayfanın en altına gelindiğinde (footer üzerinde) gizle
      // 100px tolerans payı bırakıyoruz
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
      setIsAtBottom(bottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9998] w-12 h-12 bg-surface-container-high border border-outline-variant rounded-full flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-on-primary hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 overflow-hidden ${
        isVisible && !isAtBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      style={{ borderRadius: '50%' }}
      aria-label="Yukarı Çık"
    >
      <ChevronUp size={24} />
    </button>
  );
}
