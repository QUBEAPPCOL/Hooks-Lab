import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHeader } from "@/components/ui";
import { GeneratorForm } from "./GeneratorForm";
import { SCENARIOS } from "./scenarios";

export const maxDuration = 300;

export default async function GenerarPage({ searchParams }: PageProps<"/generar">) {
  const { escenario } = await searchParams;
  const [brands, creators, industries] = await Promise.all([
    db.select().from(schema.brands).orderBy(asc(schema.brands.id)),
    db.select().from(schema.creators).orderBy(asc(schema.creators.id)),
    db.select().from(schema.industries).orderBy(asc(schema.industries.name)),
  ]);
  const sc = typeof escenario === "string" ? SCENARIOS[escenario] : undefined;
  const preset = sc ? { ...sc, brandId: brands.find((b) => b.slug === sc.brandSlug)?.id } : undefined;
  return (
    <>
      <PageHeader eyebrow="Generador" title="Generar hooks">
        El motor planifica ángulos distintos antes de escribir, evalúa cada hook según tu objetivo y filtra el lenguaje corporativo y las cifras que no vienen de tu brief.
      </PageHeader>
      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <span className="text-muted">Escenarios de prueba:</span>
        {Object.entries(SCENARIOS).map(([k, s]) => (
          <a key={k} href={`/generar?escenario=${k}`} className="chip">{s.label}</a>
        ))}
      </div>
      <GeneratorForm
        key={typeof escenario === "string" ? escenario : "libre"}
        brands={brands.map((b) => ({ id: b.id, name: b.name, maxRegister: b.maxRegister, spanishVariant: b.spanishVariant }))}
        creators={creators.map((c) => ({ slug: c.slug, name: c.name, showName: c.showName }))}
        industries={industries.map((i) => ({ code: i.code, name: i.name }))}
        preset={preset}
      />
    </>
  );
}
