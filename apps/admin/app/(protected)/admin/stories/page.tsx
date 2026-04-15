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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Send,
  Users,
  FileText,
  Clock,
  RefreshCw,
  ChevronRight,
  X,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const mockStories = [
  {
    id: '1',
    title: 'Crise énergétique en Europe',
    status: 'in_progress',
    editorialStatus: 'DRAFT',
    itemsCount: 12,
    audience: 'GENERAL',
    importanceScore: 0.92,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    summaryShort: 'Analyse de la situation énergétique en Europe...',
    sources: ['Le Monde', 'Les Échos', '01net'],
  },
  {
    id: '2',
    title: 'Réforme des retraites : dernières annonces',
    status: 'ready',
    editorialStatus: 'REVIEW',
    itemsCount: 8,
    audience: 'PROFESSIONNELS',
    importanceScore: 0.88,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    summaryShort: 'Le gouvernement a présenté les grandes lignes...',
    sources: ['Le Figaro', 'Les Échos'],
  },
  {
    id: '3',
    title: 'Intelligence artificielle et emploi : état des lieux',
    status: 'published',
    editorialStatus: 'PUBLISHED',
    itemsCount: 15,
    audience: 'ENTREPRISES',
    importanceScore: 0.85,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    summaryShort: 'L\'IA transforme le marché du travail...',
    sources: ['01net', 'Le Monde', 'Challenges'],
  },
  {
    id: '4',
    title: 'Transitions écologique : bilan 2023',
    status: 'published',
    editorialStatus: 'PUBLISHED',
    itemsCount: 20,
    audience: 'GENERAL',
    importanceScore: 0.78,
    createdAt: '2024-01-02T11:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    summaryShort: 'Retour sur les avancées et les défis...',
    sources: ['Le Monde', 'Les Échos'],
  },
];

const statusConfig = {
  draft: { label: 'Brouillon', variant: 'secondary' as const },
  in_progress: { label: 'En cours', variant: 'warning' as const },
  ready: { label: 'Prêt', variant: 'success' as const },
  published: { label: 'Publié', variant: 'default' as const },
};

const editorialStatusConfig = {
  DRAFT: { label: 'Brouillon', color: 'text-neutral-600' },
  REVIEW: { label: 'En revue', color: 'text-warning-600' },
  APPROVED: { label: 'Approuvé', color: 'text-success-600' },
  PUBLISHED: { label: 'Publié', color: 'text-primary-600' },
};

const audienceConfig: Record<string, { label: string; color: string }> = {
  GENERAL: { label: 'Grand public', color: 'bg-blue-100 text-blue-700' },
  PROFESSIONNELS: { label: 'Professionnels', color: 'bg-purple-100 text-purple-700' },
  ENTREPRISES: { label: 'Entreprises', color: 'bg-green-100 text-green-700' },
  ASSOCIATIONS: { label: 'Associations', color: 'bg-orange-100 text-orange-700' },
  INSTITUTIONS: { label: 'Institutions', color: 'bg-neutral-100 text-neutral-700' },
};

export default function StoriesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [audience, setAudience] = useState<string>('all');
  const [selectedStory, setSelectedStory] = useState<typeof mockStories[0] | null>(null);

  const filteredStories = mockStories.filter((story) => {
    if (status !== 'all' && story.status !== status) return false;
    if (audience !== 'all' && story.audience !== audience) return false;
    if (search && !story.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Stories</h1>
            <p className="text-sm text-neutral-500">
              {filteredStories.length} story{filteredStories.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle story
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b bg-neutral-50 px-6 py-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            placeholder="Rechercher une story..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            Statut
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="ready">Prêt</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>
        <Select value={audience} onValueChange={setAudience}>
          <SelectTrigger className="w-[180px]">
            Audience
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les audiences</SelectItem>
            <SelectItem value="GENERAL">Grand public</SelectItem>
            <SelectItem value="PROFESSIONNELS">Professionnels</SelectItem>
            <SelectItem value="ENTREPRISES">Entreprises</SelectItem>
            <SelectItem value="ASSOCIATIONS">Associations</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <Card
              key={story.id}
              className="group cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedStory(story)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-neutral-400" />
                      <Badge variant={statusConfig[story.status as keyof typeof statusConfig].variant} size="sm">
                        {statusConfig[story.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-neutral-900 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">
                      {story.summaryShort}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className={audienceConfig[story.audience]?.color}>
                    <Users className="mr-1 h-3 w-3" />
                    {audienceConfig[story.audience]?.label}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    <FileText className="mr-1 h-3 w-3" />
                    {story.itemsCount} articles
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(story.updatedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          editorialStatusConfig[story.editorialStatus as keyof typeof editorialStatusConfig]?.color.includes('success')
                            ? 'bg-success-500'
                            : editorialStatusConfig[story.editorialStatus as keyof typeof editorialStatusConfig]?.color.includes('warning')
                            ? 'bg-warning-500'
                            : 'bg-neutral-300'
                        }`}
                      />
                      {editorialStatusConfig[story.editorialStatus as keyof typeof editorialStatusConfig]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{ width: `${story.importanceScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-neutral-400">
                      {(story.importanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {story.sources.slice(0, 3).map((source) => (
                    <span
                      key={source}
                      className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600"
                    >
                      {source}
                    </span>
                  ))}
                  {story.sources.length > 3 && (
                    <span className="text-xs text-neutral-400">
                      +{story.sources.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedStory?.title}</DialogTitle>
                <DialogDescription className="mt-2 flex items-center gap-3">
                  <Badge variant={statusConfig[selectedStory?.status as keyof typeof statusConfig]?.variant}>
                    {statusConfig[selectedStory?.status as keyof typeof statusConfig]?.label}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {selectedStory?.itemsCount} articles
                  </span>
                </DialogDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir le détail
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Gérer les articles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approuver
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Send className="mr-2 h-4 w-4" />
                    Publier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-500">Résumé</h4>
              <p className="text-neutral-900">{selectedStory?.summaryShort}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-500">Audience</h4>
                <Badge variant="outline" className={audienceConfig[selectedStory?.audience || '']?.color}>
                  {audienceConfig[selectedStory?.audience || '']?.label}
                </Badge>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-500">Score d&apos;importance</h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${(selectedStory?.importanceScore ?? 0) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium">
                    {((selectedStory?.importanceScore ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-500">Sources</h4>
              <div className="flex flex-wrap gap-2">
                {selectedStory?.sources.map((source) => (
                  <Badge key={source} variant="secondary">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Créée le</span>
                <p className="font-medium">
                  {selectedStory && new Date(selectedStory.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Dernière mise à jour</span>
                <p className="font-medium">
                  {selectedStory && new Date(selectedStory.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedStory(null)}>
              Fermer
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gérer les articles
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
