import { writeFileSync } from "node:fs";
import { render, SITE } from "../netlify/lib/mail.mjs";
// Vorschau-Datei erzeugen: npm run mail:preview  -> emails/nico-gaming-email.html
writeFileSync(new URL("./nico-gaming-email.html", import.meta.url), render({
  title: "Werde Teil der Elite",
  intro: "Hey {{Vorname}}, hier sind die neuesten Infos von NICO GAMING – dem Club für The Finals & Fortnite.",
  rows: [["Thema", "Hier steht deine Neuigkeit"], ["Datum", "TT.MM.JJJJ"]],
  cta: { url: `${SITE}/#apply`, text: "⚡ JETZT BEWERBEN" },
}));
