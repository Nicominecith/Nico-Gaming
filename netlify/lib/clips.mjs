/** Erkennt YouTube- und Twitch-Links und liefert { p, v } (Anbieter + Video-/Clip-ID) oder null.
 *  p: "yt" = YouTube, "tc" = Twitch-Clip, "tv" = Twitch-Video */
export function parseClip(raw) {
  let u;
  try { u = new URL(String(raw ?? "").trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const h = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
  const seg = u.pathname.split("/").filter(Boolean);
  const yt = /^[A-Za-z0-9_-]{11}$/, slug = /^[A-Za-z0-9_-]{5,100}$/;

  if (h === "youtu.be" && yt.test(seg[0] || "")) return { p: "yt", v: seg[0] };
  if (h === "youtube.com" || h === "youtube-nocookie.com") {
    const v = u.searchParams.get("v");
    if (v && yt.test(v)) return { p: "yt", v };
    if (["shorts", "embed", "live"].includes(seg[0]) && yt.test(seg[1] || "")) return { p: "yt", v: seg[1] };
  }
  if (h === "clips.twitch.tv" && slug.test(seg[0] || "")) return { p: "tc", v: seg[0] };
  if (h === "twitch.tv") {
    const i = seg.indexOf("clip");
    if (i > 0 && slug.test(seg[i + 1] || "")) return { p: "tc", v: seg[i + 1] };
    if (seg[0] === "videos" && /^\d{4,15}$/.test(seg[1] || "")) return { p: "tv", v: seg[1] };
  }
  return null;
}
