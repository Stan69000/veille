'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Layers,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Trash2,
  MoreHorizontal,
  Play,
  Pause,
  Eye,
  RefreshCw,
  Globe,
  Mail,
  Rss,
  FileText,
  Users,
  Settings,
} from 'lucide-react';

const mockTargets = [
  {
    id: '1',
    name: 'Site web public',
    type: 'RSS',
    status: 'active',
    lastPublishedAt: '2024-01-15T14:30:00Z',
    storiesCount: 24,
    url: 'https://exemple.fr/feed.xml',
  },
  {
    id: '2',
    name: 'Newsletter abonnés',
    type: 'EMAIL',
    status: 'active',
    lastPublishedAt: '2024-01-15T08:00:00Z',
    storiesCount: 8,
    url: null,
  },
  {
    id: '3',
    name: 'Flux interne',
    type: 'API',
    status: 'paused',
    lastPublishedAt: '2024-01-14T16:00:00Z',
    storiesCount: 15,
    url: 'https://api.exemple.fr/v1/stories',
  },
];

const mockStoriesToPublish = [
  {
    id: '1',
    title: 'Crise énergétique en Europe',
    status: 'ready',
    itemsCount: 12,
    updatedAt: '2024-01-15T14:30:00Z',
    selected: false,
  },
  {
    id: '2',
    title: 'Réforme des retraites : les dernières annonces',
    status: 'ready',
    itemsCount: 8,
    updatedAt: '2024-01-15T12:00:00Z',
    selected: true,
  },
  {
    id: '3',
    title: 'Intelligence artificielle et emploi',
    status: 'ready',
    itemsCount: 15,
    updatedAt: '2024-01-15T10:00:00Z',
    selected: false,
  },
];

const mockPublishedStories = [
  {
    id: '4',
    title: 'Transition écologique : bilan 2023',
    publishedAt: '2024-01-14T16:00:00Z',
    target: 'Site web public',
    views: 1247,
  },
  {
    id: '5',
    title: 'Cybersécurité : les nouvelles menaces',
    publishedAt: '2024-01-14T08:00:00Z',
    target: 'Newsletter abonnés',
    views: 892,
  },
];

const targetTypeConfig = {
  RSS: { icon: Rss, label: 'RSS', color: 'text-orange-500' },
  EMAIL: { icon: Mail, label: 'Email', color: 'text-blue-500' },
  API: { icon: Globe, label: 'API', color: 'text-green-500' },
};

const statusConfig = {
  active: { label: 'Actif', variant: 'success' as const },
  paused: { label: 'En pause', variant: 'secondary' as const },
  error: { label: 'Erreur', variant: 'destructive' as const },
};

export default function PublishPage() {
  const [search, setSearch] = useState('');
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Publication</h1>
        <p className="mt-1 text-neutral-500">
          Publiez vos stories sur vos différentes cibles
        </p>
      </div>

      <Tabs defaultValue="publish" className="space-y-6">
        <TabsList>
          <TabsTrigger value="publish" className="gap-2">
            <Send className="h-4 w-4" />
            Publier
          </TabsTrigger>
          <TabsTrigger value="targets" className="gap-2">
            <Layers className="h-4 w-4" />
            Cibles
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publish" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stories prêtes à publier</CardTitle>
                    <CardDescription>
                      Sélectionnez les stories à publier
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Story</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Mise à jour</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStoriesToPublish.map((story) => {
                      const TypeIcon = Layers;
                      return (
                        <TableRow key={story.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={story.selected}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-neutral-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <TypeIcon className="h-4 w-4 text-neutral-400" />
                              <span className="font-medium">{story.title}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-neutral-500">
                            {story.itemsCount} articles
                          </TableCell>
                          <TableCell className="text-neutral-500">
                            {new Date(story.updatedAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">
                              <Eye className="mr-1 h-4 w-4" />
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cible de publication</CardTitle>
                <CardDescription>
                  Choisissez où publier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTargets
                      .filter((t) => t.status === 'active')
                      .map((target) => {
                        const TypeIcon = targetTypeConfig[target.type as keyof typeof targetTypeConfig].icon;
                        return (
                          <SelectItem key={target.id} value={target.id}>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4" />
                              {target.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>

                <div className="rounded-lg border bg-neutral-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                    Prêt à publier
                  </div>
                  <p className="mt-2 text-sm">
                    {mockStoriesToPublish.filter((s) => s.selected).length} story(ies) sélectionnée(s)
                  </p>
                </div>

                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Publier maintenant
                </Button>

                <Button variant="outline" className="w-full">
                  <Clock className="mr-2 h-4 w-4" />
                  Programmer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cibles de publication</h2>
            <Dialog open={isAddTargetOpen} onOpenChange={setIsAddTargetOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle cible
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une cible</DialogTitle>
                  <DialogDescription>
                    Configurez une nouvelle cible de publication
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input placeholder="Mon site web" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select defaultValue="RSS">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSS">Flux RSS</SelectItem>
                        <SelectItem value="EMAIL">Email / Newsletter</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL (optionnel)</label>
                    <Input placeholder="https://..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTargetOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={() => setIsAddTargetOpen(false)}>
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockTargets.map((target) => {
              const TypeIcon = targetTypeConfig[target.type as keyof typeof targetTypeConfig].icon;
              const TypeColor = targetTypeConfig[target.type as keyof typeof targetTypeConfig].color;
              return (
                <Card key={target.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg bg-neutral-100 p-2 ${TypeColor}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{target.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <TypeIcon className="h-3 w-3" />
                            {targetTypeConfig[target.type as keyof typeof targetTypeConfig].label}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={statusConfig[target.status as keyof typeof statusConfig].variant} size="sm">
                        {statusConfig[target.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Stories publiées</span>
                        <span className="font-medium">{target.storiesCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Dernière publication</span>
                        <span className="font-medium">
                          {new Date(target.lastPublishedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {target.url && (
                        <a
                          href={target.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Voir le flux
                        </a>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="mr-1 h-4 w-4" />
                        Configurer
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des publications</CardTitle>
              <CardDescription>
                Liste des stories publiées récemment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Story</TableHead>
                    <TableHead>Cible</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Vues</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPublishedStories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-neutral-400" />
                          <span className="font-medium">{story.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-500">{story.target}</TableCell>
                      <TableCell className="text-neutral-500">
                        {new Date(story.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">{story.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
