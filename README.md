# Next Full Template

Plantilla full-stack para empezar aplicaciones con **Next.js 16**, **Prisma 7** y **PostgreSQL** sin rehacer lo de siempre: autenticación, roles, CRUD con tablas dinámicas, subida de archivos, recuperación de contraseña, PWA y notificaciones push.

Todo lo opcional (Google, correo, almacenamiento remoto, push) se activa con variables de entorno. Si no las defines, la app sigue funcionando con una alternativa local.

## Funcionalidades

| Funcionalidad | Qué incluye |
| --- | --- |
| **Autenticación** | Login con email y contraseña (bcrypt) usando NextAuth. Login con **Google** solo si defines `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`; si no, el botón no aparece. Sesión JWT de 30 días. |
| **Registro** | Formulario con confirmación de contraseña e inicio de sesión automático. |
| **Recuperar contraseña** | Enlace con token aleatorio de un solo uso que **caduca** (60 min por defecto). En la base de datos solo se guarda su hash SHA-256. La respuesta es idéntica exista o no la cuenta. |
| **Correo** | Envío con **Resend** (`RESEND_API_KEY`) o **SMTP** (`SMTP_HOST`). Sin credenciales, el correo con el enlace se imprime en la consola del servidor. |
| **Roles** | `ADMIN` y `USER`. El proxy de Next 16 redirige rápido usando el JWT, y cada página y endpoint vuelve a leer el rol en la base de datos. |
| **Gestión de usuarios** | CRUD para administradores. Un admin no puede quitarse el rol ni borrar su propia cuenta. |
| **CRUD de productos y categorías** | Cualquier usuario autenticado puede verlos; solo el admin puede crear, editar o borrar. |
| **Tablas dinámicas** | Componente `DataTable` reutilizable: búsqueda con debounce, filtros por columna, orden y paginación. El estado vive en la URL y se resuelve en la consulta a la base de datos. La columna de email tiene un botón para copiarlo. |
| **Formularios validados** | `react-hook-form` + `zod`. El mismo esquema valida en el navegador y en la API. Mensajes en español. |
| **Subida de archivos** | `POST /api/uploads` con dos destinos: disco local (por defecto) o almacenamiento **compatible con S3**, como DigitalOcean Spaces, Cloudflare R2, AWS S3 o MinIO. El tipo real se comprueba por los bytes del archivo y se rechaza SVG. Se usa para el avatar y la imagen de producto. |
| **Perfil** | Editar nombre, correo y avatar, y cambiar la contraseña. Las cuentas creadas con Google pueden crear su primera contraseña. |
| **Dashboard** | Sidebar según el rol, menú móvil, **paleta de comandos (Ctrl/Cmd + K)** y métricas en el inicio. |
| **Tema claro/oscuro** | En la landing y el dashboard (claro, oscuro o sistema), sin parpadeo al cargar. |
| **PWA** | Manifest, iconos (incluido maskable), service worker y página `/offline` cuando no hay red. Instalable desde el navegador. |
| **Notificaciones push** | Web Push con claves **VAPID**. Desde Ajustes cada usuario activa o desactiva push y envía una prueba; el admin puede enviar a todos. Sin claves, la API responde 503 y la UI explica cómo activarlas. |
| **Seed** | Usuario admin, usuario demo, 4 categorías y 24 productos. |

## Stack

| Paquete | Versión |
| --- | --- |
| Next.js (App Router, Turbopack) | 16.4.0 |
| React / React DOM | 19.3.0 |
| Prisma ORM + `@prisma/adapter-pg` | 7.10.0 |
| PostgreSQL (Docker) | `postgres:latest` |
| NextAuth (`next-auth`) | 4.24.15 |
| Tailwind CSS + `@tailwindcss/postcss` | 4.3.3 |
| TypeScript | 6.0.3 |
| ESLint + `eslint-config-next` | 9.39.5 / 16.4.0 |
| Zod | 4.6.6 |
| React Hook Form + `@hookform/resolvers` | 7.90.0 / 5.9.1 |
| nodemailer | 10.1.0 |
| web-push | 3.6.7 |
| `@aws-sdk/client-s3` | 3.1149.0 |
| lucide-react | 1.55.0 |

