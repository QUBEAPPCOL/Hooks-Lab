import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { MechBadge, PageHeader, Tag } from "@/components/ui";
import { OBJECTIVES, TONE_NAMES } from "@/lib/engine/options";
import { IndustryAdapter } from "./IndustryAdapter";

export const maxDuration = 120;

export default async function StructurePage({ params }: PageProps<"/biblioteca/[code]">) {
  const { code } = await params;
  const [s] = await db.select().from(schema.structures).where(eq(schema.structures.code, code));
  if (!s) notFound();
  const [industries, mechs] = await Promise.all([
    db.select().from(schema.industries).orderBy(asc(schema.industries.name)),
    db.select().from(schema.mechanisms),
  ]);
  const mechInfo = mechs.filter((m) => s.mechanisms.includes(m.code));
  const indNames = new Map(industries.map((i) => [i.code, i.name]));
  return (
    <>
      <PageHeader eyebrow={`${s.code} · ${s.family}`} title={s.name}>
        <span className="font-mono">{s.formula}</span>
      </PageHeader>
      <div className="flex flex-wrap gap-2 mb-6">
        {s.mechanisms.map((m) => <MechBadge key={m} code={m} />)}
        {s.objective.map((o) => <Tag key={o}>{OBJECTIVES.find((x) => x.code === o)?.name ?? o}</Tag>)}
        {s.tones.map((t) => <Tag key={t} tone="rose">{TONE_NAMES[t] ?? t}</Tag>)}
        <Tag>Dificultad {["", "baja", "media", "alta"][s.difficulty]}</Tag>
        <Tag>Industrias: {s.industries.includes("todas") ? "todas" : s.industries.map((i) => indNames.get(i) ?? i).join(", ")}</Tag>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5"><p className="label">Ejemplo</p><p>“{s.example}”</p></div>
        <div className="card p-5"><p className="label">Contraejemplo (así no)</p><p className="text-ink-2">“{s.counterExample}”</p></div>
      </div>
      <div className="card p-5 mb-6">
        <p className="label mb-3">Adaptación por plataforma</p>
        <dl className="grid md:grid-cols-2 gap-4 text-sm">
          <div><dt className="font-semibold">LinkedIn</dt><dd className="text-ink-2">{s.adaptLinkedin}</dd></div>
          <div><dt className="font-semibold">Instagram</dt><dd className="text-ink-2">{s.adaptInstagram}</dd></div>
          <div><dt className="font-semibold">TikTok</dt><dd className="text-ink-2">{s.adaptTiktok}</dd></div>
          <div><dt className="font-semibold">Facebook</dt><dd className="text-ink-2">{s.adaptFacebook}</dd></div>
        </dl>
      </div>
      <div className="card p-5 mb-6">
        <p className="label mb-3">Por qué funciona (fundamento)</p>
        <ul className="space-y-3 text-sm">
          {mechInfo.map((m) => (
            <li key={m.code}>
              <span className="font-semibold">{m.name}</span> — {m.foundation}{" "}
              <span className="text-muted">({m.source}. Confianza {m.confidence}.)</span>
              {m.caveat && m.caveat !== "—" && <span className="block text-xs text-danger mt-0.5">Cuidado: {m.caveat}</span>}
            </li>
          ))}
        </ul>
        {s.reference && <p className="text-sm text-olive mt-4">Referencia de investigación: {s.reference}</p>}
      </div>
      <IndustryAdapter code={s.code} industries={industries.map((i) => ({ code: i.code, name: i.name }))} />
    </>
  );
}
