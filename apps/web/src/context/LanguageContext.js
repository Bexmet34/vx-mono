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

  featuresSectionTitle: "Powerful & Innovative Features",
  featuresSectionDesc: "Managing your Albion Online guild and parties has never been this professional.",
  securePayment: "Your payments are processed 100% securely.",
  faqTitle2: "Frequently Asked Questions",
  
  // Home - Features
  feat1Title: "Advanced Registration",
  feat1Desc: "Auto-detect guild members. Synchronize Discord roles with in-game roles (Tank, Healer, DPS).",
  feat2Title: "Dynamic Party Builder",
  feat2Desc: "Create a party with a few clicks. Members can join or leave via Discord buttons.",
  feat3Title: "Web Dashboard",
  feat3Desc: "Control your Discord server settings, events, and member attendance stats from the web interface.",
  feat4Title: "Comprehensive KillBoard (Premium)",
  feat4Desc: "Automatically fetches Albion Online KillBoard data at your specified time, listing your guild's top performing players and announcing them on Discord.",
  
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
  featNoVote: "Unlimited Use Without Voting",

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
  dFreePlan: "FREE PLAN",
  dPremiumPlan: "PREMIUM",
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
  checkoutNoServerText: "No active server found in the system. Please add the bot to your Discord server first.",
  checkoutAddBotBtn: "Add Bot to Server",

  blog: "Blog",
  
  legal: {
    privacy: {
      h1: "Information Collection & GDPR",
      p1: "Veyronix (Hereinafter referred to as \"Veyronix\") collects minimal data required for functionality. This includes your Discord user ID, server IDs where the bot is present, and basic settings you configure. We are committed to protecting user data under GDPR guidelines.",
      h2: "Data Usage & Google AdSense / Cookies",
      p2: "Your data is used solely to provide party management services and Albion Online integration. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google Ads Settings.",
      h3: "Security",
      p3: "We implement industry-standard security measures to protect your information. Data is stored on secure servers with restricted access.",
      footer: "By using Veyronix services, you agree to these policies. If you have questions about your data rights, please contact us at info@veyronix.com.tr.",
      lastUpdated: "Last updated: August 2026"
    },
    terms: {
      title: "Terms of Service",
      h1: "Acceptance of Terms",
      p1: "By using the Veyronix bot and web panel, you agree to these terms. If you do not agree to the terms, please do not use the service.",
      h2: "Service Usage",
      p2: "Veyronix is designed to help Discord communities manage their operations. Users must not use the bot for malicious purposes, spam, or to violate Discord's terms of service.",
      h3: "Premium Services",
      p3: "Premium subscriptions are non-refundable unless required by law. Subscriptions automatically grant premium features to the specified Discord server for the duration of the plan.",
      footer: "Veyronix reserves the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.",
      lastUpdated: "Last updated: August 2026"
    },
    about: {
      title: "About Us & Contact",
      h1: "About Veyronix",
      p1: "Veyronix is a professional bot service designed to enhance the management and interaction of your Discord servers. Our goal is to provide community owners and managers with advanced tools to manage their servers more efficiently and interact better with their members.",
      p2: "With our advanced party system, moderation tools, and user-friendly interface, we continue to make a difference in the Discord ecosystem.",
      infoTitle: "Contact Information",
      addressVal: "İzmir, Türkiye",
      supportVal: "Our Discord Server"
    },
    sales: {
      title: "Distance Sales Agreement",
      h1: "1. PARTIES",
      p1: "This Agreement has been signed between the following parties within the framework of the terms and conditions stated below.",
      satici: `SELLER INFORMATION:
Title: Veyronix Software & Automation
Address: İzmir, Türkiye
Phone: 0551 078 82 61
Email: info@veyronix.com.tr
(Hereinafter referred to as "SELLER")`,
      alici: "BUYER: The user who purchases Veyronix services through the website (Hereinafter referred to as \"BUYER\")",
      h2: "2. SUBJECT OF THE AGREEMENT",
      p2: "The subject of this agreement is to determine the rights and obligations of the parties in accordance with the provisions of the Law No. 6502 on the Protection of Consumers and the Regulation on Distance Contracts regarding the sale and delivery of the digital service (Veyronix Premium Subscription) that the BUYER ordered electronically through the SELLER's website.",
      h3: "3. PRODUCT AND DELIVERY",
      p3: "The product subject to the contract consists of completely digital services (Discord bot premium features). There is no physical delivery. After the payment is successfully completed, the service is automatically activated on the Discord server specified by the user.",
      h4: "4. RIGHT OF WITHDRAWAL",
      p4: "Since the services subject to this contract are services performed instantly in the electronic environment and intangible goods delivered instantly to the consumer, the right of withdrawal cannot be exercised in accordance with Article 15/1-ğ of the Regulation on Distance Contracts. Refunds cannot be requested for purchased and activated premium memberships."
    },
    refund: {
      title: "Cancellation & Refund Policy",
      h1: "DIGITAL PRODUCT AND SERVICE REFUND",
      p1: "All products and services offered by Veyronix (Subscriptions, Premium features, etc.) are within the scope of digital content.",
      important: "IMPORTANT: Since the purchased services are performed instantly in the electronic environment, no refund is possible in accordance with the Law on Consumer Protection No. 6502 and the Distance Contracts Regulation.",
      h2: "CANCELLATION PROCEDURE",
      p2: "You can cancel our subscription-based services at any time. When the cancellation is performed, you can continue to benefit from the service until the end of your current usage period. No deduction will be made from your card in the next billing period.",
      h3: "ERRONEOUS TRANSACTIONS",
      p3: "In case the service is not defined due to erroneous deductions or technical failures caused by the system, you can contact us at info@veyronix.com.tr to report the situation. Necessary corrections will be made in the requests found justified after the examination.",
      h4: "CONTACT",
      p4: "For all your questions about refund and cancellation issues:",
      email: "Email",
      support: "Discord Support"
    },
    delivery: {
      title: "Delivery Policy",
      h1: "DIGITAL DELIVERY PROCESS",
      p1: "All services purchased through Veyronix (subscriptions, premium features, etc.) are carried out entirely in a digital environment.",
      p2: "As soon as the payment for your order is successfully completed via the secure payment infrastructure, the service you have purchased is automatically and instantly assigned to your Discord account or the Discord server you specified.",
      important: "IMPORTANT: There is no physical cargo or mail delivery. The execution of the service starts digitally instantly.",
      h2: "DELIVERY TIME",
      p3: "After payment confirmation, delivery (activation of the service) is automatically carried out by the system within an average of 1-5 minutes.",
      h3: "POSSIBLE DELAYS",
      p4: "In the event of an unusual delay in delivery due to delays originating from the Discord API or system congestion, you can get instant support by contacting us via our support server or at info@veyronix.com.tr."
    }
  },
  
  admin: {
    successSave: "Settings saved successfully!",
    errorSave: "Failed to save settings.",
    deleteMsg: "Message deleted",
    addPlanSuccess: "Plan added successfully!",
    editPlanSuccess: "Plan updated successfully!",
    deletePlanConfirm: "Are you sure you want to delete this plan?",
    planDeleted: "Plan deleted",
    campaignUpdated: "Campaign updated.",
    templateUpdated: "Template updated successfully!",
    actionSuccess: "Action completed successfully!",
    confirmDeleteMsg: "Are you sure you want to delete this message?"
  },
  
  premiumTitle: "Veyronix",
  premiumSubtitle: "Unlock the full potential of Veyronix with Premium features. Choose the method that works best for you.",
  premiumBtnNavbar: "Premium",
  premiumVoteTitle: "Via Voting (Gears)",
  premiumVoteSubtitle: "Free Premium through community support",
  premiumVoteDesc1: "Get Premium features for free by voting for Veyronix on bot listing sites.",
  premiumVoteDesc2: "You can get all Premium features for free as we don't want to exclude anyone from enjoying Premium features. All you have to do is vote for the bot!",
  premiumVoteHowTo: "How do I get gears?",
  premiumVoteHowToDesc: "You can get gears by voting for the bot on these platforms:",
  premiumIndividualTitle: "Individual Packages",
  premiumIndividualSubtitle: "Personal boosts and benefits",
  premiumServerTitle: "Server Packages",
  premiumServerSubtitle: "Guild-wide premium features",
};

