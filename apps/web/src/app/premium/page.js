"use client";
import { LINKS } from '@veyronix/config';

import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { 
  Settings, CreditCard, Heart, ChevronDown, ChevronUp,
  X, Loader2, CheckCircle, PlusCircle, Server, Lock, Zap, Wallet, Sparkles, Copy, Check
} from "lucide-react";

export default function PremiumPage() {
  const { lang, t } = useLanguage();
  const { supportServer } = usePublicConfig();
  const { data: session, status } = useSession();

  // Accordion State (default open server packages)
  const [openAccordion, setOpenAccordion] = useState('server');

  // Plans & Payment Data
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Checkout Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [senderName, setSenderName] = useState("");
  const [manualSuccess, setManualSuccess] = useState(false);
  const [finalSuccess, setFinalSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoadingPlans(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPlans(false);
      });
  }, []);

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setPaymentMethod("crypto");
    setSenderName("");
    setManualSuccess(false);
    setFinalSuccess(false);
    setGeneratedCode("");
    setTermsAccepted(false);
    setShowCheckout(true);
    fetchUserServers();
    fetchBankAccounts();
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch("/api/bank-accounts");
      const data = await res.json();
      if (res.ok) {
        setBankAccounts(data);
        if (data.length > 0) setSelectedBank(data[0]);
      }
    } catch (err) {
      console.error("Banka hesapları yüklenemedi", err);
    }
  };

  const fetchUserServers = async () => {
    setIsLoadingServers(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setUserServers(data);
      } else {
        setCheckoutError(lang === 'tr' ? "Sunucular yüklenemedi." : "Failed to load servers.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(lang === 'tr' ? "Sunucular yüklenirken bir hata oluştu." : "Error loading servers.");
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleManualPurchase = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) {
      return setCheckoutError(lang === 'tr' ? "Lütfen bir sunucu seçin." : "Please select a server.");
    }
    if (!selectedBank) {
      return setCheckoutError(lang === 'tr' ? "Lütfen bir banka seçin." : "Please select a bank.");
    }
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const serverDetails = userServers.find(s => s.guild_id === selectedServer);
      const res = await fetch("/api/payment/manual-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedServer,
          guildName: serverDetails?.guild_name || "Bilinmeyen Sunucu",
          planId: selectedPlan.id,
          senderName: senderName.trim() || "Belirtilmedi",
          targetBank: selectedBank?.bank_name || "Bilinmiyor"
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedCode(data.description_code);
        setManualSuccess(true);
      } else {
        setCheckoutError(data.error || (lang === 'tr' ? "Ödeme başlatılamadı. Lütfen tekrar deneyin." : "Failed to start payment."));
      }
    } catch (err) {
      setCheckoutError(lang === 'tr' ? "Bağlantı hatası. Lütfen tekrar deneyin." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmManualPayment = async () => {
    if (!senderName || senderName.trim().length < 3) {
      alert(lang === 'tr' ? "Lütfen kart üzerindeki isminizi giriniz." : "Please enter the sender name.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payment/manual-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriptionCode: generatedCode,
          senderName: senderName.trim()
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setFinalSuccess(true);
      } else {
        alert(data.error || (lang === 'tr' ? "Onay işlemi başarısız oldu. Lütfen tekrar deneyin." : "Verification failed."));
      }
    } catch (err) {
      alert(lang === 'tr' ? "Bağlantı hatası." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) {
      return setCheckoutError(lang === 'tr' ? "Lütfen bir sunucu seçin." : "Please select a server.");
    }
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedServer, planId: selectedPlan.id })
      });
      const data = await res.json();
      
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setCheckoutError(data.error || (lang === 'tr' ? "Ödeme oluşturulamadı." : "Failed to create payment."));
      }
    } catch (err) {
      setCheckoutError(lang === 'tr' ? "Bağlantı hatası." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'iban') {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <>
      <main className="min-h-[80vh] pt-32 sm:pt-40 md:pt-48 pb-32 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[300px] bg-primary-container/10 blur-[100px] pointer-events-none rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-6 rounded-3xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <Settings className="w-10 h-10 text-primary-container" style={{ animation: 'spin 4s linear infinite' }} />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-label-bold text-xs uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(255,215,0,0.15)] relative z-10">
            <Sparkles size={14} />
            <span>{lang === 'tr' ? 'SİSTEM GÜNCELLEMESİ' : 'SYSTEM UPDATE'}</span>
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-5xl text-on-surface mb-4 font-bold tracking-tight">
            {lang === 'tr' ? 'Kısa Bir Mola' : 'Short Break'}
          </h1>
          
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed font-light">
            {lang === 'tr' 
              ? 'Sizlere çok daha iyi, dinamik ve güvenli bir altyapı sunabilmek için Premium sistemimizi kısa bir süreliğine bakıma aldık. Lütfen daha sonra tekrar uğrayın!' 
              : 'We have temporarily put our Premium system under maintenance to provide you with a much better, dynamic, and secure infrastructure. Please check back later!'}
          </p>

                {/* Trust Badges */}
                <div className="pt-2 flex justify-center items-center gap-4 text-on-surface-variant/60 text-[10px] flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} />
                    <span>256-Bit SSL Şifreleme</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} />
                    <span>Anında Otomatik Tanımlama</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
