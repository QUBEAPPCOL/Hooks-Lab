import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import { PLATFORMS, REGISTERS, REGISTER_ORDER, VARIANTS, VIDEO_FORMATS, FORMATS, OBJECTIVES, TONE_NAMES } from "./options";
import type { GenerationInput } from "./input";

type Brand = typeof schema.brands.$inferSelect;

export function brandBlock(b: Brand): string {
  return [
    `Nombre: ${b.name}`,
    `Descripción: ${b.description}`,
    `Audiencia: ${b.audience}`,
    `Personalidad: ${b.personality}`,
    `Tono de la marca: ${b.tone}`,
    b.products && `Productos: ${b.products}`,
    b.services && `Servicios: ${b.services}`,
    b.valueProp && `Propuesta de valor: ${b.valueProp}`,
    b.goals && `Objetivos comerciales: ${b.goals}`,
    b.allowedWords.length > 0 && `Expresiones propias permitidas: ${b.allowedWords.join(", ")}`,
    b.bannedWords.length > 0 && `Palabras prohibidas: ${b.bannedWords.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** El registro pedido nunca supera el techo de coloquialidad de la marca. */
export function effectiveRegister(requested: string | undefined, brandMax: string): string {
  const max = REGISTER_ORDER.indexOf(brandMax);
  const req = requested ? REGISTER_ORDER.indexOf(requested) : max;
  return REGISTER_ORDER[Math.min(req < 0 ? max : req, max < 0 ? 2 : max)];
}

export function registerBlock(register: string, variant: string): string {
  const r = REGISTERS.find((x) => x.code === register) ?? REGISTERS[1];
  const v = VARIANTS.find((x) => x.code === variant) ?? VARIANTS[3];
  return `Registro: ${r.name}. ${r.rule}\nVariante: ${v.name}. ${v.rule}`;
}

export function platformBlock(input: GenerationInput): string {
  const p = PLATFORMS.find((x) => x.code === input.platform);
  const f = FORMATS.find((x) => x.code === input.format);
  const isVideo = VIDEO_FORMATS.has(input.format) || p?.kind === "video";
  const lines = [`Plataforma: ${p?.name ?? input.platform}`, `Formato: ${f?.name ?? input.format}`];
  if (isVideo) {
    lines.push(
      "Es video corto: el hook es multimodal. Escribe la frase hablada del primer segundo (máx. ~15 palabras), el texto en pantalla (máx. 8 palabras) y la acción visual del primer segundo.",
    );
  } else if (input.platform === "linkedin" || input.platform === "facebook") {
    lines.push(
      "Es texto: el hook es lo que se lee antes del 'ver más' (≈200 caracteres en escritorio, menos en móvil). Puede ser 1 o 2 líneas cortas separadas por salto de línea.",
    );
  } else if (input.platform === "instagram") {
    lines.push("Instagram: el hook debe funcionar como portada de carrusel o primera línea del caption (corto, visual).");
  } else if (input.platform === "newsletter") {
    lines.push("Newsletter: el hook funciona como asunto + primera línea del correo.");
  }
  return lines.join("\n");
}

export function briefBlock(input: GenerationInput): string {
  const objective = OBJECTIVES.find((o) => o.code === input.objective)?.name ?? input.objective;
  const a = input.audience;
  return [
    `Tema / idea: ${input.topic}`,
    `Audiencia: ${a.segments.join(", ")}${a.custom ? `; ${a.custom}` : ""}`,
    a.age && `Edad: ${a.age}`,
    a.interests && `Intereses: ${a.interests}`,
    a.problems && `Problemas: ${a.problems}`,
    a.aspirations && `Aspiraciones: ${a.aspirations}`,
    a.knowledge && `Nivel de conocimiento del tema: ${a.knowledge}`,
    `Objetivo: ${objective}`,
    input.industry && `Industria: ${input.industry}`,
    input.mechanisms.length > 0
      ? `Mecanismos pedidos: ${input.mechanisms.map((m) => MECHANISM_NAMES[m] ?? m).join(" + ")}`
      : "Mecanismos: sorpréndeme (el plan ya los combina)",
    input.tones.length > 0 && `Tonos: ${input.tones.map((t) => TONE_NAMES[t] ?? t).join(", ")}`,
    input.extraContext && `Contexto adicional: ${input.extraContext}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function referencesBlock(slugs: string[]): Promise<string> {
  if (slugs.length === 0) return "Creatividad original, sin referencias de creadores.";
  const creators = await db.select().from(schema.creators).where(inArray(schema.creators.slug, slugs));
  if (creators.length === 0) return "Creatividad original, sin referencias de creadores.";
  const hooks = await db
    .select()
    .from(schema.observedHooks)
    .where(inArray(schema.observedHooks.creatorId, creators.map((c) => c.id)));
  return creators
    .map((c) => {
      const label = c.showName ? c.name : "Creador de referencia (anónimo)";
      const own = hooks.filter((h) => h.creatorId === c.id && !h.isCounterExample);
      const mechs = c.mechanismsObserved.map((m) => MECHANISM_NAMES[m] ?? m).join(", ");
      const constructions = own.map((h) => `  - ${h.construction}`).join("\n");
      return [
        `- ${label} (${c.category}). Estilo: ${c.style}`,
        mechs && `  Mecanismos observados: ${mechs}`,
        constructions && `  Construcciones observadas (inspírate en el mecanismo, no copies):\n${constructions}`,
        own.length === 0 && "  (Aún no hay publicaciones analizadas: usa solo su registro general, con prudencia.)",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}
