import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { HookCard, type HookView } from "@/components/HookCard";
import { PageHeader, Tag } from "@/components/ui";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import { OBJECTIVES, PLATFORMS } from "@/lib/engine/options";

type Ranking = {
  top3: { hookId: number; total: number }[];
  bestFor: { alcance: number | null; interaccion: number | null; conversion: number | null };
  criteria: { code: string; name: string; weight: number }[];
};

export default async function GenerationPage({ params }: PageProps<"/generaciones/[id]">) {
  const { id } = await params;
  const [gen] = await db.select().from(schema.generations).where(eq(schema.generations.id, Number(id)));
  if (!gen) notFound();
  const [brand] = gen.brandId ? await db.select().from(schema.brands).where(eq(schema.brands.id, gen.brandId)) : [];
  const hooks = (await db
    .select()
    .from(schema.generatedHooks)
    .where(eq(schema.generatedHooks.generationId, gen.id))
    .orderBy(asc(schema.generatedHooks.idx))) as HookView[];
  const input = gen.input as { topic: string; platform: string; objective: string; mechanisms: string[]; register: string; variant: string };
  const ranking = gen.ranking as Ranking | null;
  const diversity = gen.diversity as Record<string, number> | null;
  const byId = new Map(hooks.map((h) => [h.id, h]));
  const lensLabel: Record<string, string> = { alcance: "Mejor para alcance", interaccion: "Mejor para interacción", conversion: "Mejor para conversión" };
  const badgeFor = (hid: number) =>
    ranking
      ? Object.entries(ranking.bestFor)
          .filter(([, v]) => v === hid)
          .map(([k]) => lensLabel[k])
          .join(" · ")
      : "";

  return (
    <>
      <PageHeader eyebrow={`Generación #${gen.id} · ${brand?.name ?? ""}`} title="Resultados">
        <span className="block">{input.topic}</span>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <Tag>{PLATFORMS.find((p) => p.code === input.platform)?.name}</Tag>
        <Tag>Objetivo: {OBJECTIVES.find((o) => o.code === input.objective)?.name}</Tag>
        <Tag>
          Mecanismos: {input.mechanisms.length ? input.mechanisms.map((m) => MECHANISM_NAMES[m] ?? m).join(" + ") : "sorpréndeme"}
        </Tag>
        <Tag>Registro: {input.register} · {input.variant}</Tag>
        {gen.model && <Tag>{gen.provider} · {gen.model}</Tag>}
        {gen.promptVersions && (
          <Tag>
            Prompts: {Object.entries(gen.promptVersions).map(([k, v]) => `${k} v${v}`).join(", ")}
          </Tag>
        )}
        {diversity && (
          <Tag tone="rose">
            Diversidad: {diversity.estructuras} estructuras · {diversity.familias} familias · {diversity.mecanismosPrimarios} mecanismos primarios · {diversity.preguntas} preguntas
          </Tag>
        )}
      </div>

      {gen.status === "error" && (
        <div className="card p-6 border-danger mb-6">
          <p className="font-semibold text-danger">La generación falló</p>
          <p className="text-sm mt-1">{gen.error}</p>
        </div>
      )}

      {ranking && ranking.top3.length > 0 && (
        <section className="mb-10">
          <h2 className="serif text-2xl mb-1">Top 3</h2>
          <p className="text-xs text-muted mb-4">
            Ranking por evaluación heurística ponderada según el objetivo. No es una predicción de viralidad: es el criterio de un editor estructurado en pesos. Pesos:{" "}
            {ranking.criteria.filter((c) => c.weight > 0).map((c) => `${c.name} ${c.weight}`).join(" · ")}.
          </p>
          <div className="grid lg:grid-cols-3 gap-4">
            {ranking.top3.map((t, i) => {
              const h = byId.get(t.hookId);
              if (!h) return null;
              return (
                <div key={t.hookId} className="card p-5 flex flex-col">
                  <div className="flex items-baseline justify-between">
                    <span className="serif text-3xl text-olive">{i + 1}</span>
                    <span className="text-xs text-muted"><span className="serif text-lg text-ink">{Math.round(h.total ?? 0)}</span>/100</span>
                  </div>
                  <p className="mt-2 leading-relaxed whitespace-pre-line">{h.text}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {h.mechanisms.map((m) => (
                      <span key={m} className="rounded-full bg-olive-soft text-xs px-2 py-0.5">{MECHANISM_NAMES[m] ?? m}</span>
                    ))}
                  </div>
                  <dl className="mt-3 text-sm space-y-2 text-ink-2">
                    <div><dt className="label mb-0">Potencial</dt><dd>{h.why}</dd></div>
                    <div><dt className="label mb-0">Atrae a</dt><dd>{h.audience}</dd></div>
                  </dl>
                  {badgeFor(h.id) && <p className="mt-auto pt-3 text-xs font-semibold text-olive">{badgeFor(h.id)}</p>}
                </div>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
            {(["alcance", "interaccion", "conversion"] as const).map((k) => {
              const h = ranking.bestFor[k] ? byId.get(ranking.bestFor[k]!) : null;
              return (
                <div key={k} className="rounded-xl bg-surface-2 p-4">
                  <p className="label">{lensLabel[k]}</p>
                  <p>{h ? `#${h.idx} · ${h.text.slice(0, 110)}${h.text.length > 110 ? "…" : ""}` : "—"}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="serif text-2xl">Todas las alternativas ({hooks.length})</h2>
        {hooks.map((h) => (
          <HookCard key={h.id} hook={h} badge={badgeFor(h.id) || undefined} />
        ))}
      </section>
    </>
  );
}
