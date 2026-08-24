"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import "../admin/admin.css"; // Keep old CSS for legacy components if any
import AdminSidebar from "../admin/components/AdminSidebar";
import AdminHeader from "../admin/components/AdminHeader";
import AdminStatsTab from "../admin/tabs/AdminStatsTab";
import AdminServersTab from "../admin/tabs/AdminServersTab";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

export default function AdminPageV2() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("servers");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States for ServersTab (Simplified for preview)
  const [servers, setServers] = useState([]);

  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === ADMIN_ID_2;

  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers");
      const data = await res.json();
      if (res.ok) setServers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      if (activeTab === "servers") fetchServers();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [activeTab, status, isAdmin, fetchServers, router]);

  if (status === "loading" || (!session && status !== "unauthenticated")) {
    return (
      <div className="flex h-screen bg-[#0f1011] items-center justify-center">
        <Loader2 className="animate-spin text-[#5865F2]" size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-[#0f1011] items-center justify-center">
        <div className="text-red-500 font-bold">Yetkisiz Erişim</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f1011] overflow-hidden font-sans">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader 
          activeTab={activeTab} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          loading={loading} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto w-full">
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20'}`}>
                {message.type === 'error' ? <AlertCircle size={20} className="mt-0.5 shrink-0" /> : <CheckCircle size={20} className="mt-0.5 shrink-0" />}
                <p className="font-medium text-sm">{message.text}</p>
              </div>
            )}

            {activeTab === "stats" && <AdminStatsTab activeServerCount={servers.filter(s => s.is_active).length} />}
            {activeTab === "servers" && (
              <AdminServersTab 
                servers={servers} 
                loading={loading} 
                setLoading={setLoading} 
                fetchServers={fetchServers} 
                showToast={showToast} 
              />
            )}
            {activeTab !== "stats" && activeTab !== "servers" && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="bg-[#2b2d31]/50 border border-[#1e1f22] rounded-2xl p-8 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white mb-2">Yapım Aşamasında 🚧</h3>
                  <p className="text-[#949ba4] text-sm">
                    Bu sekmenin modern tasarımı (Mobil + Web uyumlu versiyonu) şu an kodlanıyor. Lütfen daha sonra tekrar kontrol edin.
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
