import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { generateJSON, LLMError, providerChain } from "@/lib/llm";
import type { StructureSeed } from "@/data/structures/types";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import { buildPlan, type PlanSlot } from "./plan";
import { getActivePrompt, render } from "./prompts";
import { brandBlock, briefBlock, effectiveRegister, platformBlock, referencesBlock, registerBlock } from "./context";
import { GenerationInputSchema, type GenerationInput } from "./input";
import { lintHook } from "./lint";
import { findNearDuplicates } from "./similarity";
import { CRITERIA, LENSES, weightedTotal, weightsFor, type CriterionCode } from "./weights";
import { OBJECTIVES, PLATFORMS, VIDEO_FORMATS } from "./options";

const BATCH = 10;

const GeneratedSchema = z.object({
  hooks: z.array(
    z.object({
      slot: z.number(),
      text: z.string(),
      onScreenText: z.string(),
      visualAction: z.string(),
      structureCode: z.string(),
      mechanisms: z.array(z.string()),
      tone: z.string(),
      why: z.string(),
      audience: z.string(),
      weakness: z.string(),
      platformAdaptation: z.string(),
    }),
  ),
});

const ScoreSchema = z.object({
  impacto: z.number(),
  curiosidad: z.number(),
  identificacion: z.number(),
  claridad: z.number(),
  originalidad: z.number(),
  conversacion: z.number(),
  credibilidad: z.number(),
  oferta: z.number(),
  calidad_audiencia: z.number(),
  oralidad: z.number(),
});

const JudgeSchema = z.object({
  evaluations: z.array(z.object({ id: z.number(), scores: ScoreSchema, flags: z.array(z.string()), note: z.string() })),
});

