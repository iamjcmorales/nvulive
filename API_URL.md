# API de Login NVU Live

## Información de la API

**URL Base:** `https://api.nvu-integrations.com/v1/auth/nvu-live/sign-in`
**Método:** `POST`
**Content-Type:** `application/json`

## Curl de ejemplo

```bash
curl -X POST \
  'https://api.nvu-integrations.com/v1/auth/nvu-live/sign-in' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "tu_email@ejemplo.com",
    "password": "tu_contraseña"
  }'
```

## Estructura del Request

```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

## Respuesta Exitosa

```json
{
  "nvulive": {
    "status": "Active",
    "customerName": "Nombre del Usuario",
    "customerID": "12345"
  }
}
```

## Respuesta de Error

```json
{
  "message": "Invalid credentials or inactive membership."
}
```

## Códigos de Estado

- **200**: Login exitoso
- **400**: Credenciales inválidas
- **401**: No autorizado
- **500**: Error del servidor

## Notas

- El usuario debe tener status "Active" para poder acceder
- La respuesta incluye información del cliente que se almacena en localStorage
- Si el membership está expirado, se retorna el mensaje "FL2 membership expired." 