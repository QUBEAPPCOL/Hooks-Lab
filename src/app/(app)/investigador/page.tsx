import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { MechBadge, PageHeader, Tag } from "@/components/ui";

export default async function ResearcherPage() {
  const rows = await db
    .select({ h: schema.observedHooks, creator: schema.creators.name })
    .from(schema.observedHooks)
    .leftJoin(schema.creators, eq(schema.creators.id, schema.observedHooks.creatorId))
    .orderBy(desc(schema.observedHooks.publishedAt));
  return (
    <>
      <PageHeader eyebrow="Investigador · Fase 4" title="Hooks observados">
        Registro de hooks reales con fuente, mecanismo y construcción. En la Fase 4 se agrega “Analizar publicación” (URL, texto, transcripción, captura o video): si el sistema no puede acceder al contenido, lo pide; nunca lo inventa.
      </PageHeader>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted uppercase tracking-wider">
            <tr className="border-b border-line">
              <th className="p-3">Hook literal</th><th className="p-3">Creador · red · fecha</th><th className="p-3">Mecanismo y construcción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ h, creator }) => (
              <tr key={h.id} className="border-b border-line align-top">
                <td className="p-3 max-w-md">
                  “{h.text}”
                  {h.isCounterExample && <span className="ml-2"><Tag tone="danger">Contraejemplo</Tag></span>}
                </td>
                <td className="p-3 whitespace-nowrap text-ink-2">
                  {creator}<br />{h.platform} · {h.publishedAt || "s. f."}
                  {h.url && <><br /><a href={h.url} target="_blank" rel="noreferrer" className="text-olive underline underline-offset-2">fuente</a></>}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 mb-1">{h.mechanisms.map((m) => <MechBadge key={m} code={m} />)}</div>
                  <p className="text-ink-2">{h.construction}</p>
                  {h.structureCode && <p className="text-xs text-muted mt-1">→ {h.structureCode}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
