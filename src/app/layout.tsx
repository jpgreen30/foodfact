import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FoodFactScanner – AI Baby Food Safety Scanner',
  description: 'Scan baby food ingredients instantly. Our AI detects toxic chemicals, heavy metals, and harmful additives so you can feed your baby with confidence.',
  keywords: ['baby food safety', 'toxic chemicals baby food', 'baby food scanner', 'heavy metals baby food', 'organic baby food', 'AI food scanner'],
  openGraph: {
    title: 'FoodFactScanner – Protect Your Baby from Hidden Toxins',
    description: 'AI-powered scanner that detects toxic chemicals in baby food instantly. Trusted by 24,000+ parents.',
    type: 'website',
    url: 'https://foodfactscanner.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
