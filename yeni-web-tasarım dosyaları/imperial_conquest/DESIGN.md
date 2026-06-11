---
name: Imperial Conquest
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#d0c6ab'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#999077'
  outline-variant: '#4d4732'
  surface-tint: '#e9c400'
  primary: '#fff6df'
  on-primary: '#3a3000'
  primary-container: '#ffd700'
  on-primary-container: '#705e00'
  inverse-primary: '#705d00'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#f9f5f6'
  on-tertiary: '#313031'
  tertiary-container: '#dcd9da'
  on-tertiary-container: '#605e60'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe16d'
  primary-fixed-dim: '#e9c400'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#e5e2e3'
  tertiary-fixed-dim: '#c8c6c7'
  on-tertiary-fixed: '#1c1b1c'
  on-tertiary-fixed-variant: '#474647'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system embodies the "Imperial Conquest" narrative, positioning the product as an elite tactical command center for high-stakes coordination. The brand personality is authoritative, precise, and high-octane, designed to evoke the feeling of a digital war-room where legendary campaigns are managed.

The visual style is a hybrid of **Glassmorphism** and **High-Contrast Bold**. It utilizes deep, obsidian-like surfaces to provide a sophisticated backdrop for aggressive, high-fidelity amber accents. The aesthetic relies on the interplay between sharp geometric precision and soft, luminous glass effects, creating a sense of advanced technology meeting tactical grit.

## Colors

The palette is rooted in a "Blackout" foundation, using **#0A0A0B (Obsidian)** as the primary canvas to ensure maximum contrast and visual depth.

- **Primary Amber (#FFD700):** Used for critical calls to action, high-priority status indicators, and metallic highlights.
- **Strategic Gold (#F59E0B):** Used for interactive elements, hover states, and secondary accents to provide a rich, multi-tonal metallic feel.
- **Obsidian Surfaces:** Gradients move from `#0A0A0B` to a slightly lighter `#1E293B` (Deep Slate) to create a sense of three-dimensional form and metallic sheen.
- **Tactical Glows:** Primary colors are used with varying opacities (10-30%) to create atmospheric backdrops and button "auras" that simulate illuminated hardware.

## Typography

The design system utilizes **Sora** exclusively to maintain a tech-forward, aggressive gaming aesthetic. 

Headlines use heavy weights (700-800) and tight letter spacing to create a commanding presence. Labels and tactical data should be set in uppercase with increased letter spacing to mimic military heads-up displays (HUDs). All text remains high-contrast against the dark background, primarily utilizing white or light slate, with amber reserved for emphasizing key tactical data points.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile. The layout is structured around an 8px base unit to ensure mathematical precision in element alignment.

- **Desktop:** 12-column grid with a 1440px max-width, 24px gutters, and 64px side margins. 
- **Mobile:** 4-column fluid grid with 16px gutters and 20px side margins.
- **Sectioning:** Use generous vertical padding (80px to 120px) between major content blocks to allow the "Obsidian" surfaces to breathe and enhance the premium feel. 
- **Alignment:** Elements should feel "locked-in" to the grid, avoiding soft or floating placements to maintain the tactical, war-room structure.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** combined with **Glassmorphism**. Depth is not created by traditional shadows, but by the luminosity of borders and background blurs.

- **Base Layer:** Solid `#0A0A0B`.
- **Surface Layer:** Semi-transparent deep slate with a 20px backdrop blur and a 1px solid border (`#FFFFFF` at 10% opacity) to define edges.
- **Active Layer:** Elevated elements feature a subtle inner glow or a primary-colored border at low opacity.
- **Luminosity:** Hover states should trigger a "Primary Glow," where an outer shadow using `#FFD700` at 15% opacity creates a soft illumination effect around the element.

## Shapes

The shape language is primarily **Sharp (0px)** to reflect an aggressive, militaristic aesthetic. Square corners emphasize the rigid, tactical nature of the bot's interface. 

Where glassmorphic containers are used for secondary information (e.g., tooltips or chat bubbles), a subtle 4px radius may be applied to differentiate them from primary tactical controls. However, all primary buttons, inputs, and card containers must remain strictly rectangular with 90-degree corners.

## Components

- **Tactical Buttons:** Rectangular with no radius. Primary buttons feature a solid `#FFD700` background with black text. Hovering triggers a brightness shift and a subtle amber outer glow. Secondary buttons use a transparent background with a 1px metallic gold border.
- **Status Chips:** Small, sharp-edged tags. Use a high-opacity amber background for "Active" and a deep slate for "Inactive."
- **Data Lists:** Rows should be separated by 1px slate dividers. Hovering over a row should apply a 5% white overlay to the background, creating a "scanning" highlight effect.
- **Input Fields:** Dark background with a bottom-only border in `#F59E0B`. When focused, the border should glow, and the label should shift to uppercase primary amber.
- **Tactical Cards:** Use a dark gradient background (`#1E293B` to `#0A0A0B`). Include a subtle top-border highlight in gold to suggest a metallic finish.
- **Command HUD:** A specialized component for real-time party updates, featuring a glassmorphic background with high-opacity borders and monospaced-style Sora labels for a technical feel.