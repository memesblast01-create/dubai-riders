import type { Metadata } from 'next';
import { Bebas_Neue, Barlow, Barlow_Condensed } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'block',
});

const barlow = Barlow({
  weight: ['100', '200', '300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  weight: ['100', '200', '300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-condensed',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dubai Riders — Elite Delivery Network',
  description: 'The cinematic home of Dubai\'s four greatest delivery fleets. Talabat, Noon, Careem, Keeta — one night, one road.',
  keywords: ['Dubai delivery', 'Talabat', 'Noon', 'Careem', 'Keeta', 'motorcycle delivery'],
  openGraph: {
    title: 'Dubai Riders',
    description: 'Cinematic delivery network experience',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
