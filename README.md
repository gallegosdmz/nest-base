# NestJS Base

Proyecto base open source con NestJS que incluye autenticacion JWT, control de acceso basado en roles (RBAC), verificacion OTP por telefono y un sistema de logging estructurado. Pensado como punto de partida para APIs REST con arquitectura limpia.

## Tecnologias

- **Runtime:** Node.js + TypeScript
- **Framework:** NestJS 11
- **Base de datos:** PostgreSQL + TypeORM
- **Autenticacion:** JWT (Passport) + bcrypt
- **OTP:** Twilio Verify
- **Logging:** Winston + rotacion diaria de archivos
- **Validacion:** class-validator + class-transformer
- **Package manager:** pnpm

## Arquitectura

El proyecto sigue una arquitectura limpia con tres capas por modulo:

```
src/
├── config/                  # Validacion de variables de entorno
├── modules/
│   ├── users/
│   │   ├── application/     # Controllers, DTOs, decoradores
│   │   ├── business/        # Servicios, interfaces, repositorios (contratos)
│   │   └── external-system/ # Entidades TypeORM, implementaciones de repositorios
│   └── rbac/
│       ├── application/     # Controllers, guards, decoradores
│       ├── business/        # Servicios, entidades de dominio
│       └── external-system/ # Entidades TypeORM, seeds, implementaciones
└── shared/
    ├── decorators/          # Validadores custom (telefono, nombre)
    ├── dtos/                # DTOs compartidos (paginacion)
    ├── entities/            # BaseEntity (UUID, timestamps, soft delete)
    ├── enums/               # Enums de dominio
    ├── filters/             # Filtro global de excepciones HTTP
    ├── interceptors/        # Logger de peticiones HTTP
    ├── interfaces/          # JwtPayload, IMeta
    └── logger/              # Servicio de logging con Winston
```

## Requisitos previos

- Node.js >= 18
- pnpm
- PostgreSQL

## Instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd nestjs-base

# 2. Instalar dependencias
pnpm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
```

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto con las siguientes variables:

```env
# Base de datos (requeridas)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nestjs_base
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# JWT (requerida)
JWT_SECRET=tu_secreto_jwt

# Aplicacion (opcional)
PORT=3000

# Twilio - solo si usas verificacion OTP (opcional)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_VERIFY_SERVICE_SID=tu_verify_service_sid
```

| Variable | Requerida | Default | Descripcion |
|---|---|---|---|
| `DB_HOST` | Si | - | Host de PostgreSQL |
| `DB_PORT` | No | `5432` | Puerto de PostgreSQL |
| `DB_NAME` | Si | - | Nombre de la base de datos |
| `DB_USERNAME` | Si | - | Usuario de PostgreSQL |
| `DB_PASSWORD` | Si | - | Password de PostgreSQL |
| `JWT_SECRET` | Si | - | Secreto para firmar tokens JWT |
| `PORT` | No | `3000` | Puerto de la aplicacion |
| `TWILIO_ACCOUNT_SID` | No | - | Account SID de Twilio |
| `TWILIO_AUTH_TOKEN` | No | - | Auth token de Twilio |
| `TWILIO_VERIFY_SERVICE_SID` | No | - | Service SID de Twilio Verify |

## Ejecutar el proyecto

```bash
# Desarrollo (con hot reload)
pnpm start:dev

# Desarrollo con debug
pnpm start:debug

# Produccion
pnpm build
pnpm start:prod
```

La aplicacion inicia en `http://localhost:3000` con el prefijo global `/api`.

> **Nota:** TypeORM esta configurado con `synchronize: true`, lo que sincroniza automaticamente el esquema de la base de datos. Para produccion, desactiva esta opcion y usa migraciones.

## Endpoints

Todos los endpoints tienen el prefijo `/api`.

### Auth (`/api/auth`)

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| `POST` | `/auth/register` | No | Registrar usuario |
| `POST` | `/auth/login` | No | Iniciar sesion |
| `GET` | `/auth/refresh` | Bearer | Verificar token y obtener datos del usuario |
| `POST` | `/auth/send-otp` | No | Enviar codigo OTP por SMS |
| `POST` | `/auth/verify-otp` | No | Verificar codigo OTP |

### Users (`/api/users`)

Todos los endpoints requieren Bearer token.

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/users` | Listar usuarios (paginado) |
| `GET` | `/users/me` | Perfil del usuario autenticado |
| `GET` | `/users/:id` | Obtener usuario por ID |
| `PATCH` | `/users/:id` | Actualizar usuario (solo el propietario) |
| `DELETE` | `/users/:id` | Eliminar usuario - soft delete (solo el propietario) |

**Paginacion:** Los endpoints de listado aceptan query params `limit`, `offset` y `search`.

### Roles (`/api/roles`)

Todos los endpoints requieren Bearer token.

| Metodo | Ruta | Descripcion |
|---|---|---|
| `GET` | `/roles` | Listar todos los roles |
| `GET` | `/roles/:name` | Obtener rol por nombre con sus permisos |

## Modulos

### Users + JWT

El modulo de usuarios maneja registro, login y gestion de cuentas.

- Las passwords se hashean con **bcrypt** (10 salt rounds)
- Los tokens JWT incluyen el `id` del usuario como payload
- La expiracion del token se configura con `JWT_EXPIRES_IN` (default: 24h)
- El decorador `@GetUser()` extrae el usuario autenticado del request
- El soft delete marca `isDeleted: true` en lugar de eliminar el registro

**Registro:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Perez"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'
```

