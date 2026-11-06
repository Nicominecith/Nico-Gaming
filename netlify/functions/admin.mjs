import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { guard, players, same, json, all } from "../lib/auth.mjs";

const clean = (v, n = 200) => String(v ?? "").replace(/[\r\t]+/g, " ").trim().slice(0, n);

export default async (req, context) => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return json({ error: "ADMIN_PASSWORD fehlt in Netlify (Environment variables)." }, 500);
  const given = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  const r = await guard(context, async () => same(given, pw));
  if (r === "locked") return json({ error: "Zu viele Versuche. Bitte 15 Minuten warten." }, 429);
  if (r !== "ok") return json({ error: "Falsches Passwort." }, 401);

  const apps = getStore("applications"), tours = getStore("tournaments");

  if (req.method === "DELETE") {
    const q = new URL(req.url).searchParams, id = q.get("id");
    if (id) await ({ tournament: tours, avatar: getStore("avatars") }[q.get("kind")] || apps).delete(id);
    return json({ ok: true });
  }
  if (req.method === "POST") {
    const d = await req.json().catch(() => ({}));
    const valid = players();
    const sel = (Array.isArray(d.players) ? d.players : []).map((x) => String(x).toLowerCase()).filter((x) => valid.has(x));
    const t = { id: `${Date.now()}-${randomUUID().slice(0, 6)}`, title: clean(d.title, 100), game: clean(d.game, 40), when: clean(d.when, 16), location: clean(d.location), opponent: clean(d.opponent, 100), notes: clean(d.notes, 500), players: sel };
    if (!t.title || !t.location || !sel.length || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(t.when)) return json({ error: "Titel, Datum, Ort und mindestens ein Spieler sind Pflicht." }, 400);
    await tours.setJSON(t.id, t);
    return json({ ok: true });
  }
  const pl = [...players().keys()], av = getStore("avatars");
  const avatars = Object.fromEntries((await Promise.all(pl.map(async (u) => [u, await av.get(u)]))).filter(([, v]) => v));
  return json({
    applications: (await all(apps)).sort((a, b) => b.at.localeCompare(a.at)),
    tournaments: (await all(tours)).sort((a, b) => a.when.localeCompare(b.when)),
    players: pl,
    avatars,
  });
};

export const config = { path: "/api/admin" };
