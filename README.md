<div align="center">

# 🏜️ Pacha Experiences

### Plataforma de Gestión Turística Profesional

![Status](https://img.shields.io/badge/Estado-En%20Desarrollo-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Node](https://img.shields.io/badge/Node-20-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)
![License](https://img.shields.io/badge/Licencia-MIT-green)

---

</div>

## ✦ Sobre el Proyecto

**Pacha Experiences** es una plataforma web profesional para la gestión completa de una agencia de turismo en Huacachina, Perú. Permite administrar reservas, cupos, transporte, conductores, clientes, pagos, facturación, chat en tiempo real y emergencias, todo desde un panel administrativo moderno e intuitivo.

> 🌵 *"Vive la mejor experiencia en el desierto peruano"*

---

## ✨ Características

### 🌐 Sitio Público
| Característica | Descripción |
|---------------|-------------|
| 🎠 **Carrusel infinito** | Hero con 9 slides, auto-play, loop infinito, textos traducibles |
| 🔍 **Catálogo experiencias** | Búsqueda, filtros, ordenamiento, paginación |
| 📅 **Calendario reservas** | Vista mensual con disponibilidad en tiempo real |
| 📋 **Detalle experiencia** | Galería, itinerario, reseñas, WhatsApp, reserva |
| 💬 **Chat flotante** | Widget con pestañas por área (Oficina, Transporte, Tubulares, Reservas) |
| 🌍 **Multi-idioma** | Español / Inglés con sistema i18n |
| 💰 **Multi-moneda** | Soles (PEN), Dólares (USD), Euros (EUR) |
| 🌙 **Modo oscuro** | Tema claro/oscuro con transición suave |
| 📱 **Responsive** | Mobile-first, adaptable a tablets y desktop |

### ⚙️ Panel Administrador (12+ Módulos)

| Módulo | Descripción |
|--------|-------------|
| 📊 **Dashboard** | Estadísticas en vivo, visitas, usuarios activos, gráfico 7 días |
| 🏜️ **Experiencias** | CRUD completo con imagen, precios, ES/EN, itinerario |
| 📋 **Reservas** | Gestión de reservas y estados |
| 👥 **Clientes** | CRM con historial y etiquetas |
| 🚗 **Conductores** | Licencia, contacto, WhatsApp, vehículo asignado |
| 👷 **Operadores** | Gestión de operadores de tubulares |
| 🚐 **Vehículos** | Flota con capacidad y estado |
| 📦 **Productos** | Servicios adicionales configurables |
| 💰 **Facturación** | Boletas, facturas, notas de crédito |
| 📈 **Reportes** | Gráficos de ingresos, tours vendidos, demanda |
| 🎠 **Carrusel** | Editor de slides del hero principal |
| ⚙️ **Configuración** | Redes sociales, horarios, datos de empresa |

### 🔧 Backend

- **API REST** con Express
- **Autenticación JWT** (access + refresh tokens)
- **Socket.IO** para chat en tiempo real y emergencias
- **SQLite** con capa de abstracción (preparado para PostgreSQL)
- **Rate limiting**, CORS, Helmet
- **Sistema de estadísticas** de visitas en tiempo real

---

## 🛠️ Stack Tecnológico

```
Frontend          Backend           Base de Datos
──────────        ────────          ─────────────
React 19          Node.js 20+       SQLite →
Vite 6            Express 4         PostgreSQL (futuro)
CSS Modules       JWT               better-sqlite3
React Router      Socket.IO         
Axios             Multer            
                  Nodemailer        
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+
- npm 10+

### Instalación

```bash
# 1. Clonar
git clone https://github.com/anapse/pacha-experiences-agencia-turismo.git
cd pacha-experiences-agencia-turismo

# 2. Backend
cd backend
npm install
cp .env.example .env    # Editar .env con tus datos
npm run dev              # http://localhost:3001

# 3. Frontend
cd ../frontend
npm install
npm run dev              # http://localhost:5173
```

### Acceso Admin
```
URL:      http://localhost:5173/login
Email:    admin@pacha.com
Password: admin123
```

---

## 📁 Estructura del Proyecto

```
TurismoPlatform/
├── frontend/                    # React 19 + Vite
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── common/         #   Image, Carousel, Loading, Modal
│   │   │   ├── chat/           #   ChatWidget (Socket.IO)
│   │   │   └── layout/         #   Header, Footer, MobileNav, AdminLayout
│   │   ├── pages/              # Páginas públicas
│   │   │   └── admin/          # Páginas del panel admin (12+)
│   │   ├── contexts/           # Auth, Theme, I18n, Currency, Socket
│   │   ├── hooks/              # useTranslate, useVisitTracker
│   │   ├── i18n/               # Traducciones ES/EN
│   │   ├── services/           # Cliente API (Axios)
│   │   ├── utils/              # currency, imageMap, socialIcons
│   │   └── styles/             # variables, reset, global, animations
│   └── public/images/          # 23 imágenes optimizadas
│
├── backend/                    # Node.js + Express
│   └── src/
│       ├── routes/             # 15 módulos de ruta
│       ├── middleware/         # auth, roles, validación, upload
│       ├── socket/             # chat, emergencias, notificaciones
│       └── config/            # DB schema, seed data
│
├── database/                   # Archivos SQLite
├── docs/                       # Documentación técnica
├── design/                     # Design system
└── assets/                     # Assets originales
```

---

## 📊 API Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/experiences` | Listar experiencias (`?lang=`, `?limit=`) |
| GET | `/api/experiences/:slug` | Detalle de experiencia |
| GET | `/api/carousel` | Slides del carrusel (`?lang=`) |
| POST | `/api/stats/visit` | Registrar visita |
| GET | `/api/stats/summary` | Estadísticas (admin) |
| GET | `/api/schedules/by-date/:date` | Disponibilidad por fecha |
| POST | `/api/chat/conversations` | Iniciar conversación |
| GET | `/api/faq` | Preguntas frecuentes |

---

## ☁️ Despliegue

### Cloudflare Tunnel (recomendado)
```bash
cloudflared tunnel --url http://localhost:5173
```

### Producción
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && NODE_ENV=production node server.js
```

---

## 📄 Licencia

**MIT License** — Copyright © 2026 Anapse

Este proyecto es de código cerrado. Solo el propietario tiene permisos de distribución y modificación.

---

<div align="center">
  <sub>Construido con ❤️ para Huacachina, Perú</sub>
  <br/>
  <sub>© 2026 Pacha Experiences — Todos los derechos reservados</sub>
</div>
