# 🧹 Inbox Detox

Newsletter-Erkennung und One-Click-Abmeldung für Gmail.

## Features

- **Gmail OAuth Login** — Sicherer Login via Google, kein Passwort gespeichert
- **Automatische Erkennung** — Analysiert 500–2000 E-Mails auf Newsletter-Eigenschaften
- **Confidence Score** — 0–100% Bewertung, ob ein Absender ein Newsletter ist
- **One-Click Unsubscribe** — HTTP oder mailto-basierte Abmeldung
- **Batch Abmeldung** — Alle sicheren Newsletter mit einem Klick abmelden
- **Inbox Health Score** — Visualisierung des Postfach-Zustands
- **Datenschutz-first** — Keine E-Mails gespeichert, nur Metadaten im Speicher

## Setup

### 1. Voraussetzungen

- Node.js 18+
- Google Cloud Projekt mit aktivierter Gmail API

### 2. Google OAuth einrichten

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. Neues Projekt erstellen oder bestehendes wählen
3. **APIs & Services → Library** → "Gmail API" aktivieren
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Client ID und Secret kopieren

### 3. Umgebungsvariablen

```bash
cp .env.example .env.local
```

`.env.local` befüllen:

```env
GOOGLE_CLIENT_ID=deine-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dein-client-secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### 4. Installation & Start

```bash
cd inbox-detox
npm install
npm run dev
```

App öffnen: [http://localhost:3000](http://localhost:3000)

## OAuth Scopes

Die App fordert folgende Gmail-Berechtigungen an:

| Scope | Zweck |
|-------|-------|
| `gmail.readonly` | E-Mail-Header lesen |
| `gmail.send` | Abmelde-E-Mails senden |

**Keine E-Mails werden gespeichert.** Alles bleibt im Session-Speicher.

## Newsletter-Erkennungslogik

| Kriterium | Punkte |
|-----------|--------|
| List-Unsubscribe Header (RFC 2369) | +45 |
| Bekannter E-Mail-Marketing-Dienst (Mailchimp, Klaviyo, etc.) | +20 |
| 5+ E-Mails vom gleichen Absender | +15 |
| Newsletter-Keywords in Betreffzeilen | +12 |
| No-Reply oder automatisierte Adresse | +8 |
| 3–4 E-Mails vom Absender | +8 |

Schwellenwert für Anzeige: **≥ 20 Punkte**

## Abmelde-Methoden

1. **HTTP** (bevorzugt) — GET/POST Request an Unsubscribe-URL
2. **One-Click** (RFC 8058) — POST mit `List-Unsubscribe: One-Click`
3. **mailto** — E-Mail an Unsubscribe-Adresse senden
4. **Manuell** — Link zur Website des Absenders

## Tech Stack

- **Next.js 14** — App Router, API Routes, SSE Streaming
- **NextAuth.js** — Google OAuth
- **Google APIs** — Gmail API (googleapis npm)
- **Tailwind CSS** — Styling
- **TypeScript** — Typ-Sicherheit

## Produktions-Deployment

```bash
npm run build
npm start
```

Für Vercel:
```bash
vercel deploy
```

`NEXTAUTH_URL` auf die produktive Domain setzen.

## Datenschutz

- Keine Datenbank, keine Persistierung
- E-Mail-Inhalte werden **nicht** gespeichert (nur Header-Metadaten)
- Tokens verbleiben in der verschlüsselten NextAuth-Session
- Keine Weitergabe an Dritte
