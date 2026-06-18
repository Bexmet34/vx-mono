export default function Logo({ className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" className={className}>
      <defs>
        <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f2fe"/>
          <stop offset="100%" stop-color="#4facfe"/>
        </linearGradient>
        <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c471ed"/>
          <stop offset="100%" stop-color="#f64f59"/>
        </linearGradient>
        <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f83600"/>
          <stop offset="100%" stop-color="#f9d423"/>
        </linearGradient>

        <linearGradient id="gradBlueDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0062a3"/>
          <stop offset="100%" stop-color="#1b5a8f"/>
        </linearGradient>
        <linearGradient id="gradPurpleDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7a2a9e"/>
          <stop offset="100%" stop-color="#911d25"/>
        </linearGradient>
        <linearGradient id="gradOrangeDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ab1d00"/>
          <stop offset="100%" stop-color="#c29d00"/>
        </linearGradient>

        <linearGradient id="gradBlueLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#89f7fe"/>
          <stop offset="100%" stop-color="#8ed2ff"/>
        </linearGradient>
        <linearGradient id="gradPurpleLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e2aefc"/>
          <stop offset="100%" stop-color="#ff949b"/>
        </linearGradient>
        <linearGradient id="gradOrangeLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff7f54"/>
          <stop offset="100%" stop-color="#ffe670"/>
        </linearGradient>

        <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#1f2336"/>
          <stop offset="100%" stop-color="#0f111a"/>
        </radialGradient>

        <filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="15" dy="15" stdDeviation="15" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <rect width="500" height="500" fill="url(#bgGlow)"/>

      <g filter="url(#drop-shadow)">
        <polygon points="210,340 230,320 170,220 150,240" fill="url(#gradBlueDark)"/>
        <polygon points="100,240 150,240 170,220 120,220" fill="url(#gradBlueLight)"/>
        <polygon points="100,240 150,240 210,340 160,340" fill="url(#gradBlue)"/>
        <polyline points="160,340 100,240 150,240" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
      </g>

      <g filter="url(#drop-shadow)">
        <polygon points="280,360 300,340 230,160 210,180" fill="url(#gradPurpleDark)"/>
        <polygon points="160,180 210,180 230,160 180,160" fill="url(#gradPurpleLight)"/>
        <polygon points="160,180 210,180 280,360 230,360" fill="url(#gradPurple)"/>
        <polyline points="230,360 160,180 210,180" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
      </g>

      <g filter="url(#drop-shadow)">
        <polygon points="280,360 300,340 420,100 400,120" fill="url(#gradOrangeDark)"/>
        <polygon points="350,120 400,120 420,100 370,100" fill="url(#gradOrangeLight)"/>
        <polygon points="230,360 280,360 400,120 350,120" fill="url(#gradOrange)"/>
        <polyline points="230,360 350,120 400,120" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
      </g>
    </svg>
  );
}
