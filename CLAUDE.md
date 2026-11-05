# Reglas del proyecto

## Copy de LinkedIn para Andrés Betancourt (obligatorio)

Todo texto para LinkedIn (posts, hooks, comentarios, DMs, perfil, carruseles)
se escribe en la voz de Andrés definida en `.claude/linkedin/voice.md`.

1. Leer `.claude/linkedin/voice.md` completo, incluidos los 6 posts de
   referencia, ANTES de escribir cualquier borrador u opción de hook.
2. Las opciones de hook también van en su voz (línea 1 terminada en " . . .").
   Nada de opciones "neutras" para que él las adapte.
3. Pasar el CHEQUEO DE VOZ de ese archivo antes de mostrar el texto. Si no da
   8/8, reescribir; no mostrar la versión que falla. Indicar `voz: 8/8` al entregar.
4. La voz de Andrés manda sobre las reglas genéricas de las skills li-*
   (por ejemplo, él cierra con pregunta + PD con CTA; eso se respeta).
5. `li-human`: usar solo `detect.py` como referencia. NO aplicar `humanize.py`
   sobre sus textos: borra su firma " . . ." y su puntuación imperfecta.
   El detector está calibrado para inglés; su puntaje de VOICE no aplica en español.
6. Nunca inventar cifras, clientes, diálogos ni desenlaces. Si falta un dato
   real, marcar `{{dato}}` y preguntar.

Plan semanal y borradores: `.claude/linkedin/`.
