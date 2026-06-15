import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClawdPress',
  description: 'An open-source, backend-light CMS that outputs clean, semantic HTML & CSS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
