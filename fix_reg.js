const fs = require('fs');
const path = require('path');

const regSvg = `
  <text x="50" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">REGISTRATION SETTINGS</text>
  <text x="50" y="110" font-family="sans-serif" font-size="14" fill="#9CA3AF">Set up an automated registration system and auto-check integration.</text>

  <!-- Registration Config -->
  <rect x="50" y="150" width="1100" height="480" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="200" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Registration Config</text>
  
  <text x="90" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">WELCOME CHANNEL</text>
  <rect x="90" y="250" width="310" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="278" font-family="sans-serif" font-size="14" fill="#D1D5DB"># 📝-register-here</text>

  <text x="430" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">TICKET CATEGORY</text>
  <rect x="430" y="250" width="310" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="450" y="278" font-family="sans-serif" font-size="14" fill="#D1D5DB">🗂️ Tickets</text>

  <text x="770" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">STAFF ROLE</text>
  <rect x="770" y="250" width="310" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="790" y="278" font-family="sans-serif" font-size="14" fill="#D1D5DB">@Officer</text>

  <text x="90" y="330" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">GIVEN ROLE 1</text>
  <rect x="90" y="340" width="310" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="368" font-family="sans-serif" font-size="14" fill="#D1D5DB">@Guild Member</text>

  <text x="430" y="330" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">GIVEN ROLE 2</text>
  <rect x="430" y="340" width="310" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="450" y="368" font-family="sans-serif" font-size="14" fill="#D1D5DB">@ZvZ Ready</text>

  <text x="770" y="330" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">UNREGISTERED ROLE</text>
  <rect x="770" y="340" width="310" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="790" y="368" font-family="sans-serif" font-size="14" fill="#D1D5DB">@Guest</text>

  <text x="90" y="420" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">ENABLE REGISTRATION SYSTEM</text>
  <rect x="90" y="440" width="50" height="26" rx="13" fill="#10B981"/>
  <circle cx="123" cy="453" r="11" fill="#ffffff"/>
  <text x="160" y="458" font-family="sans-serif" font-size="14" font-weight="bold" fill="#10B981">System is Active</text>

  <rect x="90" y="500" width="990" height="50" rx="6" fill="#1F2937" stroke="#374151"/>
  <text x="585" y="530" font-family="sans-serif" font-size="16" font-weight="bold" fill="#D1D5DB" text-anchor="middle">TOTAL REGISTERED MEMBERS: <tspan fill="#F59E0B">412</tspan></text>

  <!-- Welcome Message &amp; Setup -->
  <rect x="50" y="660" width="535" height="450" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="90" y="710" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Welcome Message</text>
  
  <text x="90" y="750" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">MESSAGE TEXT</text>
  <rect x="90" y="760" width="455" height="80" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="790" font-family="sans-serif" font-size="14" fill="#D1D5DB">Welcome! Click the button below to register.</text>

  <text x="90" y="870" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">LOG CHANNEL</text>
  <rect x="90" y="880" width="455" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="110" y="908" font-family="sans-serif" font-size="14" fill="#D1D5DB"># ⚙-admin-logs</text>

  <rect x="90" y="960" width="455" height="50" rx="4" fill="url(#accent)"/>
  <text x="317" y="990" font-family="sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">SEND SETUP MESSAGE TO CHANNEL</text>

  <!-- Auto Check System -->
  <rect x="615" y="660" width="535" height="450" rx="12" fill="url(#panel-bg)" stroke="#374151" stroke-width="1"/>
  <text x="655" y="710" font-family="sans-serif" font-size="20" font-weight="bold" fill="#F3F4F6">Guild Leave Auto-Check System</text>
  
  <rect x="655" y="740" width="455" height="70" rx="6" fill="#111827" stroke="#F59E0B" stroke-width="1"/>
  <text x="675" y="770" font-family="sans-serif" font-size="14" font-weight="bold" fill="#F3F4F6">Enable Auto-Check</text>
  <text x="675" y="790" font-family="sans-serif" font-size="12" fill="#9CA3AF">Scans daily and updates Discord roles</text>
  <rect x="1030" y="762" width="50" height="26" rx="13" fill="#10B981"/>
  <circle cx="1063" cy="775" r="11" fill="#ffffff"/>

  <text x="655" y="840" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">CHECK INTERVAL (DAYS)</text>
  <rect x="655" y="850" width="215" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="675" y="878" font-family="sans-serif" font-size="14" fill="#D1D5DB">3</text>

  <text x="895" y="840" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9CA3AF">GUILD TAG</text>
  <rect x="895" y="850" width="215" height="45" rx="4" fill="#111827" stroke="#374151" stroke-width="1"/>
  <text x="915" y="878" font-family="sans-serif" font-size="14" fill="#D1D5DB">ARCH</text>
  
  <!-- Sync Section -->
  <line x1="655" y1="930" x2="1110" y2="930" stroke="#374151" stroke-width="1"/>
  <text x="655" y="960" font-family="sans-serif" font-size="14" font-weight="bold" fill="#F59E0B">BACKWARD COMPATIBILITY SYNC</text>
  <text x="655" y="980" font-family="sans-serif" font-size="12" fill="#9CA3AF">Adds existing old members to the database safely.</text>
  <rect x="655" y="1010" width="455" height="50" rx="4" fill="#1F2937" stroke="#F59E0B" stroke-width="1"/>
  <text x="882" y="1040" font-family="sans-serif" font-size="14" font-weight="bold" fill="#F59E0B" text-anchor="middle">START SYNC PROCESS</text>
`;

function wrapSvg(content) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1150" width="1200" height="1150">
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
  </defs>
  <rect width="1200" height="1150" fill="url(#bg)"/>
  ${content}
</svg>`;
}

fs.writeFileSync(path.join(__dirname, 'apps', 'web', 'public', 'mockups', 'registration.svg'), wrapSvg(regSvg));
console.log('Registration SVG generated!');
