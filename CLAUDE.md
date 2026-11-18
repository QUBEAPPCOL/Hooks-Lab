# Reglas del proyecto

## Copy de LinkedIn para Andrés Betancourt (obligatorio)

Todo texto para LinkedIn (posts, hooks, comentarios, DMs, perfil, carruseles)
se escribe en la voz de Andrés definida en `.claude/linkedin/voice.md`.

1. Leer `.claude/linkedin/voice.md` completo, incluidos los 6 posts de
   referencia, ANTES de escribir cualquier borrador u opción de hook.
2. Las opciones de hook también van en su voz. Nada de opciones "neutras" para que él las adapte.
3. Pasar el CHEQUEO DE VOZ de ese archivo antes de mostrar el texto. Si falla un punto,
   reescribir; no mostrar la versión que falla. No mostrar puntajes de voz.
4. Jerarquía de skills: (a) `voice.md` y este archivo; (b) `copy-linkedin-patrones-top`
   (territorio, ICP, patrones, filtro anti-IA, CTA); (c) `copy-linkedin-estilo-anonimos`
   (fórmulas de gancho y estructuras para variar); (d) skills `li-*` solo como utilidades
   (comentarios, DMs, perfil, bandeja). Si chocan, manda la de más arriba. Las reglas
   genéricas de `li-*` (p. ej. "pregunta o instrucción, nunca ambas") no aplican a Andrés.
5. `li-human`: usar solo `detect.py` como referencia. NO aplicar `humanize.py`
   sobre sus textos: borra su firma " . . ." y su puntuación imperfecta.
   El detector está calibrado para inglés; su puntaje de VOICE no aplica en español.
6. Tres opciones de post por tema, siempre: posts COMPLETOS con apertura,
   estructura y ángulo distintos (no tres versiones del mismo texto). Decir cuál
   publicaría y por qué en una o dos frases.
7. Nunca inventar cifras, clientes, diálogos ni desenlaces. Si falta un dato
   real, marcarlo entre [corchetes] y preguntar.
8. Antes de proponer temas o muletillas, revisar `.claude/linkedin/publicados.md`
   para no repetir lo de las últimas 2 semanas.

Plan semanal y borradores: `.claude/linkedin/`.