**Usar el token:**
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <tu_token>"
```

### RBAC (Role-Based Access Control)

Sistema de control de acceso basado en roles con tres entidades: **Role**, **Resource** y **Permission**.

**Roles predefinidos (seed):**

| Rol | Descripcion | Permisos |
|---|---|---|
| `admin` | Acceso total | CRUD en todos los recursos |
| `sales` | Equipo de ventas | CRU orders, R shipments, R notifications |
| `purchases` | Equipo de compras | R orders, CRU shipments, R notifications |
| `client` | Cliente externo | CR orders, R shipments, R notifications |

**Recursos:** `users`, `orders`, `shipments`, `notifications`

**Acciones:** `CREATE`, `READ`, `UPDATE`, `DELETE`

Para proteger un endpoint con permisos, usa el guard y decorador:

```typescript
import { RequirePermissions } from 'src/modules/rbac/application/decorators/requiere-permissions.decorator';
import { PermissionsGuard } from 'src/modules/rbac/application/guards/permissions.guard';
import { Action } from 'src/modules/rbac/business/entities/Action';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@RequirePermissions({ resource: 'orders', action: Action.CREATE })
@Post()
createOrder(@Body() dto: CreateOrderDto) {
  // solo usuarios con permiso CREATE en orders
}
```

> **Nota:** El seeder (`RbacSeeder`) se ejecuta al iniciar la aplicacion via `OnModuleInit`. Si ya existen roles en la base de datos, no se vuelve a ejecutar.

### OTP (Verificacion por telefono)

Verificacion de numero telefonico via SMS usando **Twilio Verify**.

1. Enviar codigo OTP:
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{ "phone": "+525512345678" }'
```

2. Verificar codigo:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{ "phone": "+525512345678", "code": "123456" }'
```

El campo `phone` acepta formato mexicano: 10 digitos con prefijo opcional `+52` o `52`.

Al verificar exitosamente, el campo `isPhoneVerified` del usuario se marca como `true`.

> **Nota:** Para usar OTP necesitas una cuenta de Twilio con el servicio Verify configurado.

### Logging

Sistema de logging estructurado con **Winston** y rotacion diaria de archivos.

**Transports:**
- **Consola:** Salida colorizada para desarrollo
- **Archivo general:** `logs/app-YYYY-MM-DD.log` (max 20MB, retencion 30 dias)
- **Archivo de errores:** `logs/error-YYYY-MM-DD.log` (max 20MB, retencion 60 dias)

**Formato:**
```
2026-03-25 14:30:45 INFO [Bootstrap] Application running on port 3000
```

**HTTP Logger:** Un interceptor global registra automaticamente todas las peticiones HTTP con:
- Metodo, URL y codigo de estado
- Tiempo de respuesta (ms)
- IP del cliente y User-Agent
- ID del usuario autenticado (si aplica)

**Filtro de excepciones:** Las excepciones no controladas se capturan globalmente, se loguean y retornan una respuesta estructurada al cliente.

## Scripts disponibles

| Script | Descripcion |
|---|---|
| `pnpm start:dev` | Iniciar en modo desarrollo con hot reload |
| `pnpm start:debug` | Iniciar en modo debug con hot reload |
| `pnpm build` | Compilar el proyecto |
| `pnpm start:prod` | Iniciar la build de produccion |
| `pnpm lint` | Ejecutar ESLint con auto-fix |
| `pnpm format` | Formatear codigo con Prettier |
| `pnpm test` | Ejecutar tests unitarios |
| `pnpm test:watch` | Tests en modo watch |
| `pnpm test:cov` | Tests con reporte de cobertura |
| `pnpm test:e2e` | Tests end-to-end |

## Estructura de la base de datos

```
┌──────────┐     ┌────────────┐     ┌────────────┐
│   User   │────>│    Role    │<────│ Permission │
│          │ N:1 │            │ 1:N │            │
│ id       │     │ id         │     │ id         │
│ email    │     │ name       │     │ action     │
│ password │     │ description│     │ roleId     │
│ firstName│     └────────────┘     │ resourceId │
│ lastName │                        └─────┬──────┘
│ phone    │                              │ N:1
│ isVerified│                       ┌─────┴──────┐
│ isPhone- │                        │  Resource  │
│  Verified│                        │            │
│ roleId   │                        │ id         │
│ createdAt│                        │ name       │
│ updatedAt│                        │ slug       │
│ isDeleted│                        └────────────┘
└──────────┘
```

Todas las entidades heredan de `BaseEntity` que provee `id` (UUID), `createdAt`, `updatedAt` e `isDeleted`.

## Personalizacion

Este proyecto esta pensado como base. Algunas acciones comunes al usarlo:

- **Agregar un nuevo modulo:** Crea la estructura `application/`, `business/`, `external-system/` siguiendo el patron existente
- **Agregar un recurso al RBAC:** Edita `RBAC_CONFIG` en `src/modules/rbac/external-system/seeds/rbac.seed.ts`
- **Cambiar la validacion de telefono:** Modifica el decorador `@IsMexicanPhone()` en `src/shared/decorators/phone-validator.decorator.ts`
- **Desactivar OTP:** Elimina las variables de Twilio y las rutas de OTP en `AuthController`
- **Produccion:** Desactiva `synchronize: true` en `app.module.ts` y configura migraciones de TypeORM

## Licencia

MIT
