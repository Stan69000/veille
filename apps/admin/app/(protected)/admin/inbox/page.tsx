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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Inbox,
  MoreHorizontal,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  ExternalLink,
  Trash2,
  Archive,
  Tag,
  Filter,
  RefreshCw,
  Eye,
  ArrowRight,
  FileText,
  Users,
} from 'lucide-react';
import { AudienceFilter, AudienceBadge } from '@/components/audience-filter';

const mockInboxItems = [
  {
    id: '1',
    title: 'Nouvelle réglementation sur les données personnelles entre en vigueur',
    source: 'Le Monde',
    publishedAt: '2024-01-15T10:30:00Z',
    severity: 'high',
    score: 0.92,
    read: false,
    audience: ['Entreprises', 'DPO', 'Développeurs'] as string[],
    storyId: null,
  },
  {
    id: '2',
    title: 'Lancement du programme de transition écologique européen',
    source: 'Les Échos',
    publishedAt: '2024-01-15T09:45:00Z',
    severity: 'medium',
    score: 0.78,
    read: false,
    audience: ['Entreprises', 'ONG'] as string[],
    storyId: '1',
  },
  {
    id: '3',
    title: 'Cybersécurité : les nouvelles menaces pour 2024',
    source: '01net',
    publishedAt: '2024-01-15T08:20:00Z',
    severity: 'low',
    score: 0.65,
    read: true,
    audience: ['DSI', 'RSSI', 'Développeurs'] as string[],
    storyId: null,
  },
  {
    id: '4',
    title: 'Interview exclusive : le PDG de TechCorp détaille sa stratégie',
    source: 'Challenges',
    publishedAt: '2024-01-15T07:00:00Z',
    severity: 'info',
    score: 0.45,
    read: true,
    audience: ['Entreprises', 'Cadres'] as string[],
    storyId: null,
  },
];

const severityConfig = {
  info: { label: 'Info', color: 'bg-info-100 text-info-700 border-info-200' },
  low: { label: 'Faible', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  medium: { label: 'Moyen', color: 'bg-warning-100 text-warning-700 border-warning-200' },
  high: { label: 'Élevé', color: 'bg-error-100 text-error-700 border-error-200' },
};

const availableAudiences = [
  { id: 'entreprises', name: 'Entreprises', slug: 'entreprises', count: 4, color: '#3b82f6' },
  { id: 'dpo', name: 'DPO', slug: 'dpo', count: 1, color: '#8b5cf6' },
  { id: 'developpeurs', name: 'Développeurs', slug: 'developpeurs', count: 2, color: '#22c55e' },
  { id: 'dsi', name: 'DSI', slug: 'dsi', count: 1, color: '#06b6d4' },
  { id: 'rssi', name: 'RSSI', slug: 'rssi', count: 1, color: '#ef4444' },
  { id: 'ong', name: 'ONG', slug: 'ong', count: 1, color: '#10b981' },
  { id: 'cadres', name: 'Cadres', slug: 'cadres', count: 1, color: '#f59e0b' },
];

const unreadCount = mockInboxItems.filter((i) => !i.read).length;

export default function InboxPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string>('all');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === mockInboxItems.length) {
      setSelected([]);
    } else {
      setSelected(mockInboxItems.map((i) => i.id));
    }
  };

  const filteredItems = mockInboxItems.filter((item) => {
    if (severity !== 'all' && item.severity !== severity) return false;
    if (selectedAudiences.length > 0 && !selectedAudiences.some(a => 
      item.audience?.some(ia => ia.toLowerCase().replace(/\s+/g, '-') === a || ia.toLowerCase() === a)
    )) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-neutral-500" />
            <h1 className="text-xl font-semibold text-neutral-900">Boîte de réception</h1>
            {unreadCount > 0 && (
              <Badge variant="default" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4 border-b bg-neutral-50 px-6 py-3">
        <Checkbox
          checked={selected.length === filteredItems.length && selected.length > 0}
          onCheckedChange={toggleSelectAll}
          aria-label="Tout sélectionner"
        />
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sévérités</SelectItem>
            <SelectItem value="high">Élevée</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
          </SelectContent>
        </Select>
        <AudienceFilter
          audiences={availableAudiences}
          selectedAudiences={selectedAudiences}
          onChange={setSelectedAudiences}
          className="flex items-center gap-2"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            placeholder="Rechercher dans la boîte..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 border-b bg-primary-50 px-6 py-2">
          <span className="text-sm font-medium text-primary-700">
            {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
          </span>
          <Button size="sm" variant="ghost" className="text-primary-700">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Approuver
          </Button>
          <Button size="sm" variant="ghost" className="text-error-600">
            <XCircle className="mr-1 h-4 w-4" />
            Rejeter
          </Button>
          <Button size="sm" variant="ghost">
            <Archive className="mr-1 h-4 w-4" />
            Archiver
          </Button>
          <Button size="sm" variant="ghost" className="text-error-600">
            <Trash2 className="mr-1 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-neutral-50 ${
                !item.read ? 'bg-white' : 'bg-neutral-50/50'
              }`}
            >
              <Checkbox
                checked={selected.includes(item.id)}
                onCheckedChange={() => toggleSelect(item.id)}
                className="mt-1"
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`font-medium ${!item.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {item.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-400">
                      {(item.score * 100).toFixed(0)}%
                    </span>
                    <Badge
                      variant="outline"
                      className={severityConfig[item.severity].color}
                    >
                      {severityConfig[item.severity].label}
                    </Badge>
                    {item.storyId && (
                      <Badge variant="secondary" size="sm">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Story
                      </Badge>
                    )}
                  </div>
                </div>

                {item.audience && item.audience.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Users className="h-3 w-3 text-neutral-400" />
                    <div className="flex flex-wrap gap-1">
                      {item.audience.slice(0, 3).map((aud) => (
                        <AudienceBadge key={aud} audience={aud} size="sm" />
                      ))}
                      {item.audience.length > 3 && (
                        <Badge variant="secondary" size="sm">
                          +{item.audience.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="ghost">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approuver
                  </Button>
                  <Button size="sm" variant="ghost">
                    <BookOpen className="mr-1 h-4 w-4" />
                    Ajouter à une story
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Tag className="mr-1 h-4 w-4" />
                    Catégoriser
                  </Button>
                  <Button size="sm" variant="ghost" className="ml-auto">
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Source
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Marquer comme lu
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Archiver
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-error-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
