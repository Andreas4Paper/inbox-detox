import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

// next/font downloads Inter at build time and serves it from our own origin,
// so visitors never connect to Google Fonts.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Inbox Detox — Clean your email, one click at a time',
  description:
    'Automatically detect newsletters in your Gmail and unsubscribe with one click. Secure, privacy-first, no data stored.',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.svg` },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`h-full ${inter.variable}`}>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
