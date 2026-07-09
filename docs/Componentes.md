# Componentes — Pacha Experiences

## Filosofía de Componentes

- **Reutilizables** — Cada componente común debe funcionar en múltiples contextos
- **Atómicos** — Un componente, una responsabilidad
- **Modulares** — CSS Modules encapsula estilos
- **Documentados** — Props claras con valores por defecto
- **Accesibles** — ARIA labels, roles, focus management

## Componentes Comunes

### Button
```jsx
<Button variant="primary" size="lg" icon={IconName} onClick={handleClick}>
  Reservar Ahora
</Button>
```
Props: variant, size, icon, loading, disabled, fullWidth, onClick, children, type

Variantes: `primary`, `secondary`, `outline`, `ghost`, `danger`
Tamaños: `sm`, `md`, `lg`

### Card
```jsx
<Card variant="default" padding="md" hoverable>
  <Card.Image src={placeholder} aspectRatio="16/9" />
  <Card.Body>
    <Card.Title>Experiencia Huacachina</Card.Title>
    <Card.Text>Descripción breve...</Card.Text>
    <Card.Footer>
      <Button>Ver más</Button>
    </Card.Footer>
  </Card.Body>
</Card>
```

### Input
```jsx
<Input
  label="Nombre completo"
  placeholder="Ingresa tu nombre"
  error="Campo requerido"
  icon={UserIcon}
  type="text"
/>
```

### Modal
```jsx
<Modal isOpen={isOpen} onClose={handleClose} size="md" title="Confirmar Reserva">
  Contenido del modal...
</Modal>
```

### Badge
```jsx
<Badge variant="success">Confirmado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="danger">Cancelado</Badge>
```

### ImagePlaceholder
```jsx
<ImagePlaceholder
  name="IMG_HERO_ATARDECER_HUACACHINA"
  width={1200}
  height={600}
  description="Atardecer en Huacachina - Dunas doradas"
/>
```

### Loading
```jsx
<Loading size="lg" text="Cargando experiencias..." />
```

### EmptyState
```jsx
<EmptyState
  icon={CalendarIcon}
  title="Sin reservas"
  description="Aún no tienes reservas activas"
  action={<Button>Explorar Experiencias</Button>}
/>
```

### Toast
```jsx
<Toast message="Reserva confirmada exitosamente" type="success" duration={3000} />
```

### Pagination
```jsx
<Pagination currentPage={1} totalPages={10} onPageChange={handlePage} />
```

### Select
```jsx
<Select
  label="Cantidad de personas"
  options={[
    { value: 1, label: '1 persona' },
    { value: 2, label: '2 personas' },
    { value: 3, label: '3 personas' },
  ]}
  onChange={handleChange}
/>
```

## Componentes de Negocio (Ejemplos)

### BookingCard (Reserva)
Progreso visual de la reserva con pasos:
1. Seleccionar experiencia
2. Elegir fecha
3. Servicios adicionales
4. Confirmar y pagar

### CalendarGrid
Calendario mensual interactivo que muestra:
- Días disponibles (verde)
- Días completos (rojo)
- Días con disponibilidad parcial (amarillo)
- Tooltip con detalles al hover

### ChatBubble
Burbuja de chat con:
- Avatar del remitente
- Hora
- Estado (enviado, leído)
- Tipo de mensaje (texto, imagen, emergencia)

### EmergencyAlert
Alerta de emergencia con:
- Nivel de severidad (color)
- Tipo de incidente
- Ubicación en mapa
- Botones de acción rápida

### TicketCard
Ticket digital con:
- Código QR generado
- Datos de la reserva
- Estado (válido, usado)
- Experiencia y horario

### BookingCart
Carrito de compras para reservas:
- Lista de servicios agregados
- Cantidades modificables
- Subtotal por item
- Total calculado automáticamente
- Botón de confirmar

## Estructura de Componente (Plantilla)

```
ComponentName/
├── ComponentName.jsx
├── ComponentName.module.css
└── index.js
```

Cada componente exporta desde `index.js`:
```javascript
export { default } from './ComponentName';
```

### Patrón de Componente

```jsx
import styles from './ComponentName.module.css';
import { clsx } from '../../utils/helpers';

export default function ComponentName({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) {
  return (
    <div
      className={clsx(
        styles.component,
        styles[`component--${variant}`],
        styles[`component--${size}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

## Responsive

Todos los componentes se diseñan mobile-first.
Usar CSS Modules con media queries:

```css
.component {
  /* Mobile base */
  padding: 16px;
}

@media (min-width: 768px) {
  .component {
    /* Tablet */
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop */
    padding: 32px;
  }
}
```
