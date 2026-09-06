import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Prutah — Silver Value Converter',
  description: 'See the current value of 0.025 grams of pure silver — a shaveh prutah — in your currency.',
  openGraph: {
    title: 'Prutah — Silver Value Converter',
    description: 'Know the value of a shaveh prutah.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prutah — Silver Value Converter',
    description: 'Know the value of a shaveh prutah.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
