import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  BookOpen,
  Rss,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Plus,
  ArrowRight,
} from 'lucide-react';

const stats = [
  {
    title: 'Articles en attente',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Inbox,
    color: 'text-warning-600',
    bgColor: 'bg-warning-50',
  },
  {
    title: 'Stories actives',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: BookOpen,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    title: 'Sources actives',
    value: '15',
    change: '3 en erreur',
    trend: 'neutral',
    icon: Rss,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-50',
  },
  {
    title: 'Publiés ce mois',
    value: '47',
    change: '+23%',
    trend: 'up',
    icon: CheckCircle2,
    color: 'text-success-600',
    bgColor: 'bg-success-50',
  },
];

const recentItems = [
  {
    id: '1',
    title: 'Nouvelle réglementation sur les données personnelles',
    source: 'Le Monde',
    time: 'il y a 5 min',
    severity: 'high',
  },
  {
    id: '2',
    title: 'Lancement du programme de transition écologique',
    source: 'Les Échos',
    time: 'il y a 12 min',
    severity: 'medium',
  },
  {
    id: '3',
    title: 'Reportage sur les enjeux de la cybersécurité',
    source: '01net',
    time: 'il y a 25 min',
    severity: 'low',
  },
  {
    id: '4',
    title: 'Interview exclusive du PDG de TechCorp',
    source: 'Challenges',
    time: 'il y a 1h',
    severity: 'info',
  },
];

const storiesInProgress = [
  {
    id: '1',
    title: 'Crise énergétique en Europe',
    items: 12,
    status: 'in_progress',
  },
  {
    id: '2',
    title: 'Réforme des retraites',
    items: 8,
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'Intelligence artificielle et emploi',
    items: 15,
    status: 'ready',
  },
];

const severityConfig = {
  info: { label: 'Info', variant: 'info' as const },
  low: { label: 'Faible', variant: 'infoOutline' as const },
  medium: { label: 'Moyen', variant: 'warningOutline' as const },
  high: { label: 'Élevé', variant: 'errorOutline' as const },
  critical: { label: 'Critique', variant: 'destructive' as const },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-neutral-500">
              Vue d&apos;ensemble de votre veille éditoriale
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle source
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle story
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Mode V1 lean:</strong> seules les fonctionnalités cœur sont actives
          (sources RSS, items, stories, publication JSON). Les modules marqués
          <span className="mx-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Bientôt</span>
          restent visibles mais non disponibles.
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs">
                      {stat.trend === 'up' && (
                        <TrendingUp className="h-3 w-3 text-success-600" />
                      )}
                      <span
                        className={
                          stat.trend === 'up' ? 'text-success-600' : 'text-neutral-500'
                        }
                      >
                        {stat.change}
                      </span>
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Derniers articles</CardTitle>
                <CardDescription>
                  Articles récemment détectés
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-neutral-900 line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant={severityConfig[item.severity].variant} size="sm">
                      {severityConfig[item.severity].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Stories en cours</CardTitle>
                <CardDescription>
                  Consolidation en cours de traitement
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storiesInProgress.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-neutral-900">{story.title}</p>
                      <p className="text-sm text-neutral-500">
                        {story.items} articles regroupés
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          story.status === 'ready' ? 'success' : 'secondary'
                        }
                        size="sm"
                      >
                        {story.status === 'ready' ? 'Prêt' : 'En cours'}
                      </Badge>
                      <Button variant="ghost" size="icon-sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning-500" />
                Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-warning-50 p-3">
                  <XCircle className="h-4 w-4 text-warning-600" />
                  <span className="text-sm">3 sources en erreur</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-error-50 p-3">
                  <AlertCircle className="h-4 w-4 text-error-600" />
                  <span className="text-sm">5 articles en quarantaine</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">
                    Taux de couverture
                  </span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: '78%' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">
                    Précision du clustering
                  </span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-success-500"
                    style={{ width: '92%' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-info-500" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  <span>12 articles approuvés</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  <span>3 stories publiées</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <XCircle className="h-4 w-4 text-error-500" />
                  <span>2 articles rejetés</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
