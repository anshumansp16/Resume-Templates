# ResumePro Design System
**World-Class SaaS Landing Page — Complete Reference**

---

## 🎨 DESIGN PHILOSOPHY

**Core Principle**: Subtle, Premium, Intentional
- Minimalism over decoration
- Micro-depth (2-4% gradients) not flatness
- Subtle borders (rgba 255,255,255,0.05-0.10)
- Soft shadows (not glows)
- No chunky pills or blobs
- Every pixel intentional

**Visual Identity**: Linear + Framer + Notion aesthetic
- Dark mode first
- Royal blue + deep charcoal 
- Clean typography
- Micro-interactions everywhere

---

## 🛠 TECHNICAL STACK

```json
{
  "framework": "Next.js 16.0.5",
  "react": "19",
  "styling": "Tailwind CSS v4",
  "ui": "Shadcn/ui + Radix UI",
  "icons": "Lucide React",
  "fonts": "Inter (Google Fonts: 300,400,500,600,700)",
  "animations": "Tailwind transitions + CSS transforms",
  "utilities": "clsx + tailwind-merge + class-variance-authority"
}
```

---

## 🎨 COLOR SYSTEM

### Brand Identity (Never Change)
```css
/* Primary - Royal Tech Blue */
--primary-navy:     hsl(232 65% 15%)
--primary-deep:     hsl(232 72% 23%)
--primary-royal:    hsl(228 68% 42%)
--primary:          hsl(226 71% 55%)    /* #3B5BFF equivalent */
--primary-electric: hsl(224 76% 62%)
--primary-light:    hsl(222 82% 72%)

/* Background - Deep Charcoal */
--background:           hsl(228 12% 5%)   /* #0B0B0D */
--background-elevated:  hsl(228 10% 7%)
--background-elevated-2: hsl(228 8% 10%)

/* Text */
--foreground:        hsl(0 0% 98%)        /* White */
--foreground-muted:  hsl(220 15% 70%)
--foreground-soft:   hsl(220 12% 56%)

/* Semantic */
--success:  hsl(158 64% 52%)  /* Emerald */
--destructive: hsl(0 84% 60%) /* Red */

/* Borders */
--border:        rgba(255, 255, 255, 0.05)
--border-strong: rgba(255, 255, 255, 0.08)
```

### Tailwind Usage
```jsx
bg-primary           /* Royal blue */
bg-background        /* Deep charcoal */
text-foreground      /* White */
text-foreground-muted /* Muted grey */
border-white/[0.05]  /* Subtle border */
border-white/[0.10]  /* Visible border */
```

---

## 📐 SPACING SYSTEM

### Vertical Spacing (Sections)
```css
py-16   /* Standard section padding (64px total) */
pb-24   /* Hero section bottom (96px) */
mb-12   /* Section header to content (48px) */
mb-3    /* H2 to description (12px) */
mb-4    /* H1 to description (16px) */
mb-2    /* H3 to description (8px) */
```

### Container Widths
```jsx
max-w-7xl  /* Full-width sections (1280px) */
max-w-6xl  /* Tighter grids like templates (1152px) */
max-w-4xl  /* Hero container (896px) */
max-w-3xl  /* Headlines & text content (768px) */
max-w-2xl  /* Body text (672px) */
```

### Gap System
```css
gap-6   /* Grid items (24px) */
gap-3   /* Button content (12px) */
gap-2   /* Icon + text (8px) */
space-y-2 /* Vertical stack (8px) */
```

---

## 🔤 TYPOGRAPHY

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-feature-settings: "rlig" 1, "calt" 1;
```

### Text Scale
```jsx
/* Display - Hero Headlines */
text-5xl md:text-7xl  /* 48px → 72px */
font-extrabold
tracking-tight
leading-[1.1]
max-w-3xl mx-auto

/* Section - Main Headers */
text-4xl md:text-5xl  /* 36px → 48px */
font-bold
tracking-tight
mb-3

/* Title - Card Headers */
text-lg               /* 18px */
font-bold
tracking-tight
mb-2

/* Body - Descriptions */
text-lg               /* 18px - Hero description */
text-base            /* 16px - Regular body */
text-sm              /* 14px - Small text */
text-xs              /* 12px - Badges */

/* Muted Text */
text-foreground-muted
```

---

## 🎴 COMPONENT PATTERNS

### Cards (Micro-Depth)
```css
.card-template {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.card-template:hover {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.05) 100%);
  border-top-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}
```

### Buttons
```jsx
/* Primary CTA */
className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4
           font-bold text-white hover:bg-primary-electric transition-all"

/* Secondary CTA */
className="inline-flex items-center gap-2 rounded-lg bg-white/[0.02]
           border border-white/[0.10] px-8 py-4 font-semibold
           hover:bg-white/[0.08] hover:border-white/[0.18] transition-all"
```

### Badges
```jsx
/* Minimal Pills */
className="inline-flex items-center gap-2 rounded-full
           border border-white/[0.07] px-3 py-1 text-xs font-medium"
```

### Feature Cards
```jsx
className="card-feature p-6 h-44 sm:h-48 flex flex-col"

/* Icon Container */
className="inline-flex h-10 w-10 items-center justify-center
           rounded-lg bg-primary-royal/80 text-primary-light mb-4"

/* Content */
<div className="space-y-2 flex-1">
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-sm text-foreground-muted leading-relaxed">Description</p>
</div>
```

### Template Cards
```jsx
className="card-template cursor-pointer hover:-translate-y-1
           hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
