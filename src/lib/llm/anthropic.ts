import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { LLMError, type JsonRequest, type JsonResult, type LLMProvider } from "./types";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  model = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
  private client: Anthropic | null = null;

  available() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  private getClient() {
    if (!this.client) this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return this.client;
  }

  async generateJSON<T extends z.ZodType>(req: JsonRequest<T>): Promise<JsonResult<z.infer<T>>> {
    try {
      const response = await this.getClient().messages.parse({
        model: this.model,
        max_tokens: req.maxTokens ?? 16000,
        system: req.system,
        messages: [{ role: "user", content: req.user }],
        thinking: { type: "adaptive" },
        output_config: { effort: req.effort ?? "high", format: zodOutputFormat(req.schema) },
      });
      if (response.stop_reason === "refusal") {
        throw new LLMError("El modelo declinó la solicitud (refusal).", true);
      }
      if (response.stop_reason === "max_tokens") {
        throw new LLMError("La respuesta se cortó por max_tokens.", true);
      }
      if (!response.parsed_output) throw new LLMError("Salida JSON inválida.", true);
      return {
        data: response.parsed_output as z.infer<T>,
        provider: this.name,
        model: this.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (err) {
      if (err instanceof LLMError) throw err;
      if (err instanceof Anthropic.AuthenticationError) throw new LLMError("API key de Anthropic inválida.", false);
      if (err instanceof Anthropic.BadRequestError) throw new LLMError(`Solicitud inválida: ${err.message}`, false);
      if (err instanceof Anthropic.RateLimitError) throw new LLMError("Límite de uso alcanzado en Anthropic.", true);
      if (err instanceof Anthropic.APIConnectionError) throw new LLMError("No hay conexión con Anthropic.", true);
      if (err instanceof Anthropic.APIError) throw new LLMError(`Error de Anthropic: ${err.message}`, true);
      throw err;
    }
  }
}
