# HOOKS LAB

Laboratorio de investigación y generación estratégica de hooks en español latinoamericano.
No es un generador de frases: **planifica ángulos distintos antes de escribir, evalúa cada hook según el objetivo y filtra el lenguaje corporativo y las cifras inventadas.**

## Estado: MVP (Fase 3)

| Módulo | Estado |
|---|---|
| Dashboard, Generar hooks, ranking top 3 + mejor para alcance/interacción/conversión | ✅ |
| Biblioteca: 150 estructuras en 15 familias, con fundamento, ejemplo, contraejemplo y adaptación por plataforma | ✅ |
| Adaptación de una estructura a 20 industrias (léxico, tensiones, tabúes) | ✅ |
| Desarrollar contenido (post, carrusel, infografía, Reel, TikTok, artículo, newsletter) con verificación de promesa; cambiar de hook sin perder el contenido | ✅ |
| Mis marcas (4 sembradas + personalizadas), Favoritos | ✅ |
| Prompts versionados y editables, logs de llamadas, proveedores intercambiables con respaldo | ✅ |
| Creadores, Industrias, Investigador (solo lectura de hooks observados con fuente) | ✅ base |
| Investigador: "Analizar publicación" (URL, texto, transcripción, video) | Fase 4 |
| Mis resultados (registro de métricas y aprendizaje) | Fase 5 |

## Cómo funciona el motor

1. **Recuperación + planificación** (`src/lib/engine/plan.ts`): elige estructuras de la biblioteca según los mecanismos, el objetivo, el tono y la industria. Asigna una estructura distinta a cada hook: con mecanismos elegidos, todos los ángulos activan al menos uno, con equilibrio entre ellos y un máximo de 20 % de preguntas.
2. **Generación por lotes** (`generate` prompt): la voz de la marca, el registro (techo de coloquialidad), la variante de español, las reglas de plataforma y los mecanismos de los creadores de referencia, nunca sus frases.
3. **Controles deterministas** (`lint.ts`): lenguaje corporativo, palabras prohibidas de la marca, cifras que no están en tu brief, corte del "ver más" de LinkedIn y exceso de emojis.
4. **Juez heurístico** (`judge` prompt): 10 criterios de 0 a 10. Los pesos (100 puntos) cambian según el objetivo (`weights.ts`). **No es una probabilidad de viralidad.**
5. **Deduplicación** (`similarity.ts`) y **ranking**.

## Puesta en marcha

```bash
cp .env.example .env.local   # completar DATABASE_URL, APP_PASSWORD, AUTH_SECRET y ANTHROPIC_API_KEY
npm install
npm run db:push              # crea las tablas
npm run db:seed              # carga mecanismos, industrias, 150 estructuras, marcas, creadores y prompts
npm run dev
```

Pruebas:

```bash
npm run test:pipeline        # tubería completa con proveedor de prueba (sin llamar a ningún modelo)
npm run typecheck
```

## Decisiones del MVP (y cómo crecen)

- **Base de datos:** PostgreSQL (local o Supabase/Neon) con Drizzle.
- **Autenticación:** contraseña única (`APP_PASSWORD`), porque es una herramienta interna. Para el SaaS: Auth.js o Supabase Auth + `workspaces`.
- **Deduplicación léxica:** hoy es léxica. Pasar a embeddings + pgvector solo si la diversidad medida lo justifica; la interfaz de `similarity.ts` no cambia.
- **IA:** interfaz `LLMProvider` con Anthropic como proveedor principal (Claude Opus 5.5) y OpenAI como respaldo. Para agregar otro proveedor se implementa una sola clase. Las claves viven solo en el servidor.
- **Investigación:** sin scraping. TikTok, Instagram y LinkedIn se alimentan con material que sube el usuario (ver `docs/`).

Documentación de investigación y diseño en `docs/`.
