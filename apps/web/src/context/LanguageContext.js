"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const en = {
  // Navigation
  dashboard: "Dashboard",
  logout: "Logout",
  login: "Login with Discord",
  
  // Home - Hero
  heroTitle1: "Ultimate Party Management",
  heroTitle2: "for Albion Online",
  heroDesc: "Easily build your GvG, ZvZ, or Dungeon parties directly from your Discord server. Manage roles, track attendance, and always enter the battlefield prepared.",
  heroBtn: "Add to Server",
  supportBtn: "Support Server",
  
  // Home - Features
  feat1Title: "Advanced Registration",
  feat1Desc: "Auto-detect guild members. Synchronize Discord roles with in-game roles (Tank, Healer, DPS).",
  feat2Title: "Dynamic Party Builder",
  feat2Desc: "Create a party with a few clicks. Members can join or leave via Discord buttons.",
  feat3Title: "Web Dashboard",
  feat3Desc: "Control your Discord server settings, events, and member attendance stats from the web interface.",
  
  // Home - Commands
  cmdTitle: "Command List",
  cmdUser: "General Commands",
  cmdAdmin: "Administrator Commands",
  cmdOwner: "Bot Owner Commands",
  cmdProTip: "Pro Tip: Use the / (slash) key to take advantage of Discord's auto-complete feature while using commands.",
  
  // Commands Data
  cHelp: "Opens an interactive help menu containing all bot features and commands.",
  cCreate: "Opens a dynamic party creation form (Title, Origin, Roles, etc.).",
  cClose: "Allows you to manually close active parties you created.",
  cVote: "Sends the Top.gg vote link to support our bot.",
  cStats: "Shows the Albion Online (Europe) stats of the specified player.",
  cMembers: "Lists all members in your Guild alphabetically and paginated.",
  
  cSettings: "Configures server-specific language and Albion Guild ID.",
  cWhiteAdd: "Adds user to whitelist (Grants more party creation limits).",
  cWhiteRem: "Removes user from whitelist.",
  
  cSubs: "Manages subscription status of the specified server (Add/Remove days, make Unlimited).",
  cServers: "Shows a list of all servers the bot is in and their member counts.",
  
  // Dashboard
  dashWelcome: "Welcome,",
  dashSubtitle: "Welcome to the Veyronix bot management panel.",
  dashServers: "Servers You Manage",
  dashErrCreds: "System not connected to Database (🔑 Please add Supabase URL and Key to .env.local)",
  dashLoading: "Loading servers...",
  dashNoServers: "No active server subscriptions found that you manage.",
  dashUnlimited: "Unlimited Time (VIP)",
  dashExpired: "Expired",
  dashLeft: "left",
  dashPassive: "(Passive)",
  dashUnknown: "Unknown Server",
  dashManageBtn: "Manage",

  // Footer
  footerDesc: "The most advanced party management bot for Albion Online guilds.",
  footerResources: "Resources",
  footerLegal: "Legal",
  footerSocial: "Social",
  wiki: "Wiki",
  commands: "Commands",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  allRights: "All rights reserved.",
  changelog: "Changelog",
  error404Title: "404 - Page Not Found",
  error404Desc: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
  backToHome: "Back to Home",
  mesafeliSatis: "Distance Sales Agreement",
  iptalIade: "Cancellation & Refund Policy",
  hakkimizda: "About Us & Contact",
  contact: "Contact",
  address: "Address",
  phone: "Phone",
  email: "Email",
  support: "Support",
};

