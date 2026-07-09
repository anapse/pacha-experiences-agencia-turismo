# Pacha Experiences — Readme

Plataforma profesional de gestión turística.

## Stack

- **Frontend:** React 19 + Vite + CSS Modules
- **Backend:** Node.js + Express + JWT + Socket.IO
- **Database:** SQLite (inicial) con patrón repositorio para migrar a PostgreSQL

## Inicio Rápido

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Estructura

```
TurismoPlatform/
├── frontend/       # React 19 + Vite
├── backend/        # Express API + Socket.IO
├── docs/           # Documentación completa
├── design/         # Design system y assets
├── database/       # Migraciones y seeds
├── assets/         # Assets estáticos
└── uploads/        # Archivos subidos
```

## Módulos

- Experiencias
- Reservas con carrito de compras
- Calendario profesional
- Tickets con QR
- Chat en tiempo real
- Emergencias con alertas
- Panel administrador completo
- Facturación
- Blog
- FAQ

## Licencia

Privada — Pacha Experiences © 2025
