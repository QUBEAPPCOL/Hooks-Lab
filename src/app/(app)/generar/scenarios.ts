import type { Preset } from "./GeneratorForm";

// Escenarios obligatorios de prueba (sección 18 del encargo).
export const SCENARIOS: Record<string, Preset & { brandSlug: string; label: string }> = {
  A: {
    label: "A · Marca personal",
    brandSlug: "andres-betancourt",
    platform: "linkedin",
    topic: "LinkedIn se está convirtiendo en Instagram, pero algunas personas siguen consiguiendo clientes.",
    segments: ["CEOs", "Founders", "Empresarios"],
    objective: "leads",
    mechanisms: ["contradiccion", "humor"],
    tones: ["provocador"],
    format: "solo_hooks",
    count: 10,
  },
  B: {
    label: "B · Serena",
    brandSlug: "serena",
    platform: "linkedin",
    topic: "Actividades sencillas con los hijos que crean recuerdos para toda la vida.",
    segments: ["Madres profesionales"],
    objective: "emocional",
    mechanisms: ["controversia", "identificacion"],
    tones: ["emocional"],
    format: "solo_hooks",
    count: 10,
  },
  C: {
    label: "C · QUBE",
    brandSlug: "qube",
    platform: "linkedin",
    topic: "Las empresas no tienen problemas de talento; tienen problemas de liderazgo.",
    segments: ["CEOs", "Recursos Humanos"],
    objective: "autoridad",
    mechanisms: ["contradiccion", "controversia"],
    tones: ["intelectual", "provocador"],
    format: "solo_hooks",
    count: 10,
  },
};
