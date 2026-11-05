// Prueba de la tubería completa con el proveedor de prueba. Uso: npm run test:pipeline
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { db, schema } from "../src/db";
import { runGeneration } from "../src/lib/engine/generate";
import { lintHook } from "../src/lib/engine/lint";
import { findNearDuplicates } from "../src/lib/engine/similarity";
import { DEFAULT_WEIGHTS } from "../src/lib/engine/weights";

async function main() {
  // Pesos: cada set suma 100.
  for (const [k, w] of Object.entries(DEFAULT_WEIGHTS)) {
    assert.equal(Object.values(w).reduce((a, b) => a + b, 0), 100, `pesos de ${k}`);
  }
  // Lint: lenguaje corporativo y cifras inventadas.
  const l = lintHook({ text: "En el dinámico mundo de hoy el 87% falla", brief: "tema sin cifras", bannedWords: [], platform: "linkedin", isVideo: false });
  assert.ok(l.flags.some((f) => f.includes("corporativo")));
  assert.ok(l.flags.some((f) => f.includes("87%")));
  const ok = lintHook({ text: "Tu equipo no está desmotivado. Está cansado.", brief: "x", bannedWords: [], platform: "linkedin", isVideo: false });
  assert.equal(ok.flags.length, 0);
  // Cifra presente en el brief: no se marca.
  assert.equal(lintHook({ text: "El 40% renunció", brief: "según X (2025), el 40% renunció", bannedWords: [], platform: "linkedin", isVideo: false }).flags.length, 0);
  // Deduplicación.
  const d = findNearDuplicates(["el problema no es el talento es el liderazgo", "el problema no es el talento, es el liderazgo de verdad", "hay dos tipos de jefes"]);
  assert.deepEqual(d, [-1, 0, -1]);

  // Tubería completa.
  const [brand] = await db.select().from(schema.brands).where(eq(schema.brands.slug, "qube"));
  const id = await runGeneration({
    brandId: brand.id, platform: "linkedin", topic: "Las empresas no tienen problemas de talento; tienen problemas de liderazgo.",
    audience: { segments: ["CEOs"] }, objective: "autoridad", mechanisms: ["contradiccion", "controversia"], tones: ["intelectual"], format: "solo_hooks", count: 12,
  });
  const [gen] = await db.select().from(schema.generations).where(eq(schema.generations.id, id));
  assert.equal(gen.status, "ok", gen.error ?? "");
  const hooks = await db.select().from(schema.generatedHooks).where(eq(schema.generatedHooks.generationId, id));
  assert.equal(hooks.length, 12);
  const codes = new Set(hooks.map((h) => h.structureCode));
  assert.equal(codes.size, 12, "estructuras distintas");
  const corp = hooks.find((h) => h.text.includes("dinámico"))!;
  assert.ok(corp.flags.length >= 2, "el hook corporativo con cifra inventada queda marcado");
  const ranking = gen.ranking as { top3: { hookId: number }[]; bestFor: Record<string, number> };
  assert.equal(ranking.top3.length, 3);
  assert.ok(!ranking.top3.some((t) => t.hookId === corp.id), "el hook penalizado no entra al top 3");
  const totals = ranking.top3.map((t) => hooks.find((h) => h.id === t.hookId)!.total!);
  assert.ok(totals[0] >= totals[1] && totals[1] >= totals[2], "top 3 ordenado");
  console.log("diversidad", gen.diversity, "top3", totals);

  // Limpieza: la prueba no deja datos en la base.
  await db.delete(schema.generations).where(eq(schema.generations.id, id));
  await db.delete(schema.llmCalls).where(eq(schema.llmCalls.provider, "mock"));
  console.log("OK: tubería verificada");
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
