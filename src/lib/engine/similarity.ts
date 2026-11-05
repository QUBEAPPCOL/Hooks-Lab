// Deduplicación léxica (MVP). Reemplazable por embeddings sin cambiar la interfaz.

const STOP = new Set(
  "el la los las un una unos unas de del al a en y o u que es no se lo le les su sus tu tus mi mis por para con sin como mas más pero si ya muy te me nos yo tú usted ellos esto eso este esta ese esa hay ser son fue era está estás".split(
    " ",
  ),
);

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9ñ\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export const DUPLICATE_THRESHOLD = 0.5;

/** Devuelve, para cada índice, el índice del hook anterior al que se parece demasiado (o -1). */
export function findNearDuplicates(texts: string[]): number[] {
  const toks = texts.map(tokens);
  return toks.map((t, i) => {
    for (let j = 0; j < i; j++) if (jaccard(t, toks[j]) >= DUPLICATE_THRESHOLD) return j;
    return -1;
  });
}
