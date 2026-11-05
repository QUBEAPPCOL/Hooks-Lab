# Guía paso a paso: poner HOOKS LAB en línea

**Tiempo estimado:** 20–30 minutos. **No necesitas instalar nada en tu computador.**
**Necesitas:** tu cuenta de GitHub (la de QUBEAPPCOL), un correo y una tarjeta para cargar saldo en Anthropic.

> **Sobre las capturas de pantalla:** no las incluí porque no tengo acceso a tus cuentas de Supabase, Vercel ni Anthropic, y no quiero inventar pantallas. En su lugar, cada paso dice **el nombre exacto del botón o menú** entre comillas. Si alguno cambió de nombre (estas plataformas actualizan su interfaz con frecuencia), busca la opción equivalente o mándame una captura de lo que ves y te digo dónde hacer clic.

Vas a usar tres servicios:

| Servicio | Para qué | Costo |
|---|---|---|
| **Supabase** | Base de datos (marcas, biblioteca, hooks generados) | Plan gratuito |
| **Vercel** | Publicar la aplicación en internet | Plan gratuito (Hobby) |
| **Anthropic** | El modelo de IA que escribe y evalúa los hooks | Pago por uso (ver paso 3) |

Mientras avanzas, abre una nota privada (o tu gestor de contraseñas) y ve guardando 4 datos. **No los pegues en chats, correos ni documentos compartidos:**

1. La contraseña de la base de datos (paso 1).
2. La cadena de conexión de Supabase (paso 1).
3. La API key de Anthropic (paso 3).
4. La contraseña para entrar a HOOKS LAB y el secreto de sesión (paso 4).

---

## Paso 1. Crear la base de datos en Supabase (≈ 8 min)

1. Entra a **https://supabase.com** y haz clic en **"Start your project"**. Regístrate con **"Continue with GitHub"**.
2. Si te pide crear una organización, ponle **QUBE** y elige el plan **"Free"**.
3. Haz clic en **"New project"** y completa:
   - **Project name:** `hooks-lab`
   - **Database Password:** haz clic en **"Generate a password"** y **cópiala ya en tu nota**. No se vuelve a mostrar completa.
   - **Region:** **"East US (North Virginia)"**. Es la región más cercana a los servidores de Vercel, así las generaciones son más rápidas.
4. Haz clic en **"Create new project"** y espera 1–2 minutos a que termine de configurarse.

### Obtener la cadena de conexión

5. En la parte superior del proyecto, haz clic en el botón **"Connect"**.
6. En la pestaña **"Connection String"** (o **"ORMs"**), busca la opción **"Transaction pooler"**. Es la que usa el puerto **6543**.
7. Copia la dirección. Se ve así:
   ```
   postgresql://postgres.abcdefghijkl:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
8. En tu nota, haz dos cambios:
   - Reemplaza `[YOUR-PASSWORD]` (incluidos los corchetes) por la contraseña del punto 3.
   - Agrega al final: `?sslmode=no-verify`

   Queda así:
   ```
   postgresql://postgres.abcdefghijkl:TuContraseña@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=no-verify
   ```
   Esta es tu **`DATABASE_URL`**.

> Si tu contraseña tiene símbolos como `@`, `#`, `/` o `%`, la conexión puede fallar. Lo más fácil es generar otra solo con letras y números: en Supabase, **"Project Settings" → "Database" → "Reset database password"**.

---

## Paso 2. Crear las tablas y cargar la biblioteca (≈ 3 min)

1. Abre el archivo **`docs/supabase-instalacion.sql`** del repositorio en GitHub:
   https://github.com/QUBEAPPCOL/hooks-lab/blob/main/docs/supabase-instalacion.sql
