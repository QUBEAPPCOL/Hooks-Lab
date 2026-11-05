"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { runGeneration } from "@/lib/engine/generate";
import { adaptToIndustries, developContent } from "@/lib/engine/develop";
import { LLMError } from "@/lib/llm";

type State = { error?: string } | null;

export async function createGenerationAction(_: State, formData: FormData): Promise<State> {
  let id: number;
  try {
    const payload = JSON.parse(String(formData.get("payload") ?? "{}"));
    id = await runGeneration(payload);
  } catch (e) {
    if (e instanceof Error && "issues" in e) return { error: "Revisa el formulario: falta información obligatoria (marca, tema de al menos 10 caracteres, objetivo)." };
    return { error: e instanceof Error ? e.message : "No se pudo generar." };
  }
  redirect(`/generaciones/${id}`);
}

export async function toggleFavoriteAction(hookId: number) {
  await db
    .update(schema.generatedHooks)
    .set({ favorite: sql`not ${schema.generatedHooks.favorite}` })
    .where(eq(schema.generatedHooks.id, hookId));
  revalidatePath("/", "layout");
}

export async function developAction(_: State, formData: FormData): Promise<State> {
  const hookId = Number(formData.get("hookId"));
  const format = String(formData.get("format") ?? "post_linkedin");
  let contentId: number;
  try {
    contentId = await developContent(hookId, format);
  } catch (e) {
    return { error: e instanceof LLMError || e instanceof Error ? e.message : "No se pudo desarrollar el contenido." };
  }
  redirect(`/contenido/${contentId}`);
}

export async function adaptAction(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; items?: { industry: string; industryName: string; hook: string; tension: string }[] }> {
  try {
    const items = await adaptToIndustries(
      String(formData.get("structureCode")),
      formData.getAll("industries").map(String),
      String(formData.get("variant") ?? "colombiano"),
    );
    return { items };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo adaptar." };
  }
}

const list = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export async function saveBrandAction(_: State, formData: FormData): Promise<State> {
  const id = Number(formData.get("id") || 0);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio." };
  const values = {
    name,
    kind: String(formData.get("kind") ?? "otra"),
    description: String(formData.get("description") ?? ""),
    audience: String(formData.get("audience") ?? ""),
    personality: String(formData.get("personality") ?? ""),
    tone: String(formData.get("tone") ?? ""),
    products: String(formData.get("products") ?? ""),
    services: String(formData.get("services") ?? ""),
    valueProp: String(formData.get("valueProp") ?? ""),
    allowedWords: list(formData.get("allowedWords")),
    bannedWords: list(formData.get("bannedWords")),
    goals: String(formData.get("goals") ?? ""),
    maxRegister: String(formData.get("maxRegister") ?? "cafe"),
    spanishVariant: String(formData.get("spanishVariant") ?? "colombiano"),
  };
  if (id) {
    await db.update(schema.brands).set(values).where(eq(schema.brands.id, id));
  } else {
    const slug =
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now().toString(36)}`;
    await db.insert(schema.brands).values({ ...values, slug });
  }
  revalidatePath("/marcas");
  redirect("/marcas");
}

export async function savePromptVersionAction(_: State, formData: FormData): Promise<State> {
  const key = String(formData.get("key"));
  const system = String(formData.get("system") ?? "");
  const template = String(formData.get("template") ?? "");
  const effort = String(formData.get("effort") ?? "high");
  const notes = String(formData.get("notes") ?? "");
  if (!system.trim() || !template.trim()) return { error: "El system y la plantilla no pueden estar vacíos." };
  const [last] = await db
    .select({ version: schema.promptVersions.version })
    .from(schema.promptVersions)
    .where(eq(schema.promptVersions.key, key))
    .orderBy(desc(schema.promptVersions.version))
    .limit(1);
  await db.transaction(async (tx) => {
    await tx.update(schema.promptVersions).set({ active: false }).where(eq(schema.promptVersions.key, key));
    await tx.insert(schema.promptVersions).values({ key, system, template, effort, notes, version: (last?.version ?? 0) + 1, active: true });
  });
  revalidatePath("/configuracion");
  redirect("/configuracion");
}

export async function activatePromptAction(formData: FormData) {
  const key = String(formData.get("key"));
  const version = Number(formData.get("version"));
  await db.transaction(async (tx) => {
    await tx.update(schema.promptVersions).set({ active: false }).where(eq(schema.promptVersions.key, key));
    await tx
      .update(schema.promptVersions)
      .set({ active: true })
      .where(and(eq(schema.promptVersions.key, key), eq(schema.promptVersions.version, version)));
  });
  revalidatePath("/configuracion");
}