const tr = {
  dashboard: "Panel",
  logout: "Çıkış Yap",
  login: "Discord ile Giriş Yap",
  
  heroTitle1: "Albion Online İçin",
  heroTitle2: "Nihai Parti Yönetimi",
  heroDesc: "Discord sunucunuz üzerinden GvG, ZvZ veya Zindan partilerinizi kolayca kurun. Rolleri yönetin, katılımı takip edin ve savaş alanına her zaman hazırlıklı girin.",
  heroBtn: "Sunucuya Ekle",
  supportBtn: "Destek Sunucusu",

  feat1Title: "Gelişmiş Kayıt Sistemi",
  feat1Desc: "Guild üyelerinizi otomatik algılayın. Discord rolleriyle oyun içi rolleri (Tank, Healer, DPS) senkronize edin.",
  feat2Title: "Dinamik Party Builder",
  feat2Desc: "Birkaç tıklamayla parti kurun. Üyeler Discord üzerinden butonlarla partiye katılıp ayrılsın.",
  feat3Title: "Yönetim Paneli (Dashboard)",
  feat3Desc: "Web arayüzünden Discord sunucu ayarlarını, etkinlikleri ve üyelerin katılım istatistiklerini kontrol edin.",
  
  cmdTitle: "Komut Listesi",
  cmdUser: "Genel Kullanıcı Komutları",
  cmdAdmin: "Yönetici Komutları",
  cmdOwner: "Bot Sahibi Komutları",
  cmdProTip: "İpucu: Tüm komutları kullanırken başında / (slash) işareti kullanarak Discord'un otomatik tamamlama özelliğinden yararlanabilirsiniz.",

  cHelp: "Botun tüm özelliklerini ve komutlarını içeren interaktif yardım menüsünü açar.",
  cCreate: "Dinamik bir parti kurma formu açar (Başlık, Çıkış Yeri, Roller vb.).",
  cClose: "Kurucusu olduğunuz aktif partileri manuel olarak kapatmanızı sağlar.",
  cVote: "Botumuza destek olmak için Top.gg oy verme bağlatısını gönderir.",
  cStats: "Belirtilen oyuncunun Albion Online (Europe) istatistiklerini gösterir.",
  cMembers: "Loncanızdaki (Guild) tüm üyeleri alfabetik ve sayfalı olarak listeler.",
  
  cSettings: "Sunucuya özel dil ve Albion Guild ID yapılandırmasını yapar.",
  cWhiteAdd: "Kullanıcıyı beyaz listeye ekler (Daha fazla parti kurma izni verir).",
  cWhiteRem: "Kullanıcıyı beyaz listeden çıkarır.",
  
  cSubs: "Belirtilen sunucunun abonelik durumunu yönetir (Gün ekle/çıkar, Sınırsız yap).",
  cServers: "Botun bulunduğu tüm sunucuların listesini ve üye sayılarını gösterir.",
  
  // Dashboard
  dashWelcome: "Hoş Geldin,",
  dashSubtitle: "Veyronix bot yönetim paneline hoş geldiniz.",
  dashServers: "Yönettiğin Sunucular",
  dashErrCreds: "Sistem Henüz Veritabanına Bağlanmadı (🔑 Lütfen .env.local dosyasına Supabase URL ve Key ekleyin)",
  dashLoading: "Sunucular yükleniyor...",
  dashNoServers: "Yönettiğiniz herhangi bir aktif sunucu aboneliği bulunamadı.",
  dashUnlimited: "Sınırsız Süre (VIP)",
  dashExpired: "Süresi Doldu",
  dashLeft: "kaldı",
  dashPassive: "(Pasif)",
  dashUnknown: "Bilinmeyen Sunucu",
  dashManageBtn: "Yönet",

  // Footer
  footerDesc: "Albion Online loncaları için en gelişmiş parti yönetim botu.",
  footerResources: "Kaynaklar",
  footerLegal: "Yasal",
  footerSocial: "Sosyal",
  wiki: "Wiki",
  commands: "Komutlar",
  privacy: "Gizlilik Politikası",
  terms: "Kullanım Koşulları",
  allRights: "Tüm hakları saklıdır.",
  changelog: "Güncelleme Notları",
  error404Title: "404 - Sayfa Bulunamadı",
  error404Desc: "Aradığınız sayfa silinmiş, ismi değiştirilmiş veya geçici olarak kullanım dışı olabilir.",
  backToHome: "Ana Sayfaya Dön",
  mesafeliSatis: "Mesafeli Satış Sözleşmesi",
  iptalIade: "İptal ve İade Koşulları",
  hakkimizda: "Hakkımızda ve İletişim",
  contact: "İletişim",
  address: "Adres",
  phone: "Telefon",
  email: "E-posta",
  support: "Destek",
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("appLang");
    if (saved) setLang(saved);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => {
      const target = prev === "en" ? "tr" : "en";
      localStorage.setItem("appLang", target);
      return target;
    });
  };

  const t = lang === "en" ? en : tr;

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
