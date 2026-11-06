export const SITE = "https://nico-gaming.netlify.app";
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const F = "'Orbitron','Arial Black',Arial,sans-serif";
const B = "'Barlow Condensed','Arial Narrow',Arial,sans-serif";
const M = "'Courier New',Courier,monospace";

const stat = ([n, l]) => `<td align="center" width="25%" style="padding:6px 4px"><div style="font:900 26px ${F};color:#fff">${n}</div><div style="font:10px ${M};letter-spacing:1px;color:#e60012;padding-top:4px">${l}</div></td>`;
const card = ([i, t, s, p]) => `<td class="s" width="50%" valign="top" style="padding:0 6px"><table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0a0a0f" style="background:#0a0a0f;border:1px solid #2a0a10;border-bottom:2px solid #e60012"><tr><td style="padding:18px"><div style="font-size:26px">${i}</div><div style="font:900 14px ${F};color:#fff;padding-top:8px">${t}</div><div style="font:10px ${M};color:#e60012;padding-top:4px">${s}</div><div style="font:16px/22px ${B};color:#d4d4dc;padding-top:8px">${p}</div></td></tr></table></td>`;
const label = (t) => `<div style="font:12px ${M};letter-spacing:3px;color:#e60012">${t}</div>`;

/** Rendert die E-Mail im Look der Website (dunkel, rot, Orbitron). Alle dynamischen Werte werden escaped. */
export function render({ pre = "", title, intro, rows = [], cta = { url: SITE, text: "ZUR WEBSITE" }, note = "Du erhältst diese E-Mail, weil du dich bei NICO GAMING gemeldet hast." }) {
  const details = rows.length
    ? `<tr><td class="p" bgcolor="#030305" style="background:#030305;padding:0 28px 28px"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;border:1px solid #2a0a10">${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;font:11px ${M};color:#e60012;border-bottom:1px solid #1a1a22;width:36%">${esc(k)}</td><td style="padding:10px 14px;font:19px ${B};color:#fff;border-bottom:1px solid #1a1a22">${esc(v)}</td></tr>`).join("")}</table></td></tr>`
    : "";
  const stats = [["2", "KERNTEAM"], ["2", "GAMES"], ["85%", "PREISGELD"], ["13+", "MIN. ALTER"]].map(stat).join("");
  const cards = [["🎮", "NEUE SPIELER", "THE FINALS &amp; FORTNITE", "Motivierte Spieler, die mit dem Club wachsen wollen."], ["🎬", "CONTENT CREATOR", "CLIPS, STREAMS &amp; PROMO", "Creator, die NICO GAMING mit Content nach vorne bringen."]].map(card).join("");
  const side = "border-left:1px solid #1a1a22;border-right:1px solid #1a1a22";
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(title)}</title>
<style>img{display:block;border:0}a{text-decoration:none}@media(max-width:620px){.c{width:100%!important}.p{padding-left:20px!important;padding-right:20px!important}.s{display:block!important;width:100%!important;padding:0 0 12px!important}}</style></head>
<body style="margin:0;background:#030305"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(pre || intro)}</div>
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#030305" style="background:#030305"><tr><td align="center" style="padding:24px 10px">
<table class="c" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px">
<tr><td class="p" bgcolor="#0a0a0f" style="background:#0a0a0f;border-top:3px solid #e60012;padding:16px 28px"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="52"><img src="${SITE}/nico.png" width="48" height="48" alt="NICO GAMING"></td><td style="font:900 18px ${F};letter-spacing:2px;color:#fff">NICO <span style="color:#e60012">GAMING</span></td><td align="right" style="font:11px ${M};letter-spacing:2px;color:#e60012">// MAIL</td></tr></table></td></tr>
<tr><td class="p" align="center" bgcolor="#030305" style="background:#030305;${side};padding:40px 28px 32px"><img src="${SITE}/nico.png" width="140" height="140" alt="" style="margin:0 auto">
<div style="padding-top:20px">${label("OFFICIAL ESPORTS CLUB")}</div>
<h1 style="margin:10px 0 0;font:900 30px/38px ${F};color:#fff;text-transform:uppercase">${esc(title)}</h1>
<p style="margin:14px auto 0;max-width:460px;font:19px/27px ${B};color:#d4d4dc">${esc(intro)}</p>
<table align="center" cellpadding="0" cellspacing="0" style="margin:26px auto 0"><tr><td bgcolor="#e60012" style="background:#e60012;border-radius:4px"><a href="${esc(cta.url)}" style="display:inline-block;padding:15px 36px;font:900 13px ${F};letter-spacing:2px;color:#fff">${esc(cta.text)}</a></td></tr></table></td></tr>
<tr><td class="p" bgcolor="#0a0a0f" style="background:#0a0a0f;${side};border-top:1px solid #2a0a10;border-bottom:1px solid #2a0a10;padding:20px"><table width="100%" cellpadding="0" cellspacing="0"><tr>${stats}</tr></table></td></tr>
<tr><td class="p" bgcolor="#030305" style="background:#030305;${side};padding:32px 28px 20px">${label("// DEINE DATEN")}</td></tr>${details}
<tr><td class="p" bgcolor="#030305" style="background:#030305;${side};padding:8px 22px 32px"><table width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table></td></tr>
<tr><td class="p" align="center" bgcolor="#0a0a0f" style="background:#0a0a0f;border-top:2px solid #e60012;padding:26px 28px"><a href="${SITE}"><img src="${SITE}/nico.png" width="52" height="52" alt="NICO GAMING" style="margin:0 auto"></a>
<p style="margin:14px 0 0;font:11px/17px ${M};color:#7d7d89">© 2026 NICO GAMING ESPORTS · FOUNDER: NICOMINECITH<br><a href="${SITE}" style="color:#ff2940">Website</a> · <a href="https://www.instagram.com/nicogamingesports" style="color:#ff2940">Instagram</a> · <a href="mailto:nicominecithclips@gmail.com" style="color:#ff2940">Impressum</a></p>
<p style="margin:10px 0 0;font:11px/17px Arial,sans-serif;color:#7d7d89">${esc(note)}</p></td></tr>
</table></td></tr></table></body></html>`;
}
