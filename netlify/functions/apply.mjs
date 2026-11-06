import { getStore } from "@netlify/blobs";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { render, SITE } from "../lib/mail.mjs";

const ROLES = { finals: "Spieler: The Finals", fortnite: "Spieler: Fortnite", creator: "Content Creator" };
const clean = (v, n = 100) => String(v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, n);
const json = (o, status = 200) => Response.json(o, { status });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let d;
  try { d = await req.json(); } catch { return json({ error: "Ungültige Anfrage." }, 400); }
  if (d.website) return json({ ok: true }); // Honeypot: Bots füllen das Feld aus

  const f = { name: clean(d.name), nick: clean(d.nick), email: clean(d.email, 150), nation: clean(d.nation), discord: clean(d.discord), age: parseInt(d.age, 10), role: ROLES[d.role] };
  const valid = f.name && f.nick && f.nation && f.role && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email) && f.age >= 13 && f.age <= 99 && d.consent === true;
  if (!valid) return json({ error: "Bitte alle Pflichtfelder korrekt ausfüllen (Mindestalter 13)." }, 400);

  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const record = { id, at: new Date().toISOString(), ...f };
  await getStore("applications").setJSON(id, record); // Netlify Blobs

  const rows = [["Name", f.name], ["Ingame-Nick", f.nick], ["E-Mail", f.email], ["Alter", f.age], ["Nation", f.nation], ["Bewerbung als", f.role], ["Discord", f.discord || "–"], ["Eingegangen", new Date(record.at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })]];
  const attachments = [{ filename: `bewerbung-${f.nick.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) || "spieler"}.html`, contentType: "text/html" }];

  const { GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_TO } = process.env;
  const status = { admin: false, confirm: false, error: "" };
  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD fehlen in Netlify");
    const tx = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s/g, "") } });
    const from = `NICO GAMING <${GMAIL_USER}>`;
    const sheet = render({ title: "Neue Bewerbung", intro: `${f.nick} bewirbt sich als ${f.role}.`, rows, cta: { url: `mailto:${f.email}`, text: "ANTWORTEN" }, note: "Automatisch erzeugt von der NICO GAMING Website." });
    const confirm = render({ title: "Bewerbung erhalten", intro: `Hey ${f.nick}, deine Bewerbung ist erfolgreich bei uns eingegangen! Wir melden uns so schnell wie möglich bei dir.`, rows, cta: { url: SITE, text: "ZUR WEBSITE" }, note: "Du erhältst diese E-Mail, weil du dich bei NICO GAMING beworben hast." });
    const [a, c] = await Promise.allSettled([
      tx.sendMail({ from, to: MAIL_TO || GMAIL_USER, replyTo: f.email, subject: `Neue Bewerbung: ${f.nick} (${f.role})`, html: sheet, attachments: [{ ...attachments[0], content: sheet }] }),
      tx.sendMail({ from, to: f.email, subject: "Deine Bewerbung bei NICO GAMING ist eingegangen", html: confirm, attachments: [{ ...attachments[0], filename: "deine-bewerbung.html", content: confirm }] }),
    ]);
    status.admin = a.status === "fulfilled";
    status.confirm = c.status === "fulfilled";
    status.error = [a, c].filter((x) => x.status === "rejected").map((x) => x.reason?.message).join(" | ");
  } catch (err) {
    status.error = err.message;
  }
  if (status.error) console.error("Mailversand fehlgeschlagen:", status.error);
  await getStore("applications").setJSON(id, { ...record, mail: status }); // Mail-Status für die Admin-Seite
  return json({ ok: true, mailed: status.confirm });
};

export const config = { path: "/api/apply" };
