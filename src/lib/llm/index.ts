import type { z } from "zod";
import { db, schema } from "@/db";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { MockProvider } from "./mock";
import { LLMError, type JsonRequest, type JsonResult, type LLMProvider } from "./types";

const registry: Record<string, () => LLMProvider> = {
  anthropic: () => new AnthropicProvider(),
  openai: () => new OpenAIProvider(),
  // Solo para pruebas automatizadas de la tubería (nunca en producción).
  ...(process.env.NODE_ENV !== "production" ? { mock: () => new MockProvider() } : {}),
};

export function providerChain(): LLMProvider[] {
  const names = [process.env.LLM_PRIMARY || "anthropic", process.env.LLM_FALLBACK || ""].filter(Boolean);
  return [...new Set(names)].map((n) => registry[n]?.()).filter((p): p is LLMProvider => Boolean(p));
}

export function providerStatus() {
  return providerChain().map((p) => ({ name: p.name, model: p.model, configured: p.available() }));
}

async function log(entry: typeof schema.llmCalls.$inferInsert) {
  try {
    await db.insert(schema.llmCalls).values(entry);
  } catch (e) {
    console.error("[llm_calls] no se pudo registrar", e);
  }
}

/** Ejecuta la solicitud con el proveedor principal y cae al de respaldo si el error es recuperable. */
export async function generateJSON<T extends z.ZodType>(req: JsonRequest<T>): Promise<JsonResult<z.infer<T>>> {
  const chain = providerChain().filter((p) => p.available());
  if (chain.length === 0) {
    throw new LLMError(
      "No hay ningún proveedor de IA configurado. Define ANTHROPIC_API_KEY u OPENAI_API_KEY en el servidor.",
      false,
    );
  }
  let lastError: unknown;
  for (const provider of chain) {
    const started = Date.now();
    try {
      const result = await provider.generateJSON(req);
      await log({
        provider: provider.name,
        model: provider.model,
        purpose: req.purpose,
        promptKey: req.promptKey,
        promptVersion: req.promptVersion,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: Date.now() - started,
        ok: true,
      });
      return result;
    } catch (err) {
      lastError = err;
      await log({
        provider: provider.name,
        model: provider.model,
        purpose: req.purpose,
        promptKey: req.promptKey,
        promptVersion: req.promptVersion,
        latencyMs: Date.now() - started,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
      if (err instanceof LLMError && !err.retryable) break;
    }
  }
  throw lastError;
}

export { LLMError };