function planText(slots: PlanSlot[]): string {
  return slots
    .map(
      (s) =>
        `Slot ${s.slot} · ${s.structureCode} — ${s.structureName} (${s.family})\n` +
        `  Fórmula: ${s.formula}\n` +
        `  Mecanismos: ${s.mechanisms.map((m) => MECHANISM_NAMES[m] ?? m).join(" + ")}\n` +
        `  Ejemplo de la estructura (no copiar, solo para entender el movimiento): ${s.example}\n` +
        `  Contraejemplo (lo que NO debe parecer): ${s.counterExample}\n` +
        `  Nota de plataforma: ${s.platformNote}`,
    )
    .join("\n\n");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export type RankingEntry = { hookId: number; reason: string; lens: string; total: number };

export async function runGeneration(raw: unknown): Promise<number> {
  const input: GenerationInput = GenerationInputSchema.parse(raw);
  const [brand] = await db.select().from(schema.brands).where(eq(schema.brands.id, input.brandId));
  if (!brand) throw new Error("La marca no existe.");

  if (!providerChain().some((p) => p.available())) {
    throw new LLMError("No hay ningún proveedor de IA configurado. Define ANTHROPIC_API_KEY u OPENAI_API_KEY en el servidor.", false);
  }

  const register = effectiveRegister(input.register, brand.maxRegister);
  const variant = input.variant || brand.spanishVariant;
  const isVideo = VIDEO_FORMATS.has(input.format) || PLATFORMS.find((p) => p.code === input.platform)?.kind === "video";

  const structures = (await db.select().from(schema.structures)) as unknown as StructureSeed[];
  const { slots, diversity } = buildPlan({
    structures,
    count: input.count,
    mechanisms: input.mechanisms,
    objective: input.objective,
    tones: input.tones,
    industry: input.industry,
    platform: input.platform,
  });

  const genPrompt = await getActivePrompt("generate");
  const judgePrompt = await getActivePrompt("judge");

  const [generation] = await db
    .insert(schema.generations)
    .values({
      brandId: brand.id,
      input: { ...input, register, variant },
      plan: slots,
      diversity,
      promptVersions: { generate: genPrompt.version, judge: judgePrompt.version },
      status: "pendiente",
    })
    .returning();

  try {
    const shared = {
      brand: brandBlock(brand),
      brief: briefBlock(input),
      register_rules: registerBlock(register, variant),
      platform_rules: platformBlock(input),
      platform: PLATFORMS.find((p) => p.code === input.platform)?.name ?? input.platform,
      references: await referencesBlock(input.references),
    };

    // 1) Generación por lotes en paralelo (cada lote recibe slots distintos).
    const batches = await Promise.all(
      chunk(slots, BATCH).map((part) =>
        generateJSON({
          system: genPrompt.system,
          user: render(genPrompt.template, { ...shared, plan: planText(part) }),
          schema: GeneratedSchema,
          effort: genPrompt.effort as "high",
          maxTokens: 32000,
          purpose: "generate",
          promptKey: genPrompt.key,
          promptVersion: genPrompt.version,
        }),
      ),
    );
    const meta = batches[0];
    const generated = batches.flatMap((b) => b.data.hooks);
    const slotByNumber = new Map(slots.map((s) => [s.slot, s]));

    // 2) Controles deterministas + deduplicación.
    const briefText = `${input.topic}\n${input.extraContext}`;
    const lints = generated.map((h) =>
      lintHook({ text: h.text, brief: briefText, bannedWords: brand.bannedWords, platform: input.platform, isVideo }),
    );
    const dupOf = findNearDuplicates(generated.map((h) => h.text));

    // 3) Juez (heurístico) por lotes.
    const objectiveName = OBJECTIVES.find((o) => o.code === input.objective)?.name ?? input.objective;
    const judged = await Promise.all(
      chunk(
        generated.map((h, i) => ({ id: i, text: h.text, onScreen: h.onScreenText })),
        15,
      ).map((part) =>
        generateJSON({
          system: judgePrompt.system,
          user: render(judgePrompt.template, {
            brand: shared.brand,
            brief: shared.brief,
            objective: objectiveName,
            hooks: part
              .map((h) => `[id ${h.id}] ${h.text}${h.onScreen ? `\n  (texto en pantalla: ${h.onScreen})` : ""}`)
              .join("\n\n"),
          }),
          schema: JudgeSchema,
          effort: judgePrompt.effort as "medium",
          maxTokens: 16000,
          purpose: "judge",
          promptKey: judgePrompt.key,
          promptVersion: judgePrompt.version,
        }),
      ),
    );
    const evalById = new Map(judged.flatMap((j) => j.data.evaluations).map((e) => [e.id, e]));

    // 4) Totales por objetivo y por lente.
    const objWeights = weightsFor(input.objective, brand.weights);
    const rows = generated.map((h, i) => {
      const ev = evalById.get(i);
      const scores = (ev?.scores ?? {}) as Record<CriterionCode, number>;
      const penalty = lints[i].penalty + (dupOf[i] >= 0 ? 15 : 0);
      const flags = [
        ...lints[i].flags,
        ...(ev?.flags ?? []),
        ...(dupOf[i] >= 0 ? [`Muy parecido al hook #${dupOf[i] + 1}`] : []),
      ];
      const totals = {
        objetivo: Math.max(0, weightedTotal(scores, objWeights) - penalty),
        alcance: Math.max(0, weightedTotal(scores, weightsFor(LENSES.alcance)) - penalty),
        interaccion: Math.max(0, weightedTotal(scores, weightsFor(LENSES.interaccion)) - penalty),
        conversion: Math.max(0, weightedTotal(scores, weightsFor(LENSES.conversion)) - penalty),
      };
      const slot = slotByNumber.get(h.slot);
      return {
        generationId: generation.id,
        idx: i + 1,
        text: h.text.trim(),
        onScreenText: h.onScreenText || null,
        visualAction: h.visualAction || null,
        structureCode: slot?.structureCode ?? h.structureCode,
        structureName: slot?.structureName ?? "",
        mechanisms: h.mechanisms,
        tone: h.tone,
        why: h.why,
        audience: h.audience,
        weakness: h.weakness,
        platformAdaptation: h.platformAdaptation,
        scores: ev ? scores : null,
        totals,
        total: totals.objetivo,
        flags,
        judgeNote: ev?.note ?? "",
      };
    });

    const inserted = await db.insert(schema.generatedHooks).values(rows).returning();

    // 5) Ranking: top 3 por objetivo + mejor por lente.
    const eligible = inserted.filter((h) => !h.flags.some((f) => f.startsWith("Muy parecido")));
    const byObjective = [...eligible].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    const best = (lens: "alcance" | "interaccion" | "conversion") =>
      [...eligible].sort((a, b) => (b.totals?.[lens] ?? 0) - (a.totals?.[lens] ?? 0))[0];
    const ranking = {
      top3: byObjective.slice(0, 3).map((h) => ({ hookId: h.id, total: h.total })),
      bestFor: {
        alcance: best("alcance")?.id ?? null,
        interaccion: best("interaccion")?.id ?? null,
        conversion: best("conversion")?.id ?? null,
      },
      criteria: CRITERIA.map((c) => ({ code: c.code, name: c.name, weight: objWeights[c.code] })),
    };

    await db
      .update(schema.generations)
      .set({ status: "ok", ranking, provider: meta.provider, model: meta.model })
      .where(eq(schema.generations.id, generation.id));
  } catch (err) {
    await db
      .update(schema.generations)
      .set({ status: "error", error: err instanceof Error ? err.message : String(err) })
      .where(eq(schema.generations.id, generation.id));
  }
  return generation.id;
}
