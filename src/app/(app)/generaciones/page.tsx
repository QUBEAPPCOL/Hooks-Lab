import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/db";
import { Empty, PageHeader } from "@/components/ui";

export default async function HistoryPage() {
  const rows = await db
    .select({ id: schema.generations.id, input: schema.generations.input, status: schema.generations.status, createdAt: schema.generations.createdAt, brand: schema.brands.name })
    .from(schema.generations)
    .leftJoin(schema.brands, eq(schema.brands.id, schema.generations.brandId))
    .orderBy(desc(schema.generations.id))
    .limit(100);
  return (
    <>
      <PageHeader eyebrow="Historial" title="Generaciones" />
      {rows.length === 0 ? (
        <Empty>Aún no hay generaciones.</Empty>
      ) : (
        <ul className="space-y-2">
          {rows.map((g) => (
            <li key={g.id}>
              <Link href={`/generaciones/${g.id}`} className="card block p-4 hover:border-olive transition-colors">
                <p className="text-xs text-muted">#{g.id} · {g.brand} · {g.status} · {g.createdAt.toLocaleString("es-CO")}</p>
                <p className="text-sm mt-1">{(g.input as { topic: string }).topic}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
