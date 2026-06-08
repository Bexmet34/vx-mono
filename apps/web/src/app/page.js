"use client";

import Navbar from "@/components/Navbar";
import styles from "./page.module.css";
import { Shield, Users, Sword, Command, Star, MessageCircle, Zap, Activity, HelpCircle, Eye } from "lucide-react";
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
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [publicServers, setPublicServers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  
  // Checkout Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);

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
    setIsLoadingServers(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setUserServers(data);
      } else {
        setCheckoutError("Sunucular yüklenemedi.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError("Sunucular yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingServers(false);
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

    fetch('/api/servers/public')
      .then(res => res.json())
      .then(data => setPublicServers(data))
      .catch(console.error);

    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(console.error);
  }, []);

  const renderGif = (cmdName) => {
    if (gifs.includes(cmdName)) {
      return (
        <div className={styles.gifTooltip}>
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
        {/* --- HERO SECTION --- */}
        <div className={`${styles.hero} animate-fade-in`}>
          <div className={styles.heroGlow}></div>
          <div className={styles.badge}>
            <Zap size={14} className={styles.badgeHighlight} />
            Veyronix v2.0 Yayında
          </div>
          <h1 className={styles.title}>
            {t.heroTitle1} 
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
              className="btn-primary delay-1 animate-fade-in" 
            >
              <Zap size={18} fill="currentColor" />
              {t.heroBtn}
            </a>
            <a
              href="https://top.gg/bot/1082239904169336902"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-topgg delay-2 animate-fade-in"
            >
              <Star size={18} fill="currentColor" />
              {t.topggBtn ?? ("top.gg'de Oyla")}
            </a>
            <a
              href="https://discord.gg/D6T3t4beqa"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-topgg delay-3 animate-fade-in"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <MessageCircle size={18} />
              {t.supportBtn}
            </a>
          </div>
        </div>

        {/* --- MARQUEE SOCIAL PROOF --- */}
        {publicServers.length > 0 && (
          <div className={`${styles.marqueeContainer} animate-fade-in delay-3`}>
            <div className={styles.marqueeTrack}>
              {[...publicServers, ...publicServers, ...publicServers].map((server, idx) => (
                <div key={idx} className={styles.marqueeItem}>
                  <Shield size={18} className={styles.checkIcon} />
                  <span>{server.length > 20 ? server.substring(0, 17) + '...' : server}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ACTIVE CAMPAIGNS --- */}
        {activeCampaigns.length > 0 && (
          <section className={`${styles.promoSection} animate-fade-in delay-2`}>
            <div className={styles.promoGrid}>
              {activeCampaigns.map((camp, idx) => (
                <div key={camp.id} className={styles.promoCard}>
                  <div className={styles.promoIcon}>
                    <Star size={24} fill="currentColor" />
                  </div>
                  <h2 className={styles.promoTitle}>{lang === 'tr' ? camp.title_tr : camp.title_en}</h2>
                  <p className={styles.promoDesc}>{lang === 'tr' ? camp.description_tr : camp.description_en}</p>
                  <a 
                    href="https://discord.gg/D6T3t4beqa" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                  >
                    {t.promoBtn}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- BENTO GRID FEATURES --- */}
        <section className={`${styles.bentoSection} animate-fade-in delay-3`}>
          <div className={styles.bentoHeader}>
            <h2>Güçlü & Yenilikçi Özellikler</h2>
            <p>Albion Online loncanızı ve partilerinizi yönetmek hiç bu kadar profesyonel olmamıştı.</p>
          </div>
          
          <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
            <div className={styles.bentoIcon}><Users size={24} /></div>
            <h3 className={styles.bentoTitle}>{t.feat1Title}</h3>
            <p className={styles.bentoDesc}>{t.feat1Desc}</p>
          </div>
          <div className={styles.bentoCard}>
            <div className={styles.bentoIcon}><Sword size={24} /></div>
            <h3 className={styles.bentoTitle}>{t.feat2Title}</h3>
            <p className={styles.bentoDesc}>{t.feat2Desc}</p>
          </div>
          <div className={styles.bentoCard}>
            <div className={styles.bentoIcon}><Shield size={24} /></div>
            <h3 className={styles.bentoTitle}>{t.feat3Title}</h3>
            <p className={styles.bentoDesc}>{t.feat3Desc}</p>
          </div>
          <div className={`${styles.bentoCard} ${styles.bentoLarge}`} style={{ background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.05) 0%, rgba(10, 10, 15, 0.5) 100%)' }}>
            <div className={styles.bentoIcon} style={{ background: 'rgba(88, 101, 242, 0.1)', color: '#5865F2' }}><Activity size={24} /></div>
            <h3 className={styles.bentoTitle}>Tam Kapsamlı KillBoard (Premium)</h3>
            <p className={styles.bentoDesc}>Her gün saat 20:00'da Albion Online KillBoard verilerini çekerek, loncanızın en iyi performans gösteren oyuncularını otomatik olarak listeler ve Discord üzerinden duyurur.</p>
          </div>
        </section>

        {/* --- BLOG SECTION --- */}
        {blogs.length > 0 && (
          <section className="animate-fade-in" style={{ width: '100%', padding: '4rem 1rem', background: 'rgba(10, 10, 15, 0.5)', borderTop: '1px solid var(--border-color)' }}>
            <div className={styles.bentoHeader}>
              <h2 style={{ fontSize: '2.5rem' }}>Son Rehberler & İpuçları</h2>
              <p>Albion Online ve Veyronix hakkında faydalı bilgiler.</p>
            </div>
            <div className={styles.blogGrid}>
              {blogs.slice(0, 3).map((blog, idx) => (
                <a href={`/blog/${blog.slug}`} key={idx} style={{ textDecoration: 'none' }}>
                  <div className={styles.bentoCard} style={{ padding: '2rem', height: '100%' }}>
                    <div className={styles.bentoIcon} style={{ background: 'rgba(88, 101, 242, 0.1)', color: '#5865F2' }}><Star size={24} /></div>
                    <h3 className={styles.bentoTitle} style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{blog.title}</h3>
                    <p className={styles.bentoDesc} style={{ fontSize: '0.95rem' }}>{blog.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* --- PRICING SECTION --- */}
        <section className={`${styles.pricingSection} animate-fade-in`}>
          <div className={styles.bentoHeader}>
            <h2>{t.pricingTitle}</h2>
            <p>{t.pricingSubtitle}</p>
          </div>

          <div className={styles.pricingGrid}>
            {loadingPlans ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <Loader2 className="spin" size={40} style={{ margin: '0 auto 1rem', color: 'var(--accent-color)' }} />
                Yükleniyor...
              </div>
            ) : plans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                Şu anda aktif paket bulunmamaktadır.
              </div>
            ) : plans.map((plan) => {
              const features = lang === 'tr' ? (plan.features_tr || []) : (plan.features_en || []);
              
              return (
                <div key={plan.id} className={`${styles.pricingCard} ${plan.is_featured ? styles.featured : ''}`}>
                  {plan.is_featured && <div className={styles.bestSellerBadge}>{t.bestSeller}</div>}
                  <h3 className={styles.priceTitle}>{lang === 'tr' ? plan.name_tr : plan.name_en}</h3>
                  <div className={styles.priceValue}>{plan.amount}<span>USDT</span></div>
                  <ul className={styles.featureList}>
                    {features.map((feat, idx) => (
                      <li key={idx} className={styles.featureItem}><Star size={16} className={styles.checkIcon} /> {feat}</li>
                    ))}
                  </ul>
                  <button className="btn-primary" onClick={() => handleBuyClick(plan.id)}>
                    {t.buyNow}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- HOW IT WORKS & FAQ SECTION --- */}
        <section className={`${styles.faqSection} animate-fade-in`} style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className={styles.bentoHeader}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nasıl Çalışır? & SSS</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
              Veyronix'i kurmak ve kullanmaya başlamak saniyeler sürer. İşte 3 basit adım:
            </p>
          </div>

          {/* 3-Step Onboarding */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '3rem', marginBottom: '4rem' }}>
            <div style={{ background: 'linear-gradient(180deg, rgba(88, 101, 242, 0.1) 0%, rgba(10, 10, 15, 0.5) 100%)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(88, 101, 242, 0.2)', textAlign: 'center' }}>
              <div style={{ background: '#5865F2', color: '#fff', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(88, 101, 242, 0.3)' }}>
                <Zap size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>1. Botu Ekleyin</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Veyronix'i Discord sunucunuza davet edin. Kurulum saniyeler içinde tamamlanır ve hemen kullanıma hazırdır.</p>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(252, 163, 17, 0.1) 0%, rgba(10, 10, 15, 0.5) 100%)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(252, 163, 17, 0.2)', textAlign: 'center' }}>
              <div style={{ background: 'var(--accent-color)', color: '#000', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(252, 163, 17, 0.3)' }}>
                <Shield size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>2. Ayarları Yapın</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}><code>/settings</code> veya <code>/setup-guild</code> komutlarıyla dilinizi seçin, yetkili rollerini ve Albion loncanızı bağlayın.</p>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(46, 204, 113, 0.1) 0%, rgba(10, 10, 15, 0.5) 100%)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(46, 204, 113, 0.2)', textAlign: 'center' }}>
              <div style={{ background: '#2ecc71', color: '#000', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 20px rgba(46, 204, 113, 0.3)' }}>
                <Sword size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>3. Partini Kur</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Savaşa hazırsınız! <code>/createparty</code> yazarak dinamik ZvZ veya PVE partinizi oluşturun ve üyeleri toplamaya başlayın.</p>
            </div>
          </div>
          
          <div className={styles.bentoHeader}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sıkça Sorulan Sorular</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>1</span>
                {t.faqQ1}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {t.faqA1}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>2</span>
                {t.faqQ2}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {t.faqA2}
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>3</span>
                {t.faqQ3}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {t.faqA3}
              </p>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>4</span>
                {t.faqQ4}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {t.faqA4}
              </p>
            </div>
          </div>
        </section>

        {/* --- COMMANDS SECTION --- */}
        <section className={`${styles.commandsSection} animate-fade-in`}>
          <div className={styles.container}>
            <div className={styles.commandsHeader}>
              <Command size={48} className={styles.badgeHighlight} style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{t.cmdTitle}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem' }}>Veyronix'in gücünü keşfedin.</p>
            </div>
            
            <div className={styles.commandCategory}>
              <h3><Users size={20} /> {t.cmdUser}</h3>
              <div className={styles.commandGrid}>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/help</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('help')}</div>
                  </div>
                  <span>{t.cHelp}</span>
                </div>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/createparty</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('createparty')}</div>
                  </div>
                  <span>{t.cCreate}</span>
                </div>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/closeparty</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('closeparty')}</div>
                  </div>
                  <span>{t.cClose}</span>
                </div>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/vote</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('vote')}</div>
                  </div>
                  <span>{t.cVote}</span>
                </div>
              </div>
            </div>

            <div className={styles.commandCategory}>
              <h3><Shield size={20} /> {t.cmdAdmin}</h3>
              <div className={styles.commandGrid}>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/settings</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('settings')}</div>
                  </div>
                  <span>{t.cSettings}</span>
                </div>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/whitelistadd</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('whitelistadd')}</div>
                  </div>
                  <span>{t.cWhiteAdd}</span>
                </div>
                <div className={styles.cmdCard}>
                  <div className={styles.cmdHeader}>
                    <code>/whitelistremove</code>
                    <div className={styles.gifTrigger}><Eye size={18} />{renderGif('whitelistremove')}</div>
                  </div>
                  <span>{t.cWhiteRem}</span>
                </div>
              </div>
            </div>

            <div className={styles.proTip}>
              <HelpCircle size={24} className={styles.proTipIcon} />
              <p>{t.cmdProTip}</p>
            </div>
          </div>
        </section>

        {/* Top.gg Widget */}
        <section style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0 4rem 0' }}>
          <a href="https://top.gg/bot/1082239904169336902" target="_blank" rel="noopener noreferrer" style={{ transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="https://top.gg/api/widget/1082239904169336902.svg" alt="Top.gg Widget" height="120" style={{ borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(88, 101, 242, 0.3)' }} />
          </a>
        </section>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div onClick={() => setShowCheckout(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="animate-fade-in glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2.5rem', maxWidth: '420px', width: '90%', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Ödeme Yap</h2>
              <button onClick={() => setShowCheckout(false)} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Premium ayrıcalıklarını aktif etmek istediğiniz sunucuyu seçin. Sistem sizi güvenli kripto ödeme sayfasına (Cryptomus) yönlendirecektir.
            </p>

            {checkoutError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.8rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {checkoutError}
              </div>
            )}

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>Hedef Sunucu</label>
              
              {isLoadingServers ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                  <Loader2 className="spin" size={18} /> Sunucular yükleniyor...
                </div>
              ) : (
                <>
                  <select 
                    value={selectedServer}
                    onChange={e => setSelectedServer(e.target.value)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '1rem', outline: 'none', fontFamily: 'inherit' }}
                  >
                    <option value="">-- Sunucu Seçin --</option>
                    {userServers.map(s => (
                      <option key={s.guild_id} value={s.guild_id}>{s.guild_name}</option>
                    ))}
                  </select>
                  {userServers.length === 0 && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Sistemde aktif bir sunucunuz bulunamadı. Lütfen önce botu Discord sunucunuza ekleyin.</p>
                      <a href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        Botu Sunucuna Ekle
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }} 
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
