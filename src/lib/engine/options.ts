// Catálogos del formulario. Mantener en un solo lugar para UI y motor.

export const PLATFORMS = [
  { code: "linkedin", name: "LinkedIn", kind: "texto" },
  { code: "instagram", name: "Instagram", kind: "mixto" },
  { code: "tiktok", name: "TikTok", kind: "video" },
  { code: "facebook", name: "Facebook", kind: "texto" },
  { code: "youtube_shorts", name: "YouTube Shorts", kind: "video" },
  { code: "newsletter", name: "Newsletter", kind: "texto" },
  { code: "blog", name: "Blog", kind: "texto" },
  { code: "otra", name: "Otra", kind: "texto" },
] as const;

export const OBJECTIVES = [
  { code: "alcance", name: "Alcance y viralidad" },
  { code: "comentarios", name: "Generar comentarios" },
  { code: "conversacion", name: "Generar conversación" },
  { code: "posicionamiento", name: "Posicionamiento" },
  { code: "autoridad", name: "Autoridad" },
  { code: "leads", name: "Leads" },
  { code: "ventas", name: "Ventas" },
  { code: "educacion", name: "Educación" },
  { code: "emocional", name: "Identificación emocional" },
  { code: "comunidad", name: "Comunidad" },
] as const;

export const SELECTABLE_MECHANISMS = [
  "curiosidad", "contradiccion", "identificacion", "humor", "satira", "ironia", "controversia",
  "advertencia", "confesion", "aspiracion", "revelacion", "autoridad", "storytelling", "comparacion", "intriga",
  "miedo_perder", "especificidad", "prueba_social", "valor_practico", "pertenencia", "sorpresa",
];

export const TONES = [
  "provocador", "irreverente", "sarcastico", "divertido", "emocional", "profundo", "intelectual", "experto",
  "conversacional", "polemico", "confrontacional", "inspirador", "directo", "narrativo", "educativo", "comercial",
];

export const TONE_NAMES: Record<string, string> = {
  provocador: "Provocador", irreverente: "Irreverente", sarcastico: "Sarcástico", divertido: "Divertido",
  emocional: "Emocional", profundo: "Profundo", intelectual: "Intelectual", experto: "Experto",
  conversacional: "Conversacional", polemico: "Polémico", confrontacional: "Confrontacional", inspirador: "Inspirador",
  directo: "Directo", narrativo: "Narrativo", educativo: "Educativo", comercial: "Comercial",
};

export const FORMATS = [
  { code: "post", name: "Post escrito" },
  { code: "carrusel", name: "Carrusel" },
  { code: "infografia", name: "Infografía" },
  { code: "video_corto", name: "Video corto" },
  { code: "guion_tiktok", name: "Guion de TikTok" },
  { code: "reel", name: "Reel" },
  { code: "articulo", name: "Artículo" },
  { code: "newsletter", name: "Newsletter" },
  { code: "solo_hooks", name: "Solo hooks" },
] as const;

export const VIDEO_FORMATS = new Set(["video_corto", "guion_tiktok", "reel"]);

export const AUDIENCES = [
  "CEOs", "Founders", "Directivos", "Empresarios", "Profesionales", "Madres profesionales", "Mujeres emprendedoras",
  "Recursos Humanos", "Marketing", "Ventas", "Consultores", "Público general",
];

export const COUNTS = [5, 10, 15, 20, 30, 50];

export const REGISTERS = [
  { code: "sobremesa", name: "Sobremesa", rule: "Muy coloquial: frases de 3 a 8 palabras, muletillas orales con función, tono de amiga o amigo que cuenta algo en la mesa." },
  { code: "cafe", name: "Café", rule: "Conversación de café entre profesionales: natural, directo, con opinión; tuteo; cero jerga corporativa; se puede decir 'la verdad es que', 'ojo con esto'." },
  { code: "cercano", name: "Profesional cercano", rule: "Profesional pero humano: frases claras, vocabulario de negocio sin jerga de PowerPoint; puede usar 'usted' si la marca lo pide." },
  { code: "formal", name: "Formal", rule: "Formal y sobrio, sin rigidez: frases completas, sin coloquialismos, sin lenguaje de folleto." },
] as const;

export const REGISTER_ORDER = ["formal", "cercano", "cafe", "sobremesa"];

export const VARIANTS = [
  { code: "colombiano", name: "Colombiano", rule: "Español de Colombia: tuteo en redes, expresiones como 'parce' solo si el registro es sobremesa; 'ahorita', 'de una', 'pilas' con moderación; 'sin un peso'." },
  { code: "mexicano", name: "Mexicano", rule: "Español de México: 'ahorita', 'neta', 'chamba' con moderación según registro; 'sin un peso'." },
  { code: "argentino", name: "Argentino", rule: "Español rioplatense: voseo ('vos tenés', 'mirá'), 'laburo' según registro; 'sin un mango'." },
  { code: "neutro", name: "Neutro", rule: "Español latinoamericano neutro: tuteo, sin regionalismos marcados." },
] as const;

export const CREATIVE_REFERENCES = [
  "beth-cast", "el-borrego", "chabe", "juan-felipe-londono", "juanda", "ami-rodriguez", "aida-victoria-merlano",
  "felipe-saruma", "carlos-munoz", "vilma-nunez", "euge-oller", "isra-bravo", "jurgen-klaric",
];

export const BANNED_CORPORATE = [
  "en el dinámico mundo de hoy", "en el mundo actual", "es fundamental", "cabe destacar", "en este sentido",
  "potenciar", "apalancar", "sinergia", "sinergias", "transformación digital", "líder de pensamiento",
  "hoy quiero compartirles", "hoy quiero compartir", "¿sabías que", "en la era de", "no es ningún secreto",
  "desbloquea", "desbloquear", "llevar al siguiente nivel", "game changer", "holístico", "disruptivo",
  "soluciones integrales", "te comparto", "sin más preámbulos",
];
