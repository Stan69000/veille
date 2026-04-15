import type { Metadata } from 'next';
import '../globals.css';
import { Sidebar } from '@/components/layout/sidebar';

export const metadata: Metadata = {
  title: 'Veille Platform - Admin',
  description: 'Plateforme professionnelle de veille éditoriale',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50 antialiased">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
