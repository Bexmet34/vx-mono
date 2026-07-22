"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import Script from "next/script";
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
      {/* Adsterra Social Bar Test Script */}
      <Script
        src="https://pl30489132.effectivecpmnetwork.com/a0/03/09/a00309c9dbe2b85ac1210cf18697ba76.js"
        strategy="afterInteractive"
      />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-container mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Veyronix Destek & Oy Alanı</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Bota Oy Ver, Premium Özellikleri Aç!
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Aşağıdaki sponsor içeriği ve reklamlar yüklenirken lütfen bekleyin. Süre dolduğunda oy butonunuz otomatik olarak aktifleştirecektir.
          </p>
        </div>

        {/* Auth Check Card */}
        {status === "unauthenticated" && (
          <div className="w-full max-w-md bg-[#161a26] border border-gray-800 rounded-xl p-6 mb-8 text-center shadow-xl">
            <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Discord Hesabı Gerekli</h3>
            <p className="text-sm text-gray-400 mb-4">
              Oy hakkınızın Discord hesabınızla eşleşebilmesi için giriş yapmalısınız.
            </p>
            <button
              onClick={() => signIn("discord")}
              className="w-full py-3 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Discord ile Giriş Yap
            </button>
          </div>
        )}

        {/* Ad Container Box */}
        <div className="w-full bg-[#161a26] border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-gray-400 text-sm mb-4 px-2">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary-container" />
              <span>Adsterra Sponsor İçeriği / Social Bar</span>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-xs bg-gray-900/80 px-3 py-1 rounded-full border border-gray-700">
              <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              <span>{canClaim ? "Süre Doldu ✅" : `Kalan Süre: ${countdown}s`}</span>
            </div>
          </div>

          <div className="w-full py-8 text-center text-gray-400 border border-dashed border-gray-800 rounded-xl bg-[#0d0f17]">
            <p className="text-sm font-medium text-gray-300">Social Bar Reklam Formatı Aktif</p>
            <p className="text-xs text-gray-500 mt-1">
              Reklamlar sayfanın altında / bildirim baloncuğu olarak görüntülenecektir.
            </p>
          </div>
        </div>

        {/* Action Button */}
        {voteSuccess ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center max-w-md w-full">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold text-emerald-400 mb-1">Oy Başarıyla Verildi!</h3>
            <p className="text-sm text-gray-300">
              Oyunuz veritabanına işlendi. Discord sunucunuzda `/createparty` komutunu hemen kullanabilirsiniz!
            </p>
          </div>
        ) : (
          <button
            onClick={handleRewardClaim}
            disabled={status !== "authenticated" || !canClaim || voting}
            className={`px-8 py-4 rounded-xl font-extrabold text-lg transition-all shadow-xl flex items-center gap-3 ${
              status === "authenticated" && canClaim
                ? "bg-gradient-to-r from-primary to-primary-container text-white hover:scale-105 active:scale-95 cursor-pointer shadow-primary/20"
                : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
            }`}
          >
            <Award className="w-6 h-6" />
            {voting
              ? "Oy İşleniyor..."
              : !canClaim
              ? `Süre Dolması Bekleniyor (${countdown}s)`
              : "Oyu Onayla & Ücretsiz Kullan"}
          </button>
        )}

        {errorMessage && (
          <p className="text-red-400 text-sm mt-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            {errorMessage}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
