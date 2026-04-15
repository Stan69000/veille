'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'Erreur de configuration du serveur',
    AccessDenied: 'Accès refusé',
    Verification: 'Le lien de vérification a expiré',
    Default: 'Une erreur est survenue lors de la connexion',
  };

  const message = errorMessages[error || ''] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100">
              <AlertCircle className="h-6 w-6 text-error-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Erreur d&apos;authentification
          </CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login">
            <Button className="w-full">
              Retour à la connexion
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
