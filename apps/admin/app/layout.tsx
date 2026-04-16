import type { Metadata } from 'next';
import './tailwind.generated.css';

export const metadata: Metadata = {
  title: {
    default: 'Veille Platform',
    template: '%s | Veille Platform',
  },
  description: 'Plateforme professionnelle de veille éditoriale multi-sources',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
