---
name: Modern Risograph
colors:
  surface: '#fdf8fa'
  surface-dim: '#ded9db'
  surface-bright: '#fdf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2f4'
  surface-container: '#f2ecef'
  surface-container-high: '#ece7e9'
  surface-container-highest: '#e6e1e3'
  on-surface: '#1d1b1d'
  on-surface-variant: '#4a454c'
  inverse-surface: '#323032'
  inverse-on-surface: '#f5eff1'
  outline: '#7b757c'
  outline-variant: '#ccc4cc'
  surface-tint: '#665971'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#21172c'
  on-primary-container: '#8d7e98'
  inverse-primary: '#d1c0dd'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#151e12'
  on-tertiary-container: '#7d8777'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eedcf9'
  primary-fixed-dim: '#d1c0dd'
  on-primary-fixed: '#21172c'
  on-primary-fixed-variant: '#4e4259'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#dce6d3'
  tertiary-fixed-dim: '#c0cab8'
  on-tertiary-fixed: '#151e12'
  on-tertiary-fixed-variant: '#40493c'
  background: '#fdf8fa'
  on-background: '#1d1b1d'
  surface-variant: '#e6e1e3'
  block-lime: '#DCEEB1'
  block-lilac: '#C5B0F4'
  block-mint: '#C8E6CD'
  block-coral: '#F3C9B6'
  block-pink: '#EFD4D4'
  accent-magenta: '#FF3D8B'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 86px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: -0.01em
  eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  button:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: '0'
  caption:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  section-gap: 96px
  container-max: 1280px
---

## Brand & Style
The design system for I-FEST 2026 is built on a **Modern Risograph** aesthetic, blending the raw, energetic feel of independent print publishing with the precision of a high-end digital tool. The brand personality is celebratory, intellectual, and vibrantly creative, aiming to evoke a sense of immediate inspiration and "work-in-progress" energy.

The style leverages **Minimalism** as its structural foundation, using heavy whitespace and a strictly governed layout. This is punctuated by **High-Contrast** elements and massive, saturated color blocks that act as spatial containers. The interface avoids artificial depth, opting for a "flat-stack" philosophy where hierarchy is defined through color saturation and scale rather than lighting or texture. It is a digital tribute to the tactile nature of ink on paper.

## Colors
The palette is anchored by a high-contrast monochrome duo: **Midnight Ink** and **Off-White Canvas**. This "frame" provides a professional, authoritative base for the festival's identity. 

To inject energy, a series of **Color Blocks** (Lime, Lilac, Mint, Coral) are used to define major narrative beats. These colors are applied as full-bleed backgrounds for large containers, creating a rhythmic pacing that mimics flipping through chapters. The primary interactive color is Midnight, ensuring that buttons and CTAs remain grounded and highly legible regardless of which color block they sit upon.

## Typography
The typography system uses a variable sans-serif for its primary voice, emphasizing a tight, technical look. Headlines should use tight negative letter-spacing to create a "locked-in" visual density. 

Hierarchy is established through extreme scale shifts—massive display type contrasts against small, monospaced "eyebrow" labels. Use the monospaced font for technical details, metadata, and section labels to maintain the "editorial production" feel. For body copy, prioritize legibility with a slightly looser line height than headlines.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy with a maximum width of 1280px, centered on the Off-White canvas. The defining characteristic of this design system is the **96px vertical gap** between major sections, creating a luxurious sense of space and allowing each color block to feel independent.

Internal padding for color blocks should be generous (48px or more) to prevent content from feeling cramped against the 32px rounded corners. Use a 12-column grid for desktop layouts, transitioning to a single-column stack on mobile while maintaining the large vertical rhythm.

## Elevation & Depth
This system rejects traditional shadows. Elevation is conveyed through **Tonal Layers** and massive color blocks. Elements are treated as "cutouts" or "sticky notes" placed directly onto the canvas.

- **Level 0 (Canvas):** The base Off-White surface.
- **Level 1 (Blocks):** Large pastel containers with 32px rounded corners. These represent the primary content areas.
- **Level 2 (Interactive):** Midnight Black buttons or white secondary cards that sit atop the color blocks. 

The only exception for shadows is reserved for floating transient elements (like dropdown menus) to ensure they are distinguished from the content layers below. Use a soft, low-opacity shadow for these cases only.

## Shapes
The shape language is defined by a bold contrast between structural containers and interactive elements. 

- **Containers:** Large color blocks and cards use a consistent **32px (rounded-xl)** corner radius, giving them a soft, approachable, yet geometric presence.
- **Interactive Elements:** Buttons, tags, and chips must always be **Pill-shaped (rounded-full)**. This creates a clear visual affordance: if it is fully rounded, it is clickable.
- **Inputs:** Form fields should use a smaller **8px (rounded-md)** radius to maintain a sense of structural precision.

## Components

### Buttons
All buttons are pill-shaped. The **Primary Button** is Midnight Ink with White text. The **Secondary Button** uses an outline or a subtle Off-White fill. Hover states should involve a slight color shift (e.g., Midnight to Accent Magenta) but never a change in elevation or shadow.

### Color Blocks
The primary organizational unit. These are large `section` tags with 32px rounded corners. Each block should stick to one background color from the named palette. Avoid nesting different colored blocks; instead, stack them with the standard 96px gap.

### Chips & Tags
Always pill-shaped and typically use the monospaced font in a small size. Use these for categories, status indicators, or the "eyebrow" labels that sit above headlines.

### Input Fields
Inputs use a 1px Midnight border and 8px rounded corners. They do not use shadows. On focus, the border weight can increase to 2px or change to the Accent Magenta color.

### Cards
Cards within a color block should have White backgrounds and 24px rounded corners to distinguish them from the larger 32px container they reside in. This "nested rounding" maintains visual harmony.