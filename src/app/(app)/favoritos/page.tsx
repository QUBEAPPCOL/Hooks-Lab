import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { HookCard, type HookView } from "@/components/HookCard";
import { Empty, PageHeader } from "@/components/ui";

export default async function FavoritesPage() {
  const rows = (await db
    .select()
    .from(schema.generatedHooks)
    .where(eq(schema.generatedHooks.favorite, true))
    .orderBy(desc(schema.generatedHooks.id))) as HookView[];
  return (
    <>
      <PageHeader eyebrow="Favoritos" title="Hooks guardados" />
      {rows.length === 0 ? <Empty>Marca con ♡ los hooks que quieras guardar.</Empty> : <div className="space-y-4">{rows.map((h) => <HookCard key={h.id} hook={h} />)}</div>}
    </>
  );
}
