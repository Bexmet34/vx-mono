"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, CheckCircle2, ShieldAlert, Sparkles, Tv, Clock } from "lucide-react";

export default function VotePage() {
  const { data: session, status } = useSession();
  const [countdown, setCountdown] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const adBannerRef = useRef(null);

  // Adsterra 300x250 Banner Script Entegrasyonu
  useEffect(() => {
    if (!adBannerRef.current) return;

    adBannerRef.current.innerHTML = "";

    const atOptionsScript = document.createElement("script");
    atOptionsScript.type = "text/javascript";
    atOptionsScript.text = `
      atOptions = {
        'key' : '796280c12a863eece340164e11d3973c',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "https://www.highperformanceformat.com/796280c12a863eece340164e11d3973c/invoke.js";

    adBannerRef.current.appendChild(atOptionsScript);
    adBannerRef.current.appendChild(invokeScript);

    return () => {
      if (adBannerRef.current) {
        adBannerRef.current.innerHTML = "";
      }
    };
  }, []);

  // 15 Second Timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClaim(true);
    }
  }, [countdown]);

  const handleRewardClaim = async () => {
    if (!session) {
      signIn("discord");
      return;
    }

    setVoting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVoteSuccess(true);
      } else {
        setErrorMessage(data.error || "Oy kaydedilirken hata oluştu.");
      }
    } catch (err) {
      setErrorMessage("Bağlantı hatası oluştu.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f17] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center max-w-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold">Veyronix Destek & Oy Alanı</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
            Bota Oy Ver, Premium Özellikleri Aç!
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Sponsor içeriği yüklenirken bekleyin. Süre dolduğunda buton aktifleşecektir.
          </p>
        </div>

        {/* Auth Check Card */}
        {status === "unauthenticated" && (
          <div className="w-full max-w-sm bg-[#161a26] border border-gray-800 rounded-xl p-5 mb-6 text-center shadow-xl">
            <ShieldAlert className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-bold text-base mb-1">Discord Hesabı Gerekli</h3>
            <p className="text-xs text-gray-400 mb-3">
              Oy hakkınızın hesabınızla eşleşmesi için giriş yapmalısınız.
            </p>
            <button
              onClick={() => signIn("discord")}
              className="w-full py-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-sm rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Discord ile Giriş Yap
            </button>
          </div>
        )}

        {/* Compact Ad Container Box */}
        <div className="w-full max-w-md bg-[#161a26] border border-gray-800 rounded-2xl p-4 mb-6 shadow-2xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-gray-400 text-xs mb-3 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Tv className="w-3.5 h-3.5 text-yellow-400" />
              <span>Sponsor İçeriği</span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-xs bg-gray-900 px-2.5 py-1 rounded-full border border-gray-700 text-gray-300">
              <Clock className="w-3 h-3 text-yellow-400 animate-spin" />
              <span>{canClaim ? "Süre Doldu ✅" : `${countdown}s`}</span>
            </div>
          </div>

          {/* Adsterra 300x250 Container */}
          <div
            ref={adBannerRef}
            className="w-[300px] h-[250px] bg-[#0d0f17] rounded-xl flex items-center justify-center border border-dashed border-gray-800 overflow-hidden shadow-inner"
          />
        </div>

        {/* Action Button */}
        {voteSuccess ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center max-w-md w-full">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-emerald-400 mb-1">Oy Başarıyla Verildi!</h3>
            <p className="text-xs text-gray-300">
              Oyunuz veritabanına işlendi. Discord sunucunuzda komutlarınızı kullanabilirsiniz!
            </p>
          </div>
        ) : (
          <button
            onClick={handleRewardClaim}
            disabled={status !== "authenticated" || !canClaim || voting}
            className={`w-full max-w-md py-3.5 px-6 rounded-xl font-extrabold text-base transition-all shadow-xl flex items-center justify-center gap-2 ${
              status === "authenticated" && canClaim
                ? "bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700 opacity-70"
            }`}
          >
            <Award className="w-5 h-5" />
            {voting
              ? "Oy İşleniyor..."
              : !canClaim
              ? `Süre Dolması Bekleniyor (${countdown}s)`
              : "Oyu Onayla & Ücretsiz Kullan"}
          </button>
        )}

        {errorMessage && (
          <p className="text-red-400 text-xs mt-3 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
            {errorMessage}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
