import { z } from "zod";
import { LLMError, type JsonRequest, type JsonResult, type LLMProvider } from "./types";

/** Proveedor de respaldo vía API REST de OpenAI (salida JSON con esquema). */
export class OpenAIProvider implements LLMProvider {
  name = "openai";
  model = process.env.OPENAI_MODEL || "gpt-5";

  available() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generateJSON<T extends z.ZodType>(req: JsonRequest<T>): Promise<JsonResult<z.infer<T>>> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: req.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "salida", schema: z.toJSONSchema(req.schema), strict: false },
        },
      }),
    }).catch(() => {
      throw new LLMError("No hay conexión con OpenAI.", true);
    });
    if (!res.ok) throw new LLMError(`OpenAI respondió ${res.status}`, res.status >= 429);
    const json = await res.json();
    const parsed = req.schema.safeParse(JSON.parse(json.choices?.[0]?.message?.content ?? "{}"));
    if (!parsed.success) throw new LLMError("Salida JSON inválida (OpenAI).", true);
    return {
      data: parsed.data,
      provider: this.name,
      model: this.model,
      inputTokens: json.usage?.prompt_tokens,
      outputTokens: json.usage?.completion_tokens,
    };
  }
}