```

---

## 🎭 GRADIENTS & BACKGROUNDS

### Hero Section
```jsx
className="min-h-screen flex items-center pb-24
           bg-gradient-to-b from-[#0c0c0c] to-[#000]"
```

### Body Background
```jsx
className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
           from-neutral-900 via-background to-background"
```

---

## ✨ ANIMATIONS & TRANSITIONS

### Standard Transition
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Transforms
```jsx
hover:translateY(-1px)     /* Card lift */
hover:translateY(-2px)     /* Feature card lift */
hover:scale-[1.02]         /* Template card scale */
hover:translate-x-1        /* Arrow shift */
```

### Duration
```css
duration-300  /* Smooth interactions */
duration-200  /* Quick interactions */
```

---

## 📏 LAYOUT PATTERNS

### Hero Section
```jsx
<section className="min-h-screen flex items-center pb-24
                    bg-gradient-to-b from-[#0c0c0c] to-[#000]">
  <div className="mx-auto max-w-4xl px-6 text-center w-full">
    <div className="mb-8">
      <span className="badge">AI-Powered Resume Builder</span>
    </div>
    <h1 className="text-5xl md:text-7xl font-extrabold mb-4
                   tracking-tight leading-[1.1] max-w-3xl mx-auto">
      Headline
    </h1>
    <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-12">
      Description
    </p>
    {/* CTAs */}
  </div>
</section>
```

### Standard Section
```jsx
<section className="py-16 border-b border-border">
  <div className="mx-auto max-w-7xl px-6">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-bold mb-3">Title</h2>
      <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
        Description
      </p>
    </div>
    {/* Content */}
  </div>
</section>
```

### Grid Pattern
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

## 🔧 TAILWIND CONFIG ESSENTIALS

### next.config.ts
```ts
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
};
```

### globals.css Structure
```css
@import "tailwindcss";

@theme {
  /* Color variables */
  /* Radius system */
}

@layer base {
  /* CSS variable mapping */
}

@layer utilities {
  /* Custom utilities */
  /* Typography classes */
  /* Card styles */
  /* Button styles */
}
```

---

## 📦 NPM PACKAGES

### Core Dependencies
```bash
npm i next@latest react@latest react-dom@latest
npm i tailwindcss@latest postcss@latest
npm i @tailwindcss/postcss@latest
npm i @radix-ui/react-*  # UI primitives
npm i lucide-react       # Icons
npm i class-variance-authority clsx tailwind-merge
```

### Dev Dependencies
```bash
npm i -D typescript @types/node @types/react
npm i -D baseline-browser-mapping@latest
```

---

## 🎯 CRITICAL DESIGN RULES

### DO's ✅
- Use `min-h-screen` for hero sections
- Always add `pb-24` to hero to prevent peek
- Use `max-w-3xl` for headlines
- Use uniform heights for card grids
- Add micro-depth gradients (2-4%)
- Use `border-white/[0.05]` for subtle borders
- Add hover states to all interactive elements
- Use `tracking-tight` for headlines
- Keep spacing consistent with mb-12, mb-3, mb-2

### DON'Ts ❌
- No chunky background pills/blobs
- No heavy shadows or glows
- No arbitrary spacing values
- No competing CTAs (secondary should be softer)
- No flat cards (always add micro-depth)
- No inconsistent border opacities
- No fixed heights on hero sections
- No ultra-wide text containers (>max-w-4xl)

---

## 🚀 QUICK START TEMPLATE

```jsx
// Landing Page Starter
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
                    from-neutral-900 via-background to-background">

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border
                      backdrop-blur-xl bg-background/80">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">Logo</div>
            <div className="flex items-center gap-3">
              <Link href="#" className="btn-secondary">Sign In</Link>
              <Link href="#" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pb-24
                          bg-gradient-to-b from-[#0c0c0c] to-[#000]">
        <div className="mx-auto max-w-4xl px-6 text-center w-full">
          <span className="inline-flex items-center gap-2 rounded-full
                          border border-white/[0.07] px-3 py-1 text-xs mb-8">
            Badge
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4
                         tracking-tight max-w-3xl mx-auto">
            Headline
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-12">
            Description
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn-primary">Primary CTA</button>
            <button className="btn-secondary">Secondary CTA</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">Title</h2>
            <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
              Description
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature cards */}
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 📊 DESIGN METRICS

| Element | Value | Purpose |
|---------|-------|---------|
| Section padding | `py-16` | Standard vertical rhythm |
| Hero height | `min-h-screen` | Full viewport coverage |
| Card height | `h-44 sm:h-48` | Uniform grid alignment |
| Headline width | `max-w-3xl` | Optimal readability |
| Grid container | `max-w-6xl` | Focused content |
| Border radius | `12px` | Modern, not too round |
| Transition timing | `0.2s` | Snappy feel |
| Hover lift | `-2px` | Subtle elevation |

---

## 🎨 COLOR USAGE GUIDE

| Use Case | Class | Opacity |
|----------|-------|---------|
| Subtle border | `border-white/[0.05]` | 5% |
| Visible border | `border-white/[0.10]` | 10% |
| Badge border | `border-white/[0.07]` | 7% |
| Card background | `bg-white/[0.03]` | 3% |  
| Button background | `bg-white/[0.02]` | 2% |
| Hover state | `bg-white/[0.08]` | 8% |

---

**VERSION**: 1.0 - Production Perfect
**LAST UPDATED**: 8 December, 2025
**COMPATIBLE WITH**: Next.js 15+, Tailwind CSS v4+

---

*Copy this entire system to replicate world-class SaaS aesthetics anywhere.*