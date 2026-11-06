import { getStore } from "@netlify/blobs";
import { guard, players, same, json, all } from "../lib/auth.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const b = await req.json().catch(() => ({}));
  const user = String(b.user || "").trim().toLowerCase(), pw = String(b.password || "");
  const pl = players(), exp = pl.get(user);
  const r = await guard(context, async () => { const eq = same(pw, exp ?? ""); return exp !== undefined && eq; });
  if (r === "locked") return json({ error: "Zu viele Versuche. Bitte 15 Minuten warten." }, 429);
  if (r !== "ok") return json({ error: "Benutzername oder Passwort falsch." }, 401);

  const mine = (await all(getStore("tournaments")))
    .filter((t) => t.players?.includes(user))
    .sort((a, c) => a.when.localeCompare(c.when))
    .map((t) => ({ id: t.id, title: t.title, game: t.game, when: t.when, location: t.location, opponent: t.opponent, notes: t.notes, mates: t.players.filter((p) => p !== user) }));
  return json({ user, tournaments: mine });
};

export const config = { path: "/api/player" };
