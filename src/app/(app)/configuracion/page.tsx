import { desc } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/db";
import { PageHeader, Tag } from "@/components/ui";
import { providerStatus } from "@/lib/llm";
import { activatePromptAction } from "../actions";

export default async function SettingsPage() {
  const [prompts, calls] = await Promise.all([
    db.select().from(schema.promptVersions).orderBy(schema.promptVersions.key, desc(schema.promptVersions.version)),
    db.select().from(schema.llmCalls).orderBy(desc(schema.llmCalls.id)).limit(20),
  ]);
  const providers = providerStatus();
  const keys = [...new Set(prompts.map((p) => p.key))];
  return (
    <>
      <PageHeader eyebrow="Configuración" title="Motor, proveedores y prompts" />

      <section className="card p-5 mb-6">
        <h2 className="font-semibold mb-3">Proveedores de IA</h2>
        <p className="text-sm text-ink-2 mb-3">Las claves viven solo en variables de entorno del servidor (ANTHROPIC_API_KEY, OPENAI_API_KEY). El orden lo definen LLM_PRIMARY y LLM_FALLBACK.</p>
        <ul className="space-y-2 text-sm">
          {providers.map((p, i) => (
            <li key={p.name} className="flex gap-3 items-center">
              <Tag>{i === 0 ? "Principal" : "Respaldo"}</Tag>
              <span className="font-semibold">{p.name}</span>
              <span className="text-muted">{p.model}</span>
              {p.configured ? <Tag>Configurado</Tag> : <Tag tone="danger">Falta la API key</Tag>}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 mb-6">
        <h2 className="font-semibold mb-3">Prompts versionados</h2>
        <div className="space-y-4">
          {keys.map((k) => (
            <div key={k}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{k}</span>
                <Link href={`/configuracion/prompts/${k}`} className="text-sm text-olive underline underline-offset-4">Editar (crea versión nueva)</Link>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {prompts.filter((p) => p.key === k).map((p) => (
                  <li key={p.id}>
                    <form action={activatePromptAction}>
                      <input type="hidden" name="key" value={k} />
                      <input type="hidden" name="version" value={p.version} />
                      <button className="chip" data-on={p.active} title={p.notes} disabled={p.active}>
                        v{p.version}{p.active ? " · activa" : " · activar"}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 overflow-x-auto">
        <h2 className="font-semibold mb-3">Últimas llamadas a modelos (logs)</h2>
        <table className="w-full text-xs">
          <thead className="text-left text-muted">
            <tr><th className="py-1 pr-3">Fecha</th><th className="pr-3">Uso</th><th className="pr-3">Proveedor · modelo</th><th className="pr-3">Prompt</th><th className="pr-3">Tokens</th><th className="pr-3">Latencia</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="py-1.5 pr-3">{c.createdAt.toLocaleString("es-CO")}</td>
                <td className="pr-3">{c.purpose}</td>
                <td className="pr-3">{c.provider} · {c.model}</td>
                <td className="pr-3">{c.promptKey} v{c.promptVersion}</td>
                <td className="pr-3">{c.inputTokens ?? "–"} / {c.outputTokens ?? "–"}</td>
                <td className="pr-3">{c.latencyMs ? `${(c.latencyMs / 1000).toFixed(1)} s` : "–"}</td>
                <td className={c.ok ? "" : "text-danger"}>{c.ok ? "ok" : c.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {calls.length === 0 && <p className="text-sm text-muted">Sin llamadas todavía.</p>}
      </section>
    </>
  );
}
