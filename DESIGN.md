---
name: Precision Voyage
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#434655'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#005e6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#00788c'
  on-tertiary-container: '#d7f6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is anchored in the intersection of high-end travel inspiration and algorithmic precision. It targets a sophisticated traveler who values efficiency as much as aesthetics, blending the spaciousness of luxury lifestyle brands with the utilitarian clarity of modern developer tools.

The visual direction is **Minimalist-Professional**. It prioritizes extreme clarity, generous whitespace, and a "content-first" hierarchy. Drawing influence from industry leaders in precision software, the system employs subtle geometric cues to signal intelligence and reliability, while maintaining an airy, welcoming atmosphere through a light-heavy color distribution. The result is a UI that feels like a calm, expert concierge—authoritative yet unobtrusive.

## Colors

The palette is engineered for a "clean-tech" aesthetic. The **Primary Blue** (#2563EB) provides a foundation of trust and professional stability, while the **Secondary Purple** (#7C3AED) is used sparingly to denote AI-driven features and premium "magic" moments. The **Cyan Accent** (#06B6D4) serves as a functional highlight for secondary actions and data visualizations.

Backgrounds utilize a cool off-white (#F8FAFC) to reduce eye strain, while pure white (#FFFFFF) is reserved for elevated surface containers to create a clear physical hierarchy. High-contrast typography (#111827) ensures accessibility and a crisp, editorial feel.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. **Space Grotesk** is the voice of the brand, used for headings to provide a technical, geometric edge that suggests modern innovation. Its unique apertures give the UI a distinctive, memorable personality.

**Inter** serves as the workhorse for all functional content. Chosen for its exceptional legibility and neutral character, it ensures that complex travel data and AI-generated text remain highly readable. Tracking should be tightened slightly for large headlines and loosened for small uppercase labels to maintain optimal balance.

## Layout & Spacing

The layout is built on a rigorous **12-column fluid grid** for desktop, transitioning to a 4-column grid for mobile devices. All spatial relationships are governed by an 8px base unit to ensure mathematical harmony across the UI.

Padding within cards and containers should be generous (typically 24px or 32px) to reinforce the premium, "breathable" feel of the system. Sticky navigation is a core requirement, ensuring that travel planning tools remain accessible as users scroll through long itineraries. Sidebars are used for secondary navigation and filtering, maintaining a fixed width of 280px on desktop to provide a consistent anchor for the content area.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. Unlike harsh, traditional shadows, this system uses multi-layered, low-opacity blurs (e.g., 4% to 8% opacity) tinted with the primary neutral color to create a "floating" effect.

There are three primary elevation levels:
1.  **Level 0 (Base):** The background (#F8FAFC), used for the overall canvas.
2.  **Level 1 (Surface):** The primary containers (#FFFFFF), featuring a 1px subtle border (#E2E8F0) and a soft shadow.
3.  **Level 2 (Overlay):** Modals, dropdowns, and active "floating" cards, which use a more pronounced shadow to indicate temporary interaction and focus.

Backdrop blurs (12px - 20px) are applied to sticky navbars and modals to provide a modern, translucent feel that maintains context of the content beneath.

## Shapes

The shape language is defined by a **Rounded** profile. A standard corner radius of 16px (1rem) is applied to all major cards and containers to soften the technical nature of the typography and create a friendly, approachable atmosphere.

Buttons and input fields follow a 12px radius to feel integrated yet distinct from the larger structural cards. For small interactive elements like tags or "AI" badges, use a pill-shape (full rounding) to differentiate them as actionable or informative tokens. Borders should remain thin (1px) and low-contrast to avoid cluttering the minimalist aesthetic.

## Components

**Buttons & Interactive States**
Primary buttons use the Primary Blue with white text. Hover states involve a subtle darken (10%) and a slight upward translate (1px) to mimic physical tactility. Loading states should utilize a subtle shimmer effect rather than a traditional spinner to maintain the "premium" feel.

**Floating Cards**
The core UI element for travel destinations and itinerary steps. Cards must feature a 16px radius, a 1px stroke (#F1F5F9), and a Level 1 shadow. Images within cards should have a top-only rounding of 16px.

**Input Fields & Forms**
Fields utilize a light gray background (#F1F5F9) that transitions to pure white (#FFFFFF) with a 2px Primary Blue border on focus. All labels use `label-md` for clarity.

**AI Indicators**
Features powered by AI are marked with a subtle gradient (Secondary to Accent) and Lucide "Sparkles" icons. These elements should feel lighter and more dynamic than standard UI components.

**Tables & Data**
Tables should be borderless, using alternating row backgrounds or subtle dividers. Headers are set in `label-sm` with a light gray text color to keep focus on the data.

**Navigation**
The top Navbar is sticky with a heavy backdrop blur. The Sidebar uses a clean, vertical list with active states indicated by a Primary Blue left-accent bar and a light blue background tint.

**Icons**
Use Lucide icons with a 'Regular' (2px) stroke weight. Icons should be monochrome (Text Secondary) except when used as primary action indicators or within AI-themed components.