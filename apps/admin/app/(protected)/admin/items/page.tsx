'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Tag,
  BookOpen,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

const mockItems = [
  {
    id: '1',
    title: 'Nouvelle réglementation sur les données personnelles entre en vigueur',
    source: 'Le Monde',
    publishedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
    severity: 'high',
    score: 0.92,
    category: 'Politique',
    tags: ['RGPD', 'Vie privée'],
  },
  {
    id: '2',
    title: 'Lancement du programme de transition écologique européen',
    source: 'Les Échos',
    publishedAt: '2024-01-15T09:45:00Z',
    status: 'normalized',
    severity: 'medium',
    score: 0.78,
    category: 'Environnement',
    tags: ['Énergie', 'Europe'],
  },
  {
    id: '3',
    title: 'Cybersécurité : les nouvelles menaces pour 2024',
    source: '01net',
    publishedAt: '2024-01-15T08:20:00Z',
    status: 'approved',
    severity: 'low',
    score: 0.65,
    category: 'Technologie',
    tags: ['Sécurité', 'IT'],
  },
  {
    id: '4',
    title: 'Interview exclusive : le PDG de TechCorp détaille sa stratégie',
    source: 'Challenges',
    publishedAt: '2024-01-15T07:00:00Z',
    status: 'rejected',
    severity: 'info',
    score: 0.45,
    category: 'Économie',
    tags: ['Interview', 'Tech'],
  },
  {
    id: '5',
    title: 'Analyse : les tendances du marché de l\'immobilier en 2024',
    source: 'Le Figaro',
    publishedAt: '2024-01-14T16:00:00Z',
    status: 'clustered',
    severity: 'medium',
    score: 0.71,
    category: 'Économie',
    tags: ['Immobilier', 'Finance'],
  },
];

const statusConfig = {
  pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
  normalized: { label: 'Normalisé', variant: 'default' as const, icon: CheckCircle2 },
  approved: { label: 'Approuvé', variant: 'success' as const, icon: CheckCircle2 },
  rejected: { label: 'Rejeté', variant: 'destructive' as const, icon: XCircle },
  clustered: { label: 'Clusterisé', variant: 'default' as const, icon: BookOpen },
};

const severityConfig = {
  info: { label: 'Info', color: 'bg-info-100 text-info-700 border-info-200' },
  low: { label: 'Faible', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  medium: { label: 'Moyen', color: 'bg-warning-100 text-warning-700 border-warning-200' },
  high: { label: 'Élevé', color: 'bg-error-100 text-error-700 border-error-200' },
  critical: { label: 'Critique', color: 'bg-error-200 text-error-800 border-error-300' },
};

type SortField = 'title' | 'source' | 'publishedAt' | 'score';
type SortDirection = 'asc' | 'desc';

export default function ItemsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [severity, setSeverity] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('publishedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewItem, setViewItem] = useState<typeof mockItems[0] | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-neutral-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary-600" />
      : <ArrowDown className="h-4 w-4 text-primary-600" />;
  };

  const filteredItems = mockItems.filter((item) => {
    if (status !== 'all' && item.status !== status) return false;
    if (severity !== 'all' && item.severity !== severity) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Articles</h1>
            <p className="text-sm text-neutral-500">
              {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''}
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b bg-neutral-50 px-6 py-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            placeholder="Rechercher un article..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="normalized">Normalisé</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
            <SelectItem value="clustered">Clusterisé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sévérité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sévérités</SelectItem>
            <SelectItem value="high">Élevée</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead className="w-[400px]">
                <button
                  onClick={() => toggleSort('title')}
                  className="flex items-center gap-1 hover:text-primary-600"
                >
                  Titre
                  <SortIcon field="title" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('source')}
                  className="flex items-center gap-1 hover:text-primary-600"
                >
                  Source
                  <SortIcon field="source" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('publishedAt')}
                  className="flex items-center gap-1 hover:text-primary-600"
                >
                  Date
                  <SortIcon field="publishedAt" />
                </button>
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Sévérité</TableHead>
              <TableHead>
                <button
                  onClick={() => toggleSort('score')}
                  className="flex items-center gap-1 hover:text-primary-600"
                >
                  Score
                  <SortIcon field="score" />
                </button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const StatusIcon = statusConfig[item.status as keyof typeof statusConfig].icon;
              return (
                <TableRow key={item.id} className="group">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium line-clamp-2">{item.title}</span>
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="secondary" size="sm">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-neutral-600">{item.source}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-500">
                      {new Date(item.publishedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {new Date(item.publishedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[item.status as keyof typeof statusConfig].variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig[item.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={severityConfig[item.severity].color}>
                      {severityConfig[item.severity].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${item.score * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-medium">
                        {(item.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewItem(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Source
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approuver
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <XCircle className="mr-2 h-4 w-4" />
                          Rejeter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Ajouter à une story
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="mr-2 h-4 w-4" />
                          Catégoriser
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewItem?.title}</DialogTitle>
            <DialogDescription>
              {viewItem?.source} • {viewItem && new Date(viewItem.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{viewItem?.category}</Badge>
              {viewItem?.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Score</span>
                <p className="font-medium">{(viewItem?.score ?? 0) * 100}%</p>
              </div>
              <div>
                <span className="text-neutral-500">Sévérité</span>
                <p className="font-medium capitalize">{viewItem?.severity}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
