import { z } from "zod";

export const GenerationInputSchema = z.object({
  brandId: z.coerce.number().int().positive(),
  platform: z.string().min(1),
  topic: z.string().min(10, "Cuéntame un poco más del tema (mínimo 10 caracteres)."),
  audience: z.object({
    segments: z.array(z.string()).default([]),
    custom: z.string().default(""),
    age: z.string().default(""),
    interests: z.string().default(""),
    problems: z.string().default(""),
    aspirations: z.string().default(""),
    knowledge: z.string().default(""),
  }),
  objective: z.string().min(1),
  mechanisms: z.array(z.string()).default([]), // vacío = sorpréndeme
  tones: z.array(z.string()).default([]),
  format: z.string().default("solo_hooks"),
  count: z.coerce.number().int().min(1).max(50).default(10),
  register: z.string().optional(),
  variant: z.string().optional(),
  industry: z.string().nullable().default(null),
  references: z.array(z.string()).default([]),
  extraContext: z.string().default(""),
});

export type GenerationInput = z.infer<typeof GenerationInputSchema>;
