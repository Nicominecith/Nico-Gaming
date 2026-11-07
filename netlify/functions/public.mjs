import { getStore } from "@netlify/blobs";
import { all } from "../lib/auth.mjs";

/** Öffentliche Daten für die Startseite: News, Turnierkalender, Spieler-Stats, Clips.
 *  Bewusst NICHT enthalten: Turnier-Hinweise (Lobby-Codes o. Ä.), nicht freigegebene Spieler/Turniere. */
export default async () => {
  const [news, tours, clips, profs, av] = await Promise.all([
    all(getStore("news")), all(getStore("tournaments")), all(getStore("clips")), all(getStore("profiles")),
    getStore("avatars").list().then((r) => new Set(r.blobs.map((b) => b.key))),
  ]);
  const profiles = profs.filter((p) => p.pub).sort((a, b) => a.user.localeCompare(b.user))
    .map((p) => ({ user: p.user, rank: p.rank || "", role: p.role || "", kd: p.kd || "", avatar: av.has(p.user) }));
  const shown = new Set(profiles.map((p) => p.user));

  const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Berlin" }).slice(0, 16).replace(" ", "T");
  const pubTours = tours.filter((t) => t.pub === true).sort((a, b) => a.when.localeCompare(b.when));
  const past = pubTours.filter((t) => t.when < now).slice(-12), upcoming = pubTours.filter((t) => t.when >= now);
  const tournaments = [...past, ...upcoming].map((t) => ({
    id: t.id, title: t.title, game: t.game, when: t.when, location: t.location, opponent: t.opponent || "",
    result: t.result || "", outcome: t.outcome || "", players: (t.players || []).filter((p) => shown.has(p)),
  }));

  return Response.json({
    news: news.sort((a, b) => (b.pinned === true) - (a.pinned === true) || b.at.localeCompare(a.at)).slice(0, 20)
      .map((n) => ({ id: n.id, at: n.at, title: n.title, body: n.body, pinned: n.pinned === true })),
    tournaments,
    profiles,
    clips: clips.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 24).map((c) => ({ id: c.id, title: c.title, p: c.p, v: c.v })),
  }, { headers: { "cache-control": "public, max-age=30, stale-while-revalidate=120" } });
};

export const config = { path: "/api/public" };
