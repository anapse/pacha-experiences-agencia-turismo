# Design System — Pacha Experiences

## Inspiración

- **Airbnb** — Tarjetas de experiencia, navegación limpia
- **Booking** — Filtros, calendario, reseñas
- **GetYourGuide** — Itinerarios, actividades
- **Uber** — Diseño mobile-first, mapas, tracking
- **Notion** — Tipografía, espacios, íconos
- **Apple** — Minimalismo, animaciones, materiales
- **Stripe** — Dashboard, formularios, datos

## Paleta de Colores

### Tema Claro
```
Primary:       #0ea5e9 (Sky-500)
Primary Dark:  #0284c7 (Sky-600)
Secondary:     #8b5cf6 (Violet-500)
Accent:        #f59e0b (Amber-500)
Success:       #10b981 (Emerald-500)
Danger:        #ef4444 (Red-500)
Warning:       #f59e0b (Amber-500)
Info:          #3b82f6 (Blue-500)

Background:    #ffffff
Bg Secondary:  #f8fafc (Slate-50)
Bg Tertiary:   #f1f5f9 (Slate-100)
Text Primary:  #0f172a (Slate-900)
Text Secondary:#475569 (Slate-600)
Text Tertiary: #94a3b8 (Slate-400)
Border:        #e2e8f0 (Slate-200)
```

### Tema Oscuro
```
Background:    #0f172a (Slate-900)
Bg Secondary:  #1e293b (Slate-800)
Bg Tertiary:   #334155 (Slate-700)
Text Primary:  #f8fafc (Slate-50)
Text Secondary:#cbd5e1 (Slate-300)
Text Tertiary: #64748b (Slate-500)
Border:        #334155 (Slate-700)
```

## Glassmorphism
```
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

## Sombras
```
sm:   0 1px 2px rgba(0,0,0,0.05)
md:   0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)
lg:   0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)
xl:   0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)
2xl:  0 25px 50px -12px rgba(0,0,0,0.25)
glow: 0 0 20px rgba(14, 165, 233, 0.15)
```

## Border Radius
```
sm:   8px
md:   12px
lg:   16px
xl:   24px
full: 9999px
```

## Tipografía
```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Font Mono:   'JetBrains Mono', monospace (para código)

Sizes:
xs:   0.75rem  (12px)
sm:   0.875rem (14px)
base: 1rem     (16px)
lg:   1.125rem (18px)
xl:   1.25rem  (20px)
2xl:  1.5rem   (24px)
3xl:  1.875rem (30px)
4xl:  2.25rem  (36px)
5xl:  3rem     (48px)
6xl:  3.75rem  (60px)
```

## Espaciado
```
xs:   4px
sm:   8px
md:   16px
lg:   24px
xl:   32px
2xl:  48px
3xl:  64px
4xl:  96px
```

## Animaciones
```css
/* Transición base */
--transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover en tarjetas */
transform: translateY(-4px);
box-shadow: var(--shadow-lg);

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scale in */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Slide up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Breakpoints
```
Mobile:  0 - 639px
Tablet:  640px - 1023px
Desktop: 1024px+
Wide:    1280px+
```

## Imágenes Placeholder
Todas las imágenes usan placeholders generados con SVG inline o colores sólidos hasta que se generen las imágenes reales con IA.

Formato: `[IMG_NOMBRE_DESCRIPTIVO]`
Ancho/Alto estandarizados para consistencia.
