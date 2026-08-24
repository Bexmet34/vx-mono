"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { Server, Users, Swords, Clock } from "lucide-react";

function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsBanner() {
  const { t } = useLanguage();

  const stats = [
    { icon: Server, value: 50, suffix: "+", label: t.statServers },
    { icon: Users, value: 10000, suffix: "+", label: t.statMembers },
    { icon: Swords, value: 1500, suffix: "+", label: t.statParties },
    { icon: Clock, value: 99.9, suffix: "%", label: t.statUptime, isDecimal: true },
  ];

  return (
    <section id="stats" className="relative py-10 md:py-12 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low" />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,215,0,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      
      {/* Top and bottom border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/30 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container transition-all duration-300 group-hover:bg-primary-container/20 group-hover:scale-110">
                <stat.icon size={22} />
              </div>
              <div className="text-3xl md:text-4xl font-headline-xl text-on-surface font-bold mb-1.5 tracking-tight">
                {stat.isDecimal ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-sm text-on-surface-variant font-light uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
