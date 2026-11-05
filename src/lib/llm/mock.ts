import type { z } from "zod";
import type { JsonRequest, JsonResult, LLMProvider } from "./types";

/**
 * Proveedor de PRUEBA: devuelve JSON válido y determinista para verificar la tubería
 * (plan → generación → juez → filtros → ranking → base de datos) sin llamar a ningún modelo.
 * Sus textos son marcadores, no hooks: nunca deben mostrarse como resultados reales.
 */
const WORDS = "manzana bicicleta oceano tornillo ventana guitarra cometa ladrillo paraguas tortuga volcan cuaderno espejo linterna girasol tambor brujula cactus pelota relampago almohada martillo cascada pinguino".split(" ");

export class MockProvider implements LLMProvider {
  name = "mock";
  model = "mock-1";
  available() {
    return true;
  }
  async generateJSON<T extends z.ZodType>(req: JsonRequest<T>): Promise<JsonResult<z.infer<T>>> {
    let data: unknown;
    if (req.purpose === "generate") {
      const slots = [...req.user.matchAll(/Slot (\d+) · ([A-Z]+-\d+)/g)];
      data = {
        hooks: slots.map(([, n, code], i) => ({
          slot: Number(n),
          text: i === 1 ? "En el dinámico mundo de hoy el 87% de los líderes falla." : `[PRUEBA ${code}] ${WORDS.slice((i * 3) % WORDS.length, ((i * 3) % WORDS.length) + 3).join(" ")}`,
          onScreenText: "",
          visualAction: "",
          structureCode: code,
          mechanisms: ["contradiccion"],
          tone: "directo",
          why: "prueba",
          audience: "prueba",
          weakness: "prueba",
          platformAdaptation: "prueba",
        })),
      };
    } else if (req.purpose === "judge") {
      const ids = [...req.user.matchAll(/\[id (\d+)\]/g)].map((m) => Number(m[1]));
      data = {
        evaluations: ids.map((id) => ({
          id,
          scores: { impacto: (id % 10), curiosidad: 6, identificacion: 5, claridad: 7, originalidad: 5, conversacion: (9 - (id % 10)), credibilidad: 6, oferta: (id % 4) * 3, calidad_audiencia: 5, oralidad: 7 },
          flags: [],
          note: "prueba",
        })),
      };
    } else {
      data = { title: "[PRUEBA]", body: "[PRUEBA] cuerpo", slides: [], promiseCheck: "prueba", adaptations: [] };
    }
    return { data: req.schema.parse(data), provider: this.name, model: this.model };
  }
}
