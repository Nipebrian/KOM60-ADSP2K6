---
name: Agro-Urban Vitality
colors:
  surface: '#f6fbf4'
  surface-dim: '#d7dbd5'
  surface-bright: '#f6fbf4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f5ee'
  surface-container: '#ebefe9'
  surface-container-high: '#e5e9e3'
  surface-container-highest: '#dfe4dd'
  on-surface: '#181d19'
  on-surface-variant: '#3f4941'
  inverse-surface: '#2d322d'
  inverse-on-surface: '#eef2eb'
  outline: '#6f7a71'
  outline-variant: '#bec9bf'
  surface-tint: '#046d40'
  primary: '#00502e'
  on-primary: '#ffffff'
  primary-container: '#006b3f'
  on-primary-container: '#91e9b1'
  inverse-primary: '#81d9a2'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#782b31'
  on-tertiary: '#ffffff'
  tertiary-container: '#964247'
  on-tertiary-container: '#ffc9c9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9df5bd'
  primary-fixed-dim: '#81d9a2'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#00522f'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b4'
  on-tertiary-fixed: '#40010b'
  on-tertiary-fixed-variant: '#7a2d33'
  background: '#f6fbf4'
  on-background: '#181d19'
  surface-variant: '#dfe4dd'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

## Brand & Style
This design system captures the intersection of academic prestige and modern culinary convenience. The brand personality is **Fresh, Efficient, and Community-Focused**, bridging the gap between IPB's agricultural heritage and the fast-paced needs of a modern food delivery ecosystem. 

The aesthetic follows a **Corporate / Modern** style with a focus on high legibility and clear information architecture. It leverages a "Clean-Green" philosophy: heavy use of white space to promote a sense of hygiene and freshness, accented by a deep botanical green that evokes growth and sustainability. Visual elements are streamlined to reduce cognitive load during the high-intent task of food ordering.

## Colors
The palette is anchored by **IPB Green**, used for primary actions and brand identifiers to establish authority and trust. **Warm Yellow** serves as a functional accent for secondary interactions, ratings, and highlights, stimulating appetite and friendliness.

The neutral scale is strictly controlled: **White** serves as the base for all card-based layouts to maintain "clutter-free" visuals, while **Light Gray** provides subtle structural separation for background sections. Semantic colors (Danger, Success, Info) follow standard accessibility patterns to ensure error states and order confirmations are instantly recognizable.

## Typography
This design system utilizes **Plus Jakarta Sans** for its friendly, modern, and highly legible characteristics, which outperform standard sans-serifs in food and beverage contexts. 

Headings use a tighter letter-spacing and heavier weights to create a strong visual hierarchy against the dark gray (#1A1A1A). Body text is optimized for readability with generous line heights, ensuring that menu descriptions and ingredient lists are easy to scan. Muted styles are reserved for secondary metadata like distance, delivery time, or disabled states.

## Layout & Spacing
The layout employs a **Fluid Grid** system based on a 4px baseline rhythm. For mobile interfaces, a 4-column grid is used with 16px margins; for desktop, a 12-column grid with 24px gutters is standard.

Spacing follows a geometric scale to ensure consistent grouping. Use 8px (sm) for internal element spacing (e.g., icon to text) and 16px (md) for padding within cards or between logical sections. Larger gaps of 24px-32px should be used to separate major content blocks like "Promos" from "Restaurant Categories."

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and tonal layering. The primary depth marker is a soft, diffused shadow (`0 2px 8px rgba(0,0,0,0.08)`) applied to cards and floating action buttons.

To maintain a "clean" look, elevation is kept to two primary tiers:
1.  **Level 0 (Flat):** Used for background and subtle content sections (Light Gray).
2.  **Level 1 (Raised):** Used for interactive cards (White) to make them pop against the background.
3.  **Level 2 (Overlay):** Reserved for sticky navigation bars and modals, using the same shadow profile but often paired with a subtle 1px border (#E0E0E0) for extra definition.

## Shapes
The shape language is "Soft-Organic," reflecting the "leaf" aspect of the brand logo. 
- **Cards** use a 12px radius to feel modern and approachable.
- **Buttons** use a slightly tighter 8px radius to maintain a sense of structural integrity and precision.
- **Pills** (24px radius) are used exclusively for status tags (e.g., "Open," "Free Delivery") and filter chips to distinguish them clearly from actionable buttons.

## Components

### Buttons
- **Primary:** Solid IPB Green with white text. 8px radius. Hover state shifts to #005432.
- **Secondary:** White background with IPB Green border and text. 
- **Ghost:** No background/border, green text. Used for "See All" or "View Details."

### Cards
- White background, 12px radius, with the standard 8px ambient shadow. Card content should have 16px internal padding. Product images within cards should have their top corners rounded to 12px.

### Input Fields
- 8px radius, Light Gray (#F5F7FA) fill with a 1px border (#E0E0E0). On focus, the border transitions to IPB Green with a subtle glow.

### Chips & Tags
- **Category Chips:** Pill-shaped (24px), White background with a light border.
- **Status Tags:** Pill-shaped with low-opacity background fills of the semantic colors (e.g., Success green at 10% opacity for "Recommended").

### Specialized Components
- **Cart Summary Bar:** A sticky bottom component using the Primary Green color, displaying total price and a "Check Out" label.
- **Quantity Selector:** A compact 8px rounded component with "minus" and "plus" icons flanking the current count.
- **Restaurant Header:** Uses a high-quality hero image with a gradient overlay to ensure the white "IPB Food Hub" logo and back button remain visible.