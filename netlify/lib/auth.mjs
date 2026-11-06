import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const hash = (s) => createHash("sha256").update(String(s)).digest();
export const same = (a, b) => timingSafeEqual(hash(a), hash(b));
export const json = (o, status = 200) => Response.json(o, { status });

/** Spieler aus der Netlify-Variable PLAYERS: "n1co:passwort1,jak:passwort2" (Passwörter ohne Komma) */
export function players() {
  const m = new Map();
  for (const p of (process.env.PLAYERS || "").split(",")) {
    const i = p.indexOf(":");
    const u = p.slice(0, i).trim().toLowerCase(), pw = p.slice(i + 1).trim();
    if (i > 0 && u && pw) m.set(u, pw);
  }
  return m;
}

/** Sperrt eine IP 15 Min. nach 5 Fehlversuchen. check() liefert true bei richtigen Zugangsdaten. */
export async function guard(context, check) {
  const lock = getStore("login-lock"), key = hash(context.ip || "unknown").toString("hex");
  const rec = (await lock.get(key, { type: "json" })) || { n: 0, t: 0 };
  const now = Date.now(), recent = now - rec.t < 15 * 60 * 1000;
  if (recent && rec.n >= 5) return "locked";
  if (await check()) { if (rec.n) await lock.delete(key); return "ok"; }
  await lock.setJSON(key, { n: recent ? rec.n + 1 : 1, t: now });
  return "denied";
}

export async function all(store) {
  const { blobs } = await store.list();
  return (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
}
