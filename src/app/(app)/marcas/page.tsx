import { asc } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/db";
import { PageHeader, Tag } from "@/components/ui";
import { REGISTERS } from "@/lib/engine/options";

export default async function BrandsPage() {
  const brands = await db.select().from(schema.brands).orderBy(asc(schema.brands.id));
  return (
    <>
      <PageHeader eyebrow="Mis marcas" title="Marcas">Cada marca tiene su voz, su audiencia, sus palabras prohibidas y su techo de coloquialidad.</PageHeader>
      <Link href="/marcas/nueva" className="btn btn-primary mb-6">+ Nueva marca</Link>
      <div className="grid md:grid-cols-2 gap-3">
        {brands.map((b) => (
          <Link key={b.id} href={`/marcas/${b.id}`} className="card p-5 block hover:border-olive transition-colors">
            <h3 className="font-semibold">{b.name}</h3>
            <p className="text-sm text-ink-2 mt-1 line-clamp-3">{b.description}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Tag>Registro máx.: {REGISTERS.find((r) => r.code === b.maxRegister)?.name}</Tag>
              <Tag>{b.spanishVariant}</Tag>
              {b.bannedWords.length > 0 && <Tag tone="rose">{b.bannedWords.length} palabras prohibidas</Tag>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
