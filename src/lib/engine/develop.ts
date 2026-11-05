import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { generateJSON } from "@/lib/llm";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import { getActivePrompt, render } from "./prompts";
import { brandBlock, briefBlock } from "./context";
import { GenerationInputSchema } from "./input";

export const DEVELOP_FORMATS = [
  { code: "post_linkedin", name: "Post de LinkedIn", rule: "Post de LinkedIn de 150 a 300 palabras. Párrafos de 1-3 líneas, saltos de línea, sin hashtags en el cuerpo (máx. 3 al final), cierre con pregunta honesta o CTA coherente." },
  { code: "carrusel", name: "Carrusel", rule: "Carrusel de 7 a 10 slides. Slide 1 = el hook. Una idea por slide, máx. 30 palabras por slide. Último slide con cierre/CTA. En body pon el caption (máx. 120 palabras)." },
  { code: "infografia", name: "Infografía", rule: "Infografía vertical: título (el hook), 4-6 bloques con dato o idea + explicación breve, fuente si hay datos. Cada bloque es un slide en slides." },
  { code: "reel", name: "Guion de Reel", rule: "Guion de Reel de 30-45 s con marcas de tiempo: [0-2s] hook hablado + texto en pantalla + acción, desarrollo en 3-4 tomas, remate y CTA. Indica texto en pantalla por toma." },
  { code: "tiktok", name: "Guion de TikTok", rule: "Guion de TikTok de 30-60 s: [0-1s] hook (frase + texto en pantalla + acción), cambios de ritmo cada 3-5 s, remate. Lenguaje oral, no leído." },
  { code: "articulo", name: "Artículo", rule: "Artículo de 700-1.000 palabras con título, subtítulos (##) y cierre. El hook es el primer párrafo." },
  { code: "newsletter", name: "Newsletter", rule: "Newsletter de 300-500 palabras: asunto (en title), primera línea = hook, una sola idea desarrollada con historia o ejemplo, un CTA." },
] as const;

const DevelopSchema = z.object({
  title: z.string(),
  body: z.string(),
  slides: z.array(z.string()),
  promiseCheck: z.string(),
});

export async function developContent(hookId: number, format: string): Promise<number> {
  const [hook] = await db.select().from(schema.generatedHooks).where(eq(schema.generatedHooks.id, hookId));
  if (!hook) throw new Error("El hook no existe.");
  const [generation] = await db.select().from(schema.generations).where(eq(schema.generations.id, hook.generationId));
  const input = GenerationInputSchema.parse(generation.input);
  const [brand] = await db.select().from(schema.brands).where(eq(schema.brands.id, input.brandId));
  const f = DEVELOP_FORMATS.find((x) => x.code === format) ?? DEVELOP_FORMATS[0];
  const prompt = await getActivePrompt("develop");

  const res = await generateJSON({
    system: prompt.system,
    user: render(prompt.template, {
      brand: brandBlock(brand),
      brief: briefBlock(input),
      hook: hook.text + (hook.onScreenText ? `\n(Texto en pantalla: ${hook.onScreenText})` : ""),
      structure: `${hook.structureCode} ${hook.structureName}`,
      mechanisms: hook.mechanisms.map((m) => MECHANISM_NAMES[m] ?? m).join(", "),
      format_rules: `${f.name}. ${f.rule}`,
    }),
    schema: DevelopSchema,
    effort: prompt.effort as "high",
    maxTokens: 32000,
    purpose: "develop",
    promptKey: prompt.key,
    promptVersion: prompt.version,
  });

  const [content] = await db
    .insert(schema.contents)
    .values({
      hookId,
      format: f.code,
      title: res.data.title,
      body: res.data.body,
      slides: res.data.slides.length > 0 ? res.data.slides : null,
      promiseCheck: res.data.promiseCheck,
    })
    .returning();
  return content.id;
}

const AdaptSchema = z.object({
  adaptations: z.array(z.object({ industry: z.string(), hook: z.string(), tension: z.string() })),
});

export async function adaptToIndustries(structureCode: string, industryCodes: string[], variant: string) {
  const [s] = await db.select().from(schema.structures).where(eq(schema.structures.code, structureCode));
  if (!s) throw new Error("La estructura no existe.");
  const inds = await db.select().from(schema.industries).where(inArray(schema.industries.code, industryCodes));
  const prompt = await getActivePrompt("industry_adapt");
  const res = await generateJSON({
    system: prompt.system,
    user: render(prompt.template, {
      structure: `${s.code} — ${s.name}\nFórmula: ${s.formula}\nEjemplo: ${s.example}\nContraejemplo: ${s.counterExample}`,
      variant,
      industries: inds
        .map(
          (i) =>
            `- ${i.code} (${i.name}). Léxico: ${i.lexicon.join(", ")}. Tensiones: ${i.tensions.join("; ")}. Evitar: ${i.taboos.join("; ")}`,
        )
        .join("\n"),
    }),
    schema: AdaptSchema,
    effort: prompt.effort as "medium",
    maxTokens: 16000,
    purpose: "industry_adapt",
    promptKey: prompt.key,
    promptVersion: prompt.version,
  });
  const names = new Map(inds.map((i) => [i.code, i.name]));
  return res.data.adaptations.map((a) => ({ ...a, industryName: names.get(a.industry) ?? a.industry }));
}
