import { ImageResponse } from 'next/og';
import { BUTTON_DATA } from './buttonConfigs';

/**
 * Generates an ultra-crisp PNG image buffer using next/og ImageResponse
 * Dimensions: 705px wide, dynamic height based on row count
 */
export async function generateInterfaceImage(activeButtons, lang = 'tr') {
  if (!activeButtons || activeButtons.length === 0) {
    return null;
  }

  const rowCount = Math.ceil(activeButtons.length / 5);
  // Heights matching user exact specifications:
  // 1 row: ~42px, 2 rows: ~80px, 3 rows: ~118px
  const height = rowCount === 1 ? 42 : rowCount === 2 ? 80 : 118;
  const width = 705;

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
          padding: '4px 6px',
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
              return (
                <div
                  key={btnId}
                  style={{
                    flex: 1,
                    height: '32px',
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
                    {config.icon(config.color)}
                  </div>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '11px',
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
              <div key={`empty-${emptyIdx}`} style={{ flex: 1, height: '32px' }} />
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
