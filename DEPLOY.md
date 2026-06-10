# Deploy en Vercel — Tabi Review

Guía para desplegar el formulario de reseñas en [Vercel](https://vercel.com) con base de datos persistente en [Turso](https://turso.tech) (SQLite compatible con serverless).

## Arquitectura

| Componente | Solución |
|---|---|
| App web | Express empaquetado en una función serverless (`api/index.js`) |
| Rutas | `vercel.json` reescribe todo el tráfico a `/api`; archivos en `public/` se sirven estáticos |
| Base de datos | `@libsql/client` + Turso (reemplaza `better-sqlite3` local) |
| Sesiones admin | Cookie firmada HMAC (`HttpOnly`, `Secure` en producción) |

**Por qué Turso:** Vercel usa filesystem efímero y funciones serverless. Un archivo SQLite local no persiste entre invocaciones. Turso ofrece SQLite remoto compatible con `@libsql/client`, sin cambiar el esquema SQL.

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Turso](https://turso.tech) (plan gratuito disponible)
- [Turso CLI](https://docs.turso.tech/cli/introduction) instalada (`brew install tursodatabase/tap/turso`)

## 1. Crear base de datos Turso

```bash
turso auth login
turso db create tabi-review --region gbl   # elige la región más cercana
turso db show tabi-review --url
turso db tokens create tabi-review
```

Guarda la URL (`libsql://...`) y el token.

## 2. Variables de entorno en Vercel

En el proyecto de Vercel → **Settings → Environment Variables**, configura:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `TURSO_DATABASE_URL` | Sí | URL de la base Turso (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Sí | Token de autenticación Turso |
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

Las migraciones se ejecutan automáticamente en el primer request (cold start).

## Desarrollo local

```bash
cp .env.example .env
npm install
npm run dev
```

Sin `TURSO_*` configurado, la app usa `file:resenas.db` en la raíz del proyecto (SQLite local vía libsql).

Para probar el entorno serverless localmente:

```bash
npx vercel dev
```

## Limitaciones

- **Cold starts:** la primera petición tras inactividad puede tardar 1–3 s (migraciones + conexión DB).
- **Turso free tier:** límites de lecturas/escrituras; suficiente para un formulario de reseñas de un restaurante.
- **Sin uploads de archivos:** el proyecto no almacena archivos; no aplica.
- **Admin credentials:** en producción la app falla al arrancar si faltan `ADMIN_USER`, `ADMIN_PASSWORD` o `SESSION_SECRET`.

## Migrar datos locales a Turso

Si ya tienes reseñas en `resenas.db` local:

```bash
sqlite3 resenas.db .dump > dump.sql
turso db shell tabi-review < dump.sql
```

## Estructura de archivos de deploy

```
api/index.js          → entrada serverless (exporta Express)
src/createApp.js      → app Express compartida (local + Vercel)
vercel.json           → rewrites a /api
public/               → CSS, JS, logos (servidos estáticos)
.env.example          → plantilla de variables
```
