const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'apps', 'web', 'public', 'mockups');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function wrapSvg(content) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="panel-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1F2937" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#111827" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="accent-blue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  ${content}
</svg>`;
}

const accessSvg = wrapSvg(`
  <!-- Access (Whitelist) -->
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">ACCESS SETTINGS</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Configure who can use restricted bot commands like /createparty</text>
  
  <!-- Left Panel -->
  <rect x="50" y="150" width="600" height="600" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <rect x="80" y="180" width="40" height="40" rx="8" fill="#F59E0B" fill-opacity="0.1"/>
  <text x="135" y="206" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Active Whitelist</text>
  
  <!-- Item 1 -->
  <rect x="80" y="240" width="540" height="60" rx="6" fill="#111827" stroke="#374151"/>
  <circle cx="110" cy="270" r="8" fill="#EF4444"/>
  <text x="135" y="276" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">@Admin</text>
  <rect x="570" y="255" width="30" height="30" rx="4" fill="#EF4444" fill-opacity="0.1"/>
  
  <!-- Item 2 -->
  <rect x="80" y="310" width="540" height="60" rx="6" fill="#111827" stroke="#374151"/>
  <circle cx="110" cy="340" r="8" fill="#3B82F6"/>
  <text x="135" y="346" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">Commander#1234</text>
  <rect x="570" y="325" width="30" height="30" rx="4" fill="#EF4444" fill-opacity="0.1"/>

  <!-- Right Panel -->
  <rect x="680" y="150" width="470" height="600" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="720" y="206" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Add New Entry</text>
  
  <!-- Toggle -->
  <rect x="720" y="240" width="390" height="40" rx="6" fill="#111827" stroke="#374151"/>
  <rect x="722" y="242" width="193" height="36" rx="4" fill="url(#accent)"/>
  <text x="818" y="265" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">ROLES</text>
  <text x="1013" y="265" font-family="sans-serif" font-size="14" font-weight="bold" fill="#9CA3AF" text-anchor="middle">USERS</text>
  
  <!-- Search -->
  <rect x="720" y="300" width="390" height="46" rx="6" fill="#111827" stroke="#F59E0B" stroke-width="1"/>
  <text x="740" y="328" font-family="sans-serif" font-size="15" fill="#9CA3AF">Search roles...</text>
  
  <!-- List -->
  <rect x="720" y="370" width="390" height="50" rx="4" fill="#1F2937"/>
  <text x="740" y="400" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">@Officer</text>
  <rect x="1070" y="380" width="30" height="30" rx="4" fill="#10B981" fill-opacity="0.15"/>
`);

const overviewSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">OVERVIEW</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Welcome to your server command center.</text>
  
  <!-- Welcome Box -->
  <rect x="50" y="150" width="1100" height="180" rx="12" fill="url(#accent)" fill-opacity="0.05" stroke="#F59E0B" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="24" font-weight="bold" fill="#F59E0B">SERVER COMMAND CENTER</text>
  <text x="90" y="240" font-family="sans-serif" font-size="16" fill="#D1D5DB" width="600">Configure integrations, manage templates, and monitor performance.</text>
  <rect x="90" y="270" width="160" height="40" rx="4" fill="url(#accent)"/>
  <text x="170" y="295" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">QUICK SETUP</text>
  
  <!-- Status Box -->
  <rect x="50" y="360" width="535" height="200" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="410" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Subscription Status</text>
  <rect x="90" y="440" width="60" height="60" rx="8" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-width="2"/>
  <text x="170" y="465" font-family="sans-serif" font-size="24" font-weight="bold" fill="#10B981">PREMIUM</text>
  <text x="170" y="485" font-family="sans-serif" font-size="14" fill="#9CA3AF">LIFETIME ACCESS ACTIVE</text>
  
  <!-- System Status -->
  <rect x="615" y="360" width="535" height="280" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="655" y="410" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">System Status</text>
  <rect x="655" y="440" width="455" height="40" rx="4" fill="#10B981" fill-opacity="0.05" stroke="#10B981" stroke-width="1" stroke-opacity="0.3"/>
  <text x="670" y="465" font-family="sans-serif" font-size="14" font-weight="bold" fill="#10B981">✓ ALBION GUILD LINK</text>
  <text x="1080" y="465" font-family="sans-serif" font-size="14" font-weight="bold" fill="#10B981" text-anchor="end">LINKED</text>
  
  <rect x="655" y="490" width="455" height="40" rx="4" fill="#10B981" fill-opacity="0.05" stroke="#10B981" stroke-width="1" stroke-opacity="0.3"/>
  <text x="670" y="515" font-family="sans-serif" font-size="14" font-weight="bold" fill="#10B981">✓ KILLBOARD REPORTS</text>
  <text x="1080" y="515" font-family="sans-serif" font-size="14" font-weight="bold" fill="#10B981" text-anchor="end">ACTIVE</text>
  
  <rect x="655" y="540" width="455" height="40" rx="4" fill="#374151" fill-opacity="0.2" stroke="#374151" stroke-width="1"/>
  <text x="670" y="565" font-family="sans-serif" font-size="14" font-weight="bold" fill="#9CA3AF">✗ AUTO-CHECK</text>
  <text x="1080" y="565" font-family="sans-serif" font-size="14" font-weight="bold" fill="#9CA3AF" text-anchor="end">DISABLED</text>
`);

const killboardSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">KILLBOARD SETTINGS</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Where and when should the KillBoard report be posted?</text>
  
  <rect x="50" y="150" width="1100" height="240" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Discord Integration</text>
  
  <!-- Inputs -->
  <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">TARGET CHANNEL</text>
  <rect x="90" y="250" width="480" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="278" font-family="sans-serif" font-size="15" fill="#D1D5DB"># 💀-kill-reports</text>

  <text x="610" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">DAILY POST TIME (UTC)</text>
  <rect x="610" y="250" width="480" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="630" y="278" font-family="sans-serif" font-size="15" fill="#D1D5DB">06:00</text>
  
  <!-- Buttons -->
  <rect x="90" y="320" width="230" height="45" rx="4" fill="#1F2937" stroke="#374151"/>
  <text x="205" y="348" font-family="sans-serif" font-size="14" font-weight="bold" fill="#D1D5DB" text-anchor="middle">PREVIEW DATA</text>
  
  <rect x="340" y="320" width="230" height="45" rx="4" fill="url(#accent)"/>
  <text x="455" y="348" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">TRIGGER NOW</text>

  <!-- Preview Panel -->
  <rect x="50" y="420" width="1100" height="340" rx="12" fill="url(#panel-bg)" stroke="#F59E0B" stroke-opacity="0.3" stroke-width="1"/>
  <text x="90" y="470" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Daily Summary Preview</text>
  
  <rect x="90" y="500" width="310" height="100" rx="6" fill="#111827" stroke="#374151"/>
  <text x="245" y="535" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF" text-anchor="middle">TOTAL KILLS</text>
  <text x="245" y="575" font-family="sans-serif" font-size="36" font-weight="bold" fill="#10B981" text-anchor="middle">42</text>
  
  <rect x="440" y="500" width="310" height="100" rx="6" fill="#111827" stroke="#374151"/>
  <text x="595" y="535" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF" text-anchor="middle">TOTAL DEATHS</text>
  <text x="595" y="575" font-family="sans-serif" font-size="36" font-weight="bold" fill="#EF4444" text-anchor="middle">18</text>
  
  <rect x="790" y="500" width="310" height="100" rx="6" fill="#111827" stroke="#374151"/>
  <text x="945" y="535" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF" text-anchor="middle">KILL FAME</text>
  <text x="945" y="575" font-family="sans-serif" font-size="36" font-weight="bold" fill="#F59E0B" text-anchor="middle">1,204,500</text>
