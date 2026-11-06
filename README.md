# NICO GAMING

Website (`public/`) + Netlify Functions (`netlify/functions/`) + Netlify Blobs + Gmail-Versand mit HTML-Anhang.

## Einmalig: Gmail-App-Passwort
1. Google-Konto -> Sicherheit -> Bestätigung in zwei Schritten aktivieren
2. https://myaccount.google.com/apppasswords -> App-Passwort erstellen (16 Zeichen)
3. Netlify -> Site configuration -> Environment variables:
   `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_TO` (optional), `ADMIN_PASSWORD` (frei wählbar, lang!), `PLAYERS`
   Das Passwort NIE in den Code oder ins Repo schreiben.

## Termux -> GitHub
```bash
pkg update -y && pkg install -y git unzip
termux-setup-storage
git config --global user.name "Nicominecith"
git config --global user.email "nicominecithclips@gmail.com"
cd ~ && git clone https://github.com/Nicominecith/Nico-Gaming.git && cd Nico-Gaming
git rm -q --ignore-unmatch index.html nico.png Nicobild.png googlefef3834f3051c89e.html
unzip -o ~/storage/downloads/Nico-Gaming-update.zip -d .
git add -A && git commit -m "Neue Website, Netlify Blobs, Gmail-Mails" && git push
```
Beim Push: Benutzername = GitHub-Name, Passwort = Personal Access Token (GitHub -> Settings -> Developer settings -> Tokens, Recht `repo`).
Netlify deployt danach automatisch (Repo mit Netlify verbunden, Build-Einstellungen kommen aus `netlify.toml`).

## Admin-Seite
`https://nico-gaming.netlify.app/admin` -> Passwort = `ADMIN_PASSWORD`. Zeigt alle Bewerbungen, Löschen möglich. Nach 5 Fehlversuchen 15 Min. gesperrt.

## Spieler-Bereich
`/player` -> Login mit Benutzername + Passwort aus der Netlify-Variable `PLAYERS`, Format `n1co:passwort1,jak:passwort2` (Benutzernamen klein, Passwörter ohne Komma). Neuer Spieler / neues Passwort = Variable ändern + neu deployen.
Turniere trägst du unter `/admin` -> Tab „Turniere" ein und wählst die Spieler aus. Jeder sieht nur seine eigenen Turniere.

## Profilbilder
Spieler ändern ihr Bild unter /player (wird auf 256 px quadratisch verkleinert, in Netlify Blobs gespeichert). Du löschst Bilder unter /admin -> Tab „Spieler".

## E-Mail-Vorschau neu erzeugen
`npm install && npm run mail:preview` -> `emails/nico-gaming-email.html`
