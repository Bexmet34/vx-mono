import { ImageResponse } from 'next/og';
import { BUTTON_DATA } from './buttonConfigs';

// Native Satori-compatible 28px vector SVG icons for 2x High-DPI Retina Rendering
const ICONS_2X = {
  name: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  limit: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  privacy: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="10" width="6" height="5" rx="1" stroke="#ffffff" strokeWidth="1.6" />
      <path d="M10 10V8a2 2 0 0 1 4 0v2" stroke="#ffffff" strokeWidth="1.6" />
    </svg>
  ),
  waiting_room: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" stroke="#facc15" strokeWidth="2.5" />
    </svg>
  ),
  chat: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  trusted: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#ffffff" />
      <circle cx="8.5" cy="7" r="4" stroke="#ffffff" />
      <circle cx="18" cy="11" r="4.5" stroke="#22c55e" strokeWidth="2" fill="#1e1f24" />
      <polyline points="16 11 17.5 12.5 20 9.5" stroke="#22c55e" strokeWidth="2.2" />
    </svg>
  ),
  untrusted: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#ffffff" />
      <circle cx="8.5" cy="7" r="4" stroke="#ffffff" />
      <circle cx="18" cy="11" r="4.5" stroke="#ef4444" strokeWidth="2" fill="#1e1f24" />
      <line x1="16" y1="9" x2="20" y2="13" stroke="#ef4444" strokeWidth="2.2" />
      <line x1="20" y1="9" x2="16" y2="13" stroke="#ef4444" strokeWidth="2.2" />
    </svg>
  ),
  invite: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#ffffff" />
      <circle cx="18" cy="6" r="4" fill="#22c55e" stroke="none" />
      <line x1="18" y1="4" x2="18" y2="8" stroke="#ffffff" strokeWidth="1.5" />
      <line x1="16" y1="6" x2="20" y2="6" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  ),
  kick: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" stroke="#ffffff" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" strokeWidth="2.8" />
    </svg>
  ),
  region: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  block: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#ffffff" />
      <circle cx="8.5" cy="7" r="4" stroke="#ffffff" />
      <circle cx="18" cy="11" r="4.5" stroke="#ef4444" strokeWidth="2" fill="#1e1f24" />
      <line x1="15" y1="14" x2="21" y2="8" stroke="#ef4444" strokeWidth="2.2" />
    </svg>
  ),
  unblock: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#ffffff" />
      <circle cx="8.5" cy="7" r="4" stroke="#ffffff" />
      <circle cx="18" cy="11" r="4.5" stroke="#22c55e" strokeWidth="2" fill="#1e1f24" />
      <polyline points="15.5 11 17.5 13 20.5 9" stroke="#22c55e" strokeWidth="2.2" />
    </svg>
  ),
  claim: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
    </svg>
  ),
  transfer: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  delete: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" fill="none" stroke="#ef4444" strokeWidth="2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
};

/**
 * Generates an ultra-crisp 2x Retina PNG image buffer using next/og ImageResponse
 * Resolution: 1410 x 232 (exact reference dimensions and crystal-clear vector rendering)
 */
export async function generateInterfaceImage(activeButtons, lang = 'tr', emojiMap = {}) {
  if (!activeButtons || activeButtons.length === 0) {
    return null;
  }

  const rowCount = Math.ceil(activeButtons.length / 5);
  // High-DPI 2x Retina Dimensions (1410px width, 232px height for 3 rows)
  const width = 1410;
  const height = rowCount === 1 ? 80 : rowCount === 2 ? 156 : 232;

  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(activeButtons.slice(i * 5, (i + 1) * 5));
  }

  // Pre-fetch custom emojis as base64 if available to guarantee instant rendering
  const emojiBase64 = {};
  if (emojiMap && typeof emojiMap === 'object') {
    await Promise.all(
      Object.entries(emojiMap).map(async ([name, info]) => {
        if (info && info.url) {
          try {
            const res = await fetch(info.url);
            if (res.ok) {
              const buffer = await res.arrayBuffer();
              emojiBase64[name] = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
          } catch (e) {
            // Ignore fetch errors, fallback to vector icon
          }
        }
      })
    );
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '10px',
          backgroundColor: '#18191c',
          padding: '10px 14px',
          boxSizing: 'border-box',
          fontFamily: 'sans-serif',
        }}
      >
        {rows.map((rowButtons, rIdx) => (
          <div
            key={rIdx}
            style={{
              display: 'flex',
              width: '100%',
              gap: '10px',
            }}
          >
            {rowButtons.map((btnId) => {
              const config = BUTTON_DATA[btnId];
              if (!config) return null;
              const label = config.label[lang] || config.label.en;
              const customEmojiB64 = config.emojiName ? emojiBase64[config.emojiName.toLowerCase()] : null;
              const vectorIcon = ICONS_2X[btnId] || ICONS_2X.name;

              return (
                <div
                  key={btnId}
                  style={{
                    flex: 1,
                    height: '64px',
                    backgroundColor: '#2b2d31',
                    border: '2px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '0 16px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {customEmojiB64 ? (
                      <img
                        src={customEmojiB64}
                        alt={config.emojiName}
                        width="30"
                        height="30"
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      vectorIcon
                    )}
                  </div>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '21px',
                      fontWeight: 800,
                      letterSpacing: '0.4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            {/* Fill empty spots in row if less than 5 to maintain flex layout */}
            {Array.from({ length: 5 - rowButtons.length }).map((_, emptyIdx) => (
              <div key={`empty-${emptyIdx}`} style={{ flex: 1, height: '64px' }} />
            ))}
          </div>
        ))}
      </div>
    ),
    {
      width,
      height,
    }
  );

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
