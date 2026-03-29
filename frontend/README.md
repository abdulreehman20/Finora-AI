# Finora AI — Landing Page

A premium, fully responsive landing page for **Finora AI** — an AI-powered personal finance tracker. Built with **Next.js 16**, **Tailwind CSS v4**, and **shadcn/ui**, with Aceternity UI components and Framer Motion animations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Install Dependencies
```bash
npm install
# or
bun install
```



### Run Development Server
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Color Theme

The site uses a **Green / White / Black** theme, configured in `src/app/globals.css`:

| Token | Description | Value |
|-------|-------------|-------|
| `--primary` | Main brand green | `oklch(0.52 0.19 145)` (light) / `oklch(0.58 0.2 145)` (dark) |
| `--brand` | Same as primary | Same as above |
| `--background` | Background | White (light) / Near-black (dark) |
| `--foreground` | Text | Black (light) / White (dark) |

To update the color theme:
1. Open `src/app/globals.css`
2. Edit the `--primary`, `--brand`, and related CSS variables under `:root` (light) and `.dark` (dark) blocks

---

## 🖼️ Updating Images

### Dashboard Image
The hero section uses a dashboard preview image located at:
```
public/dashboard.png
```
Replace this file with your actual dashboard screenshot. Recommended dimensions: **1400×800px** or larger.

---

## 📂 Component Architecture

```
src/
├── app/
│   ├── globals.css         ← Tailwind + shadcn theme (Green/White/Black)
│   ├── layout.tsx          ← Root layout with Inter font
│   └── page.tsx            ← Main landing page (assembles all sections)
│
└── components/
    ├── landing/
    │   ├── Navbar.tsx       ← Resizable navbar (Aceternity)
    │   ├── Hero.tsx         ← Hero with ripple bg + scroll animation
    │   ├── PurposeGrid.tsx  ← 2×2 purpose grid with animated center icon
    │   ├── FeaturesGrid.tsx ← Bento grid with glowing effects
    │   ├── Reviews.tsx      ← Draggable testimonials rows
    │   ├── Pricing.tsx      ← Monthly/Yearly toggle pricing cards
    │   ├── CTASection.tsx   ← CTA with noise background
    │   └── Footer.tsx       ← 4-column footer
    │
    └── ui/
        ├── resizable-navbar.tsx          ← Aceternity Navbar
        ├── background-ripple-effect.tsx  ← Aceternity Ripple
        ├── container-scroll-animation.tsx ← Aceternity Scroll
        └── glowing-effect.tsx            ← Aceternity Glow
```

---

## 🔧 Aceternity UI Components Used

| Component | Used In | Install Command |
|-----------|---------|-----------------|
| Resizable Navbar | `Navbar.tsx` | `npx shadcn@latest add @aceternity/resizable-navbar` |
| Background Ripple Effect | `Hero.tsx` | `npx shadcn@latest add @aceternity/background-ripple-effect` |
| Container Scroll Animation | `Hero.tsx` | `npx shadcn@latest add @aceternity/container-scroll-animation` |
| Glowing Effect | `FeaturesGrid.tsx` | `npx shadcn@latest add @aceternity/glowing-effect` |

---

## ✨ Features

- **Resizable Navbar** — Shrinks and gets a blur backdrop on scroll
- **Hero** — Interactive ripple background + 3D scroll-animated dashboard preview
- **Purpose Grid** — 2×2 grid with colored icons and animated spinning center loading icon
- **Key Features** — Three-column bento grid with mouse-tracking glow effects
- **Reviews** — Two draggable rows of testimonials with gradient avatars 
- **Pricing** — Monthly / Yearly toggle with animated price transitions
- **CTA** — Green gradient card with SVG noise texture overlay
- **Footer** — 4-column grid (Product, Company, Legal, Support)

---

## 📱 Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile | < 640px |
| Tablet | 640px – 1024px |
| Laptop | 1024px – 1280px |
| Desktop | ≥ 1280px |

---

## 🛠️ Build for Production

```bash
npm run build
npm start
```