2. Haz clic en el botón **"Raw"** (arriba a la derecha del archivo). Luego selecciona todo (**Ctrl+A** / **Cmd+A**) y copia (**Ctrl+C** / **Cmd+C**).
3. En Supabase, en el menú izquierdo, entra a **"SQL Editor"** y haz clic en **"New query"** (o el **"+"**).
4. Pega todo el contenido y haz clic en **"Run"**. Si Supabase te muestra una advertencia sobre una "operación destructiva" o sobre "RLS", confirma con **"Run this query"**.
5. Debe aparecer **"Success. No rows returned"** (o similar).

**Verifícalo:** en el menú izquierdo, entra a **"Table Editor"**. Deberías ver 11 tablas. Abre `structures`: debe tener **150 filas**. Abre `brands`: debe tener **4** (Andrés Betancourt, QUBE, Serena y Ps. Joha Quintero).

> Ejecútalo **una sola vez**. Si lo corres de nuevo, dará error porque las tablas ya existen. No pasa nada grave, pero no hace falta.

---

## Paso 3. Obtener la API key de Anthropic (≈ 5 min)

1. Entra a **https://console.anthropic.com** y crea tu cuenta.
2. Ve a **"Settings" → "Billing"** y carga saldo. Para empezar sobran **USD 20**.
3. **Recomendado:** en **"Settings" → "Limits"**, define un **límite de gasto mensual** (por ejemplo, USD 30). Así nunca te llevas una sorpresa.
4. Ve a **"API Keys"** y haz clic en **"Create Key"**. Ponle de nombre `hooks-lab-produccion`.
5. **Copia la clave en tu nota ya.** Empieza por `sk-ant-` y no se vuelve a mostrar.

### Cuánto cuesta usarlo (estimación, no dato verificado)

El modelo configurado es Claude Opus 5.5 (USD 4 por millón de tokens de entrada y USD 20 por millón de salida). Una generación de 10 hooks hace dos llamadas: escribir y evaluar. **Calculo entre USD 0,30 y 1,00 por generación de 10 hooks**, según el largo del tema y cuánto "piense" el modelo. Desarrollar un post completo debería costar menos.

El costo real lo vas a ver en HOOKS LAB, en **Configuración → Últimas llamadas a modelos**, que muestra los tokens de cada llamada. Revísalo después de las primeras 5 generaciones y ajustamos si hace falta. Por ejemplo, se puede usar un modelo más económico solo para el evaluador.

---

## Paso 4. Preparar tu contraseña y el secreto de sesión (≈ 2 min)

Necesitas dos textos más en tu nota:

- **`APP_PASSWORD`:** la contraseña con la que vas a entrar a HOOKS LAB. Usa una larga y única, distinta a las demás.
- **`AUTH_SECRET`:** un texto aleatorio de al menos 40 caracteres que firma tu sesión. Nunca lo vas a escribir a mano. Genéralo con el generador de contraseñas de tu navegador o gestor (1Password, Bitwarden, Google Password Manager): elige 48 caracteres, solo letras y números.

---

## Paso 5. Publicar la aplicación en Vercel (≈ 7 min)

1. Entra a **https://vercel.com/signup** y elige **"Continue with GitHub"**. Plan **"Hobby"**.
2. En el panel, haz clic en **"Add New…" → "Project"**.
3. En **"Import Git Repository"**, busca **`hooks-lab`**.
   - **Si no aparece:** haz clic en **"Adjust GitHub App Permissions"** (o **"Configure GitHub App"**), elige la organización **QUBEAPPCOL** y dale acceso al repositorio **Hooks-Lab**. Vuelve a Vercel y aparecerá.
4. Haz clic en **"Import"**.
5. En la pantalla de configuración:
   - **Framework Preset:** debe decir **Next.js** (lo detecta solo).
   - **Root Directory:** déjalo como está (`./`).
   - Abre **"Environment Variables"** y agrega **una por una** (Key = nombre, Value = valor):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | La cadena de conexión del paso 1, terminada en `?sslmode=no-verify` |
   | `APP_PASSWORD` | Tu contraseña del paso 4 |
   | `AUTH_SECRET` | El secreto del paso 4 |
   | `ANTHROPIC_API_KEY` | La clave `sk-ant-…` del paso 3 |
   | `LLM_PRIMARY` | `anthropic` |
   | `ANTHROPIC_MODEL` | `claude-opus-5-5` |

