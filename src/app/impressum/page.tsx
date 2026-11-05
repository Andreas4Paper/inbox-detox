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
        <p className="text-slate-500 mb-10 text-sm">Angaben gemäß § 5 DDG</p>

        <div className="space-y-8 text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Anbieter</h2>
            <p className="text-sm leading-relaxed">
              PaperSync UG (haftungsbeschränkt)<br />
              Am alten Bauhof 32<br />
              33719 Bielefeld<br />
              Deutschland
            </p>
            <p className="text-sm leading-relaxed mt-2">
              Vertreten durch die Geschäftsführer: Andreas Hanrath, Tobias Buchta
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Registereintrag</h2>
            <p className="text-sm leading-relaxed">
              Amtsgericht Bielefeld, HRB 45686
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Umsatzsteuer-ID</h2>
            <p className="text-sm leading-relaxed">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE367264364
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
              Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)
            </h2>
            <p className="text-sm leading-relaxed">
              Andreas Hanrath, Tobias Buchta<br />
              Am alten Bauhof 32<br />
              33719 Bielefeld
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Datenschutz</h2>
            <p className="text-sm leading-relaxed">
              Informationen zur Verarbeitung personenbezogener Daten findest du in der{' '}
              <Link href="/datenschutz" className="text-violet-600 hover:underline">
                Datenschutzerklärung
              </Link>
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
