import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { guard, players, same, json, all } from "../lib/auth.mjs";
import { parseClip } from "../lib/clips.mjs";

const clean = (v, n = 200) => String(v ?? "").replace(/[\r\t]+/g, " ").trim().slice(0, n);
const text = (v, n) => String(v ?? "").replace(/\r\n?/g, "\n").replace(/\t/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, n);
const newId = () => `${Date.now()}-${randomUUID().slice(0, 6)}`;
const OUTCOMES = ["win", "loss", "draw"];

export default async (req, context) => {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return json({ error: "ADMIN_PASSWORD fehlt in Netlify (Environment variables)." }, 500);
  const given = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  const r = await guard(context, async () => same(given, pw));
  if (r === "locked") return json({ error: "Zu viele Versuche. Bitte 15 Minuten warten." }, 429);
  if (r !== "ok") return json({ error: "Falsches Passwort." }, 401);

  const apps = getStore("applications"), tours = getStore("tournaments"), avatars = getStore("avatars"),
    news = getStore("news"), clips = getStore("clips"), profiles = getStore("profiles");

  if (req.method === "DELETE") {
    const q = new URL(req.url).searchParams, id = q.get("id");
    if (id) await ({ tournament: tours, avatar: avatars, news, clip: clips }[q.get("kind")] || apps).delete(id);
    return json({ ok: true });
  }

  if (req.method === "POST") {
    const d = await req.json().catch(() => ({}));
    const kind = d.kind || "tournament", valid = players();

    if (kind === "news") {
      const n = { id: newId(), at: new Date().toISOString(), title: clean(d.title, 120), body: text(d.body, 2000), pinned: d.pinned === true };
      if (!n.title || !n.body) return json({ error: "Titel und Text sind Pflicht." }, 400);
      await news.setJSON(n.id, n);
      return json({ ok: true });
    }

    if (kind === "clip") {
      const p = parseClip(d.url), title = clean(d.title, 100);
      if (!p) return json({ error: "Link nicht erkannt. Erlaubt: YouTube-Video/Short, Twitch-Clip oder Twitch-Video." }, 400);
      if (!title) return json({ error: "Titel ist Pflicht." }, 400);
      const c = { id: newId(), at: new Date().toISOString(), title, ...p };
      await clips.setJSON(c.id, c);
      return json({ ok: true });
    }

    if (kind === "profile") {
      const user = String(d.user || "").toLowerCase(), kd = String(d.kd ?? "").trim().replace(",", ".");
      if (!valid.has(user)) return json({ error: "Unbekannter Spieler." }, 400);
      if (kd && !/^\d{1,3}(\.\d{1,2})?$/.test(kd)) return json({ error: "K/D muss eine Zahl sein, z. B. 1.85" }, 400);
      await profiles.setJSON(user, { user, rank: clean(d.rank, 40), role: clean(d.role, 40), kd, pub: d.pub === true });
      return json({ ok: true });
    }

    if (kind === "tupdate") {
      const old = await tours.get(String(d.id || ""), { type: "json" });
      if (!old) return json({ error: "Turnier nicht gefunden." }, 404);
      await tours.setJSON(old.id, { ...old, pub: d.pub === true, result: clean(d.result, 40), outcome: OUTCOMES.includes(d.outcome) ? d.outcome : "" });
      return json({ ok: true });
    }

    const sel = (Array.isArray(d.players) ? d.players : []).map((x) => String(x).toLowerCase()).filter((x) => valid.has(x));
    const t = { id: newId(), title: clean(d.title, 100), game: clean(d.game, 40), when: clean(d.when, 16), location: clean(d.location), opponent: clean(d.opponent, 100), notes: clean(d.notes, 500), players: sel, pub: d.pub === true, result: "", outcome: "" };
    if (!t.title || !t.location || !sel.length || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(t.when)) return json({ error: "Titel, Datum, Ort und mindestens ein Spieler sind Pflicht." }, 400);
    await tours.setJSON(t.id, t);
    return json({ ok: true });
  }

  const pl = [...players().keys()];
  const avatarMap = Object.fromEntries((await Promise.all(pl.map(async (u) => [u, await avatars.get(u)]))).filter(([, v]) => v));
  const [applications, tournaments, newsAll, clipsAll, profs] = await Promise.all([all(apps), all(tours), all(news), all(clips), all(profiles)]);
  return json({
    applications: applications.sort((a, b) => b.at.localeCompare(a.at)),
    tournaments: tournaments.sort((a, b) => a.when.localeCompare(b.when)),
    players: pl,
    avatars: avatarMap,
    news: newsAll.sort((a, b) => b.at.localeCompare(a.at)),
    clips: clipsAll.sort((a, b) => b.at.localeCompare(a.at)),
    profiles: Object.fromEntries(profs.map((p) => [p.user, p])),
  });
};

export const config = { path: "/api/admin" };
