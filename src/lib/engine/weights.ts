// Modelo heurístico de 100 puntos. Los pesos cambian según el objetivo.
// No es una probabilidad de éxito: es una evaluación editorial estructurada.

export const CRITERIA = [
  { code: "impacto", name: "Impacto inicial" },
  { code: "curiosidad", name: "Curiosidad" },
  { code: "identificacion", name: "Identificación" },
  { code: "claridad", name: "Claridad" },
  { code: "originalidad", name: "Originalidad" },
  { code: "conversacion", name: "Potencial de conversación" },
  { code: "credibilidad", name: "Credibilidad / criterio" },
  { code: "oferta", name: "Problema + conexión con la oferta" },
  { code: "calidad_audiencia", name: "Calidad de audiencia" },
  { code: "oralidad", name: "Oralidad (suena humano)" },
] as const;

export type CriterionCode = (typeof CRITERIA)[number]["code"];
export type Weights = Record<CriterionCode, number>;

const W = (w: Partial<Weights>): Weights => ({
  impacto: 0, curiosidad: 0, identificacion: 0, claridad: 0, originalidad: 0,
  conversacion: 0, credibilidad: 0, oferta: 0, calidad_audiencia: 0, oralidad: 0, ...w,
});

// Cada set suma 100.
export const DEFAULT_WEIGHTS: Record<string, Weights> = {
  alcance: W({ impacto: 20, curiosidad: 20, identificacion: 15, claridad: 10, originalidad: 15, conversacion: 10, credibilidad: 5, oralidad: 5 }),
  comentarios: W({ impacto: 15, curiosidad: 10, identificacion: 15, claridad: 10, originalidad: 10, conversacion: 30, credibilidad: 5, oralidad: 5 }),
  conversacion: W({ impacto: 15, curiosidad: 10, identificacion: 15, claridad: 10, originalidad: 10, conversacion: 25, credibilidad: 5, oferta: 5, oralidad: 5 }),
  posicionamiento: W({ impacto: 15, curiosidad: 10, identificacion: 10, claridad: 15, originalidad: 15, conversacion: 10, credibilidad: 20, oralidad: 5 }),
  autoridad: W({ impacto: 15, curiosidad: 10, identificacion: 10, claridad: 15, originalidad: 10, conversacion: 5, credibilidad: 25, oferta: 5, oralidad: 5 }),
  leads: W({ impacto: 10, curiosidad: 10, identificacion: 10, claridad: 15, originalidad: 10, conversacion: 5, credibilidad: 10, oferta: 20, calidad_audiencia: 10 }),
  ventas: W({ impacto: 10, curiosidad: 5, identificacion: 10, claridad: 15, originalidad: 5, conversacion: 5, credibilidad: 15, oferta: 25, calidad_audiencia: 10 }),
  educacion: W({ impacto: 15, curiosidad: 15, identificacion: 10, claridad: 20, originalidad: 10, conversacion: 5, credibilidad: 15, oralidad: 10 }),
  emocional: W({ impacto: 15, curiosidad: 10, identificacion: 25, claridad: 10, originalidad: 10, conversacion: 15, credibilidad: 5, oralidad: 10 }),
  comunidad: W({ impacto: 10, curiosidad: 10, identificacion: 25, claridad: 10, originalidad: 10, conversacion: 20, credibilidad: 5, oralidad: 10 }),
};

/** Set usados para "mejor para alcance / interacción / conversión". */
export const LENSES = { alcance: "alcance", interaccion: "comentarios", conversion: "leads" } as const;

export function weightsFor(objective: string, brandWeights?: Record<string, Record<string, number>> | null): Weights {
  const base = DEFAULT_WEIGHTS[objective] ?? DEFAULT_WEIGHTS.alcance;
  const override = brandWeights?.[objective];
  return override ? { ...base, ...(override as Partial<Weights>) } : base;
}

export function weightedTotal(scores: Partial<Record<CriterionCode, number>>, weights: Weights): number {
  let total = 0;
  let sum = 0;
  for (const c of CRITERIA) {
    const w = weights[c.code] ?? 0;
    sum += w;
    total += (w * Math.max(0, Math.min(10, scores[c.code] ?? 0))) / 10;
  }
  return sum === 0 ? 0 : Math.round((total * 100) / sum);
}
