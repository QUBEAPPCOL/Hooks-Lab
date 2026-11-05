import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("otra"), // marca_personal | empresa | qube | serena | otra
  description: text("description").notNull().default(""),
  audience: text("audience").notNull().default(""),
  personality: text("personality").notNull().default(""),
  tone: text("tone").notNull().default(""),
  products: text("products").notNull().default(""),
  services: text("services").notNull().default(""),
  valueProp: text("value_prop").notNull().default(""),
  allowedWords: jsonb("allowed_words").$type<string[]>().notNull().default([]),
  bannedWords: jsonb("banned_words").$type<string[]>().notNull().default([]),
  goals: text("goals").notNull().default(""),
  // techo de coloquialidad: sobremesa > cafe > cercano > formal
  maxRegister: text("max_register").notNull().default("cafe"),
  spanishVariant: text("spanish_variant").notNull().default("colombiano"),
  weights: jsonb("weights").$type<Record<string, Record<string, number>>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mechanisms = pgTable("mechanisms", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  foundation: text("foundation").notNull(),
  source: text("source").notNull(),
  confidence: text("confidence").notNull(), // alta | media | baja
  caveat: text("caveat").notNull().default(""),
});

export const industries = pgTable("industries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  lexicon: jsonb("lexicon").$type<string[]>().notNull(),
  tensions: jsonb("tensions").$type<string[]>().notNull(),
  taboos: jsonb("taboos").$type<string[]>().notNull(),
});

export const structures = pgTable("structures", {
  code: text("code").primaryKey(),
  family: text("family").notNull(),
  name: text("name").notNull(),
  formula: text("formula").notNull(),
  mechanisms: jsonb("mechanisms").$type<string[]>().notNull(),
  objective: jsonb("objective").$type<string[]>().notNull(),
  tones: jsonb("tones").$type<string[]>().notNull(),
  industries: jsonb("industries").$type<string[]>().notNull(), // ["todas"] o códigos
  difficulty: integer("difficulty").notNull(), // 1-3
  example: text("example").notNull(),
  counterExample: text("counter_example").notNull(),
  adaptLinkedin: text("adapt_linkedin").notNull(),
  adaptInstagram: text("adapt_instagram").notNull(),
  adaptTiktok: text("adapt_tiktok").notNull(),
  adaptFacebook: text("adapt_facebook").notNull(),
  reference: text("reference").notNull().default(""),
  isQuestion: boolean("is_question").notNull().default(false),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  handle: text("handle").notNull().default(""),
  country: text("country").notNull().default(""),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
  category: text("category").notNull().default(""),
  style: text("style").notNull().default(""),
  mechanismsObserved: jsonb("mechanisms_observed").$type<string[]>().notNull().default([]),
  notes: text("notes").notNull().default(""),
  showName: boolean("show_name").notNull().default(true), // false = solo mecanismos, sin nombre en UI
  status: text("status").notNull().default("perfil"), // perfil | propuesto | analizado
  confidence: text("confidence").notNull().default("media"),
  sources: jsonb("sources").$type<{ label: string; url: string }[]>().notNull().default([]),
});

export const observedHooks = pgTable("observed_hooks", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => creators.id),
  platform: text("platform").notNull(),
  publishedAt: text("published_at").notNull().default(""),
  text: text("text").notNull(),
  url: text("url").notNull().default(""),
  mechanisms: jsonb("mechanisms").$type<string[]>().notNull().default([]),
  structureCode: text("structure_code"),
  construction: text("construction").notNull().default(""),
  evidence: text("evidence").notNull().default("O"), // O | H | C | A
  confidence: text("confidence").notNull().default("media"),
  isCounterExample: boolean("is_counter_example").notNull().default(false),
});

export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    version: integer("version").notNull(),
    system: text("system").notNull(),
    template: text("template").notNull(),
    effort: text("effort").notNull().default("high"),
    active: boolean("active").notNull().default(false),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("prompt_key_version").on(t.key, t.version)],
);

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => brands.id),
  input: jsonb("input").$type<Record<string, unknown>>().notNull(),
  plan: jsonb("plan").$type<unknown>(),
  promptVersions: jsonb("prompt_versions").$type<Record<string, number>>(),
  provider: text("provider"),
  model: text("model"),
  status: text("status").notNull().default("pendiente"), // pendiente | ok | error
  error: text("error"),
  ranking: jsonb("ranking").$type<unknown>(),
  diversity: jsonb("diversity").$type<unknown>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedHooks = pgTable(
  "generated_hooks",
  {
    id: serial("id").primaryKey(),
    generationId: integer("generation_id")
      .references(() => generations.id, { onDelete: "cascade" })
      .notNull(),
    idx: integer("idx").notNull(),
    text: text("text").notNull(),
    onScreenText: text("on_screen_text"),
    visualAction: text("visual_action"),
    structureCode: text("structure_code"),
    structureName: text("structure_name").notNull().default(""),
    mechanisms: jsonb("mechanisms").$type<string[]>().notNull().default([]),
    tone: text("tone").notNull().default(""),
    why: text("why").notNull().default(""),
    audience: text("audience").notNull().default(""),
    weakness: text("weakness").notNull().default(""),
    platformAdaptation: text("platform_adaptation").notNull().default(""),
    scores: jsonb("scores").$type<Record<string, number>>(),
    totals: jsonb("totals").$type<Record<string, number>>(),
    total: real("total"),
    flags: jsonb("flags").$type<string[]>().notNull().default([]),
    judgeNote: text("judge_note").notNull().default(""),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("hooks_generation").on(t.generationId)],
);

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  hookId: integer("hook_id")
    .references(() => generatedHooks.id, { onDelete: "cascade" })
    .notNull(),
  format: text("format").notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull(),
  slides: jsonb("slides").$type<string[]>(),
  promiseCheck: text("promise_check").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const llmCalls = pgTable("llm_calls", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  purpose: text("purpose").notNull(),
  promptKey: text("prompt_key"),
  promptVersion: integer("prompt_version"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  latencyMs: integer("latency_ms"),
  ok: boolean("ok").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
