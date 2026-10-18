"use client";

import { useEffect, useRef, useState } from "react";

export default function FadeIn({
  children,
  delay = 0,
  direction = "up", // "up", "down", "left", "right", "none"
  className = "",
  distance = 30, // px to translate
}) {
  // SSR-safe: Default to true so Googlebot & initial HTML always render opacity: 1
  const [isVisible, setIsVisible] = useState(true);
  const domRef = useRef();

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef || typeof IntersectionObserver === "undefined") return;

    // Only animate elements that start below the initial viewport
    const rect = currentRef.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      setIsVisible(false);
    } else {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.05
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return "translate3d(0,0,0)";
    switch (direction) {
      case "up": return `translate3d(0, ${distance}px, 0)`;
      case "down": return `translate3d(0, -${distance}px, 0)`;
      case "left": return `translate3d(${distance}px, 0, 0)`;
      case "right": return `translate3d(-${distance}px, 0, 0)`;
      default: return "translate3d(0,0,0)";
    }
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[700ms] ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
