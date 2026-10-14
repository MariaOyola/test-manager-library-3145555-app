# Manager Library App

Frontend React para Manager Library.

## HU-01 - Health check

Esta rama queda preparada para la primera integracion con el backend: consumir `GET /health` y mostrar si la API responde.

La implementacion visual completa empieza despues de confirmar el arranque basico de `infra` y `api`.

## Contrato esperado

```http
GET /health
```

```json
{ "status": "ok" }
```
