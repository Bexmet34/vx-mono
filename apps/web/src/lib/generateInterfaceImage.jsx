import { ImageResponse } from 'next/og';
import { BUTTON_DATA } from './buttonConfigs';

/**
 * Generates an ultra-crisp PNG image buffer using next/og ImageResponse
 * Renders Custom Application Emojis or Vector Icons in 740px width pills
 */
export async function generateInterfaceImage(activeButtons, lang = 'tr', emojiMap = {}) {
  if (!activeButtons || activeButtons.length === 0) {
    return null;
  }

  const rowCount = Math.ceil(activeButtons.length / 5);
  // Heights: 1 row = 48px, 2 rows = 92px, 3 rows = 136px
  const height = rowCount === 1 ? 48 : rowCount === 2 ? 92 : 136;
  const width = 740;

  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(activeButtons.slice(i * 5, (i + 1) * 5));
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
          gap: '6px',
          backgroundColor: '#18191c',
          padding: '5px 8px',
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
              gap: '6px',
            }}
          >
            {rowButtons.map((btnId) => {
              const config = BUTTON_DATA[btnId];
              if (!config) return null;
              const label = config.label[lang] || config.label.en;
              const appEmoji = config.emojiName ? emojiMap[config.emojiName.toLowerCase()] : null;

              return (
                <div
                  key={btnId}
                  style={{
                    flex: 1,
                    height: '36px',
                    backgroundColor: '#111214',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '0 8px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '6px',
                      flexShrink: 0,
                    }}
                  >
                    {appEmoji ? (
                      <img
                        src={appEmoji.url}
                        alt={config.emojiName}
                        width="16"
                        height="16"
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      config.icon(config.color)
                    )}
                  </div>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      letterSpacing: '0.1px',
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
              <div key={`empty-${emptyIdx}`} style={{ flex: 1, height: '36px' }} />
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
