# SaraFun Design Code: "Cyber-Neon"

This document defines the visual language and design tokens for the SaraFun application, characterized by a premium, dark, cybernetic, and neon-infused aesthetic.

## Core Palette

- **Background (BG):** `#0d0f14` - A deep, near-black space gray.
- **Accent (Neon):** `#00E5CC` - A vibrant, energetic turquoise.
- **Neon Dim:** `rgba(0, 229, 204, 0.15)` - Used for backgrounds and subtle borders.
- **Card Background:** `rgba(18, 22, 32, 0.85)` - Dark navy with glassmorphic transparency.
- **Surface:** `rgba(255, 255, 255, 0.04)` - Subtle layering for interactive elements.

## Typography

- **Font Family:** 'Inter', system-ui, sans-serif.
- **Headings:**
  - `h1`: 22px, Extra Bold (900), `letter-spacing: -0.02em`.
  - `h2`: 18px, Bold (700), `letter-spacing: -0.01em`.
- **Text Shadow:** Used for neon titles to create a glow effect.
  - `neon-glow`: `0 0 8px #00E5CC`.

## Effects & Components

### Glassmorphism
- **Standard Glass:**
  - `background: rgba(10, 14, 22, 0.96)`.
  - `backdrop-filter: blur(20px)`.
  - `border: 1px solid rgba(0, 229, 204, 0.12)`.

### Neon Borders
- **Active State:** `1.5px solid #00E5CC`.
- **Inactive State:** `1.5px solid rgba(255, 255, 255, 0.12)`.

### Interactive Behavior (Press)
- **Buttons/Cards:** `active: scale(0.92)` or `active: scale(0.97)`.
- **Haptic Feedback:** Use `WebApp.HapticFeedback.impactOccurred('light')` for most taps.

### Bottom Navigation
- **Height:** 72px (including safe-area-inset-bottom).
- **QR Focus:** The central button is a floating circle with a radial neon gradient and intense glow.
- **Icons:** Thin strokes (1.8pt), бирюзовый when active, subtle white/40% when inactive.

## Sections & Layout
- **Scroll Rows:** Horizontal скролл-ряды with `gap: 12px` and no scrollbar.
- **Section Titles:** Pulse animation on neon titles.
- **Cards:** Rounded corners (14px - 18px), high contrast, dark overlays for readability.
