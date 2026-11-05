import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { MechBadge, PageHeader, Tag } from "@/components/ui";

export default async function CreatorsPage() {
  const [creators, hooks] = await Promise.all([
    db.select().from(schema.creators).orderBy(asc(schema.creators.id)),
    db.select().from(schema.observedHooks).where(eq(schema.observedHooks.isCounterExample, false)),
  ]);
  const statusLabel: Record<string, string> = { perfil: "Solo perfil", propuesto: "Propuesto", analizado: "Hooks analizados" };
  return (
    <>
      <PageHeader eyebrow="Base de investigación" title="Creadores">
        Solo datos con fuente. Los creadores de entretenimiento publican sobre todo en video: su análisis de hooks queda pendiente de transcripciones (Investigador, Fase 4).
      </PageHeader>
      <div className="grid md:grid-cols-2 gap-3">
        {creators.map((c) => {
          const n = hooks.filter((h) => h.creatorId === c.id).length;
          return (
            <div key={c.id} className="card p-5">
              <div className="flex justify-between gap-2">
                <h3 className="font-semibold">{c.name}</h3>
                <Tag tone={c.status === "analizado" ? "neutral" : "rose"}>{statusLabel[c.status]}{n ? ` · ${n}` : ""}</Tag>
              </div>
              <p className="text-xs text-muted mt-0.5">{c.country} · {c.platforms.join(", ")} · {c.category}</p>
              <p className="text-sm text-ink-2 mt-2">{c.style}</p>
              {c.mechanismsObserved.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{c.mechanismsObserved.map((m) => <MechBadge key={m} code={m} />)}</div>}
              {c.notes && <p className="text-xs text-muted mt-3">{c.notes}</p>}
              {!c.showName && <p className="text-xs text-danger mt-2">Riesgo reputacional: en la generación se usa sin nombre.</p>}
              {c.sources.length > 0 && (
                <p className="text-xs mt-3">
                  Fuentes: {c.sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-olive underline underline-offset-2 mr-2">{s.label}</a>
                  ))}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
