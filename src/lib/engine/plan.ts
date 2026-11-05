import type { StructureSeed } from "@/data/structures/types";

// Afinidad objetivo → mecanismos (para "Sorpréndeme"). Basado en docs/01, sección 2.
export const OBJECTIVE_MECHANISMS: Record<string, string[]> = {
  alcance: ["curiosidad", "humor", "identificacion", "sorpresa", "contradiccion", "controversia"],
  comentarios: ["controversia", "identificacion", "pertenencia", "comparacion", "humor"],
  conversacion: ["controversia", "contradiccion", "identificacion", "pertenencia", "confesion"],
  posicionamiento: ["contradiccion", "autoridad", "revelacion", "controversia", "especificidad"],
  autoridad: ["autoridad", "revelacion", "especificidad", "contradiccion", "confesion"],
  leads: ["miedo_perder", "revelacion", "autoridad", "especificidad", "valor_practico", "contradiccion"],
  ventas: ["miedo_perder", "especificidad", "prueba_social", "comparacion", "autoridad"],
  educacion: ["valor_practico", "curiosidad", "revelacion", "especificidad", "advertencia"],
  emocional: ["identificacion", "storytelling", "confesion", "intriga", "pertenencia"],
  comunidad: ["pertenencia", "identificacion", "humor", "confesion", "valor_practico"],
};

export type PlanSlot = {
  slot: number;
  structureCode: string;
  structureName: string;
  family: string;
  formula: string;
  mechanisms: string[];
  example: string;
  counterExample: string;
  platformNote: string;
};

type PlanArgs = {
  structures: StructureSeed[];
  count: number;
  mechanisms: string[]; // vacío = sorpréndeme
  objective: string;
  tones: string[];
  industry: string | null;
  platform: string;
  avoidCodes?: Set<string>;
  seed?: number;
};

function platformNote(s: StructureSeed, platform: string): string {
  if (platform === "linkedin" || platform === "newsletter" || platform === "blog") return s.adaptLinkedin;
  if (platform === "instagram") return s.adaptInstagram;
  if (platform === "tiktok" || platform === "youtube_shorts") return s.adaptTiktok;
  if (platform === "facebook") return s.adaptFacebook;
  return s.adaptLinkedin;
}

// PRNG determinista para poder reproducir un plan.
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Planificador de ángulos: asigna a cada hook una estructura distinta, maximizando
 * la diversidad de familias y respetando una cuota de preguntas (≤ 20 %).
 */
export function buildPlan(args: PlanArgs): { slots: PlanSlot[]; diversity: Record<string, number> } {
  const rand = mulberry32(args.seed ?? Date.now());
  const wanted = args.mechanisms.length > 0 ? args.mechanisms : OBJECTIVE_MECHANISMS[args.objective] ?? [];

  // Si el usuario eligió mecanismos, cada slot debe activar al menos uno de ellos
  // (solo se relaja si no hay suficientes estructuras que lo cumplan).
  const pool = args.structures.filter((s) => !args.avoidCodes?.has(s.code));
  const matching = pool.filter((s) => args.mechanisms.some((m) => s.mechanisms.includes(m)));
  const candidates = args.mechanisms.length > 0 && matching.length >= args.count ? matching : pool;

  const scored = candidates
    .map((s) => {
      let score = 0;
      const primary = s.mechanisms[0];
      for (const m of s.mechanisms) if (wanted.includes(m)) score += m === primary ? 4 : 2;
      // Si el usuario pidió una combinación (p. ej. contradicción + humor), premiar estructuras que tienen ambas.
      if (args.mechanisms.length >= 2) {
        const hits = args.mechanisms.filter((m) => s.mechanisms.includes(m)).length;
        if (hits >= 2) score += 4;
      }
      if (s.objective.includes(args.objective)) score += 3;
      for (const t of args.tones) if (s.tones.includes(t)) score += 1.5;
      if (args.industry && (s.industries.includes(args.industry) || s.industries.includes("todas"))) score += 0.5;
      if (args.industry && !s.industries.includes("todas") && !s.industries.includes(args.industry)) score -= 3;
      score += rand() * 2.5; // exploración: evita que siempre salgan las mismas
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  // Round-robin por familia en orden de mejor puntaje.
  const byFamily = new Map<string, typeof scored>();
  for (const item of scored) {
    if (!byFamily.has(item.s.family)) byFamily.set(item.s.family, []);
    byFamily.get(item.s.family)!.push(item);
  }
  const families = [...byFamily.entries()].sort((a, b) => b[1][0].score - a[1][0].score);

  const maxQuestions = Math.max(1, Math.floor(args.count * 0.2));
  let questions = 0;
  const picked: StructureSeed[] = [];
  const minScore = scored.length > 0 ? scored[Math.min(scored.length - 1, Math.floor(scored.length * 0.6))].score : 0;

  let round = 0;
  while (picked.length < args.count && round < 20) {
    let addedThisRound = 0;
    for (const [, list] of families) {
      if (picked.length >= args.count) break;
      const idx = list.findIndex(
        (it) =>
          !picked.includes(it.s) &&
          (!it.s.isQuestion || questions < maxQuestions) &&
          // en la primera vuelta solo familias relevantes; después, cualquiera
          (round > 0 || it.score >= minScore),
      );
      if (idx >= 0) {
        const it = list[idx];
        picked.push(it.s);
        if (it.s.isQuestion) questions++;
        addedThisRound++;
      }
    }
    if (addedThisRound === 0 && round > 0) break;
    round++;
  }

  // Equilibrio: cada mecanismo pedido debe aparecer en al menos ~1/3 de los slots.
  for (const m of args.mechanisms) {
    const target = Math.ceil(picked.length / (args.mechanisms.length + 1));
    let have = picked.filter((s) => s.mechanisms.includes(m)).length;
    if (have >= target) continue;
    const extra = scored.map((x) => x.s).filter((s) => s.mechanisms.includes(m) && !picked.includes(s));
    for (let i = picked.length - 1; i >= 0 && have < target && extra.length > 0; i--) {
      const s = picked[i];
      const others = args.mechanisms.filter((o) => o !== m);
      const removable = !s.mechanisms.includes(m) && others.every((o) => picked.filter((p) => p !== s && p.mechanisms.includes(o)).length >= 1);
      if (removable) {
        picked[i] = extra.shift()!;
        have++;
      }
    }
  }

  const slots = picked.map((s, i) => ({
    slot: i + 1,
    structureCode: s.code,
    structureName: s.name,
    family: s.family,
    formula: s.formula,
    mechanisms: s.mechanisms,
    example: s.example,
    counterExample: s.counterExample,
    platformNote: platformNote(s, args.platform),
  }));

  return {
    slots,
    diversity: {
      estructuras: new Set(slots.map((s) => s.structureCode)).size,
      familias: new Set(slots.map((s) => s.family)).size,
      mecanismosPrimarios: new Set(slots.map((s) => s.mechanisms[0])).size,
      preguntas: questions,
    },
  };
}
