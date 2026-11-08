/** Prüft über die Twitch-API, ob der Kanal live ist UND in einer erlaubten Kategorie streamt.
 *  Env: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET (Pflicht), TWITCH_CHANNEL (Standard nicominecith_ttv),
 *       LIVE_CATEGORIES (Standard "the finals,events,irl,just chatting,travel & outdoors" – Teilstring-Vergleich, Groß-/Kleinschreibung egal) */
let token = { v: "", exp: 0 }, cache = { t: 0, v: null };

async function appToken(id, secret, force) {
  if (!force && token.v && Date.now() < token.exp) return token.v;
  const r = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials" }),
  });
  if (!r.ok) throw new Error("Twitch-Token: HTTP " + r.status);
  const j = await r.json();
  token = { v: j.access_token, exp: Date.now() + (j.expires_in - 300) * 1000 };
  return token.v;
}

async function stream(id, secret, channel, retry = true) {
  const r = await fetch("https://api.twitch.tv/helix/streams?user_login=" + encodeURIComponent(channel), {
    headers: { "client-id": id, authorization: "Bearer " + (await appToken(id, secret, !retry)) },
  });
  if (r.status === 401 && retry) return stream(id, secret, channel, false);
  if (!r.ok) throw new Error("Twitch-API: HTTP " + r.status);
  return (await r.json()).data?.[0] || null;
}

const out = (o) => Response.json(o, { headers: { "cache-control": "public, max-age=30" } });

export default async () => {
  const id = process.env.TWITCH_CLIENT_ID, secret = process.env.TWITCH_CLIENT_SECRET;
  const channel = (process.env.TWITCH_CHANNEL || "nicominecith_ttv").trim().toLowerCase();
  if (!id || !secret) return out({ configured: false, show: false, channel });
  if (cache.v && Date.now() - cache.t < 45000) return out(cache.v);
  try {
    const s = await stream(id, secret, channel);
    const cats = (process.env.LIVE_CATEGORIES || "the finals,events,irl,just chatting,travel & outdoors").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
    const game = s?.game_name || "";
    const v = { configured: true, channel, live: !!s && s.type === "live", game, title: s?.title || "", show: !!s && s.type === "live" && cats.some((c) => game.toLowerCase().includes(c)) };
    cache = { t: Date.now(), v };
    return out(v);
  } catch (e) {
    console.error("Live-Check fehlgeschlagen:", e.message);
    return Response.json({ configured: true, show: false, error: true, channel }, { headers: { "cache-control": "no-store" } });
  }
};

export const config = { path: "/api/live" };
