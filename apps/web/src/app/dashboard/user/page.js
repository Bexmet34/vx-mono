"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Settings, Copy, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import UserTemplatesTab from "./components/UserTemplatesTab";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [templates, setTemplates] = useState([]);
  
  const { toasts, showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch(`/api/user-templates`);
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
        setIsPremium(data.isPremium || false);
      } else {
        showToast(data.error || "Failed to load templates", "error");
      }
    } catch (err) {
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  }, [status, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (status === "loading" || !session) {
    return (
      <>
        <Navbar isStatic={true} />
        <div className="min-h-screen flex items-center justify-center">
          <Logo className="w-20 h-20 animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isStatic={true} />
      <main className="pt-32 pb-20 min-h-screen max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <ToastContainer toasts={toasts} />

        <div className="mb-3 border-b border-white/5 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-1 relative z-10">
            <div className="flex items-center gap-1">
              <div className="w-20 h-20 bg-surface-container-high border border-outline flex items-center justify-center font-headline-md text-lg text-on-surface uppercase shadow-2xl relative overflow-hidden group">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <h1 className="font-headline-xl text-4xl text-on-surface tracking-tight m-0">{session.user?.name}</h1>
                  {isPremium ? (
                    <span className="bg-primary-container text-on-primary font-label-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                      PREMIUM
                    </span>
                  ) : (
                    <span className="bg-surface-variant text-on-surface-variant border border-outline-variant font-label-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm">
                      FREEMIUM
                    </span>
                  )}
                </div>
                <p className="font-label-bold text-[10px] text-primary-container tracking-widest uppercase">{lang === 'tr' ? 'Bireysel Profil' : 'Individual Profile'}</p>
              </div>
            </div>
            
            <nav className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 w-full md:w-auto mt-2 md:mt-0">
              <button 
                className={`flex items-center gap-2 px-2 py-1 rounded-full font-label-bold text-[10px] transition-all whitespace-nowrap ${activeTab === 'templates' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} 
                onClick={() => setActiveTab('templates')}
              >
                <Copy size={16} /> {lang === 'tr' ? 'Kişisel Şablonlar' : 'Personal Templates'}
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-container" size={48} />
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'templates' && (
              <UserTemplatesTab 
                t={t} 
                lang={lang} 
                templates={templates} 
                setTemplates={setTemplates} 
                isPremium={isPremium} 
                showToast={showToast} 
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
