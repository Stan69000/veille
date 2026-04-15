'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Rss,
  MoreHorizontal,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  Edit,
  Eye,
  BarChart3,
} from 'lucide-react';

const mockSources = [
  {
    id: '1',
    name: 'Le Monde',
    url: 'https://www.lemonde.fr/rss/.xml',
    type: 'RSS',
    status: 'active',
    trustLevel: 'TRUSTED',
    itemsCount: 245,
    lastFetchedAt: '2024-01-15T14:30:00Z',
    errorCount: 0,
    fetchFrequency: 'HOURLY',
    failureCount: 0,
  },
  {
    id: '2',
    name: 'Les Échos',
    url: 'https://www.lesechos.fr/rss/feed.xml',
    type: 'RSS',
    status: 'active',
    trustLevel: 'TRUSTED',
    itemsCount: 189,
    lastFetchedAt: '2024-01-15T14:25:00Z',
    errorCount: 0,
    fetchFrequency: 'HOURLY',
    failureCount: 0,
  },
  {
    id: '3',
    name: '01net',
    url: 'https://www.01net.com/rss.xml',
    type: 'RSS',
    status: 'error',
    trustLevel: 'VERIFIED',
    itemsCount: 156,
    lastFetchedAt: '2024-01-15T10:00:00Z',
    errorCount: 3,
    fetchFrequency: 'DAILY',
    failureCount: 3,
  },
  {
    id: '4',
    name: 'Mediapart',
    url: 'https://www.mediapart.fr/articles/feed',
    type: 'RSS',
    status: 'active',
    trustLevel: 'TRUSTED',
    itemsCount: 98,
    lastFetchedAt: '2024-01-15T14:00:00Z',
    errorCount: 0,
    fetchFrequency: 'REAL_TIME',
    failureCount: 0,
  },
  {
    id: '5',
    name: 'Wikipedia Actualités',
    url: 'https://en.wikipedia.org/w/index.php?title=Special:NewestPages&feed=atom',
    type: 'ATOM',
    status: 'paused',
    trustLevel: 'VERIFIED',
    itemsCount: 45,
    lastFetchedAt: '2024-01-14T08:00:00Z',
    errorCount: 0,
    fetchFrequency: 'DAILY',
    failureCount: 0,
  },
];

const statusConfig = {
  active: { label: 'Actif', variant: 'success' as const, icon: CheckCircle2 },
  paused: { label: 'En pause', variant: 'secondary' as const, icon: Pause },
  error: { label: 'En erreur', variant: 'destructive' as const, icon: AlertCircle },
};

const trustLevelConfig = {
  TRUSTED: { label: 'Fiable', color: 'text-success-600' },
  VERIFIED: { label: 'Vérifié', color: 'text-primary-600' },
  UNVERIFIED: { label: 'Non vérifié', color: 'text-neutral-500' },
  BLOCKED: { label: 'Bloqué', color: 'text-error-600' },
};

const frequencyConfig: Record<string, string> = {
  REAL_TIME: 'Temps réel',
  HOURLY: 'Toutes les heures',
  DAILY: 'Une fois par jour',
  WEEKLY: 'Une fois par semaine',
};

export default function SourcesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredSources = mockSources.filter((source) => {
    if (status !== 'all' && source.status !== status) return false;
    if (type !== 'all' && source.type !== type) return false;
    if (search && !source.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = mockSources.filter((s) => s.status === 'active').length;
  const errorCount = mockSources.filter((s) => s.status === 'error').length;

  return (
    <div className="flex h-full flex-col">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Sources</h1>
            <p className="text-sm text-neutral-500">
              {activeCount} actives • {errorCount} en erreur
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ajouter une source</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau flux RSS ou une nouvelle source de veille
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la source</Label>
                  <Input id="name" placeholder="Le Monde" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL du flux</Label>
                  <Input id="url" type="url" placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select defaultValue="RSS">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSS">RSS</SelectItem>
                        <SelectItem value="ATOM">Atom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fréquence</Label>
                    <Select defaultValue="HOURLY">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REAL_TIME">Temps réel</SelectItem>
                        <SelectItem value="HOURLY">Toutes les heures</SelectItem>
                        <SelectItem value="DAILY">Une fois par jour</SelectItem>
                        <SelectItem value="WEEKLY">Une fois par semaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setIsAddOpen(false)}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b bg-neutral-50 px-6 py-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            placeholder="Rechercher une source..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="error">En erreur</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="RSS">RSS</SelectItem>
            <SelectItem value="ATOM">Atom</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tout synchroniser
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Confiance</TableHead>
              <TableHead className="text-right">Articles</TableHead>
              <TableHead>Fréquence</TableHead>
              <TableHead>Dernière sync</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSources.map((source) => {
              const StatusIcon = statusConfig[source.status as keyof typeof statusConfig].icon;
              return (
                <TableRow key={source.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg bg-neutral-100 p-2 ${statusConfig[source.status as keyof typeof statusConfig].variant === 'success' ? 'text-success-600' : statusConfig[source.status as keyof typeof statusConfig].variant === 'destructive' ? 'text-error-600' : 'text-neutral-500'}`}>
                        <Rss className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-medium">{source.name}</span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center text-xs text-primary-600 hover:underline"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          voir
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{source.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusConfig[source.status as keyof typeof statusConfig].variant === 'success' ? 'text-success-500' : statusConfig[source.status as keyof typeof statusConfig].variant === 'destructive' ? 'text-error-500' : 'text-neutral-400'}`} />
                      <Badge variant={statusConfig[source.status as keyof typeof statusConfig].variant}>
                        {statusConfig[source.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={trustLevelConfig[source.trustLevel as keyof typeof trustLevelConfig]?.color}>
                      {trustLevelConfig[source.trustLevel as keyof typeof trustLevelConfig]?.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{source.itemsCount.toLocaleString()}</span>
                    {source.errorCount > 0 && (
                      <Badge variant="destructive" size="sm" className="ml-2">
                        {source.errorCount} erreurs
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-neutral-500">
                      {frequencyConfig[source.fetchFrequency]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-neutral-500">
                      <Clock className="h-3 w-3" />
                      {source.lastFetchedAt && new Date(source.lastFetchedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir le flux
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Statistiques
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Synchroniser maintenant
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {source.status === 'active' ? (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Mettre en pause
                          </DropdownMenuItem>
                        ) : source.status === 'paused' ? (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Reprendre
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-error-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="border-t bg-white px-6 py-3">
        <p className="text-sm text-neutral-500">
          Affichage de {filteredSources.length} sur {mockSources.length} sources
        </p>
      </div>
    </div>
  );
}
