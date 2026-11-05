import type { z } from "zod";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface JsonRequest<T extends z.ZodType> {
  system: string;
  user: string;
  schema: T;
  effort?: Effort;
  maxTokens?: number;
  purpose: string;
  promptKey?: string;
  promptVersion?: number;
}

export interface JsonResult<T> {
  data: T;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

/** Interfaz común: cualquier proveedor nuevo implementa solo esto. */
export interface LLMProvider {
  name: string;
  model: string;
  available(): boolean;
  generateJSON<T extends z.ZodType>(req: JsonRequest<T>): Promise<JsonResult<z.infer<T>>>;
}

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}
