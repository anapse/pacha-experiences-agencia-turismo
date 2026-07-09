# API Reference — Pacha Experiences

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.pacha-experiences.com/api
```

## Autenticación

### POST /auth/register
Registrar nuevo usuario.
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "SecurePass123!",
  "phone": "+51999888777"
}
```

### POST /auth/login
Iniciar sesión.
```json
{
  "email": "juan@email.com",
  "password": "SecurePass123!"
}
// Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": 1, "name": "Juan Pérez", "role": "client" }
  }
}
```

### POST /auth/refresh
Renovar token.
```json
{
  "refreshToken": "eyJ..."
}
```

### GET /auth/me
Obtener usuario actual.

---

## Experiencias

### GET /experiences
Listar experiencias activas.
```
Query: ?page=1&limit=20&category=tubular&search=huacachina
```

### GET /experiences/:slug
Obtener experiencia por slug.

### POST /experiences (Admin)
Crear experiencia.
```json
{
  "name": "Tubulares en Huacachina",
  "description": "...",
  "base_price": 50,
  "max_capacity": 20,
  "includes": ["Transporte", "Tubular", "Guía"]
}
```

### PUT /experiences/:id (Admin)
Actualizar experiencia.

### DELETE /experiences/:id (Admin)
Desactivar experiencia.

---

## Horarios (Schedules)

### GET /experiences/:id/schedules
Obtener horarios disponibles.
```
Query: ?date=2025-05-15&status=confirmed
```

### POST /schedules (Admin)
Crear horario.
```json
{
  "experience_id": 1,
  "date": "2025-05-15",
  "time": "15:30",
  "max_capacity": 20,
  "vehicle_id": 1,
  "driver_id": 2
}
```

### PUT /schedules/:id
Actualizar horario.

---

## Reservas

### GET /bookings
Listar reservas (filtrado por rol).
```
Query: ?status=confirmed&date_from=2025-05-01&date_to=2025-05-31&client_id=1
```

### GET /bookings/:id
Obtener reserva con servicios incluidos.

### POST /bookings
Crear reserva.
```json
{
  "schedule_id": 1,
  "client_id": 1,
  "pax_count": 4,
  "services": [
    { "service_id": 1, "quantity": 2 },
    { "service_id": 3, "quantity": 1 }
  ],
  "source": "web",
  "notes": "Cliente quiere musica"
}
```

### PUT /bookings/:id
Actualizar reserva (cambiar estado, agregar/quitar servicios).

### DELETE /bookings/:id
Cancelar reserva.

### POST /bookings/:id/services
Agregar servicio adicional a reserva existente.
```json
{
  "service_id": 5,
  "quantity": 1
}
```

### DELETE /bookings/:id/services/:serviceId
Quitar servicio adicional.

---

## Servicios Adicionales

### GET /services
Listar servicios activos.
```
Query: ?category=equipment
```

### POST /services (Admin)
```json
{
  "name": "Sandboard Profesional",
  "description": "Tabla de sandboard profesional",
  "price": 25,
  "category": "equipment"
}
```

---

## Pagos

### POST /payments
Registrar pago.
```json
{
  "booking_id": 1,
  "amount": 200,
  "method": "yape",
  "reference": "20250515-001"
}
```

### GET /bookings/:id/payments
Historial de pagos de una reserva.

---

## Tickets

### GET /bookings/:id/tickets
Tickets de una reserva.

### POST /tickets/:id/validate
Validar ticket (usar en acceso).

---

## Facturación

### POST /bookings/:id/invoice
Generar factura/boleta.
```json
{
  "type": "boleta",
  "ruc": "12345678901",
  "business_name": "Juan Pérez"
}
```

### GET /invoices/:id/pdf
Descargar PDF.

---

## Chat

### GET /chat/conversations
Listar conversaciones del usuario.

### GET /chat/conversations/:id/messages
Obtener mensajes.
```
Query: ?page=1&limit=50
```

### POST /chat/conversations
Iniciar conversación.
```json
{
  "participant_id": 2,
  "booking_id": 1
}
```

### WebSocket
Ver documento Backend.md para eventos Socket.IO.

---

## Emergencias

### GET /emergencies
Listar emergencias (Admin/Operador).

### POST /emergencies
Reportar emergencia.
```json
{
  "booking_id": 1,
  "type": "injury",
  "severity": "high",
  "description": "Cliente se torció el tobillo",
  "location": "Tierra Prometida - Duna 5"
}
```

### PUT /emergencies/:id
Actualizar estado de emergencia.

---

## Admin

### GET /admin/dashboard
Estadísticas del dashboard.
```json
{
  "total_bookings_today": 12,
  "total_revenue_today": 2400,
  "active_emergencies": 0,
  "pending_bookings": 5,
  "occupation_rate": 0.75,
  "upcoming_schedules": [...]
}
```

### GET /admin/reports
Reportes con filtros.
```
Query: ?from=2025-01-01&to=2025-12-31&group_by=month
```

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| VALIDATION_ERROR | Datos inválidos |
| UNAUTHORIZED | No autenticado |
| FORBIDDEN | No autorizado (rol) |
| NOT_FOUND | Recurso no encontrado |
| CONFLICT | Conflicto (cupo lleno) |
| INTERNAL_ERROR | Error del servidor |
| RATE_LIMITED | Demasiadas solicitudes |

## Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
Accept-Language: es
```
