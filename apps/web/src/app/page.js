"use client";

import Navbar from "@/components/Navbar";
import styles from "./page.module.css";
import { Shield, Users, Sword, Command, Star, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { t } = useLanguage();
  const [gifs, setGifs] = useState([]);
  const [serverCount, setServerCount] = useState(0);

  useEffect(() => {
    fetch('/api/gifs')
      .then(res => res.json())
      .then(data => setGifs(data))
      .catch(console.error);

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setServerCount(data.count || 0))
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

        <div className={`${styles.features} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
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
              <div className={styles.cmdCard}><code>/stats</code> <span>{t.cStats}</span> {renderGif('stats')}</div>
              <div className={styles.cmdCard}><code>/members</code> <span>{t.cMembers}</span> {renderGif('members')}</div>
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
    </>
  );
}
