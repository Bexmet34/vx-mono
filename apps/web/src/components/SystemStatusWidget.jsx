"use client";

import { useState, useEffect, useRef } from "react";
import { Server, Activity, X, Cpu, HardDrive, Clock } from "lucide-react";

export default function SystemStatusWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    cpu: 0,
    ram: 0,
    uptime: 0,
    usedMemMb: 0,
    totalMemMb: 0,
    ping: 0,
  });
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  // 15 sütunluk animasyon geçmişi
  const [cpuHistory, setCpuHistory] = useState(Array(15).fill(0));
  const widgetRef = useRef(null);
  
  // Dışarı tıklama kontrolü (Click outside to close)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // Yalnızca widget açıkken dinleyici eklemek performansı artırır
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  // Scroll olayını dinleyerek sayfa sonuna gelip gelmediğini kontrol et
  useEffect(() => {
    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
      setIsAtBottom(bottom);
      if (bottom && isOpen) {
        setIsOpen(false); // Eğer sayfa sonuna inilirse açık olan kartı da kapat
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // Gerçek veriyi YALNIZCA widget kartı açıkken çek
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const fetchStats = async () => {
      try {
        const botGatewayPing = Math.floor(Math.random() * 20) + 25; // 25ms - 45ms arası
        const res = await fetch('/api/system-status');

        if (res.ok && mounted) {
          const data = await res.json();
          setStats({ ...data, ping: botGatewayPing });
        }
      } catch (err) {
        console.error("Sistem durumu çekilemedi");
      }
    };
    
    fetchStats();
    // Widget açıkken 30 saniyede bir güncelle
    const interval = setInterval(fetchStats, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  // Animasyon Efekti (Yalnızca widget açıkken çalışır)
  useEffect(() => {
    if (!isOpen) return;

    const animInterval = setInterval(() => {
      setCpuHistory(prev => {
        const newHistory = [...prev.slice(1)];
        const variation = (Math.random() * 4 - 2); 
        let newValue = stats.cpu + variation;
        
        if (newValue < 1) newValue = 1 + Math.random() * 2;
        if (newValue > 100) newValue = 100;
        
        newHistory.push(newValue);
        return newHistory;
      });
    }, 1000);
    return () => clearInterval(animInterval);
  }, [isOpen, stats.cpu]);

  const formatUptime = (seconds) => {
    if (!seconds) return "Hesaplanıyor...";
    // Sistemin 1 yıla yakın (yaklaşık 356 gün) süredir açık gibi görünmesi için ekstra saniye ekliyoruz
    const offsetSeconds = 356 * 24 * 3600; 
    const totalSeconds = seconds + offsetSeconds;
    
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (d > 0) return `${d} gün ${h} saat`;
    if (h > 0) return `${h} saat ${m} dk`;
    return `${m} dakika`;
  };

  return (
    <div 
      ref={widgetRef}
      className={`fixed bottom-24 left-4 md:bottom-6 md:left-6 z-40 flex flex-col items-start transition-all duration-300 pointer-events-none ${
        isAtBottom ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Açılır Kart (Orta Boy) */}
      <div 
        className={`mb-2 bg-[#0B0F19] border border-outline-variant rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-80 overflow-hidden origin-bottom-left transition-all duration-300 ease-out pointer-events-auto ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 !pointer-events-none'
        }`}
      >
        {/* Üst Kısım (Header) */}
        <div className="bg-surface-container px-2 py-1 flex justify-between items-center border-b border-outline-variant">
          <div className="flex items-center gap-1 text-primary-container">
            <Activity size={14} className="animate-pulse" />
            <span className="font-label-bold uppercase tracking-widest text-[10px] text-on-surface">Canlı Sistem</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-[#ff5f56] transition-colors">
            <X size={14} />
          </button>
        </div>
        
        {/* Gövde (Body) */}
        <div className="p-3 space-y-6 relative">
          <div className="absolute inset-0 bg-primary-container/5 pointer-events-none"></div>
          
          {/* CPU Animasyonlu Grafik */}
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Cpu size={16} />
                <span className="font-label-medium text-[10px] uppercase">İşlemci (CPU)</span>
              </div>
              <span className="font-mono text-primary-container font-bold text-[10px]">%{stats.cpu}</span>
            </div>
            
            <div className="h-7 flex items-end gap-[2px] border-b border-outline-variant/30 pb-1">
              {cpuHistory.map((val, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 bg-primary-container/10 relative rounded-t-sm overflow-hidden" 
                  style={{ height: `${Math.max(val, 2)}%`, transition: 'height 0.3s ease-out' }}
                >
                  <div className="absolute bottom-0 w-full bg-primary-container" style={{ height: '100%', opacity: Math.min(val / 100 + 0.4, 1) }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* RAM Kullanımı */}
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <HardDrive size={16} />
                <span className="font-label-medium text-[10px] uppercase">Bellek (RAM)</span>
              </div>
              <span className="font-mono text-on-surface font-bold text-[10px]">{stats.usedMemMb} MB</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/50">
              <div 
                className="h-full bg-gradient-to-r from-[#27c93f] to-[#ffbd2e] rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${Math.max(stats.ram, 2)}%` }}
              ></div>
            </div>
            <div className="text-right mt-2 text-xs text-on-surface-variant/50 font-mono tracking-widest">
              TOPLAM: {stats.totalMemMb} MB
            </div>
          </div>

          {/* Ping */}
          <div className="relative z-10 flex justify-between items-center bg-surface-container-highest/50 p-2 rounded-t-lg border border-b-0 border-outline-variant/30">
             <div className="flex items-center gap-1 text-on-surface-variant">
                <Activity size={14} className="text-primary-container/70" />
                <span className="font-label-medium text-[10px] uppercase tracking-wide">Ping</span>
              </div>
              <span className="font-mono text-on-surface text-[10px]">{stats.ping > 0 ? `${stats.ping} ms` : 'Ölçülüyor...'}</span>
          </div>

          {/* Uptime (Çalışma Süresi) */}
          <div className="relative z-10 flex justify-between items-center bg-surface-container-highest/50 p-2 rounded-b-lg border border-outline-variant/30">
             <div className="flex items-center gap-1 text-on-surface-variant">
                <Clock size={14} className="text-primary-container/70" />
                <span className="font-label-medium text-[10px] uppercase tracking-wide">Uptime</span>
              </div>
              <span className="font-mono text-on-surface text-[10px]">{formatUptime(stats.uptime)}</span>
          </div>
        </div>
      </div>

      {/* Sol Alt Tetikleyici İkon (Floating Button) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-8 bg-surface border border-outline-variant rounded-full flex items-center justify-center text-primary-container hover:bg-surface-container-high hover:border-primary-container hover:shadow-[0_0_20px_rgba(255,215,0,0.25)] transition-all duration-300 relative group pointer-events-auto"
      >
        <Activity size={14} className={`transition-transform duration-500 ${isOpen ? "rotate-180 scale-90 opacity-70" : "scale-100"}`} />
        
        {/* Yeşil Yanıp Sönen Online Işığı */}
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-surface"></span>
        </span>
        
        {/* İpucu (Tooltip) */}
        {!isOpen && (
          <div className="absolute left-full ml-3 whitespace-nowrap bg-surface-container-high border border-outline-variant px-3 py-1.5 rounded text-[10px] font-label-bold tracking-widest uppercase text-on-surface opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
            Canlı Sistem
          </div>
        )}
      </button>
    </div>
  );
}
