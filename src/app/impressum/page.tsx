import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum – Inbox Detox',
}

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Impressum</h1>
        <p className="text-slate-500 mb-10 text-sm">Angaben gemäß § 5 TMG</p>

        <div className="space-y-8 text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Anbieter</h2>
            <p className="text-sm leading-relaxed">
              {/* TODO: Vollständigen Namen und Adresse eintragen */}
              [Vor- und Nachname]<br />
              [Straße und Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Kontakt</h2>
            <p className="text-sm leading-relaxed">
              E-Mail:{' '}
              <a
                href="mailto:service@papersync.eu"
                className="text-violet-600 hover:underline"
              >
                service@papersync.eu
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)
            </h2>
            <p className="text-sm leading-relaxed">
              {/* TODO: Name und Adresse des Verantwortlichen */}
              [Vor- und Nachname]<br />
              [Anschrift wie oben]
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Datenschutz</h2>
            <p className="text-sm leading-relaxed">
              Inbox Detox speichert keine E-Mail-Inhalte. Beim Login via Google OAuth werden
              ausschließlich Metadaten (Absender, Betreff, Datum) temporär im Arbeitsspeicher
              verarbeitet und nach dem Ende der Sitzung verworfen. Es werden keine Daten an
              Dritte weitergegeben.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              Für die Verarbeitung personenbezogener Daten durch Google gelten die{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline"
              >
                Datenschutzbestimmungen von Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Haftungsausschluss</h2>
            <p className="text-sm leading-relaxed">
              Die App wird als Hilfsmittel bereitgestellt. Für die Korrektheit der
              Newsletter-Erkennung und den Erfolg von Abmelde-Anfragen bei Drittanbietern
              wird keine Haftung übernommen.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
