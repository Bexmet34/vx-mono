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
  teslimatKosullari: "Delivery Policy",
  hakkimizda: "About Us & Contact",
  contact: "Contact",
  address: "Address",
  phone: "Phone",
  email: "Email",
  support: "Support",
  pricingTitle: "Premium Plans",
  pricingSubtitle: "Unlock the full potential of your Discord server",
  sevenDays: "7 Days",
  oneMonth: "1 Month",
  threeMonths: "3 Months",
  oneYear: "1 Year",
  bestSeller: "Best Seller",
  buyNow: "Buy Now",
  paybePending: "Payment unavailable (Waiting for Paybe approval)",
  allFeatures: "All Features Included",
  featParty: "Advanced Party System",
  featLimit: "Unlimited Party Creation",
  featDash: "Full Web Dashboard Access",
  featSupport: "Priority Discord Support",

  // Dashboard Settings
  dOverview: "Overview",
  dGeneral: "General Settings",
  dVisual: "Visual Identity",
  dAccess: "Access Control",
  dTemplates: "Templates",
  dKillBoard: "KillBoard",
  dRegistration: "Registration",
  dSave: "Save Settings",
  dSaving: "Saving...",
  dWelcome: "Welcome Back!",
  dWelcomeDesc: "Manage your Albion Online community with ease. Here is a quick summary of your bot status.",
  dSubStatus: "Subscription Status",
  dActive: "ACTIVE",
  dExpired: "EXPIRED",
  dRemaining: "Remaining Time:",
  dDays: "Days",
  dHours: "Hours",
  dQuickAccess: "Quick Access",
  dQuickDesc: "Check your most important settings.",
  dGeneralDesc: "Configure the basic operations of your server from here.",
  dBotLang: "Bot Language",
  dBotLangDesc: "Sets the language for messages the bot will send in the server.",
  dAutoRole: "Auto Role Sync",
  dAutoRoleDesc: "Automatically syncs guild members' roles with their in-game roles.",
  dGuildId: "Albion Guild ID",
  dGuildIdDesc: "Enter your Albion Online guild ID here.",

  promoTitle: "Get 30 Days Free!",
  promoDesc: "To help you experience the full power of Veyronix, we're giving away 30 days of premium to everyone who joins our support server!",
  promoBtn: "Join & Claim Reward",
  promoBadge: "Gift",

  dRedeemTitle: "Redeem Promo Code",
  dRedeemDesc: "Enter your special promo code here to extend your subscription.",
  dRedeemPlaceholder: "Enter code (e.g. 30DAILY)",
  dRedeemBtn: "Redeem",
  dRedeemSuccess: "Success! Your subscription has been extended.",
  dRedeemError: "Error! Invalid or expired code.",
  
  // FAQ
  faqTitle: "How It Works & FAQ",
  faqSubtitle: "Adding and configuring Veyronix to your Discord server takes seconds. Here are the most frequently asked questions about installation and usage.",
  faqQ1: "How to install Veyronix?",
  faqA1: "Use the 'Add to Server' button above to invite the Veyronix bot to your server. After selecting a server where you have administrator privileges, the automatic installation will be completed. Then, you can quickly start using it by setting your guild information (Guild Name) and channels with the `/settings` command within Discord.",
  faqQ2: "How does the Killboard feature work?",
  faqA2: "When you purchase a premium plan, the system automatically connects to Albion Online's official API every evening and pulls your guild's current Killboard statistics (PvE, PvP kill data, deaths). It sends this data to your designated log channel in a detailed and visually rich way (Embed message format). Moreover, this feature is completely autonomous.",
  faqQ3: "What does Party System Management offer?",
  faqA3: "You can create special parties for Guild events (ZvZ, Fame Farm, Roaming, etc.). Players who want to join the party created with the `/createparty` command can choose their roles (Tank, DPS, Healer) via interactive buttons. When the party is full, the leader can close participation or open an extra slot with a special command. All organization is done within Discord.",
  faqQ4: "Are payments secure?",
  faqA4: "All our Premium transactions are secured with the Cryptomus infrastructure. You can make completely anonymous and 100% secure payments via USDT and other supported crypto assets. Your subscription automatically becomes active on your Discord server within seconds after the payment is confirmed on the blockchain. No manual action is required.",

  // Marquee
  marqueeTitle: "Communities Trusting Veyronix",
  
  // Blog
  blogHeaderTitle: "Latest Guides & Tips",
  blogHeaderDesc: "Useful information about Albion Online and Veyronix.",

  // How it works
  faqMainTitle: "How It Works & FAQ",
  faqMainDesc: "Setting up and starting to use Veyronix takes seconds. Here are 3 simple steps:",
  step1Title: "1. Add the Bot",
  step1Desc: "Invite Veyronix to your Discord server. Installation takes seconds and it's ready to use immediately.",
  step2Title: "2. Configure Settings",
  step2Desc: "Select your language, link admin roles and your Albion guild using /settings or /setup-guild commands.",
  step3Title: "3. Build Your Party",
  step3Desc: "Ready for battle! Type /createparty to create your dynamic ZvZ or PVE party and start gathering members.",
  
  // Checkout Modal Additions
  checkoutTargetServer: "Target Server",
  checkoutSelectServer: "-- Select a Server --",
  checkoutLoading: "Loading servers...",
  checkoutNoServerText: "No active server found in the system. Please add the bot to your Discord server first.",
  checkoutAddBotBtn: "Add Bot to Server",

  blog: "Blog",
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

  dGeneralDesc: "Sunucunuzun temel işleyişini buradan yapılandırın.",
  dBotLang: "Bot Dili",
  dBotLangDesc: "Botun sunucuda vereceği mesajların dilini belirler.",
  dAutoRole: "Otomatik Rol Senkronizasyonu",
  dAutoRoleDesc: "Guild üyelerinin rollerini otomatik olarak oyun içi rolleriyle eşitler.",
  dGuildId: "Albion Guild ID",
  dGuildIdDesc: "Albion Online guild ID'nizi buraya girin.",
  
  dQuickDesc: "En önemli ayarlarınıza hızlıca göz atın.",
  dGeneralDesc: "Sunucunuzun temel işleyişini buradan yapılandırın.",
  dBotLang: "Bot Dili",
  dBotLangDesc: "Botun sunucuda vereceği mesajların dilini belirler.",
  dAutoRole: "Otomatik Rol Senkronizasyonu",
  dAutoRoleDesc: "Guild üyelerinin rollerini otomatik olarak oyun içi rolleriyle eşitler.",
  dGuildId: "Albion Guild ID",
  dGuildIdDesc: "Albion Online guild ID'nizi buraya girin.",

  promoTitle: "30 Gün Hediye Kazan!",
  promoDesc: "Botu denemeniz ve amacını görmeniz için destek sunucumuza katılan herkese 30 günlük premium üyelik hediye ediyoruz!",
  promoBtn: "Katıl ve Hediye Al",
  promoBadge: "Hediye",

  dRedeemTitle: "Promosyon Kodu Kullan",
  dRedeemDesc: "Size özel kampanya kodunu buraya girerek sürenizi uzatabilirsiniz.",
  dRedeemPlaceholder: "Kodu giriniz (Örn: 30GUN)",
  dRedeemBtn: "Kodu Kullan",
  dRedeemSuccess: "Başarılı! Sunucu süreniz uzatıldı.",
  dRedeemError: "Hata! Geçersiz veya kotası dolmuş kod.",
  
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
  teslimatKosullari: "Teslimat Koşulları",
  hakkimizda: "Hakkımızda ve İletişim",
  contact: "İletişim",
  address: "Adres",
  phone: "Telefon",
  email: "E-posta",
  support: "Destek",
  pricingTitle: "Premium Paketler",
  pricingSubtitle: "Discord sunucunuzun tüm potansiyelini açığa çıkarın",
  sevenDays: "7 Günlük",
  oneMonth: "1 Aylık",
  threeMonths: "3 Aylık",
  oneYear: "1 Yıllık",
  bestSeller: "En Çok Satılan",
  buyNow: "Şimdi Al",
  paybePending: "Ödeme şu an kapalı (Paybe onayı beklenmektedir)",
  allFeatures: "Tüm Özellikler Dahil",
  featParty: "Gelişmiş Parti Sistemi",
  featLimit: "Sınırsız Parti Kurma",
  featDash: "Tam Web Paneli Erişimi",
  featSupport: "Öncelikli Discord Desteği",

  // Dashboard Ayarları
  dOverview: "Genel Durum",
  dGeneral: "Genel Ayarlar",
  dVisual: "Görsel Kimlik",
  dAccess: "Erişim Kontrolü",
  dTemplates: "Parti Şablonları",
  dKillBoard: "KillBoard",
  dRegistration: "Kayıt Sistemi",
  dSave: "Ayarları Kaydet",
  dSaving: "Kaydediliyor...",
  dWelcome: "Tekrar Hoş Geldin!",
  dWelcomeDesc: "Albion Online topluluğunuzu kolayca yönetin. İşte bot durumunuzun kısa bir özeti.",
  dSubStatus: "Abonelik Durumu",
  dActive: "AKTİF",
  dExpired: "SÜRESİ DOLDU",
  dRemaining: "Kalan Süre:",
  dDays: "Gün",
  dHours: "Saat",
  dQuickAccess: "Hızlı Erişim",
  dQuickDesc: "En önemli ayarlarınıza hızlıca göz atın.",
  
  // FAQ
  faqTitle: "Nasıl Çalışır & Sıkça Sorulan Sorular",
  faqSubtitle: "Veyronix'i Discord sunucunuza eklemek ve yapılandırmak saniyeler sürer. Kurulum ve kullanım hakkında en çok merak edilen detaylar aşağıda yer almaktadır.",
  faqQ1: "Veyronix Nasıl Kurulur?",
  faqA1: "Veyronix botunu sunucunuza davet etmek için yukarıdaki \"Discord'a Ekle\" butonunu kullanın. Yönetici yetkisine sahip olduğunuz bir sunucuyu seçtikten sonra, otomatik kurulum tamamlanacaktır. Ardından Discord içerisinden `/settings` komutu ile lonca bilgilerinizi (Guild Name) ve kanallarınızı ayarlayarak hızlıca kullanıma başlayabilirsiniz.",
  faqQ2: "Killboard Özelliği Nasıl Çalışır?",
  faqA2: "Premium plan satın aldığınızda, sistem her akşam otomatik olarak Albion Online resmi API'sine bağlanarak loncanızın güncel Killboard istatistiklerini (PvE, PvP kill verileri, ölümler) çeker. Bu verileri belirlediğiniz log kanalına detaylı ve görsel olarak zengin bir şekilde (Embed mesajı formatında) gönderir. Üstelik bu özellik tamamen otonomdur.",
  faqQ3: "Parti Sistemi Yönetimi Neler Sunar?",
  faqA3: "Guild etkinlikleri (ZvZ, Fame Farm, Roaming vb.) için özel partiler oluşturabilirsiniz. `/createparty` komutuyla oluşturulan partiye katılmak isteyen oyuncular, interaktif butonlar üzerinden rollerini (Tank, DPS, Healer) seçebilir. Parti dolduğunda lider özel komutla katılımı kapatabilir veya ekstra slot açabilir. Tüm organizasyon Discord içerisinden yapılır.",
  faqQ4: "Ödemeler Güvenli mi?",
  faqA4: "Tüm Premium işlemlerimiz Cryptomus altyapısı ile güvence altındadır. USDT ve desteklenen diğer kripto varlıklar üzerinden tamamen anonim ve %100 güvenli ödeme yapabilirsiniz. Aboneliğiniz, ödeme blok zincirinde onaylandıktan sonra saniyeler içinde otomatik olarak Discord sunucunuzda aktif hale gelir. Manuel işlem gerektirmez.",

  // Marquee
  marqueeTitle: "Veyronix'i Tercih Eden Topluluklar",
  
  // Blog
  blogHeaderTitle: "Son Rehberler & İpuçları",
  blogHeaderDesc: "Albion Online ve Veyronix hakkında faydalı bilgiler.",

  // How it works
  faqMainTitle: "Nasıl Çalışır? & SSS",
  faqMainDesc: "Veyronix'i kurmak ve kullanmaya başlamak saniyeler sürer. İşte 3 basit adım:",
  step1Title: "1. Botu Ekleyin",
  step1Desc: "Veyronix'i Discord sunucunuza davet edin. Kurulum saniyeler içinde tamamlanır ve hemen kullanıma hazırdır.",
  step2Title: "2. Ayarları Yapın",
  step2Desc: "/settings veya /setup-guild komutlarıyla dilinizi seçin, yetkili rollerini ve Albion loncanızı bağlayın.",
  step3Title: "3. Partini Kur",
  step3Desc: "Savaşa hazırsınız! /createparty yazarak dinamik ZvZ veya PVE partinizi oluşturun ve üyeleri toplamaya başlayın.",
  
  // Checkout Modal Additions
  checkoutTargetServer: "Hedef Sunucu",
  checkoutSelectServer: "-- Sunucu Seçin --",
  checkoutLoading: "Sunucular yükleniyor...",
  checkoutNoServerText: "Sistemde aktif bir sunucunuz bulunamadı. Lütfen önce botu Discord sunucunuza ekleyin.",
  checkoutAddBotBtn: "Botu Sunucuna Ekle",

  blog: "Blog",
};


const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Always start with "en" on both server and client to avoid hydration mismatch.
  // After hydration is complete, useEffect reads localStorage and applies the saved preference.
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("appLang");
    if (saved && saved !== lang) {
      setLang(saved);
      document.cookie = `NEXT_LOCALE=${saved}; path=/; max-age=31536000`;
    }
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => {
      const target = prev === "en" ? "tr" : "en";
      localStorage.setItem("appLang", target);
      document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000`;
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