6. Haz clic en **"Deploy"** y espera 2–3 minutos.
7. Cuando veas **"Congratulations!"**, haz clic en **"Continue to Dashboard"** y luego en **"Visit"**. Tu dirección será algo como `https://hooks-lab-xxxx.vercel.app`.

> **Importante:** la API key queda guardada solo en Vercel, del lado del servidor. Nunca llega al navegador ni al código en GitHub.

---

## Paso 6. Primera prueba (≈ 5 min)

1. Entra a tu dirección de Vercel. Te pedirá la contraseña: usa tu `APP_PASSWORD`.
2. Ve a **Configuración**. En "Proveedores de IA", Anthropic debe decir **"Configurado"**.
3. Ve a **Generar hooks** y haz clic en **"A · Marca personal"** (arriba del formulario). Se llena solo con el escenario A.
4. Haz clic en **GENERAR HOOKS**. **Tarda entre 1 y 2 minutos:** escribe, evalúa, filtra y ordena. No cierres la pestaña.
5. Repite con **"B · Serena"** y **"C · QUBE"**.

**Qué revisar en cada resultado** (y qué mandarme):
- ¿Al menos 3 de los 10 hooks los publicarías casi tal cual?
- ¿Suenan a ti (o a Joha), o suenan a máquina?
- ¿Hay ángulos realmente distintos, o son variaciones de la misma frase?
- ¿El top 3 coincide con tu criterio?

Mándame el enlace de cada generación (o una captura) con tu opinión. Con eso ajustamos los prompts desde **Configuración**, sin tocar código: cada cambio queda como una versión nueva y se puede revertir.

---

## Si algo falla

| Síntoma | Causa probable | Solución |
|---|---|---|
| El deploy en Vercel falla en "Build" | Algo en el código o una variable mal escrita | Copia las últimas 20 líneas del log de Vercel y mándamelas. |
| Al entrar aparece "Application error" o error 500 | `DATABASE_URL` incorrecta | Revisa que tenga tu contraseña real (sin corchetes), puerto **6543** y `?sslmode=no-verify` al final. Después de corregir una variable: **"Deployments" → los tres puntos del último deploy → "Redeploy"**. |
| Error "self-signed certificate" | Falta `?sslmode=no-verify` | Agrégalo al final de `DATABASE_URL` y haz Redeploy. |
| "Contraseña incorrecta" al entrar | `APP_PASSWORD` distinta a la que escribes | Revísala en Vercel → **"Settings" → "Environment Variables"**, corrígela y haz Redeploy. |
| "No hay ningún proveedor de IA configurado" | Falta `ANTHROPIC_API_KEY` | Agrégala en Vercel y haz Redeploy. |
| "API key de Anthropic inválida" | Clave mal copiada o revocada | Crea una nueva en console.anthropic.com y reemplázala. |
| La generación se queda cargando y falla pasados 5 minutos | Límite de tiempo del plan Hobby | Prueba con 10 hooks en vez de 30–50. Si se repite, lo ajusto. |
| Errores de "credit balance" o "billing" | Sin saldo en Anthropic | Carga saldo en **"Settings" → "Billing"**. |
| La app no carga después de una semana sin uso | Supabase gratuito pausa los proyectos inactivos | Entra a Supabase y haz clic en **"Restore project"**. |

---

## Seguridad: lo mínimo

- **Haz privado el repositorio en GitHub** (**"Settings" → "General" → "Danger Zone" → "Change visibility" → "Private"**). La biblioteca, los prompts y la investigación son tu propiedad intelectual. Vercel sigue funcionando igual.
- No compartas la dirección de Vercel junto con la contraseña en el mismo mensaje.
- Si crees que una clave se filtró, revócala en su plataforma (Anthropic, Supabase) y crea otra.