`);

const generalSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">GENERAL SETTINGS</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Configure basic bot behavior and game integrations.</text>

  <rect x="50" y="150" width="1100" height="160" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Global Settings</text>
  <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">BOT LANGUAGE</text>
  <rect x="90" y="250" width="480" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="278" font-family="sans-serif" font-size="15" fill="#D1D5DB">English</text>

  <rect x="50" y="340" width="1100" height="300" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="390" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Albion Guild Configuration</text>
  <text x="90" y="420" font-family="sans-serif" font-size="14" fill="#9CA3AF">Search and link your Albion Online Guild.</text>
  
  <rect x="90" y="450" width="1020" height="120" rx="6" fill="#F59E0B" fill-opacity="0.05" stroke="#F59E0B" stroke-opacity="0.5"/>
  <text x="120" y="480" font-family="sans-serif" font-size="12" font-weight="bold" fill="#F59E0B">ACTIVE GUILD</text>
  <text x="120" y="515" font-family="sans-serif" font-size="24" font-weight="bold" fill="#F3F4F6">[ARCH] Blue Army</text>
  <text x="120" y="545" font-family="sans-serif" font-size="14" fill="#9CA3AF">Leader: Mojo • Members: 298</text>
  
  <rect x="950" y="490" width="130" height="40" rx="4" fill="#EF4444" fill-opacity="0.1" stroke="#EF4444" stroke-opacity="0.5"/>
  <text x="1015" y="515" font-family="sans-serif" font-size="14" font-weight="bold" fill="#EF4444" text-anchor="middle">DISCONNECT</text>
`);

const visualSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">BRANDING</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Customize how the bot's messages look in your server.</text>

  <rect x="50" y="150" width="600" height="500" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Message Customization</text>
  
  <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">WELCOME MESSAGE</text>
  <rect x="90" y="250" width="520" height="100" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="280" font-family="sans-serif" font-size="15" fill="#D1D5DB">Welcome to the server! Please register using the</text>
  <text x="110" y="305" font-family="sans-serif" font-size="15" fill="#D1D5DB">button below to get your roles.</text>

  <text x="90" y="380" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">EMBED THUMBNAIL URL</text>
  <rect x="90" y="390" width="520" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="418" font-family="sans-serif" font-size="15" fill="#D1D5DB">https://imgur.com/my-guild-logo.png</text>

  <rect x="680" y="150" width="470" height="500" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="720" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Preview</text>
  <rect x="720" y="230" width="390" height="200" rx="6" fill="#2B2D31" stroke="#1E1F22"/>
  <rect x="720" y="230" width="4" height="200" fill="#F59E0B"/>
  <circle cx="1060" cy="270" r="30" fill="#111827"/>
  <text x="740" y="260" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Guild Registration</text>
  <text x="740" y="290" font-family="sans-serif" font-size="12" fill="#DBDEE1">Welcome to the server! Please register</text>
  <text x="740" y="310" font-family="sans-serif" font-size="12" fill="#DBDEE1">using the button below to get your roles.</text>
`);

const templatesSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">PARTY TEMPLATES</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Pre-configure team compositions for instant use.</text>

  <rect x="50" y="150" width="1100" height="600" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <rect x="1000" y="180" width="120" height="40" rx="4" fill="url(#accent)"/>
  <text x="1060" y="205" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">+ NEW</text>

  <!-- Template 1 -->
  <rect x="90" y="240" width="1020" height="80" rx="6" fill="#111827" stroke="#374151"/>
  <text x="120" y="285" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F3F4F6">ZvZ Standard 20-Man</text>
  <rect x="350" y="260" width="80" height="30" rx="15" fill="#3B82F6" fill-opacity="0.2"/>
  <text x="390" y="280" font-family="sans-serif" font-size="12" font-weight="bold" fill="#3B82F6" text-anchor="middle">PvP</text>
  <text x="460" y="285" font-family="sans-serif" font-size="14" fill="#9CA3AF">5x Tank, 5x Healer, 10x DPS</text>
  
  <!-- Template 2 -->
  <rect x="90" y="340" width="1020" height="80" rx="6" fill="#111827" stroke="#374151"/>
  <text x="120" y="385" font-family="sans-serif" font-size="18" font-weight="bold" fill="#F3F4F6">Ava Dungeon Group</text>
  <rect x="350" y="360" width="80" height="30" rx="15" fill="#10B981" fill-opacity="0.2"/>
  <text x="390" y="380" font-family="sans-serif" font-size="12" font-weight="bold" fill="#10B981" text-anchor="middle">PvE</text>
  <text x="460" y="385" font-family="sans-serif" font-size="14" fill="#9CA3AF">1x Main Tank, 1x Off Tank, 3x Healer...</text>
`);

const regSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">REGISTRATION SETTINGS</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Automate member registration via Albion Online API.</text>

  <rect x="50" y="150" width="535" height="400" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Core Setup</text>
  
  <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">REGISTRATION CHANNEL</text>
  <rect x="90" y="250" width="455" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="278" font-family="sans-serif" font-size="15" fill="#D1D5DB"># 📝-register-here</text>

  <text x="90" y="320" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">VERIFIED ROLE</text>
  <rect x="90" y="330" width="455" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="358" font-family="sans-serif" font-size="15" fill="#D1D5DB">@Guild Member</text>

  <rect x="615" y="150" width="535" height="400" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="655" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Auto-Check & Cleanup</text>
  <text x="655" y="230" font-family="sans-serif" font-size="14" fill="#9CA3AF">Automatically remove roles when members leave.</text>
  
  <rect x="655" y="260" width="455" height="80" rx="6" fill="#111827" stroke="#F59E0B" stroke-width="1"/>
  <text x="685" y="295" font-family="sans-serif" font-size="16" font-weight="bold" fill="#F3F4F6">Enable Auto-Check</text>
  <text x="685" y="315" font-family="sans-serif" font-size="12" fill="#9CA3AF">Scans daily and updates Discord roles</text>
  <rect x="1030" y="285" width="50" height="26" rx="13" fill="#10B981"/>
  <circle cx="1063" cy="298" r="11" fill="#ffffff"/>
`);

const rolesSvg = wrapSvg(`
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">ROLE MENU</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Create self-assignable role menus for players.</text>

  <rect x="50" y="150" width="1100" height="600" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Active Categories</text>
  
  <rect x="900" y="170" width="200" height="40" rx="4" fill="url(#accent)"/>
  <text x="1000" y="195" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">SEND TO CHANNEL</text>

  <rect x="90" y="240" width="320" height="400" rx="6" fill="#111827" stroke="#374151"/>
  <text x="120" y="280" font-family="sans-serif" font-size="18" font-weight="bold" fill="#EF4444">Combat Roles</text>
  <text x="120" y="300" font-family="sans-serif" font-size="12" fill="#9CA3AF">Max selection: 5</text>
  <rect x="120" y="320" width="260" height="40" rx="4" fill="#1F2937"/>
  <text x="140" y="345" font-family="sans-serif" font-size="14" fill="#F3F4F6">⚔️ PvP Role</text>
  <rect x="120" y="370" width="260" height="40" rx="4" fill="#1F2937"/>
  <text x="140" y="395" font-family="sans-serif" font-size="14" fill="#F3F4F6">🛡️ PvE Role</text>

  <rect x="440" y="240" width="320" height="400" rx="6" fill="#111827" stroke="#374151"/>
  <text x="470" y="280" font-family="sans-serif" font-size="18" font-weight="bold" fill="#3B82F6">Economy Roles</text>
  <text x="470" y="300" font-family="sans-serif" font-size="12" fill="#9CA3AF">Max selection: 3</text>
  <rect x="470" y="320" width="260" height="40" rx="4" fill="#1F2937"/>
  <text x="490" y="345" font-family="sans-serif" font-size="14" fill="#F3F4F6">⛏️ Gatherer</text>
  <rect x="470" y="370" width="260" height="40" rx="4" fill="#1F2937"/>
  <text x="490" y="395" font-family="sans-serif" font-size="14" fill="#F3F4F6">🔨 Crafter</text>
`);

fs.writeFileSync(path.join(outDir, 'access.svg'), accessSvg);
fs.writeFileSync(path.join(outDir, 'overview.svg'), overviewSvg);
fs.writeFileSync(path.join(outDir, 'killboard.svg'), killboardSvg);
fs.writeFileSync(path.join(outDir, 'general.svg'), generalSvg);
fs.writeFileSync(path.join(outDir, 'visual.svg'), visualSvg);
fs.writeFileSync(path.join(outDir, 'templates.svg'), templatesSvg);
fs.writeFileSync(path.join(outDir, 'registration.svg'), regSvg);
fs.writeFileSync(path.join(outDir, 'roles.svg'), rolesSvg);

console.log('SVG Mockups generated successfully!');
