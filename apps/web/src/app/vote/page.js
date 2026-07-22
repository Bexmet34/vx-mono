"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, CheckCircle2, ShieldAlert, Sparkles, Tv, Play, Volume2, VolumeX, Check } from "lucide-react";

export default function VotePage() {
  const { data: session, status } = useSession();
  const [canClaim, setCanClaim] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [voting, setVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef(null);

  // Tanıtım / Sponsor Video Bağlantısı (İstediğiniz MP4 video adresini buraya koyabilirsiniz)
  const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

  // Video oynatılırken ilerlemeyi takip et
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    const percentage = Math.floor((current / duration) * 100);
    setProgress(percentage);
  };

  // Video Bittiğinde (onEnded) Çalışacak ve Oy Butonunu Açacak Fonksiyon
  const handleVideoEnded = () => {
    setVideoWatched(true);
    setCanClaim(true);
    setVideoPlaying(false);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
            Videoyu İzle, Ücretsiz Oy Ver!
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Aşağıdaki videoyu sonuna kadar izleyin. Video tamamlandığında oy butonunuz otomatik olarak aktifleştirecektir.
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

        {/* Custom HTML5 Video Player Box */}
        <div className="w-full max-w-lg bg-[#161a26] border border-gray-800 rounded-2xl p-4 mb-6 shadow-2xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full text-gray-400 text-xs mb-3 px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Tv className="w-3.5 h-3.5 text-yellow-400" />
              <span>Sponsorlu Tanıtım Videosu</span>
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-xs bg-gray-900 px-2.5 py-1 rounded-full border border-gray-700 text-gray-300">
              {videoWatched ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> İzleme Tamamlandı
                </span>
              ) : (
                <span>İlerleme: %{progress}</span>
              )}
            </div>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-[#0d0f17] rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center group shadow-inner">
            <video
              ref={videoRef}
              src={videoSrc}
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              className="w-full h-full object-cover"
            />

            {/* Initial Play Overlay Button */}
            {!videoPlaying && !videoWatched && (
              <button
                onClick={handlePlayVideo}
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-all hover:bg-black/50 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg shadow-yellow-500/30 transform transition group-hover:scale-110">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <span className="text-sm font-bold mt-3 tracking-wide text-yellow-400">
                  Videoyu Başlatmak İçin Tıklayın
                </span>
              </button>
            )}

            {/* Mute/Unmute Controls Overlay */}
            {videoPlaying && (
              <button
                onClick={toggleMute}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full border border-gray-700 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              </button>
            )}

            {/* Video Completed Overlay Banner */}
            {videoWatched && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-emerald-400 font-extrabold text-base mb-1">
                  Tebrikler! Video Tamamlandı
                </p>
                <p className="text-gray-300 text-xs max-w-xs">
                  Aşağıdaki butona basarak oyunuzu onaylayabilir ve ayrıcalıklarınızı hemen aktif edebilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${videoWatched ? "bg-emerald-500" : "bg-yellow-400"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
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
              ? "Videoyu Sonuna Kadar İzleyin..."
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
