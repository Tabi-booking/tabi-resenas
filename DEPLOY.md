# Deploy en Vercel — Tabi Review

Guía para desplegar el formulario de reseñas en [Vercel](https://vercel.com) con base de datos persistente en [Supabase](https://supabase.com) (PostgreSQL).

## Arquitectura

| Componente | Solución |
|---|---|
| App web | Express empaquetado en una función serverless (`api/index.js`) |
| Rutas | `vercel.json` reescribe todo el tráfico a `/api`; archivos en `public/` se sirven estáticos |
| Base de datos | `@supabase/supabase-js` + Supabase PostgreSQL |
| Sesiones admin | Cookie firmada HMAC (`HttpOnly`, `Secure` en producción) |

**Por qué Supabase:** Vercel usa filesystem efímero y funciones serverless. Un archivo SQLite local no persiste entre invocaciones. Supabase ofrece PostgreSQL gestionado con acceso HTTP, ideal para serverless.

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com) (plan gratuito disponible)

## 1. Crear proyecto y tabla en Supabase

1. Crea un proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.resenas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT NOT NULL,
  meseros TEXT,
  ocasion JSONB,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
```

3. En **Project Settings → API**, copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

> La `service_role` key solo se usa en el servidor (Vercel). Nunca la expongas en el frontend.

## 2. Variables de entorno en Vercel

En el proyecto de Vercel → **Settings → Environment Variables**, configura:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SUPABASE_URL` | Sí | URL del proyecto Supabase (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave `service_role` (solo servidor) |
| `ADMIN_USER` | Sí | Usuario del panel admin |
| `ADMIN_PASSWORD` | Sí | Contraseña del panel admin |
| `SESSION_SECRET` | Sí | Secreto largo y aleatorio para firmar cookies (≥ 32 caracteres) |
| `GOOGLE_PLACE_ID` | No* | Place ID de Google para enlace directo a reseña |
| `GOOGLE_REVIEW_URL` | No* | URL alternativa si no usas Place ID |
| `NODE_ENV` | Auto | Vercel la define como `production` |

\* Si no configuras ninguna, se usa la URL por defecto de La Rock en el código.

Generar `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Desplegar

### Opción A — CLI de Vercel

```bash
npm install
npx vercel login
npx vercel          # preview
npx vercel --prod   # producción
```

### Opción B — GitHub

1. Sube el repo a GitHub.
2. En Vercel → **Add New Project** → importa el repositorio.
3. Framework preset: **Other** (sin build command; Vercel detecta `api/`).
4. Añade las variables de entorno del paso 2.
5. Deploy.

## 4. Verificar

- Formulario: `https://tu-proyecto.vercel.app/`
- Admin: `https://tu-proyecto.vercel.app/admin`
- Assets estáticos: `https://tu-proyecto.vercel.app/assets/tabi-isotipo.png`

Al primer request, la app verifica que la tabla `resenas` exista en Supabase.

## Desarrollo local

Supabase es obligatorio también en local. Copia las credenciales del dashboard a `.env`:

```bash
cp .env.example .env
# Edita .env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Sin `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, la app muestra una página de configuración pendiente.

Para probar el entorno serverless localmente:

```bash
npx vercel dev
```

## Limitaciones

- **Cold starts:** la primera petición tras inactividad puede tardar 1–3 s (verificación DB + conexión).
- **Supabase free tier:** límites de filas y ancho de banda; suficiente para un formulario de reseñas de un restaurante.
- **Sin uploads de archivos:** el proyecto no almacena archivos; no aplica.
- **Admin credentials:** en producción la app falla al arrancar si faltan `ADMIN_USER`, `ADMIN_PASSWORD` o `SESSION_SECRET`.
- **RLS habilitado:** el acceso a datos se hace con `service_role`, que omite RLS. No expongas esa clave al cliente.

## Estructura de archivos de deploy

```
api/index.js          → entrada serverless (exporta Express)
src/createApp.js      → app Express compartida (local + Vercel)
vercel.json           → rewrites a /api
public/               → CSS, JS, logos (servidos estáticos)
supabase/schema.sql   → SQL para crear la tabla
.env.example          → plantilla de variables
```
