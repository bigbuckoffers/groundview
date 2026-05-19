import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GroundView — Invest From Anywhere',
  description: 'Boots-on-ground photos, AI photo enhancement, and repair estimates for real estate investors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
