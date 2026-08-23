import { ImageResponse } from 'next/og';
import { BUTTON_DATA } from './buttonConfigs';

/**
 * Generates an ultra-crisp PNG image buffer using next/og ImageResponse
 * Dimensions: 720px wide, dynamic height based on row count
 */
export async function generateInterfaceImage(activeButtons, lang = 'tr') {
  if (!activeButtons || activeButtons.length === 0) {
    return null;
  }

  const rowCount = Math.ceil(activeButtons.length / 5);
  // Enlarged pill heights: 38px height + 7px gap + 6px padding = 50px (1 row), 96px (2 rows), 142px (3 rows)
  const height = rowCount === 1 ? 50 : rowCount === 2 ? 96 : 142;
  const width = 720;

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
          gap: '7px',
          backgroundColor: '#18191c',
          padding: '6px 8px',
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
              gap: '7px',
            }}
          >
            {rowButtons.map((btnId) => {
              const config = BUTTON_DATA[btnId];
              if (!config) return null;
              const label = config.label[lang] || config.label.en;
              return (
                <div
                  key={btnId}
                  style={{
                    flex: 1,
                    height: '38px',
                    backgroundColor: '#111214',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '0 10px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                      flexShrink: 0,
                    }}
                  >
                    {config.icon(config.color)}
                  </div>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
            {/* Fill empty spots in row if less than 5 to maintain flex layout */}
            {Array.from({ length: 5 - rowButtons.length }).map((_, emptyIdx) => (
              <div key={`empty-${emptyIdx}`} style={{ flex: 1, height: '38px' }} />
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
