import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz – Inbox Detox',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-2">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-600 hover:underline"
    >
      {children}
    </a>
  )
}

export default function DatenschutzPage() {
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

        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Datenschutzerklärung</h1>
        <p className="text-slate-500 mb-10 text-sm">Stand: November 2026</p>

        <div className="space-y-8 text-slate-700">
          <Section title="1. Verantwortlicher">
            <p>
              PaperSync UG (haftungsbeschränkt)<br />
              Am alten Bauhof 32<br />
              33719 Bielefeld<br />
              Deutschland
            </p>
            <p>
              Vertreten durch die Geschäftsführer Andreas Hanrath und Tobias Buchta<br />
              E-Mail:{' '}
              <a href="mailto:service@papersync.eu" className="text-violet-600 hover:underline">
                service@papersync.eu
              </a>
            </p>
          </Section>

          <Section title="2. Aufruf dieser Website">
            <p>
              Die Website wird über GitHub Pages (GitHub, Inc., USA) bereitgestellt, die App
              Inbox Detox über Vercel (Vercel Inc., USA). Beim Aufruf verarbeiten diese Anbieter
              technisch bedingt Zugriffsdaten wie IP-Adresse, Zeitpunkt, aufgerufene Seite und
              Browserinformationen, um die Seiten auszuliefern und abzusichern. Die
              Speicherdauer dieser Protokolle richtet sich nach den Vorgaben der Anbieter.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt
              im sicheren und zuverlässigen Betrieb der Website.
            </p>
            <p>
              Schriftarten werden von unserem eigenen Webspace geladen. Wir setzen keine
              Analyse-, Tracking- oder Werbedienste ein.
            </p>
          </Section>

          <Section title="3. Anmeldung mit Google">
            <p>
              Für die Nutzung der App meldest du dich mit deinem Google-Konto an. Dabei erhalten
              wir deinen Namen, deine E-Mail-Adresse und dein Profilbild sowie einen zeitlich
              begrenzten Zugriffsschlüssel (Token) für die von dir freigegebenen
              Gmail-Berechtigungen. Das Profilbild ruft unser
              Server bei Google ab und liefert es an deinen Browser aus.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der von dir
              gewünschten Funktion). Die Nutzung ist freiwillig, ohne die Freigabe kann die App
              jedoch nicht genutzt werden.
            </p>
          </Section>

          <Section title="4. Gmail-Analyse">
            <p>
              Die App fordert die Berechtigungen <code>gmail.readonly</code> und{' '}
              <code>gmail.send</code> an. Für die Analyse ruft sie von bis zu 2.000 deiner
              E-Mails die Kopfzeilen Absender, Betreff, Datum und Abmelde-Angaben
              (List-Unsubscribe) sowie die von Gmail erzeugte Kurzvorschau (Snippet) ab. Die
              Kurzvorschau ist ein kurzer Auszug aus dem E-Mail-Text. Den vollständigen Text und
              Anhänge ruft die App nicht ab.
            </p>
            <p>
              Aus diesen Daten berechnet die App einen Wert, der einschätzt, ob ein Absender ein
              Newsletter ist. Die Einschätzung dient nur als Vorschlag: Abgemeldet wird erst nach
              deinem Klick. Eine automatisierte Entscheidung im Sinne von Art. 22 DSGVO findet
              nicht statt.
            </p>
            <p>
              Die Daten werden nur während der Analyse auf dem Server verarbeitet, an deinen
              Browser übermittelt und nicht in einer Datenbank gespeichert. Wir nutzen sie
              ausschließlich, um dir diese Funktionen bereitzustellen, also nicht für Werbung,
              nicht zum Verkauf und nicht zum Training von KI-Modellen. Rechtsgrundlage ist
              Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </Section>

          <Section title="5. Abmeldung von Newslettern">
            <p>
              Wenn du dich von einem Newsletter abmeldest, gibt es je nach Absender zwei Wege:
              Entweder ruft unser Server die vom Absender angegebene Abmelde-Adresse auf, die
              eine Kennung für dich enthalten kann. Oder die App sendet aus deinem Gmail-Konto
              eine Abmelde-E-Mail an den Absender, die dann auch in deinem Konto liegt und deine
              E-Mail-Adresse zeigt. Empfänger ist jeweils der Absender des Newsletters.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Bei technischen Fehlern können
              Fehlermeldungen vorübergehend in den Server-Protokollen des Hosting-Anbieters
              gespeichert werden.
            </p>
          </Section>

          <Section title="6. Cookies">
            <p>
              Die App setzt nur technisch notwendige Cookies für Anmeldung und Schutz vor
              Missbrauch. Das Sitzungs-Cookie enthält in verschlüsselter Form deine Profildaten
              und den Google-Zugriffsschlüssel und gilt bis zur Abmeldung, längstens etwa eine
              Stunde. Danach meldest du dich neu an. Rechtsgrundlage sind § 25 Abs. 2 Nr. 2 TDDDG und Art. 6 Abs. 1
              lit. b DSGVO. Diese statische Website selbst setzt keine Cookies.
            </p>
          </Section>

          <Section title="7. Kontakt per E-Mail">
            <p>
              Wenn du uns schreibst, verarbeiten wir deine Angaben, um deine Anfrage zu
              bearbeiten, und löschen sie, sobald sie nicht mehr erforderlich sind und keine
              gesetzlichen Aufbewahrungspflichten bestehen. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. b oder lit. f DSGVO.
            </p>
          </Section>

          <Section title="8. Empfänger und Übermittlung in Drittländer">
            <p>
              Empfänger sind die genannten Dienstleister GitHub und Vercel, Google als Anbieter
              der Anmeldung und von Gmail sowie die Newsletter-Absender im Fall einer Abmeldung.
              Dabei können Daten in die USA übermittelt werden. Die Übermittlung stützt sich auf
              den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO),
              soweit der Anbieter danach zertifiziert ist, und andernfalls auf
              Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).
            </p>
            <p>
              Weitere Informationen:{' '}
              <ExternalLink href="https://policies.google.com/privacy">Google</ExternalLink>,{' '}
              <ExternalLink href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">
                GitHub
              </ExternalLink>
              , <ExternalLink href="https://vercel.com/legal/privacy-policy">Vercel</ExternalLink>.
            </p>
          </Section>

          <Section title="9. Zugriff widerrufen">
            <p>
              Du kannst dich jederzeit abmelden und den Zugriff der App in deinem{' '}
              <ExternalLink href="https://myaccount.google.com/permissions">Google-Konto</ExternalLink>{' '}
              widerrufen. Danach kann die App nicht mehr auf dein Gmail-Konto zugreifen. Die
              Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt davon unberührt.
            </p>
          </Section>

          <Section title="10. Deine Rechte">
            <p>
              Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung
              (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit
              (Art. 20). Soweit eine Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht, kannst
              du aus Gründen, die sich aus deiner besonderen Situation ergeben, widersprechen
              (Art. 21). Wende dich dafür an die oben genannte E-Mail-Adresse.
            </p>
            <p>
              Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren
              (Art. 77 DSGVO). Für uns zuständig ist die Landesbeauftragte für Datenschutz und
              Informationsfreiheit Nordrhein-Westfalen.
            </p>
          </Section>
        </div>
      </div>
    </main>
  )
}
