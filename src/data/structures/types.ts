export type StructureSeed = {
  code: string;
  family: string;
  name: string;
  formula: string;
  mechanisms: string[];
  objective: string[];
  tones: string[];
  industries: string[];
  difficulty: 1 | 2 | 3;
  example: string;
  counterExample: string;
  adaptLinkedin: string;
  adaptInstagram: string;
  adaptTiktok: string;
  adaptFacebook: string;
  reference: string;
  isQuestion: boolean;
};

type FamilyDefaults = {
  family: string;
  li: string;
  ig: string;
  tt: string;
  fb: string;
};

type Compact = {
  c: string; // código
  n: string; // nombre
  f: string; // fórmula
  m: string[]; // mecanismos
  o: string[]; // objetivos
  t: string[]; // tonos
  d: 1 | 2 | 3;
  ex: string; // ejemplo
  cx: string; // contraejemplo
  i?: string[]; // industrias (por defecto todas)
  li?: string;
  ig?: string;
  tt?: string;
  fb?: string;
  ref?: string;
  q?: boolean; // ¿la apertura es una pregunta?
};

export function family(defaults: FamilyDefaults, items: Compact[]): StructureSeed[] {
  return items.map((s) => ({
    code: s.c,
    family: defaults.family,
    name: s.n,
    formula: s.f,
    mechanisms: s.m,
    objective: s.o,
    tones: s.t,
    industries: s.i ?? ["todas"],
    difficulty: s.d,
    example: s.ex,
    counterExample: s.cx,
    adaptLinkedin: s.li ?? defaults.li,
    adaptInstagram: s.ig ?? defaults.ig,
    adaptTiktok: s.tt ?? defaults.tt,
    adaptFacebook: s.fb ?? defaults.fb,
    reference: s.ref ?? "",
    isQuestion: s.q ?? false,
  }));
}
