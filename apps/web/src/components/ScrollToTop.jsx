"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll olayını dinle
  useEffect(() => {
    const toggleVisibility = () => {
      // 300 piksel aşağı kaydırıldığında göster
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
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
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9998] w-12 h-12 bg-surface-container-high border border-outline-variant rounded-full flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-on-primary hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Yukarı Çık"
    >
      <ChevronUp size={24} />
    </button>
  );
}
