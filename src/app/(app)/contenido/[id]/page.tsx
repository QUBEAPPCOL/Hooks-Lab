import { and, asc, eq, ne } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { HookCard, type HookView } from "@/components/HookCard";
import { PageHeader } from "@/components/ui";
import { DEVELOP_FORMATS } from "@/lib/engine/develop";
import { CopyButton } from "./CopyButton";

export const maxDuration = 300;

export default async function ContentPage({ params }: PageProps<"/contenido/[id]">) {
  const { id } = await params;
  const [content] = await db.select().from(schema.contents).where(eq(schema.contents.id, Number(id)));
  if (!content) notFound();
  const [hook] = await db.select().from(schema.generatedHooks).where(eq(schema.generatedHooks.id, content.hookId));
  const [versions, others] = await Promise.all([
    db.select().from(schema.contents).where(eq(schema.contents.hookId, hook.id)).orderBy(asc(schema.contents.id)),
    db
      .select()
      .from(schema.generatedHooks)
      .where(and(eq(schema.generatedHooks.generationId, hook.generationId), ne(schema.generatedHooks.id, hook.id)))
      .orderBy(asc(schema.generatedHooks.idx)),
  ]);
  const fmt = DEVELOP_FORMATS.find((f) => f.code === content.format)?.name ?? content.format;
  const fullText = [content.title, content.body, ...(content.slides ?? []).map((s, i) => `Slide ${i + 1}: ${s}`)].filter(Boolean).join("\n\n");
  return (
    <>
      <PageHeader eyebrow={`Contenido · ${fmt}`} title={content.title || "Contenido desarrollado"}>
        <Link href={`/generaciones/${hook.generationId}`} className="text-olive underline underline-offset-4 text-sm">← Volver a la generación</Link>
      </PageHeader>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <article className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="label mb-0">Listo para publicar</p>
              <CopyButton text={fullText} />
            </div>
            <div className="whitespace-pre-line leading-relaxed">{content.body}</div>
            {content.slides && content.slides.length > 0 && (
              <ol className="mt-6 grid sm:grid-cols-2 gap-3">
                {content.slides.map((s, i) => (
                  <li key={i} className="rounded-xl bg-surface-2 p-4 text-sm">
                    <span className="label">Slide {i + 1}</span>
                    <span className="whitespace-pre-line">{s}</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
          <div className="card p-5 text-sm">
            <p className="label">Verificación de promesa</p>
            <p>{content.promiseCheck}</p>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="card p-5 text-sm">
            <p className="label">Versiones con este hook</p>
            <ul className="space-y-1">
              {versions.map((v) => (
                <li key={v.id}>
                  <Link href={`/contenido/${v.id}`} className={v.id === content.id ? "font-semibold" : "text-olive"}>
                    #{v.id} · {DEVELOP_FORMATS.find((f) => f.code === v.format)?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <section className="mt-10">
        <h2 className="serif text-2xl mb-1">Cambiar de hook</h2>
        <p className="text-sm text-muted mb-4">Este contenido queda guardado. Desarrollar con otro hook crea una versión nueva.</p>
        <div className="space-y-4">{(others as HookView[]).map((h) => <HookCard key={h.id} hook={h} />)}</div>
      </section>
    </>
  );
}
