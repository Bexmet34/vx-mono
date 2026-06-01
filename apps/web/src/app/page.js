"use client";

import Navbar from "@/components/Navbar";
import styles from "./page.module.css";
import { Shield, Users, Sword, Command, Star, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2, X } from "lucide-react";

export default function Home() {
  const { lang, t } = useLanguage();
  const { data: session, status } = useSession();
  const [gifs, setGifs] = useState([]);
  const [serverCount, setServerCount] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  
  // Checkout Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleBuyClick = (planId) => {
    if (status !== "authenticated") {
      signIn("discord");
      return;
    }
    setSelectedPlan(planId);
    setShowCheckout(true);
    fetchUserServers();
  };

  const fetchUserServers = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setUserServers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedServer) return setCheckoutError("Lütfen bir sunucu seçin.");
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedServer, planId: selectedPlan })
      });
      const data = await res.json();
      
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setCheckoutError(data.error || "Ödeme oluşturulamadı.");
      }
    } catch (err) {
      setCheckoutError("Bağlantı hatası.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetch('/api/gifs')
      .then(res => res.json())
      .then(data => setGifs(data))
      .catch(console.error);

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setServerCount(data.count || 0))
      .catch(console.error);

    fetch('/api/campaigns/active')
      .then(res => res.json())
      .then(data => setActiveCampaigns(data.filter(c => c.show_on_home)))
      .catch(console.error);
  }, []);

  const renderGif = (cmdName) => {
    if (gifs.includes(cmdName)) {
      return (
        <div className={styles.gifWrapper}>
          <img src={`/gif/${cmdName}.gif`} alt={`${cmdName} command`} className={styles.gifImage} />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`${styles.hero} animate-fade-in`}>
          <div className={styles.heroGlow}></div>
          <h1 className={styles.title}>
            {t.heroTitle1} <br />
            <span className={styles.highlight}>{t.heroTitle2}</span>
          </h1>
          <p className={styles.description}>
            {t.heroDesc}
          </p>
          <div className={styles.cta}>
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary" 
              style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {t.heroBtn}
            </a>
            <a
              href="https://top.gg/bot/1082239904169336902"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-topgg"
            >
              <Star size={18} fill="currentColor" />
              {t.topggBtn ?? ("top.gg'de Oyla")}
            </a>
            <a
              href="https://discord.gg/D6T3t4beqa"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-topgg"
              style={{ background: 'rgba(88, 101, 242, 0.1)', borderColor: '#5865F2', color: '#fff' }}
            >
              <MessageCircle size={18} fill="currentColor" />
              {t.supportBtn}
            </a>
          </div>
          
          <div className={styles.statsContainer} style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <Users size={20} className={styles.featureIcon} style={{ margin: 0 }} />
              <span style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text)' }}>
                {serverCount > 0 ? `${serverCount} Sunucuda Aktif` : "Sunucu sayısı yükleniyor..."}
              </span>
            </div>
            
            <a href="https://top.gg/bot/1082239904169336902" target="_blank" rel="noopener noreferrer" className={styles.widgetLink} style={{ transition: 'transform 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <img src="https://top.gg/api/widget/1082239904169336902.svg" alt="Top.gg Widget" height="120" style={{ borderRadius: '8px' }} />
            </a>
          </div>
        </div>

        {/* Active Campaigns Showcase */}
        {activeCampaigns.length > 0 && (
          <div className={`${styles.promoSection} animate-fade-in`}>
            {activeCampaigns.map((camp, idx) => (
              <div key={camp.id} className={styles.promoCard}>
                <div className={styles.promoBadge}>{t.promoBadge}</div>
                <Star size={32} className={styles.promoIcon} fill="#fca311" />
                <h2 className={styles.promoTitle}>{lang === 'tr' ? camp.title_tr : camp.title_en}</h2>
                <p className={styles.promoDesc}>{lang === 'tr' ? camp.description_tr : camp.description_en}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: 'auto' }}>
                  <a 
                    href="https://discord.gg/D6T3t4beqa" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.5rem', background: '#5865F2', borderColor: '#5865F2', fontSize: '0.9rem' }}
                  >
                    {t.promoBtn}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`${styles.pricingSection} animate-fade-in`} style={{ animationDelay: '0.3s' }}>
          <div className={styles.pricingHeader}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t.pricingTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t.pricingSubtitle}</p>
          </div>

          <div className={styles.pricingGrid}>
            {/* 7 Days */}
            <div className={`${styles.pricingCard} glass-panel`}>
              <h3 className={styles.priceTitle}>{t.sevenDays}</h3>
              <div className={styles.priceValue}>1.00 <span>USDT</span></div>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Sword size={18} className={styles.checkIcon} /> {t.featParty}</li>
                <li className={styles.featureItem}><Command size={18} className={styles.checkIcon} /> {t.featLimit}</li>
                <li className={styles.featureItem}><Users size={18} className={styles.checkIcon} /> {t.featDash}</li>
                <li className={styles.featureItem}><Shield size={18} className={styles.checkIcon} /> {t.featSupport}</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => handleBuyClick('7_days')}>
                {t.buyNow}
              </button>
            </div>

            {/* 1 Month */}
            <div className={`${styles.pricingCard} glass-panel`}>
              <h3 className={styles.priceTitle}>{t.oneMonth}</h3>
              <div className={styles.priceValue}>3.00 <span>USDT</span></div>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Sword size={18} className={styles.checkIcon} /> {t.featParty}</li>
                <li className={styles.featureItem}><Command size={18} className={styles.checkIcon} /> {t.featLimit}</li>
                <li className={styles.featureItem}><Users size={18} className={styles.checkIcon} /> {t.featDash}</li>
                <li className={styles.featureItem}><Shield size={18} className={styles.checkIcon} /> {t.featSupport}</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => handleBuyClick('1_month')}>
                {t.buyNow}
              </button>
            </div>

            {/* 3 Months - BEST SELLER */}
            <div className={`${styles.pricingCard} ${styles.featured} glass-panel`}>
              <div className={styles.bestSellerBadge}>{t.bestSeller}</div>
              <h3 className={styles.priceTitle}>{t.threeMonths}</h3>
              <div className={styles.priceValue}>8.00 <span>USDT</span></div>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Sword size={18} className={styles.checkIcon} /> {t.featParty}</li>
                <li className={styles.featureItem}><Command size={18} className={styles.checkIcon} /> {t.featLimit}</li>
                <li className={styles.featureItem}><Users size={18} className={styles.checkIcon} /> {t.featDash}</li>
                <li className={styles.featureItem}><Shield size={18} className={styles.checkIcon} /> {t.featSupport}</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => handleBuyClick('3_months')}>
                {t.buyNow}
              </button>
            </div>

            {/* 1 Year */}
            <div className={`${styles.pricingCard} glass-panel`}>
              <h3 className={styles.priceTitle}>{t.oneYear}</h3>
              <div className={styles.priceValue}>25.00 <span>USDT</span></div>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Sword size={18} className={styles.checkIcon} /> {t.featParty}</li>
                <li className={styles.featureItem}><Command size={18} className={styles.checkIcon} /> {t.featLimit}</li>
                <li className={styles.featureItem}><Users size={18} className={styles.checkIcon} /> {t.featDash}</li>
                <li className={styles.featureItem}><Shield size={18} className={styles.checkIcon} /> {t.featSupport}</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => handleBuyClick('1_year')}>
                {t.buyNow}
              </button>
            </div>

          </div>
        </div>

        <div className={`${styles.features} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
          <div className={`${styles.featureCard} glass-panel`}>
            <Users className={styles.featureIcon} size={32} />
            <h3 className={styles.featureTitle}>{t.feat1Title}</h3>
            <p className={styles.featureDesc}>{t.feat1Desc}</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <Sword className={styles.featureIcon} size={32} />
            <h3 className={styles.featureTitle}>{t.feat2Title}</h3>
            <p className={styles.featureDesc}>{t.feat2Desc}</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <Shield className={styles.featureIcon} size={32} />
            <h3 className={styles.featureTitle}>{t.feat3Title}</h3>
            <p className={styles.featureDesc}>{t.feat3Desc}</p>
          </div>
        </div>


        <div className={`${styles.commandsSection} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
          <div className={styles.commandsHeader}>
            <Command size={28} className={styles.featureIcon} style={{ margin: 0 }} />
            <h2 style={{ fontSize: '2rem' }}>{t.cmdTitle}</h2>
          </div>
          
          <div className={styles.commandCategory}>
            <h3>⚔️ {t.cmdUser}</h3>
            <div className={styles.commandGrid}>
              <div className={styles.cmdCard}><code>/help</code> <span>{t.cHelp}</span> {renderGif('help')}</div>
              <div className={styles.cmdCard}><code>/createparty</code> <span>{t.cCreate}</span> {renderGif('createparty')}</div>
              <div className={styles.cmdCard}><code>/closeparty</code> <span>{t.cClose}</span> {renderGif('closeparty')}</div>
              <div className={styles.cmdCard}><code>/vote</code> <span>{t.cVote}</span> {renderGif('vote')}</div>
            </div>
          </div>

          <div className={styles.commandCategory}>
            <h3>⚙️ {t.cmdAdmin}</h3>
            <div className={styles.commandGrid}>
              <div className={styles.cmdCard}><code>/settings</code> <span>{t.cSettings}</span> {renderGif('settings')}</div>
              <div className={styles.cmdCard}><code>/whitelistadd</code> <span>{t.cWhiteAdd}</span> {renderGif('whitelistadd')}</div>
              <div className={styles.cmdCard}><code>/whitelistremove</code> <span>{t.cWhiteRem}</span> {renderGif('whitelistremove')}</div>
            </div>
          </div>


          <div className={styles.proTip}>
            <p>{t.cmdProTip}</p>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="admin-modal-overlay" onClick={() => setShowCheckout(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="admin-modal animate-slide-up" onClick={e => e.stopPropagation()} style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Ödeme Yap</h2>
              <button onClick={() => setShowCheckout(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Premium ayrıcalıklarını aktif etmek istediğiniz sunucuyu seçin. Sistem sizi güvenli kripto ödeme sayfasına (Cryptomus) yönlendirecektir.
            </p>

            {checkoutError && (
              <div style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {checkoutError}
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Hedef Sunucu</label>
              <select 
                value={selectedServer}
                onChange={e => setSelectedServer(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' }}
              >
                <option value="">-- Sunucu Seçin --</option>
                {userServers.map(s => (
                  <option key={s.guild_id} value={s.guild_id}>{s.guild_name}</option>
                ))}
              </select>
              {userServers.length === 0 && (
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem' }}>Yüklenecek sunucu bulunamadı veya yetkiniz yok.</p>
              )}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
              onClick={handleConfirmPurchase}
              disabled={isProcessing || !selectedServer}
            >
              {isProcessing ? <Loader2 className="spin" size={20} /> : "Ödemeye Geç (USDT)"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
