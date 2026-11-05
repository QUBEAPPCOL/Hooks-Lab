import { BANNED_CORPORATE } from "./options";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export type LintInput = {
  text: string;
  brief: string; // tema + contexto: para saber si una cifra viene del usuario
  bannedWords: string[];
  platform: string;
  isVideo: boolean;
};

/** Controles deterministas que no dependen del modelo. Devuelve flags y penalización. */
export function lintHook({ text, brief, bannedWords, platform, isVideo }: LintInput) {
  const flags: string[] = [];
  let penalty = 0;
  const t = norm(text);

  for (const phrase of [...BANNED_CORPORATE, ...bannedWords]) {
    if (phrase && t.includes(norm(phrase))) {
      flags.push(`Lenguaje prohibido o corporativo: "${phrase}"`);
      penalty += 8;
    }
  }

  // Cifras que no aparecen en el brief → posible dato inventado.
  const numbers = text.match(/\d+(?:[.,]\d+)?\s?%?/g) ?? [];
  const briefNorm = norm(brief);
  for (const n of numbers) {
    const digits = n.replace(/[^\d]/g, "");
    if (digits.length === 0) continue;
    const isPercent = n.includes("%");
    if (!briefNorm.includes(digits) && (isPercent || digits.length >= 3)) {
      flags.push(`Cifra "${n.trim()}" no está en tu brief: verifica que sea real o cámbiala`);
      penalty += isPercent ? 12 : 6;
    }
  }
  if (/\[dato real/.test(text)) flags.push("Necesita un dato real con fuente antes de publicar");

  if (!isVideo && (platform === "linkedin" || platform === "facebook")) {
    const firstBlock = text.split("\n")[0];
    if (firstBlock.length > 210) {
      flags.push("La primera línea pasa de ~210 caracteres: se corta antes del 'ver más'");
      penalty += 4;
    }
  }
  if (isVideo && text.split(/\s+/).length > 22) {
    flags.push("Para video, la frase del primer segundo es larga (más de 22 palabras)");
    penalty += 4;
  }
  const emojiCount = (text.match(/\p{Extended_Pictographic}/gu) ?? []).length;
  if (emojiCount > 2) {
    flags.push("Exceso de emojis");
    penalty += 3;
  }
  return { flags, penalty };
}
