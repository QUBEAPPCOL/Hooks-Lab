// Autenticación mínima para el MVP de uso interno (una contraseña compartida).
// Para el SaaS se reemplaza por Auth.js / Supabase Auth sin tocar el resto de la app.

export const SESSION_COOKIE = "hl_session";

async function hmac(value: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET en el servidor.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(sig).toString("base64url");
}

export async function createSessionToken(): Promise<string> {
  const payload = `v1.${Date.now() + 1000 * 60 * 60 * 24 * 30}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const expires = Number(payload.split(".")[1]);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = await hmac(payload);
  return expected.length === token.slice(i + 1).length && expected === token.slice(i + 1);
}