const tr = {
  dashboard: "Panel",
  logout: "Çıkış Yap",
  login: "Discord ile Giriş Yap",
  
  heroTitle1: "Albion Online İçin",
  heroTitle2: "Nihai Parti Yönetimi",
  heroDesc: "GvG, ZvZ veya Dungeon partilerinizi doğrudan Discord sunucunuz üzerinden kolayca kurun. Rolleri yönetin, katılımı takip edin ve savaş alanına her zaman hazırlıklı girin.",
  heroBtn: "Sunucuya Ekle",
  supportBtn: "Destek Sunucusu",

  featuresSectionTitle: "Güçlü & Yenilikçi Özellikler",
  featuresSectionDesc: "Albion Online loncanızı ve partilerinizi yönetmek hiç bu kadar profesyonel olmamıştı.",
  securePayment: "Ödemeleriniz %100 güvenli bir şekilde gerçekleştirilmektedir.",
  faqTitle2: "Sıkça Sorulan Sorular",

  feat1Title: "Gelişmiş Kayıt Sistemi",
  feat1Desc: "Guild üyelerinizi otomatik algılayın. Discord rolleriyle oyun içi rolleri (Tank, Healer, DPS) senkronize edin.",
  feat2Title: "Dinamik Party Builder",
  feat2Desc: "Birkaç tıklamayla parti kurun. Üyeler Discord üzerinden butonlarla partiye katılıp ayrılsın.",
  feat3Title: "Yönetim Paneli (Dashboard)",
  feat3Desc: "Web arayüzünden Discord sunucu ayarlarını, etkinlikleri ve üyelerin katılım istatistiklerini kontrol edin.",
  feat4Title: "Tam Kapsamlı KillBoard (Premium)",
  feat4Desc: "Belirlediğiniz saatte Albion Online KillBoard verilerini çekerek, loncanızın en iyi performans gösteren oyuncularını otomatik olarak listeler ve Discord üzerinden duyurur.",
  
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
  featNoVote: "Oy Vermeden Sınırsız Kullanım",

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
  dFreePlan: "ÜCRETSİZ PLAN",
  dPremiumPlan: "PREMIUM",
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
  checkoutNoServerText: "Sistemde aktif bir sunucunuz bulunamadı. Lütfen önce botu Discord sunucunuza ekleyin.",
  checkoutAddBotBtn: "Botu Sunucuna Ekle",

  blog: "Blog",
  
  legal: {
    privacy: {
      h1: "Veri Toplama ve KVKK / AdSense Gizlilik Bildirimi",
      p1: "Veyronix (Bundan sonra \"Veyronix\" olarak anılacaktır), 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca kullanıcılarının verilerini korumayı taahhüt eder. Sadece hizmetin işleyişi için gerekli olan Discord ID, sunucu ID ve temel ayar verileri toplanır.",
      h2: "Veri Kullanımı, Çerezler ve Google AdSense Reklamları",
      p2: "Toplanan veriler sadece botun sunduğu party yönetim sistemi ve Albion Online entegrasyonu gibi hizmetlerin sağlanması amacıyla kullanılır. Sitemizde yayınlanan Google AdSense reklamları kapsamında Google dahil üçüncü taraf tedarikçiler, web sitemize yapılan önceki ziyaretlere dayalı olarak reklam sunmak için çerezlerden faydalanır. Kullanıcılar Google Kişiselleştirilmiş Reklam Ayarları sayfasını ziyaret ederek kişiselleştirilmiş reklamcılığı devre dışı bırakabilirler.",
      h3: "Güvenlik",
      p3: "Verileriniz güvenli sunucularda saklanmakta olup, yetkisiz erişime karşı endüstri standardı güvenlik önlemleri uygulanmaktadır.",
      footer: "Veyronix hizmetlerini kullanarak bu politikaları kabul etmiş sayılırsınız. KVKK kapsamındaki haklarınız ve diğer sorularınız için info@veyronix.com.tr adresinden bizimle iletişime geçebilirsiniz.",
      lastUpdated: "Son güncelleme: Ağustos 2026"
    },
    terms: {
      title: "Kullanım Koşulları",
      h1: "Koşulların Kabulü",
      p1: "Veyronix botunu ve web panelini kullanarak bu koşulları kabul etmiş sayılırsınız. Eğer koşulları kabul etmiyorsanız lütfen hizmeti kullanmayınız.",
      h2: "Hizmet Kullanımı",
      p2: "Veyronix, Discord topluluklarının operasyonlarını yönetmelerine yardımcı olmak için tasarlanmıştır. Kullanıcılar botu kötü amaçlı işlemler, spam veya Discord hizmet şartlarını ihlal edecek şekilde kullanamazlar.",
      h3: "Premium Hizmetler",
      p3: "Premium abonelikler yasa gereği zorunlu olmadığı sürece iade edilemez. Abonelikler, plan süresi boyunca belirtilen Discord sunucusuna otomatik olarak premium özellikleri sağlar.",
      footer: "Veyronix bu koşulları dilediği zaman değiştirme hakkını saklı tutar. Hizmeti kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.",
      lastUpdated: "Son güncelleme: Ağustos 2026"
    },
    about: {
      title: "Hakkımızda ve İletişim",
      h1: "Veyronix Hakkında",
      p1: "Veyronix, Discord sunucularınızın yönetimini ve etkileşimini artırmak için tasarlanmış profesyonel bir bot hizmetidir. Amacımız, topluluk sahiplerine ve yöneticilere, sunucularını daha verimli bir şekilde yönetebilecekleri, üyeleriyle daha iyi etkileşim kurabilecekleri gelişmiş araçlar sunmaktır.",
      p2: "Gelişmiş parti sistemi, moderasyon araçları ve kullanıcı dostu arayüzümüzle, Discord ekosisteminde fark yaratmaya devam ediyoruz.",
      infoTitle: "İletişim Bilgileri",
      addressVal: "İzmir, Türkiye",
      supportVal: "Discord Sunucumuz"
    },
    sales: {
      title: "Mesafeli Satış Sözleşmesi",
      h1: "1. TARAFLAR",
      p1: "İşbu Sözleşme aşağıdaki taraflar arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde imzalanmıştır.",
      satici: `SATICI BİLGİLERİ:
Ünvan: Veyronix Yazılım ve Otomasyon Hizmetleri
Adres: İzmir, Türkiye
Telefon: 0551 078 82 61
E-Posta: info@veyronix.com.tr
(Bundan sonra "SATICI" olarak anılacaktır)`,
      alici: "ALICI: Veyronix hizmetlerini web sitesi üzerinden satın alan kullanıcı (Bundan sonra \"ALICI\" olarak anılacaktır)",
      h2: "2. SÖZLEŞMENİN KONUSU",
      p2: "İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda siparişini yaptığı dijital hizmetin (Veyronix Premium Abonelik) satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.",
      h3: "3. ÜRÜN VE TESLİMAT",
      p3: "Sözleşme konusu ürün, tamamen dijital hizmetlerden (Discord bot premium özellikleri) oluşmaktadır. Fiziksel bir teslimat yoktur. Ödeme başarıyla tamamlandıktan sonra, hizmet otomatik olarak kullanıcının belirttiği Discord sunucusunda aktif hale gelir.",
      h4: "4. CAYMA HAKKI",
      p4: "İşbu sözleşmeye konu hizmetler, Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ğ maddesi uyarınca elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallar kapsamında olduğundan cayma hakkı kullanılamaz. Satın alınan ve aktif edilen premium üyelikler için ücret iadesi talep edilemez."
    },
    refund: {
      title: "İptal ve İade Koşulları",
      h1: "DİJİTAL ÜRÜN VE HİZMET İADESİ",
      p1: "Veyronix tarafından sunulan tüm ürün ve hizmetler (Abonelikler, Premium Özellikler vb.) dijital içerik kapsamındadır.",
      important: "ÖNEMLİ: Satın alınan hizmetler elektronik ortamda anında ifa edildiği için, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği gereği iadesi mümkün değildir.",
      h2: "İPTAL PROSEDÜRÜ",
      p2: "Abonelik bazlı hizmetlerimizi dilediğiniz zaman iptal edebilirsiniz. İptal işlemi gerçekleştirildiğinde, mevcut kullanım sürenizin sonuna kadar hizmetten yararlanmaya devam edebilirsiniz. Bir sonraki faturalandırma döneminde kartınızdan herhangi bir çekim yapılmayacaktır.",
      h3: "HATALI İŞLEMLER",
      p3: "Sistemden kaynaklı hatalı çekimler veya teknik aksaklıklar nedeniyle hizmetin tanımlanmaması durumunda, durumu bildirmek için info@veyronix.com.tr adresi üzerinden bizimle iletişime geçebilirsiniz. İnceleme sonrası haklı bulunan taleplerde gerekli düzeltmeler yapılacaktır.",
      h4: "İLETİŞİM",
      p4: "İade ve iptal konularındaki tüm sorularınız için:",
      email: "E-posta",
      support: "Discord Destek"
    },
    delivery: {
      title: "Teslimat Koşulları",
      h1: "DİJİTAL TESLİMAT SÜRECİ",
      p1: "Veyronix üzerinden satın alınan tüm hizmetler (abonelikler, premium özellikler vb.) tamamen dijital ortamda gerçekleştirilmektedir.",
      p2: "Siparişinizin ödemesi güvenli ödeme altyapısı üzerinden başarıyla tamamlandığı anda, satın almış olduğunuz hizmet Discord hesabınıza veya belirttiğiniz Discord sunucusuna otomatik ve anında tanımlanır.",
      important: "ÖNEMLİ: Herhangi bir fiziksel kargo veya posta teslimatı yapılmamaktadır. Hizmet ifası anında dijital olarak başlar.",
      h2: "TESLİMAT SÜRESİ",
      p3: "Ödeme onayı alındıktan sonra teslimat (hizmetin aktifleşmesi) ortalama 1-5 dakika içerisinde sistem tarafından otomatik olarak gerçekleştirilir.",
      h3: "OLASI GECİKMELER",
      p4: "Discord API kaynaklı gecikmeler veya sistem yoğunlukları sebebiyle teslimatta olağan dışı bir gecikme yaşanması durumunda, destek sunucumuz üzerinden veya info@veyronix.com.tr adresinden bize ulaşarak anında destek alabilirsiniz."
    }
  },
  
  admin: {
    successSave: "Ayarlar başarıyla kaydedildi!",
    errorSave: "Ayarlar kaydedilemedi.",
    deleteMsg: "Mesaj silindi",
    addPlanSuccess: "Paket başarıyla eklendi!",
    editPlanSuccess: "Paket başarıyla güncellendi!",
    deletePlanConfirm: "Bu paketi silmek istediğinize emin misiniz?",
    planDeleted: "Paket silindi",
    campaignUpdated: "Kampanya güncellendi.",
    templateUpdated: "Şablon başarıyla güncellendi!",
    actionSuccess: "İşlem başarıyla gerçekleşti!",
    confirmDeleteMsg: "Emin misiniz?"
  },
  
  premiumTitle: "Veyronix",
  premiumSubtitle: "Veyronix'in tam potansiyelini Premium özelliklerle açın. Sizin için en uygun yöntemi seçin.",
  premiumBtnNavbar: "Premium",
  premiumVoteTitle: "Oylama Yoluyla (Gears)",
  premiumVoteSubtitle: "Topluluk desteği sayesinde ücretsiz Premium içerik.",
  premiumVoteDesc1: "Bot listeleme sitelerinde Veyronix'e oy vererek Premium özellikleri ücretsiz edinin.",
  premiumVoteDesc2: "Kimsenin Premium özelliklerden mahrum kalmasını istemediğimiz için tüm Premium özellikleri ücretsiz alabilirsiniz. Tek yapmanız gereken bota oy vermek!",
  premiumVoteHowTo: "Nasıl gear elde ederim?",
  premiumVoteHowToDesc: "Bu platformlarda bota oy vererek gear elde edebilirsiniz:",
  premiumIndividualTitle: "Bireysel Paketler",
  premiumIndividualSubtitle: "Kişisel avantajlar ve destekler",
  premiumServerTitle: "Sunucu Paketleri",
  premiumServerSubtitle: "Loncanız için özel premium özellikler",
};


const LanguageContext = createContext();

export function LanguageProvider({ children, initialLang = "tr" }) {
  // Always start with the server-rendered language to avoid hydration mismatch.
  // After hydration is complete, useEffect reads localStorage and applies the saved preference.
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    const saved = localStorage.getItem("appLang");
    if (saved && saved !== lang) {
      // eslint-disable-next-line
      setLang(saved);
      document.cookie = `NEXT_LOCALE=${saved}; path=/; max-age=31536000`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
