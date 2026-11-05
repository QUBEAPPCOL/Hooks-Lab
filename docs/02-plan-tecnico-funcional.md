# HOOKS LAB — Fase 2: Plan técnico y funcional

## 0. Recomendación

**Construir primero una herramienta de uso interno para tus 4 marcas (Andrés, QUBE, Joha, Serena).** Dejarla lista para ser multi-tenant, pero sin construir todavía facturación, onboarding ni planes.

Por qué:
- El valor del producto está en la **base de conocimiento curada** y en el **ciclo de aprendizaje**, no en la interfaz. Ambos se prueban usándolo tú a diario durante 6–8 semanas.
- Ya existen generadores genéricos para LinkedIn (Taplio, Supergrow y otros). Convertir esto en un SaaS antes de demostrar que los hooks superan a esos generadores sería competir en precio contra herramientas financiadas.
- **Costo de oportunidad:** cada hora en HOOKS LAB es una hora que no va al pipeline de QUBE (ABM de 100 cuentas). HOOKS LAB se justifica si **acelera el contenido que alimenta ese pipeline**. Esa es la métrica que propongo para decidir si se escala.

Qué tendría que ser cierto para que valga la pena como SaaS:
1. En un test a ciegas, tú prefieres sus hooks frente a los de un LLM sin el sistema en ≥60 % de los casos.
2. Lo usas ≥4 días por semana.
3. Al menos 3 colegas creadores o agencias pagarían por él después de verlo.

---

## 1. Arquitectura

```
┌──────────────── Next.js 15 (App Router, TypeScript) ────────────────┐
│ UI (React + Tailwind + shadcn/ui)   │   Server Actions / Route Handlers │
└───────────────┬──────────────────────┴─────────────┬─────────────────┘
                │                                    │
        Auth (Auth.js / Supabase Auth)      Motor de hooks (servidor)
                │                    ┌───────────────┴───────────────┐
                │                    │ 1. Recuperación (RAG)         │
                │                    │ 2. Planificador de ángulos    │
                │                    │ 3. Generación                 │
                │                    │ 4. Evaluación (juez)          │
                │                    │ 5. Deduplicación semántica    │
                │                    │ 6. Ranking por objetivo       │
                │                    └───────────────┬───────────────┘
                │                                    │
   PostgreSQL + pgvector (Supabase)     Capa de proveedores LLM (interfaz común)
   - datos, prompts versionados,        - Anthropic (principal)
     embeddings, logs                   - OpenAI / Google (respaldo)
                                        - embeddings intercambiables
```

| Decisión | Elección | Motivo | Alternativa descartada |
|---|---|---|---|
| Framework | **Next.js + TypeScript** | Un solo repositorio para front y back, es maduro, se despliega en Vercel y hay mucho talento disponible para mantenerlo | Separar React + FastAPI: es más complejo sin beneficio a esta escala |
| Base de datos | **PostgreSQL (Supabase)** + **pgvector** | Es relacional, la búsqueda semántica corre en la misma base y además trae Auth y almacenamiento de archivos | Una base vectorial aparte: sería sobreingeniería |
| ORM | **Drizzle** | Tipado, migraciones simples | Prisma: más pesado con pgvector |
| LLM | **Interfaz `LLMProvider`** con adaptadores. Anthropic como principal; OpenAI/Gemini como respaldo | Exigiste no depender de un solo proveedor | — |
| Modelos | Generación y juez: modelo de gama alta. Clasificación y extracción masiva: modelo rápido y barato | Calidad donde importa, costo bajo donde no | — |
| Claves API | Solo en variables de entorno del servidor; el cliente nunca llama al LLM | Seguridad | — |
| Prompts | Tabla `prompt_versions` (nombre, versión, plantilla, modelo, parámetros, activa). Editables desde Configuración. Cada generación registra la versión usada | Versionado y comparación A/B de prompts | Prompts en el código |
| Salidas | JSON validado con **Zod** (salida estructurada) | Evita respuestas mal formadas | — |
| Logs | Tabla `llm_calls` (proveedor, modelo, tokens, latencia, costo, error) + Sentry | Trazabilidad y control de costos | — |
| Transcripción | Interfaz `Transcriber` (Whisper u otro) | Análisis de video subido manualmente | — |

## 2. Motor de generación (el corazón del producto)

El problema de los generadores genéricos es que piden "dame 10 hooks" y obtienen 10 variaciones de la misma frase. HOOKS LAB **planifica antes de escribir**:

