// Carga idempotente de la base de conocimiento inicial. Uso: npm run db:seed
import { sql } from "drizzle-orm";
import { db, schema } from "../src/db";
import { MECHANISMS } from "../src/data/mechanisms";
import { INDUSTRIES } from "../src/data/industries";
import { STRUCTURES } from "../src/data/structures";
import { BRANDS } from "../src/data/brands";
import { CREATORS, OBSERVED_HOOKS } from "../src/data/creators";
import { PROMPTS } from "../src/data/prompts";

async function main() {
  for (const m of MECHANISMS) {
    await db.insert(schema.mechanisms).values(m).onConflictDoUpdate({ target: schema.mechanisms.code, set: m });
  }
  for (const i of INDUSTRIES) {
    await db.insert(schema.industries).values(i).onConflictDoUpdate({ target: schema.industries.code, set: i });
  }
  for (const s of STRUCTURES) {
    await db.insert(schema.structures).values(s).onConflictDoUpdate({ target: schema.structures.code, set: s });
  }
  for (const b of BRANDS) {
    await db.insert(schema.brands).values(b).onConflictDoNothing({ target: schema.brands.slug });
  }
  for (const c of CREATORS) {
    await db.insert(schema.creators).values(c).onConflictDoUpdate({ target: schema.creators.slug, set: c });
  }
  const creatorRows = await db.select({ id: schema.creators.id, slug: schema.creators.slug }).from(schema.creators);
  const bySlug = new Map(creatorRows.map((r) => [r.slug, r.id]));
  const existing = await db.select({ text: schema.observedHooks.text }).from(schema.observedHooks);
  const seen = new Set(existing.map((e) => e.text));
  for (const h of OBSERVED_HOOKS) {
    if (seen.has(h.text)) continue;
    await db.insert(schema.observedHooks).values({
      creatorId: bySlug.get(h.creator) ?? null,
      platform: h.platform,
      publishedAt: h.publishedAt,
      text: h.text,
      url: h.url,
      mechanisms: h.mechanisms,
      structureCode: h.structureCode ?? null,
      construction: h.construction,
      evidence: "O",
      isCounterExample: h.isCounterExample ?? false,
    });
  }
  for (const p of PROMPTS) {
    const rows = await db.execute(sql`select 1 from prompt_versions where key = ${p.key} limit 1`);
    if (rows.rows.length === 0) {
      await db.insert(schema.promptVersions).values({ ...p, version: 1, active: true });
    }
  }
  console.log(
    `Seed OK: ${MECHANISMS.length} mecanismos, ${INDUSTRIES.length} industrias, ${STRUCTURES.length} estructuras, ${BRANDS.length} marcas, ${CREATORS.length} creadores, ${OBSERVED_HOOKS.length} hooks observados, ${PROMPTS.length} prompts.`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
