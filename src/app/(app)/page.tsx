import { count, desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/db";
import { PageHeader, Stat, Empty } from "@/components/ui";
import { MECHANISM_NAMES } from "@/data/mechanisms";

export default async function Dashboard() {
  const [[hooks], [favs], [creators], [structures], [observed], recent, mechByBrand] = await Promise.all([
    db.select({ n: count() }).from(schema.generatedHooks),
    db.select({ n: count() }).from(schema.generatedHooks).where(eq(schema.generatedHooks.favorite, true)),
    db.select({ n: count() }).from(schema.creators),
    db.select({ n: count() }).from(schema.structures),
    db.select({ n: count() }).from(schema.observedHooks),
    db
      .select({ id: schema.generations.id, input: schema.generations.input, status: schema.generations.status, createdAt: schema.generations.createdAt, brand: schema.brands.name })
      .from(schema.generations)
      .leftJoin(schema.brands, eq(schema.brands.id, schema.generations.brandId))
      .orderBy(desc(schema.generations.id))
      .limit(6),
    // Mecanismos más presentes en favoritos, por marca (señal de preferencia editorial; los resultados reales llegan en "Mis resultados").
    db.execute<{ brand: string; mech: string; n: number }>(sql`
      select b.name as brand, m.mech, count(*)::int as n
      from generated_hooks h
      join generations g on g.id = h.generation_id
      join brands b on b.id = g.brand_id
      cross join lateral jsonb_array_elements_text(h.mechanisms) as m(mech)
      where h.favorite = true
      group by b.name, m.mech
      order by b.name, n desc`),
  ]);
  const grouped = new Map<string, { mech: string; n: number }[]>();
  for (const r of mechByBrand.rows) {
    if (!grouped.has(r.brand)) grouped.set(r.brand, []);
    if (grouped.get(r.brand)!.length < 3) grouped.get(r.brand)!.push({ mech: r.mech, n: r.n });
  }
  const observedRecent = await db
    .select({ text: schema.observedHooks.text, platform: schema.observedHooks.platform, date: schema.observedHooks.publishedAt, creator: schema.creators.name })
    .from(schema.observedHooks)
    .leftJoin(schema.creators, eq(schema.creators.id, schema.observedHooks.creatorId))
    .where(eq(schema.observedHooks.isCounterExample, false))
    .orderBy(desc(schema.observedHooks.publishedAt))
    .limit(4);

  return (
    <>
      <PageHeader eyebrow="Dashboard" title="Laboratorio de atención">
        Entender, diseñar y medir la atención. Empieza por <Link className="text-olive underline underline-offset-4" href="/generar">generar hooks</Link>.
      </PageHeader>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
        <Stat label="Hooks generados" value={hooks.n} />
        <Stat label="Favoritos" value={favs.n} />
        <Stat label="Creadores" value={creators.n} hint="en la base de investigación" />
        <Stat label="Estructuras" value={structures.n} hint="15 familias" />
        <Stat label="Hooks observados" value={observed.n} hint="con fuente" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="serif text-xl mb-3">Últimas generaciones</h2>
          {recent.length === 0 ? (
            <Empty>Aún no hay generaciones.</Empty>
          ) : (
            <ul className="space-y-2">
              {recent.map((g) => (
                <li key={g.id}>
                  <Link href={`/generaciones/${g.id}`} className="card block p-4 hover:border-olive transition-colors">
                    <p className="text-xs text-muted">#{g.id} · {g.brand} · {g.status}</p>
                    <p className="text-sm mt-1 line-clamp-2">{(g.input as { topic: string }).topic}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="space-y-6">
          <div>
            <h2 className="serif text-xl mb-1">Mecanismos preferidos por marca</h2>
            <p className="text-xs text-muted mb-3">Según tus favoritos. Es preferencia editorial, no rendimiento: el rendimiento real se medirá en Mis resultados.</p>
            {grouped.size === 0 ? (
              <Empty>Marca hooks como favoritos para ver patrones.</Empty>
            ) : (
              <div className="space-y-2">
                {[...grouped.entries()].map(([b, ms]) => (
                  <div key={b} className="card p-4">
                    <p className="font-semibold text-sm">{b}</p>
                    <p className="text-sm text-ink-2 mt-1">{ms.map((m) => `${MECHANISM_NAMES[m.mech] ?? m.mech} (${m.n})`).join(" · ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="serif text-xl mb-3">Últimos hooks investigados</h2>
            <ul className="space-y-2">
              {observedRecent.map((o, i) => (
                <li key={i} className="card p-4 text-sm">
                  <p className="text-xs text-muted">{o.creator} · {o.platform} · {o.date}</p>
                  <p className="mt-1">“{o.text}”</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
