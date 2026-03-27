import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'FoodFactScanner – AI Baby Food Safety Scanner',
  description: 'Scan baby food ingredients instantly. Our AI detects toxic chemicals, heavy metals, and harmful additives so you can feed your baby with confidence.',
  keywords: ['baby food safety', 'toxic chemicals baby food', 'baby food scanner', 'heavy metals baby food', 'organic baby food', 'AI food scanner'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FoodFactScanner',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-MW7WLZ9NW7"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MW7WLZ9NW7');
          `
        }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