### Decisiones de versiones

- **NextAuth 4.24 en lugar de Auth.js v5.** La v5 sigue en beta (`5.0.0-beta.32`). En cambio, `next-auth@4.24.15` es estable y declara compatibilidad con `next ^16` y `react ^19`. Aquí se usan credenciales + Google con sesión JWT, y las dos funcionan sin problemas en la v4: `getServerSession` en el App Router y `getToken` en el proxy.
- **ESLint 9 y no 10.** `eslint-config-next@16.4.0` incluye `eslint-plugin-react`, `eslint-plugin-import` y `eslint-plugin-jsx-a11y`, que solo aceptan ESLint `^9`. Con ESLint 10 npm tendría que forzar peer dependencies. `npm install` muestra un aviso de deprecación de ESLint 9 que no afecta al proyecto.
- **TypeScript 6.0 y no 7.** `typescript-eslint` (que usa `eslint-config-next/typescript`) aún exige `typescript <6.1.0`.
- **Prisma 7.10 y no 8.** En npm, `prisma@latest` apunta a `8.0.0-rc.x`, una release candidate. Se fija la 7.10.0 estable, igual que `@prisma/client`.
- **nodemailer 10 con `overrides`.** next-auth 4 declara `nodemailer ^7` como peer opcional, pero solo lo usa su EmailProvider (aquí no se usa), y nodemailer `<10.0.6` tiene vulnerabilidades altas. El `overrides` de `package.json` hace que next-auth acepte la versión del proyecto.

## Requisitos

- Node.js **20.19 o superior** (recomendado 24 LTS) y npm
- Docker (para PostgreSQL)

## Puesta en marcha

```bash
# 1. Dependencias (postinstall ejecuta `prisma generate`)
npm install

# 2. Variables de entorno
cp .env.example .env
# Edita NEXTAUTH_SECRET. Para generar uno: openssl rand -base64 32

# 3. Base de datos: contenedor next-full-template-db en el puerto 5461
docker compose up -d

# 4. Migraciones y datos de ejemplo
npx prisma migrate dev
npm run db:seed

# 5. Servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000>.

> Prisma 7 ya no ejecuta `generate` ni el seed automáticamente después de `migrate dev`. Si cambias `prisma/schema.prisma`, ejecuta `npm run db:migrate` y luego `npm run db:generate`.

### Usuarios de ejemplo

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | `admin@example.com` (o `SEED_ADMIN_EMAIL`) | `Admin12345` (o `SEED_ADMIN_PASSWORD`) |
| Usuario | `user@example.com` | `User12345` |

Puedes volver a ejecutar el seed sin problema: no duplica datos ni cambia contraseñas que ya existen.

### Producción

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start
```

Define `NEXTAUTH_URL` con la URL pública: se usa en los enlaces de los correos y no se deduce del header `Host`. Con `STORAGE_DRIVER=local`, la carpeta `UPLOAD_DIR` tiene que estar en un disco persistente.

## Variables de entorno

