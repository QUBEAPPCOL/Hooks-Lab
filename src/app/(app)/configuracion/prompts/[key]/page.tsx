import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getActivePrompt } from "@/lib/engine/prompts";
import { PromptEditor } from "./PromptEditor";

export default async function PromptPage({ params }: PageProps<"/configuracion/prompts/[key]">) {
  const { key } = await params;
  const p = await getActivePrompt(key).catch(() => null);
  if (!p) notFound();
  return (
    <>
      <PageHeader eyebrow={`Prompt · v${p.version} activa`} title={key} />
      <PromptEditor p={{ key: p.key, system: p.system, template: p.template, effort: p.effort, version: p.version }} />
    </>
  );
}
