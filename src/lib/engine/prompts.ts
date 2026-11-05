import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export type ActivePrompt = typeof schema.promptVersions.$inferSelect;

export async function getActivePrompt(key: string): Promise<ActivePrompt> {
  const [row] = await db
    .select()
    .from(schema.promptVersions)
    .where(and(eq(schema.promptVersions.key, key), eq(schema.promptVersions.active, true)))
    .orderBy(desc(schema.promptVersions.version))
    .limit(1);
  if (!row) throw new Error(`No hay una versión activa del prompt "${key}". Ejecuta npm run db:seed.`);
  return row;
}

export function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
}
