import type { Metadata } from 'next';
import { Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'μRetro',
  description: 'Do a retro with your team, remotely. Mikro-style.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
