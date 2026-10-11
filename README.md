# Torneo 5vs5 UdeC 2026 — página web

Página del torneo con login de Discord, inscripción de equipos, cuadro de eliminación directa
(semis, final y 3er lugar al mejor de 3), jugadores, calendario, reglamento, transmisión en vivo y panel de admin.

Si la subes sin configurar nada, funciona en **modo demo** (datos de ejemplo que se reinician).
Sigue estos pasos para dejarla funcionando de verdad. Toma unos 20 minutos.

---

## Paso 1 · Subir el proyecto a GitHub

1. Crea una cuenta en https://github.com (si no tienes).
2. Arriba a la derecha: **+ → New repository**. Nombre: `torneo-udec`. Deja "Private" si quieres. **Create repository**.
3. En la página del repositorio vacío, haz clic en **"uploading an existing file"**.
4. Descomprime el zip y arrastra **todo el contenido de la carpeta** (no la carpeta misma: deben quedar `app`, `components`, `lib`, `package.json`, etc. en la raíz). **Commit changes**.

## Paso 2 · Crear el proyecto en Vercel

1. Entra a https://vercel.com y regístrate **con tu cuenta de GitHub**.
2. **Add New… → Project** → elige `torneo-udec` → **Import** → **Deploy**.
3. En 1-2 minutos tendrás tu dirección, por ejemplo `https://torneo-udec.vercel.app`. Ya se ve la página en modo demo.
   - Puedes cambiar el nombre de la dirección en **Settings → Domains**.

## Paso 3 · Conectar la base de datos (Neon, gratis)

1. En tu proyecto de Vercel: pestaña **Storage → Create Database → Neon (Serverless Postgres)** → plan Free → región São Paulo o Washington → **Create**.
2. Cuando pregunte, conéctala al proyecto `torneo-udec` (todas las opciones marcadas). Esto agrega la variable `DATABASE_URL` sola.
   Las tablas se crean automáticamente la primera vez que se abre la página.

## Paso 4 · Crear la app de Discord (para "Entrar con Discord")

1. Entra a https://discord.com/developers/applications → **New Application** → nombre "Torneo UdeC".
2. Menú **OAuth2**:
   - Copia el **Client ID**.
   - En **Client Secret** haz clic en **Reset Secret** y copia el secreto (guárdalo, solo se muestra una vez).
   - En **Redirects** → **Add Redirect** y pega exactamente (con TU dirección):
     `https://torneo-udec.vercel.app/api/auth/callback/discord`
   - **Save Changes**.

## Paso 5 · Variables de entorno en Vercel

En Vercel: **Settings → Environment Variables**. Agrega una por una:

| Nombre | Valor |
|---|---|
| `DISCORD_CLIENT_ID` | El Client ID del paso 4 |
| `DISCORD_CLIENT_SECRET` | El Client Secret del paso 4 |
| `NEXTAUTH_SECRET` | Un texto largo al azar. Puedes generarlo en https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | Tu dirección, ej: `https://torneo-udec.vercel.app` |
| `ADMIN_DISCORD_IDS` | Los IDs de Discord de los organizadores, separados por coma (ver abajo) |

**Cómo sacar tu ID de Discord:** en Discord ve a Ajustes → Avanzado → activa **Modo desarrollador**.
Luego clic derecho sobre tu nombre → **Copiar ID de usuario**. Es un número largo como `123456789012345678`.

Después: pestaña **Deployments** → en el último, los tres puntos **⋯ → Redeploy**. ¡Listo!

---

## Cómo se usa

**Jugadores**
1. Entran con Discord → "Mi cuenta" → ponen su Riot ID (Nombre#TAG), rango y rol.
2. El capitán crea el equipo (nombre + tag) y recibe un **código de 6 letras**.
3. Los compañeros entran con Discord y escriben el código para unirse. Mínimo 5, máximo 7 (2 suplentes).

**Organizadores** (los IDs en `ADMIN_DISCORD_IDS`; ven "Panel de admin" en el menú de su avatar)
- **Crear cuadro:** sorteo al azar o por orden de inscripción. Si los equipos no son 4, 8, 16, 32…, algunos pasan directo (bye). Al crearlo se cierran las inscripciones.
- **Resultados:** escriben el marcador (BO1: 1-0 · BO3: 2-0 o 2-1) y la fecha/hora. El ganador avanza solo, y los perdedores de semis pasan al partido por el 3er lugar.
- **Ajustes:** número de **WhatsApp** y link de **Instagram** para inscripciones (mientras estén vacíos, la sección "Inscripción" muestra "Pronto"), abrir/cerrar inscripciones, canal de Twitch para "En vivo", y links de Discord, Instagram, Facebook, X y TikTok (aparecen en el pie de página).

## Cambiar textos

- **Reglamento:** `lib/reglamento.ts`
- **Premios y textos de inicio:** `app/page.tsx`
- **Texto de la página de inscripción:** `app/inscripcion/page.tsx`
- **Mensaje que llega por WhatsApp:** `lib/data.ts`, línea `WA_TEXT`
- **Colores:** las primeras líneas de `app/globals.css`
- **BO del 3er lugar** (está en BO3): `lib/bracket.ts`, línea `BO_THIRD`

En GitHub puedes editar cualquier archivo con el ícono del lápiz. Al guardar, Vercel actualiza la página sola en ~1 minuto.

## Probar en tu computador (opcional)

Necesitas Node.js 18 o superior: `npm install` y luego `npm run dev`, y abre http://localhost:3000.
Sin variables configuradas arranca en modo demo, con botones para entrar como jugador o admin de prueba.