1. **Recuperación.** Toma tema, marca, plataforma, audiencia, objetivo e industria. Con eso busca en la biblioteca las estructuras compatibles (filtros más similitud semántica), los hooks observados de los creadores de referencia y los hooks propios con buen rendimiento (del módulo MIS RESULTADOS).
2. **Planificador de ángulos.** Asigna a cada hook solicitado una combinación **distinta** de estructura, mecanismo(s) y ángulo, y la diversidad se mide. Con 10 hooks, por ejemplo: ≥6 estructuras distintas, ≥5 mecanismos primarios distintos y una cuota máxima de preguntas.
3. **Generación.** Una llamada por lote, con el plan explícito más la voz de la marca, las palabras permitidas y prohibidas y la adaptación a la plataforma. Para video, cada hook incluye: texto en pantalla, frase hablada y acción visual del primer segundo.
4. **Evaluación.** Otro prompt, con el rol de "editor exigente", califica cada hook con rúbricas cuyos pesos dependen del objetivo (tabla abajo). Además marca: cifras inventadas, promesas que el contenido no puede cumplir, frases cliché (lista negra editable) y expresiones poco naturales en la variante de español elegida.
5. **Deduplicación.** Por similitud de embeddings: si dos hooks se parecen más de 0,88 (umbral a calibrar), se regenera uno.
6. **Ranking.** Top 3 con justificación: el mejor para alcance, para interacción y para conversión. Las puntuaciones se muestran siempre como "**evaluación heurística**", nunca como probabilidad de éxito.

### Pesos por objetivo (puntos sobre 100)

| Criterio | Alcance | Conversación | Autoridad | Leads/Ventas | Identificación emocional |
|---|---|---|---|---|---|
| Impacto inicial | 20 | 15 | 15 | 10 | 15 |
| Curiosidad | 20 | 10 | 10 | 10 | 10 |
| Identificación | 15 | 15 | 10 | 10 | 25 |
| Claridad | 10 | 10 | 15 | 15 | 10 |
| Originalidad | 15 | 10 | 15 | 10 | 10 |
| Potencial de conversación | 15 | 30 | 10 | 5 | 15 |
| Credibilidad / criterio | 5 | 5 | 25 | 10 | 5 |
| Claridad del problema + conexión con la oferta | 0 | 5 | 0 | 20 | 5 |
| Calidad de audiencia atraída | 0 | 0 | 0 | 10 | 5 |

Los pesos son editables por marca. Cuando MIS RESULTADOS tenga suficientes datos, el sistema **sugerirá** ajustes, pero nunca los aplicará solo.

## 3. Modelo de datos (resumen)

- `users`, `workspaces` (para el futuro multi-tenant), `brands` (descripción, audiencia, personalidad, tono, productos, propuesta de valor, palabras permitidas y prohibidas, objetivos, variante de español)
- `creators` (perfil, plataformas, temática, estilo, nivel de provocación, riesgo reputacional, confianza)
- `sources` (URL, tipo, autor, año, cita, verificada)
- `posts` (creador, plataforma, URL, fecha, métricas observadas con fecha de captura, transcripción, archivo)
- `observed_hooks` (post, texto literal, primeros 3 s, recursos visuales, tipo O/H/C/A, confianza)
- `mechanisms` (20 iniciales, fundamento, fuente, advertencias)
- `structures` (código, nombre, fórmula, objetivo, tono, dificultad, ejemplo, contraejemplo, adaptaciones por plataforma, industrias, `source_id`, embedding)
- `structure_mechanisms` (N:M, primario/secundario)
- `industries` (20, con su léxico, tensiones típicas y tabúes)
- `generations` (formulario completo, versión de prompt, modelo, costo) → `generated_hooks` (texto, estructura, mecanismos, tono, explicación, audiencia, debilidad, adaptación, puntuaciones, rank, favorito)
- `contents` (hook, formato, cuerpo, versiones; cambiar de hook conserva el historial)
- `published_posts` (marca, red, fecha, hook, clasificación, impresiones, alcance, likes, comentarios, compartidos, guardados, clics, leads, ventas, observaciones)
- `prompt_versions`, `llm_calls`

## 4. Navegación y pantallas

