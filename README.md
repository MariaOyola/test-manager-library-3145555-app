# Manager Library App — HU-01

React para iniciar sesión según el contrato de ambos specs. Rama: `hu-01-dev`.

## Ejecutar

Con Node.js 22 y npm, desde este repositorio:

```bash
npm ci
npm run dev
```

Abrir http://localhost:5173. La API debe estar disponible en http://localhost:8000 y tener `CORS_ORIGIN=http://localhost:5173`. Para otra dirección copiar .env.example a .env y ajustar VITE_API_URL.

El formulario envía POST /api/v1/auth/login, muestra error genérico para 401 y el rol de una sesión válida de ocho horas. Guarda el token únicamente en memoria; recargar o cerrar sesión lo descarta. La autorización real se aplica siempre en el backend. Usar HTTPS al publicar para proteger las credenciales durante el transporte.

## Comprobar

```bash
npm test
npm run build
```

Catálogo, socios, préstamos, devoluciones y reportes quedan para sus HU. Esta entrega implementa solo el acceso HU-01.
