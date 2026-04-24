"use client";

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import styles from "./wiki.module.css";
import { Book, ChevronRight, Info, Shield, Zap, HelpCircle, Terminal, Hash, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ContentRenderer = ({ blocks }) => {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'text') {
          return <p key={index} className={styles.contentText}>{block.content}</p>;
        }
        if (block.type === 'heading') {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-white">{block.content}</h3>;
        }
        if (block.type === 'code') {
          return <div key={index} className={styles.codeBlock}>{block.content}</div>;
        }
        if (block.type === 'embed') {
          return (
            <div key={index} className={styles.mockEmbed}>
              <div className={styles.mockEmbedTitle}>{block.title}</div>
              <div className={styles.mockEmbedDesc}>{block.content}</div>
            </div>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="list-disc pl-6 mb-4 text-gray-300">
              {block.items.map((item, i) => (
                <li key={i} className="mb-2">{item}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </>
  );
};

export default function WikiPage() {
  const { lang } = useLanguage();
  const [activeSection, setActiveSection] = useState('intro');

  const wikiData = {
    en: {
      sidebar: [
        { id: 'intro', title: 'Introduction', icon: <Info size={18} /> },
        { id: 'getting-started', title: 'Getting Started (Pro)', icon: <Zap size={18} /> },
        { id: 'advanced-formatting', title: 'Advanced Formatting', icon: <Hash size={18} /> },
        { id: 'waitlist', title: 'The Waitlist System', icon: <Clock size={18} /> },
        { id: 'commands', title: 'Definitive Commands', icon: <Terminal size={18} /> },
        { id: 'permissions', title: 'Permissions & Hierarchy', icon: <Shield size={18} /> },
        { id: 'faq', title: 'Global FAQ', icon: <HelpCircle size={18} /> },
      ],
      content: {
        intro: {
          title: 'Introduction & Core Concept',
          blocks: [
            { type: 'text', content: 'Welcome to the definitive guide for Partikur, the ultimate Discord bot tailored specifically for Albion Online Guilds.' },
            { type: 'heading', content: 'Beyond Basics' },
            { type: 'text', content: 'Partikur is not just a party maker; it is a full-fledged dynamic scheduling and grouping system designed to alleviate the pressure of manual Discord role pings, endless spreadsheet tracking, and messy LFG channels.' },
            { type: 'heading', content: 'The "Dynamic Embed" Philosophy' },
            { type: 'text', content: 'Our philosophy revolves around transforming simple text inputs into rich, interactive Discord interfaces. Instead of typing messy messages, leaders use streamlined commands that Partikur converts into live, interactive embedded panels, complete with buttons for members to join, waitlist, and view real-time gear requirements.' }
          ]
        },
        'getting-started': {
          title: 'Getting Started (The Pro Way)',
          blocks: [
            { type: 'text', content: 'Setting up Partikur properly from the beginning will save your officers hours of management time.' },
            { type: 'heading', content: 'Zero to Hero' },
            { type: 'text', content: 'Start by inviting the bot, and immediately utilize the /settings command in your officer channel. The interactive panel will allow you to quickly set the working language and your default Albion Server limit preferences.' },
            { type: 'heading', content: 'Guild ID Masterclass' },
            { type: 'text', content: 'To sync real Albion stats, we need your Albion Guild ID. Go to the official Albion Online killboard or search via the community tools on Europe/Americas/Asia to copy the unique ID string. Paste this in your dashboard or using /settings to enable the sync module.' }
          ]
        },
        'advanced-formatting': {
          title: 'Advanced Party Formatting (#, >)',
          blocks: [
            { type: 'text', content: 'Partikur features a secret weapon for Party Leaders: The Formatting Engine. By using specific characters in the party description, you can create highly structured embeds.' },
            { type: 'heading', content: 'Categorization (#)' },
            { type: 'text', content: 'Use the `[#]` symbol to designate a category. The bot will create a bold separator emoji (📌) splitting the list.' },
            { type: 'code', content: '#TANK\n1x Main Tank\n#HEALERS\n2x Hallowfall' },
            { type: 'embed', title: '📌 TANK', content: '1x Main Tank\n📌 HEALERS\n2x Hallowfall' },
            { type: 'heading', content: 'Gear & Role Requirements (>)' },
            { type: 'text', content: 'Use the `[>]` symbol to separate a role from its specific requirement. This guarantees the requirement is placed on a new line perfectly aligned for maximum readability.' },
            { type: 'code', content: 'Tank > 8.3 Gear Only\nDPS > Minimum 1500 IP' },
            { type: 'embed', title: 'Role: Tank', content: '↳ 8.3 Gear Only' },
            { type: 'heading', content: 'Emoji Magic' },
            { type: 'text', content: 'The bot automatically detects keywords like "Tank", "Healer", or "DPS" and prepends them with standard MMO emojis (🛡️, ⚕️, ⚔️) internally.' }
          ]
        },
        'waitlist': {
          title: 'The Waitlist System',
          blocks: [
            { type: 'text', content: 'When a party fills up, the waitlist activates automatically. This ensures fairness and auto-fills dropouts.' },
            { type: 'heading', content: 'How it Works' },
            { type: 'text', content: 'Users clicking "Join" on a full party are routed to a modal where they can select a queue. The bot tracks their queue position.' },
            { type: 'heading', content: 'Multi-Role Waiting' },
            { type: 'text', content: 'Players can select multiple roles if they are flexible (e.g., waiting for both Tank and DPS). The first available slot will claim them.' },
            { type: 'heading', content: 'Interaction Rules' },
            { type: 'list', items: [
              'When a slot opens, the bot immediately promotes the first eligible user.',
              'The bot sends a direct DM (and/or pings them) confirming their successful promotion.',
              'The embed updates automatically to reflect the new roster.'
            ]}
          ]
        },
        'commands': {
          title: 'Definitive Commands Guide',
          blocks: [
            { type: 'heading', content: 'General Commands' },
            { type: 'list', items: [
              '/createparty - Launches the wizard to create a new PVE/PVP roaming party.',
              '/closeparty - Immediately locks the active party and sends an archive recap.',
              '/stats - Displays your personal or guild activity statistics.',
              '/members - Syncs and displays current guild members.'
            ]},
            { type: 'heading', content: 'Management Commands' },
            { type: 'text', content: 'Use /whitelistadd and /whitelistremove to manage VIP access. Whitelisted users bypass standard queue limits and have distinct user limit thresholds compared to standard verified users.' },
            { type: 'heading', content: 'Configuration commands' },
            { type: 'text', content: '/settings brings up the Guild Config module allowing Language persistence and Sync toggles.' }
          ]
        },
        'permissions': {
          title: 'Permissions & Hierarchy',
          blocks: [
            { type: 'text', content: 'For Partikur to execute advanced features seamlessly, understanding Discord Role Hierarchy is critical.' },
            { type: 'heading', content: 'The "High Role" Rule' },
            { type: 'text', content: 'The Bot\'s role MUST be placed higher in your Server Settings > Roles list than the roles it is attempting to manage or mention. Otherwise, Discord API blocks the action.' },
            { type: 'heading', content: 'Necessary Scopes' },
            { type: 'list', items: [
              'Send/Read Messages: Basic operational requirement.',
              'Embed Links: Crucial for the dynamic panel system.',
              'Manage Roles: Needed for /whitelistadd and sync modules.',
              'Manage Channels: Needed to create temporary voice channels for parties.'
            ]}
          ]
        },
        'faq': {
          title: 'Global FAQ & Troubleshooting',
          blocks: [
            { type: 'heading', content: 'API Sync Issues' },
            { type: 'text', content: 'Q: Why is the member data outdated?\nA: There is a known delay between the game servers and the public Albion Data Project API. It can take up to 24 hours for fresh guild changes to reflect via standard APIs.' },
            { type: 'heading', content: 'Limit Reached' },
            { type: 'text', content: 'Q: What is the difference between Whitelist and Standard Limits?\nA: Standard users are restricted to a soft limit to avoid spam, while Whitelisted users can bypass these rate limits, allowing unlimited party joins.' },
            { type: 'heading', content: 'Language Issues' },
            { type: 'text', content: 'Q: Translations aren\'t applying?\nA: Force a refresh by doing /settings, changing the language to TR, and back to EN.' }
          ]
        }
      }
    },
    tr: {
      sidebar: [
        { id: 'intro', title: 'Giriş ve Temel Kavram', icon: <Info size={18} /> },
        { id: 'getting-started', title: 'Başlangıç (Pro)', icon: <Zap size={18} /> },
        { id: 'advanced-formatting', title: 'Gelişmiş Formatlama', icon: <Hash size={18} /> },
        { id: 'waitlist', title: 'Bekleme Listesi (Waitlist)', icon: <Clock size={18} /> },
        { id: 'commands', title: 'Kapsamlı Komutlar', icon: <Terminal size={18} /> },
        { id: 'permissions', title: 'Yetkiler ve Hiyerarşi', icon: <Shield size={18} /> },
        { id: 'faq', title: 'SSS ve Sorun Giderme', icon: <HelpCircle size={18} /> },
      ],
      content: {
        intro: {
          title: 'Giriş ve Temel Kavram',
          blocks: [
            { type: 'text', content: 'Albion Online Loncaları için özel olarak tasarlanmış olan nihai Discord botu Partikur için hazırlanan detaylı rehbere hoş geldiniz.' },
            { type: 'heading', content: 'Temellerin Ötesi' },
            { type: 'text', content: 'Partikur sıradan bir parti oluşturucu değildir; manuel Discord rol etiketlemelerinin, sonsuz elektronik tablo takiplerinin ve karmaşık LFG kanallarının stresini hafifletmek için tasarlanmış tam teşekküllü dinamik bir planlama sistemidir.' },
            { type: 'heading', content: 'Dinamik Embed Felsefesi' },
            { type: 'text', content: 'Felsefemiz, basit metin girdilerini zengin, etkileşimli Discord arayüzlerine dönüştürmek etrafında döner. Liderler, Partikur komutlarını kullanarak karmaşık mesajlar yazmak yerine, canlı ve düğmelerle etkileşim sağlanabilen embed panelleri oluştururlar.' }
          ]
        },
        'getting-started': {
          title: 'Başlangıç (Pro Yaklaşımı)',
          blocks: [
            { type: 'text', content: 'Partikur\'u en başından doğru bir şekilde ayarlamak, yöneticilerinize saatlerce sürecek yönetim işlemlerinden tasarruf sağlayacaktır.' },
            { type: 'heading', content: 'Sıfırdan Zirveye' },
            { type: 'text', content: 'Botu davet ederek başlayın ve yetkili kanalınızda hemen /settings komutunu kullanın. Etkileşimli panel, çalışma dilini ve varsayılan Albion Sunucusu tercihlerinizi hızlıca ayarlamanıza olanak tanır.' },
            { type: 'heading', content: 'Guild ID Ustalığı' },
            { type: 'text', content: 'Gerçek Albion istatistiklerini senkronize edebilmek için Albion Lonca ID\'nize ihtiyacımız var. Resmi Albion Online killboard\'a gidin veya Avrupa/Amerika/Asya araçları üzerinden ID dizisini kopyalayın. Bunu yönetim panelinizde veya /settings üzerinden yapıştırın.' }
          ]
        },
        'advanced-formatting': {
          title: 'Gelişmiş Parti Formatlama (#, >)',
          blocks: [
            { type: 'text', content: 'Partikur, Parti Liderleri için gizli bir silaha sahiptir: Formatlama Motoru. Parti açıklamasında belirli karakterleri kullanarak highly yapılandırılmış embed\'ler oluşturabilirsiniz.' },
            { type: 'heading', content: 'Kategorizasyon (#)' },
            { type: 'text', content: 'Bir kategoriyi belirlemek için `[#]` sembolünü kullanın. Bot, listeyi ayıran kalın bir ayırıcı emoji (📌) oluşturacaktır.' },
            { type: 'code', content: '#TANK\n1x Main Tank\n#HEALERS\n2x Hallowfall' },
            { type: 'embed', title: '📌 TANK', content: '1x Main Tank\n📌 HEALERS\n2x Hallowfall' },
            { type: 'heading', content: 'Eşya ve Rol Gereksinimleri (>)' },
            { type: 'text', content: 'Bir rolü belirli bir gereksiniminden ayırmak için `[>]` sembolünü kullanın. Bu, gereksinimin maksimum okunabilirlik için mükemmel şekilde hizalanmış yeni bir satıra yerleştirilmesini garanti eder.' },
            { type: 'code', content: 'Tank > 8.3 Gear Only\nDPS > Minimum 1500 IP' },
            { type: 'embed', title: 'Role: Tank', content: '↳ 8.3 Gear Only' },
            { type: 'heading', content: 'Emoji Büyüsü' },
            { type: 'text', content: 'Bot "Tank", "Healer" veya "DPS" gibi anahtar kelimeleri otomatik olarak algılar ve arka planda bunlara standart MMO emojileri (🛡️, ⚕️, ⚔️) ekler.' }
          ]
        },
        'waitlist': {
          title: 'Bekleme Listesi (Waitlist) Sistemi',
          blocks: [
            { type: 'text', content: 'Bir parti dolduğunda bekleme listesi otomatik olarak devreye girer. Bu, adaleti sağlar ve ayrılanların yerini anında doldurur.' },
            { type: 'heading', content: 'Nasıl Çalışır?' },
            { type: 'text', content: 'Dolu bir partide "Join" e tıklayan kullanıcılar, bir kuyruk seçebilecekleri bir modal\'a yönlendirilir.' },
            { type: 'heading', content: 'Çoklu Rol Bekleme' },
            { type: 'text', content: 'Oyuncular esneklerse birden fazla rol seçebilirler (örn. hem Tank hem de DPS için beklemek). Müsait olan ilk slot onları alacaktır.' },
            { type: 'heading', content: 'Etkileşim Kuralları' },
            { type: 'list', items: [
              'Bir slot açıldığında bot hemen uygun olan ilk kullanıcıyı terfi ettirir.',
              'Bot, başarılı terfiyi onaylayan doğrudan bir DM gönderir (ve/veya kullanıcıyı etiketler).',
              'Embed panel, yeni katılımcı listesini yansıtacak şekilde otomatik güncellenir.'
            ]}
          ]
        },
        'commands': {
          title: 'Kapsamlı Komut Rehberi',
          blocks: [
            { type: 'heading', content: 'Genel Komutlar' },
            { type: 'list', items: [
              '/createparty - Yeni bir PVE/PVP oluşturma sihirbazını başlatır.',
              '/closeparty - Aktif partiyi anında kilitler ve özet bilgisini arşivler.',
              '/stats - İstatistiklerinizi veya lonca aktivitelerinizi gösterir.',
              '/members - Güncel lonca üyelerini senkronize eder ve gösterir.'
            ]},
            { type: 'heading', content: 'Yönetim Komutları' },
            { type: 'text', content: '/whitelistadd ve /whitelistremove komutlarını kullanarak VIP erişimini yönetebilirsiniz. Beyaz listeli kullanıcılar standart sınırları atlar.' },
            { type: 'heading', content: 'Yapılandırma Komutları' },
            { type: 'text', content: '/settings komutu, Dil seçimi ve Senkronizasyon ayarlarının yapılabildiği Lonca Yapılandırma modülünü açar.' }
          ]
        },
        'permissions': {
          title: 'Yetkiler ve Hiyerarşi',
          blocks: [
            { type: 'text', content: 'Partikur\'un gelişmiş özellikleri sorunsuz çalıştırabilmesi için Discord Rol Hiyerarşisini doğru kurmak çok önemlidir.' },
            { type: 'heading', content: '"Yüksek Rol" Kuralı' },
            { type: 'text', content: 'Sunucu Ayarları > Roller listesinde Bot\'un rolü DAİMA yöneteceğiniz veya etiketleyeceğiniz rollerden daha yüksek bir sırada olmalıdır. Aksi takdirde API işlemi engeller.' },
            { type: 'heading', content: 'Gerekli İzin Kapsamları' },
            { type: 'list', items: [
              'Mesaj Gönder/Oku: Temel operasyonel gerekliliktir.',
              'Bağlantı Yerleştir (Embed Links): Dinamik panel sistemi için çok önemlidir.',
              'Rolleri Yönet: /whitelistadd ve senkronizasyon modülleri için gereklidir.',
              'Kanalları Yönet: Partiler için geçici ses kanalları oluşturmak amacıyla gereklidir.'
            ]}
          ]
        },
        'faq': {
          title: 'SSS ve Sorun Giderme',
          blocks: [
            { type: 'heading', content: 'API Senkronizasyon Sorunları' },
            { type: 'text', content: 'S: Üye verileri neden eski?\nC: Oyun sunucuları ile açık Albion Data Projesi API\'si arasında bilinen bir gecikme vardır. Değişikliklerin yansıması bazen 24 saat sürebilir.' },
            { type: 'heading', content: 'Limit Aşıldı (Limit Reached)' },
            { type: 'text', content: 'S: Beyaz Liste (Whitelist) ve Standart Limitler arasındaki fark nedir?\nC: Standart kullanıcıların spam engeli nedeniyle parti katılma sınırı vardır. Beyaz listeli kullanıcılar bu sınırları atlayarak sınırsız işlem yapabilir.' },
            { type: 'heading', content: 'Dil Sorunları' },
            { type: 'text', content: 'S: Çeviriler uygulanmıyor mu?\nC: /settings komutunu kullanarak dili EN yapıp tekrar TR yaparak önbelleği sıfırlayın.' }
          ]
        }
      }
    }
  };

  const currentWiki = wikiData[lang] || wikiData.en;
  const content = currentWiki.content[activeSection];

  return (
    <>
      <Navbar />
      <main className={styles.wikiContainer}>
        <div className={styles.wikiHeader}>
          <div className={styles.headerGlow}></div>
          <h1 className="text-white">{currentWiki.sidebar.find(s => s.id === 'intro').title.split(' ')[0]} Wiki</h1>
          <p>Everything you need to know about Partikur</p>
        </div>

        <div className={styles.wikiLayout}>
          {/* Sidebar */}
          <aside className={`${styles.sidebar} glass-panel`}>
            {currentWiki.sidebar.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
              >
                {item.icon}
                <span>{item.title}</span>
                <ChevronRight size={16} className={styles.chevron} />
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <article className={`${styles.content} glass-panel`}>
            <div className={styles.contentInner}>
              <h2 className={styles.contentTitle}>{content.title}</h2>
              <div className={styles.contentSection}>
                <ContentRenderer blocks={content.blocks} />
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
