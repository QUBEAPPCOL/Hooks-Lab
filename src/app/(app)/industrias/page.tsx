import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHeader } from "@/components/ui";

export default async function IndustriesPage() {
  const rows = await db.select().from(schema.industries).orderBy(asc(schema.industries.name));
  return (
    <>
      <PageHeader eyebrow="Motor de adaptación" title="Industrias">
        El léxico, las tensiones y los tabúes de cada industria alimentan las adaptaciones. Para adaptar una estructura, ábrela en la Biblioteca.
      </PageHeader>
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((i) => (
          <div key={i.code} className="card p-5 text-sm">
            <h3 className="font-semibold text-base">{i.name}</h3>
            <p className="label mt-3">Tensiones</p>
            <ul className="list-disc pl-4 space-y-0.5 text-ink-2">{i.tensions.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="label mt-3">Léxico real</p>
            <p className="text-ink-2">{i.lexicon.join(" · ")}</p>
            <p className="label mt-3">Evitar</p>
            <p className="text-danger">{i.taboos.join(" · ")}</p>
          </div>
        ))}
      </div>
    </>
  );
}
