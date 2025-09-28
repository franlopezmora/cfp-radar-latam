import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CFP Radar LATAM - Call for Papers y Eventos Tech',
  description: 'Radar de Call for Papers y eventos tech en Latinoamérica. Encuentra oportunidades para presentar en conferencias, meetups y eventos de tecnología.',
  keywords: ['CFP', 'Call for Papers', 'eventos tech', 'conferencias', 'meetups', 'Latinoamérica', 'LATAM', 'tecnología'],
  authors: [{ name: 'CFP Radar LATAM' }],
  openGraph: {
    type: 'website',
    url: 'https://cfp-radar-latam.vercel.app/',
    title: 'CFP Radar LATAM - Call for Papers y Eventos Tech',
    description: 'Encuentra Call for Papers y eventos tech en Latinoamérica. Filtra por país, ciudad, formato y tracks.',
    images: ['https://cfp-radar-latam.vercel.app/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CFP Radar LATAM - Call for Papers y Eventos Tech',
    description: 'Encuentra Call for Papers y eventos tech en Latinoamérica. Filtra por país, ciudad, formato y tracks.',
    images: ['https://cfp-radar-latam.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