1. **Dashboard:** contadores, últimos análisis, mecanismos con mejor desempeño por marca (con el tamaño de muestra visible).
2. **Generar hooks:** formulario en 3 pasos (Contexto → Estrategia → Estilo). Resultados en tarjetas, filtros por mecanismo, ranking fijo arriba y acciones: favorito, "desarrollar contenido", "regenerar similar", "más arriesgado / más sobrio".
3. **Biblioteca:** más de 150 estructuras con filtros por mecanismo, objetivo, plataforma, industria y dificultad. Cada ficha incluye el adaptador por industria.
4. **Investigador:** analizar publicación (URL, texto, transcripción, captura o video), con la regla de que, si no hay acceso al contenido, el sistema lo pide y no inventa.
5. **Creadores:** fichas, publicaciones analizadas, patrones recurrentes y fuentes.
6. **Industrias:** léxico y tensiones por industria, y adaptar una estructura a una o varias industrias.
7. **Mis marcas.**
8. **Mis resultados:** registro manual o por CSV, comparativas por marca, plataforma, mecanismo y tono, y avisos de "muestra insuficiente" (menos de 10 publicaciones por grupo) y de "alcance sin conversión".
9. **Favoritos.**
10. **Configuración:** proveedores, modelos, prompts versionados, pesos, lista negra de clichés.

Diseño:
- Negro carbón (#141414), blanco y grises.
- Acento verde oliva (#6B7A3A) y color secundario para acciones (#E8C9C0, rosa pastel tenue, coherente con tu identidad).
- Tipografía Inter + una serif editorial para los títulos.
- Modo oscuro por defecto, responsive.

## 5. Prompts especializados (10, versionados)

1. Investigación de creador.
2. Análisis de publicación.
3. Extracción de estructura.
4. Clasificación psicológica.
5. Planificación de ángulos + generación.
6. Evaluación (juez).
7. Adaptación por industria.
8. Adaptación por plataforma.
9. Desarrollo de contenido, con una verificación de que "el contenido cumple lo que promete el hook".
10. Análisis de resultados, con la regla explícita de no atribuir causalidad a una sola variable.

## 6. Biblioteca de 150 estructuras: cómo evito la "variación superficial"

Las organizo en **15 familias × ~10 estructuras**. Cada estructura debe diferir de las demás en **al menos dos de estos tres ejes**: movimiento lógico (inversión, revelación, comparación, secuencia, escena…), posición del lector (protagonista, observador, acusado, cómplice…) y tipo de apertura (afirmación, escena, cifra, diálogo, confesión, instrucción, lista…).

Las 15 familias:
1. Contradicción.
2. Revelación.
3. Identificación situacional.
4. Humor / violación benigna.
5. Controversia / opinión impopular.
6. Confesión.
7. Advertencia / pérdida.
8. Transformación.
9. Escena narrativa (*in medias res*).
10. Autoridad con criterio.
11. Especificidad / dato.
12. Comparación / contraste.
13. Pertenencia / tribu.
14. Valor práctico.
15. Meta / formato (rompe la cuarta pared).

Las estructuras inspiradas en un creador llevarán `source_id` y una nota: "inspirada en el mecanismo observado en X". **Nunca llevarán una frase literal suya.**

## 7. Plan de ejecución

| Fase | Entregable | Duración estimada (yo) |
|---|---|---|
| 3. MVP | Proyecto base, autenticación, marcas (4 sembradas), biblioteca de 150, 20 mecanismos, 20 industrias, motor completo (recuperación, plan, generación, juez, deduplicación, ranking), favoritos, dashboard básico. **Pruebas con los escenarios A, B y C** | 1–2 sesiones de trabajo |
| 4. Investigación | Investigador, creadores, fuentes, transcripción, YouTube API | 1 sesión |
| 5. Aprendizaje | Mis resultados, CSV, comparativas, sugerencias | 1 sesión |
| 6. Optimización | Evaluación a ciegas frente a un LLM sin el sistema, diversidad, seguridad, rendimiento | Continua |

## 8. Lo que necesito de ti para arrancar la Fase 3

1. **Aprobación del enfoque** (uso interno primero, preparado para SaaS).
2. **Stack:** confirmar Next.js + Supabase + Vercel, o indicar otra preferencia.
3. **API keys:** al menos una de Anthropic (y opcionalmente de OpenAI). Se configuran como secreto del entorno, **nunca en el chat**.
4. **Juanda:** ¿JuanDa (Juan David Morales) o Juanda Caribe?
5. **Creadores con riesgo reputacional** (Carlos Muñoz, Aida Victoria): ¿se quedan como referencia nombrada, o solo se extraen sus mecanismos sin mostrar su nombre en la interfaz?
6. **Tu referente de LinkedIn B2B** en español.
7. Dónde vive el código: un repositorio de GitHub tuyo, para que yo haga push.
