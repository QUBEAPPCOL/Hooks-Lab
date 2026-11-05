import { asc } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/db";
import { MechBadge, PageHeader } from "@/components/ui";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import { OBJECTIVES } from "@/lib/engine/options";

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function LibraryPage({ searchParams }: PageProps<"/biblioteca">) {
  const sp = await searchParams;
  const f = { familia: one(sp.familia), mecanismo: one(sp.mecanismo), objetivo: one(sp.objetivo), industria: one(sp.industria), dificultad: one(sp.dificultad), q: one(sp.q) };
  const [all, industries] = await Promise.all([
    db.select().from(schema.structures).orderBy(asc(schema.structures.code)),
    db.select().from(schema.industries).orderBy(asc(schema.industries.name)),
  ]);
  const families = [...new Set(all.map((s) => s.family))];
  const q = f.q.toLowerCase();
  const rows = all.filter(
    (s) =>
      (!f.familia || s.family === f.familia) &&
      (!f.mecanismo || s.mechanisms.includes(f.mecanismo)) &&
      (!f.objetivo || s.objective.includes(f.objetivo)) &&
      (!f.industria || s.industries.includes("todas") || s.industries.includes(f.industria)) &&
      (!f.dificultad || String(s.difficulty) === f.dificultad) &&
      (!q || `${s.name} ${s.formula} ${s.example}`.toLowerCase().includes(q)),
  );
  return (
    <>
      <PageHeader eyebrow="Biblioteca" title={`${all.length} estructuras de hooks`}>
        Quince familias con movimientos lógicos distintos. Cada estructura tiene fórmula, mecanismo, ejemplo, contraejemplo y adaptación por plataforma.
      </PageHeader>
      <form className="card p-4 mb-6 grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <input name="q" defaultValue={f.q} placeholder="Buscar…" className="field lg:col-span-1 sm:col-span-3" />
        <select name="familia" defaultValue={f.familia} className="field">
          <option value="">Familia</option>
          {families.map((x) => <option key={x}>{x}</option>)}
        </select>
        <select name="mecanismo" defaultValue={f.mecanismo} className="field">
          <option value="">Mecanismo</option>
          {Object.entries(MECHANISM_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="objetivo" defaultValue={f.objetivo} className="field">
          <option value="">Objetivo</option>
          {OBJECTIVES.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
        </select>
        <select name="industria" defaultValue={f.industria} className="field">
          <option value="">Industria</option>
          {industries.map((i) => <option key={i.code} value={i.code}>{i.name}</option>)}
        </select>
        <div className="flex gap-2">
          <select name="dificultad" defaultValue={f.dificultad} className="field">
            <option value="">Dificultad</option>
            <option value="1">Baja</option>
            <option value="2">Media</option>
            <option value="3">Alta</option>
          </select>
          <button className="btn btn-primary">Filtrar</button>
        </div>
      </form>
      <p className="text-sm text-muted mb-3">{rows.length} resultados</p>
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((s) => (
          <Link key={s.code} href={`/biblioteca/${s.code}`} className="card p-5 hover:border-olive transition-colors block">
            <div className="flex justify-between text-xs text-muted">
              <span className="font-mono">{s.code}</span>
              <span>{s.family} · {"●".repeat(s.difficulty)}{"○".repeat(3 - s.difficulty)}</span>
            </div>
            <h3 className="font-semibold mt-1">{s.name}</h3>
            <p className="text-sm text-ink-2 mt-1 font-mono">{s.formula}</p>
            <p className="text-sm mt-3">“{s.example}”</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{s.mechanisms.map((m) => <MechBadge key={m} code={m} />)}</div>
            {s.reference && <p className="text-xs text-olive mt-2">● Basada en un hook observado</p>}
          </Link>
        ))}
      </div>
    </>
  );
}
