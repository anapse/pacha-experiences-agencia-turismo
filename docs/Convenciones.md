# Convenciones — Pacha Experiences

## Código

### JavaScript/Node.js
- Usar **async/await** siempre, evitar callbacks y .then()
- **Arrow functions** preferentemente
- Nombres en **camelCase** para variables y funciones
- Nombres en **PascalCase** para clases y componentes
- Constantes en **UPPER_SNAKE_CASE**
- Archivos en **kebab-case** (ej. `booking.service.js`)
- Componentes en **PascalCase** (ej. `BookingCard.jsx`)
- Puntos y coma obligatorios
- Usar `===` siempre, nunca `==`

```javascript
// ✅ Correcto
async function getBooking(id) {
  return await bookingRepo.findById(id);
}

// ❌ Incorrecto
function getBooking(id) {
  return bookingRepo.findById(id).then(data => data);
}
```

### React
- Componentes funcionales con hooks, sin clases
- Props desestructuradas con valores por defecto
- Fragmentos (`<>...</>`) en lugar de divs innecesarios
- Hooks personalizados para lógica reutilizable
- Event handlers con prefijo `handle` (ej. `handleSubmit`)

```jsx
// ✅ Correcto
export default function Button({ variant = 'primary', children }) {
  return <button className={styles[`btn--${variant}`]}>{children}</button>;
}

// ❌ Incorrecto
export default class Button extends React.Component {
  render() {
    return <button>{this.props.children}</button>;
  }
}
```

### CSS Modules
- Nombres BEM-like: `.component__element--modifier`
- Variables CSS globales para colores, sombras, radios
- Mobile first: estilos base = móvil, media queries para desktop
- Sin !important (salvo excepciones justificadas)

```css
/* ✅ Correcto */
.card { }
.card__title { }
.card__title--featured { }

/* ❌ Incorrecto */
.Card { }
.Card_Title { }
```

### Base de Datos
- Nombres de tablas en **snake_case** plural: `users`, `additional_services`
- Columnas en **snake_case**: `first_name`, `created_at`
- Primary key: `id INTEGER PRIMARY KEY AUTOINCREMENT`
- Foreign keys: `table_id` (ej. `user_id`)
- Timestamps: `created_at`, `updated_at`
- Soft delete NO usar; usar campo `is_active`

## Git

### Commits
Conventional Commits:

```
feat: Nueva funcionalidad para el usuario
fix: Corrección de bug
refactor: Cambio de código sin corrección ni feature
style: Cambios de formato (espacios, commas)
docs: Cambios en documentación
test: Agregar o corregir tests
chore: Cambios en build, dependencias, etc.
```

Ejemplos:
```
feat: add calendar professional view
fix: recalculate total after removing service
refactor: extract booking validation to service layer
docs: update API endpoints documentation
```

### Branches
- `main` — Producción
- `develop` — Integración
- `feat/nombre` — Nuevas funcionalidades
- `fix/nombre` — Correcciones
- `refactor/nombre` — Refactorización

## Organización de Archivos

### Frontend
```
ComponentName/
├── ComponentName.jsx    # Componente principal
├── ComponentName.module.css  # Estilos
└── index.js             # Re-export
```

### Backend
```
NombreModule/
├── NombreService.js     # Lógica de negocio
├── NombreController.js  # Manejador HTTP
├── NombreRepository.js  # Acceso a datos
└── nombre.routes.js     # Definición de rutas
```

## Testing
- Archivos de test junto al código fuente: `Component.test.jsx`
- Describir el comportamiento, no la implementación
- Usar nombres descriptivos: `'should return error when capacity is full'`
- Mínimo 80% de cobertura en módulos críticos

## Performance
- Lazy loading en todas las rutas del frontend
- Paginación en todas las listas (página 20 items default)
- Compresión gzip activada
- Imágenes optimizadas (WebP cuando sea posible)
- Evitar renders innecesarios (useMemo, useCallback)
- Bundle size monitoring

## Seguridad
- Sanitizar toda entrada de usuario
- No loguear información sensible
- Tokens JWT en HTTP-only cookies para refresh
- Rate limiting en rutas sensibles (/auth/*)
- Validación en frontend y backend (nunca confiar solo en frontend)
