/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zemin ve Yüzey Katmanları (Derin Lacivert/Obsidyen)
        background: "#080C14",
        surface: "#0D131F",
        "surface-container-lowest": "#05080E",
        "surface-container-low": "#0F1726",
        "surface-container": "#141E30",
        "surface-container-high": "#1B273E",
        "surface-container-highest": "#23324F",
        "surface-variant": "#1A2333",

        // Ana Vurgu (Canlı Altın / Amber)
        primary: "#FBBF24",
        "primary-container": "#D97706",
        "primary-fixed": "#FEF3C7",
        "primary-fixed-dim": "#FDE68A",
        "on-primary": "#1E1300",
        "on-primary-container": "#FFFBEB",
        "inverse-primary": "#B45309",

        // İkincil Vurgu (Elektrik Mavisi / Cyan)
        secondary: "#38BDF8",
        "secondary-container": "#0284C7",
        "secondary-fixed": "#E0F2FE",
        "secondary-fixed-dim": "#BAE6FD",
        "on-secondary": "#042F2E",
        "on-secondary-container": "#F0F9FF",

        // Üçüncül / Nötr Destek (Ametist Moru / Yumuşak Vurgu)
        tertiary: "#A78BFA",
        "tertiary-container": "#6D28D9",
        "tertiary-fixed": "#EDE9FE",
        "tertiary-fixed-dim": "#DDD6FE",
        "on-tertiary": "#1E1035",
        "on-tertiary-container": "#F5F3FF",

        // Tipografi ve Metin Renkleri
        "on-background": "#F1F5F9",
        "on-surface": "#E2E8F0",
        "on-surface-variant": "#94A3B8",
        "inverse-surface": "#F8FAFC",
        "inverse-on-surface": "#0F172A",

        // Kenarlıklar ve Ayrıcılar (Borders)
        outline: "#334155",
        "outline-variant": "rgba(255, 255, 255, 0.08)",

        // Durum Renkleri (Hata / Başarı)
        error: "#F87171",
        "error-container": "#991B1B",
        "on-error": "#450A0A",
        "on-error-container": "#FEE2E2",
      },
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      borderRadius: {
        "DEFAULT": "8px",
        "sm": "6px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
        "full": "9999px"
      },
      spacing: {
        "container-max": "1440px",
        "unit": "8px",
        "margin-desktop": "64px",
        "margin-mobile": "20px",
        "gutter": "24px"
      },
      fontFamily: {
        "sora": ["var(--font-sora)", "sans-serif"],
        "body-lg": ["var(--font-sora)", "sans-serif"],
        "headline-lg": ["var(--font-sora)", "sans-serif"],
        "body-md": ["var(--font-sora)", "sans-serif"],
        "headline-xl": ["var(--font-sora)", "sans-serif"],
        "label-bold": ["var(--font-sora)", "sans-serif"],
        "headline-md": ["var(--font-sora)", "sans-serif"],
        "label-sm": ["var(--font-sora)", "sans-serif"],
        "headline-lg-mobile": ["var(--font-sora)", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "headline-lg": ["20px", {"lineHeight": "26px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
        "body-md": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
        "headline-xl": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "label-bold": ["12px", {"lineHeight": "16px", "letterSpacing": "0.03em", "fontWeight": "600"}],
        "headline-md": ["16px", {"lineHeight": "22px", "fontWeight": "600"}],
        "label-sm": ["11px", {"lineHeight": "14px", "fontWeight": "500"}],
        "headline-lg-mobile": ["18px", {"lineHeight": "24px", "fontWeight": "700"}]
      }
    },
  },
  plugins: [],
};
