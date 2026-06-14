"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function DemoReklamPage() {
    const [timeLeft, setTimeLeft] = useState(15);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0E14] text-white p-2 font-sans overflow-x-hidden">
            
            {/* Adsterra Popunder Script */}
            <Script 
                src="https://pl29746072.effectivecpmnetwork.com/6d/1d/7d/6d1d7d7f928f5303a220767bfc6a6f5e.js" 
                strategy="afterInteractive" 
            />

            {/* Adsterra Native Banner/Social Bar Script (Loads Once) */}
            <Script 
                src="https://pl29746098.effectivecpmnetwork.com/76065e7d3fa28e6d941142b176377f08/invoke.js" 
                strategy="afterInteractive"
                data-cfasync="false"
            />

            {/* TOP AD CONTAINER */}
            <div className="w-full max-w-sm mb-4 min-h-[50px] flex items-center justify-center">
                <div id="container-76065e7d3fa28e6d941142b176377f08"></div>
            </div>

            {/* KART KÜÇÜLTÜLDÜ: max-w-md -> max-w-sm, p-8 -> p-6 */}
            <div className="bg-[#151921] border border-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-blue-500/10 blur-[40px] pointer-events-none"></div>

                <div className="mb-4 relative z-10">
                    <span className="text-3xl block mb-2">🛡️</span>
                    <h1 className="text-xl font-bold mb-1">Güvenlik Doğrulaması</h1>
                    <p className="text-gray-400 text-xs">
                        Bot sistemini kullanmak için lütfen işlemin tamamlanmasını bekleyin. Bu sayfada beklemeniz yeterlidir.
                    </p>
                </div>

                <div className="bg-[#0B0E14] rounded-xl p-4 mb-5 border border-gray-800 relative z-10">
                    {timeLeft > 0 ? (
                        <div>
                            <div className="text-4xl font-mono font-bold text-yellow-500 mb-1 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                                {timeLeft}
                            </div>
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Saniye Kaldı</div>
                        </div>
                    ) : (
                        <div className="animate-in zoom-in duration-300">
                            <div className="text-4xl font-mono font-bold text-green-500 mb-1 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                                ✓
                            </div>
                            <div className="text-green-500 text-xs font-bold tracking-wide uppercase">Doğrulama Tamamlandı</div>
                        </div>
                    )}
                </div>

                <button 
                    disabled={timeLeft > 0}
                    onClick={() => {
                        alert("Harika! Gerçek sistemde bu butona basıldığında yetki verilecek ve Discord'a yönlendirilecek.");
                    }}
                    className={`relative z-10 w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 text-xs uppercase tracking-wider ${
                        timeLeft > 0 
                        ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-700/50' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-500/50'
                    }`}
                >
                    {timeLeft > 0 ? 'Lütfen Bekleyin...' : '🚀 Bota Geri Dön'}
                </button>
            </div>
            
            {/* BOTTOM AD CONTAINER */}
            <div className="w-full max-w-sm mt-4 min-h-[50px] flex items-center justify-center">
                <div id="container-76065e7d3fa28e6d941142b176377f08"></div>
            </div>

            <p className="text-gray-600 text-[10px] mt-4 max-w-xs text-center">
                Sayfada rastgele bir yere tıkladığınızda sponsor reklamları açılabilir. Bu, sistemin ücretsiz kalmasını sağlar.
            </p>
        </div>
    );
}
