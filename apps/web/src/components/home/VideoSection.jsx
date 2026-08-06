"use client";

import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function VideoSection() {
  const { lang } = useLanguage();
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <div 
      ref={videoContainerRef} 
      className="mb-16 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.15)] border border-primary-container/30 relative group cursor-pointer" 
      onClick={toggleMute}
    >
      <div className="absolute inset-0 bg-primary-container/10 mix-blend-overlay pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
      
      {/* Sound Toggle Overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-primary-container hover:text-on-primary text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-2">
        {isVideoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span className="font-label-bold text-[10px] hidden md:block">
          {isVideoMuted ? (lang === 'tr' ? 'Sesi Aç' : 'Unmute') : (lang === 'tr' ? 'Sesi Kapat' : 'Mute')}
        </span>
      </div>

      {shouldLoadVideo ? (
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-auto object-cover"
        >
          <source src="/videos/tanitim.mp4" type="video/mp4" />
          <track kind="captions" src="/placeholder.vtt" srcLang="tr" label="Türkçe" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
      ) : (
        <div className="w-full aspect-video bg-surface-container-highest flex items-center justify-center text-primary-container">
          <Loader2 className="animate-spin text-primary-container" size={36} />
        </div>
      )}
    </div>
  );
}