| Variable | Obligatoria | Por defecto | Descripción |
| --- | --- | --- | --- |
| `DATABASE_URL` | Sí | — | Conexión a PostgreSQL. Con el `docker-compose.yml`: `postgresql://fazt:faztpassword@localhost:5461/nextdb?schema=public` |
| `NEXTAUTH_URL` | Sí (en producción) | — | URL pública de la app |
| `NEXTAUTH_SECRET` | Sí | — | Secreto para firmar la sesión (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | No | — | Activa el login con Google junto con la siguiente |
| `GOOGLE_CLIENT_SECRET` | No | — | Secreto del cliente OAuth de Google |
| `EMAIL_FROM` | No | `Next Full Template <onboarding@resend.dev>` | Remitente de los correos |
| `RESEND_API_KEY` | No | — | Envío con Resend (tiene prioridad sobre SMTP) |
| `SMTP_HOST` | No | — | Envío por SMTP |
| `SMTP_PORT` | No | `587` | Puerto SMTP |
| `SMTP_USER` / `SMTP_PASSWORD` | No | — | Credenciales SMTP |
| `SMTP_SECURE` | No | `true` si el puerto es 465 | TLS implícito |
| `PASSWORD_RESET_TTL_MINUTES` | No | `60` | Validez del enlace de recuperación |
| `STORAGE_DRIVER` | No | `local` | `local` o `s3` (si faltan credenciales S3 se usa `local`) |
| `UPLOAD_DIR` | No | `uploads` | Carpeta de las subidas locales |
| `UPLOAD_MAX_SIZE_MB` | No | `5` | Tamaño máximo por archivo |
| `S3_ENDPOINT` | No | — | Endpoint S3 compatible, p. ej. `https://nyc3.digitaloceanspaces.com` |
| `S3_REGION` | No | `us-east-1` | Región (en Spaces usa `us-east-1`) |
| `S3_BUCKET` | Con `s3` | — | Bucket o Space |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Con `s3` | — | Credenciales |
| `S3_PUBLIC_URL` | No | Se deduce del endpoint | URL pública o CDN de los archivos |
| `S3_FORCE_PATH_STYLE` | No | `false` | `true` para MinIO |
| `S3_ACL` | No | `public-read` | `none` para buckets de AWS con las ACL desactivadas |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | No | — | Activan las notificaciones push (`npm run vapid`) |
| `VAPID_SUBJECT` | No | `mailto:admin@example.com` | Contacto para los servicios de push |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | No | `admin@example.com` / `Admin12345` | Admin que crea el seed |

Todas están documentadas en [`.env.example`](./.env.example).

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción (incluye el chequeo de tipos) |
| `npm run start` | Sirve el build |
| `npm run lint` / `npm run lint:fix` | ESLint (flat config; `next lint` ya no existe en Next 16) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Genera el cliente de Prisma en `src/generated/prisma` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (producción) |
| `npm run db:seed` | Datos de ejemplo |
| `npm run db:reset` | Borra la base de datos y vuelve a migrar |
| `npm run db:studio` | Prisma Studio |
| `npm run vapid` | Genera un par de claves VAPID |

## Estructura

```
├── docker-compose.yml        # PostgreSQL de desarrollo (puerto 5461)
├── prisma.config.ts          # Config de Prisma 7: schema, migraciones, seed y URL
├── prisma/
│   ├── schema.prisma         # User, Category, Product, PasswordResetToken, PushSubscription
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── icons/                # Iconos de la PWA
│   └── sw.js                 # Service worker: offline + push
└── src/
    ├── proxy.ts              # Protección de rutas (antes middleware.ts)
    ├── app/
    │   ├── (landing)/        # Inicio, precios, acerca de
    │   ├── auth/             # signin, register, forgot-password, reset-password
    │   ├── (dashboard)/      # Layout con sesión + dashboard/{products,categories,users,profile,settings}
    │   ├── api/              # Endpoints REST
    │   ├── uploads/[...path] # Sirve las subidas locales
    │   ├── offline/          # Página sin conexión (PWA)
    │   └── manifest.ts       # /manifest.webmanifest
    ├── components/           # UI base, data-table, dashboard, landing, auth
    ├── config/               # Sitio, navegación y rutas por rol
    ├── libs/                 # auth, session, prisma, mail, storage, push, table, validations/…
    ├── types/                # Tipos de next-auth (id y role en la sesión)
    └── generated/prisma/     # Cliente de Prisma (generado, ignorado por git)
```

## API REST

Todas las respuestas son JSON. Los errores tienen la forma `{ "error": "...", "fieldErrors": { "campo": ["mensaje"] } }`. Los cuerpos se validan con zod y deben enviarse como `application/json`, salvo la subida de archivos.

| Método y ruta | Acceso | Descripción |
| --- | --- | --- |
| `POST /api/auth/register` | Público | Crea una cuenta `{ name, email, password }` |
| `POST /api/auth/forgot-password` | Público | Envía el enlace de recuperación `{ email }` |
| `POST /api/auth/reset-password` | Público | Cambia la contraseña `{ token, password }` |
| `GET/POST /api/auth/*` | Público | Endpoints de NextAuth (csrf, callback, session, signout…) |
| `GET /api/products` | Autenticado | Lista paginada (`q`, `category`, `sort`, `order`, `page`, `pageSize`) |
| `POST /api/products` | Admin | Crea un producto |
| `GET/PATCH/DELETE /api/products/:id` | Lectura autenticado, escritura admin | Detalle, edición y borrado |
| `GET /api/categories`, `GET /api/categories/:id` | Autenticado | Lista (`q`, `sort`, `order`, `page`, `pageSize`) y detalle |
| `POST`, `PATCH`, `DELETE /api/categories…` | Admin | Al borrar una categoría, sus productos quedan sin categoría |
| `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id` | Admin | Usuarios (`q`, `role`, `sort`…). Nunca devuelve el hash de la contraseña |
| `GET/PATCH /api/profile` | Autenticado | Perfil propio `{ name, email, image }` |
| `PATCH /api/profile/password` | Autenticado | `{ currentPassword, newPassword }` |
| `POST /api/uploads` | Autenticado | `multipart/form-data` con `file` y `folder` (`avatars`, `products`, `misc`) |
| `POST/DELETE /api/push/subscription` | Autenticado | Guarda o elimina la suscripción del navegador |
| `POST /api/push/test` | Autenticado | Envía una notificación de prueba a tus dispositivos |
| `POST /api/push/broadcast` | Admin | `{ title, body, url }` a todas las suscripciones |
| `GET /api/health` | Público | Estado de la base de datos y de los servicios opcionales |

## Configurar servicios opcionales

**Google.** En Google Cloud Console crea un cliente OAuth de tipo *Aplicación web*. Agrega `http://localhost:3000/api/auth/callback/google` (y la URL de producción) como URI de redirección, y copia el ID y el secreto en `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. Una cuenta de Google se vincula con un usuario existente si el correo coincide y Google lo marca como verificado.

**Correo.** Con Resend, define `RESEND_API_KEY` y un `EMAIL_FROM` de un dominio verificado. Con SMTP, define `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASSWORD`. En desarrollo sin credenciales, busca el bloque `[mail] correo de desarrollo` en la terminal del servidor.

**DigitalOcean Spaces (u otro S3).**

```env
STORAGE_DRIVER="s3"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_REGION="us-east-1"
S3_BUCKET="mi-space"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://mi-space.nyc3.cdn.digitaloceanspaces.com"
```

**Push.** Ejecuta `npm run vapid`, copia las claves en `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`, define `VAPID_SUBJECT` y reinicia. El navegador exige HTTPS, salvo en `localhost`.

## Alcance y limitaciones

Lo que la plantilla **no** hace (o hace de forma mínima), para que no haya sorpresas:

- **Rate limiting en memoria** en login, registro, recuperación, subidas y push. Sirve para una sola instancia; con varias réplicas conviene llevarlo a Redis o Upstash.
- **Las sesiones JWT no se revocan** al cambiar la contraseña o borrar un usuario: el JWT sigue siendo válido hasta que caduca. Aun así, como la autorización se comprueba contra la base de datos, un usuario borrado no puede usar el dashboard ni la API.
- **No hay verificación de email** al registrarse.
- **Los archivos reemplazados no se borran** del almacenamiento (ni local ni S3).
- **El service worker es mínimo**: solo guarda en caché la página `/offline` y los iconos, y no sirve el dashboard sin conexión.
- **Push** se probó en el servidor (suscripción, envío y limpieza de suscripciones caducadas). La suscripción desde el navegador requiere permiso del usuario y HTTPS o `localhost`.
- **Los precios** de la página `/prices` son de ejemplo.
- **No incluye tests automatizados**.
