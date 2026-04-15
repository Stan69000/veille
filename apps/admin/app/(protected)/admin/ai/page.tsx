'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Bot,
  Cpu,
  Key,
  Plus,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Hash,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

const aiModes = [
  {
    value: 'OFF',
    label: 'Désactivé',
    description: 'Aucune fonctionnalité IA activée',
    icon: XCircle,
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100',
  },
  {
    value: 'SUGGEST',
    label: 'Suggestions',
    description: 'L\'IA suggère des actions sans les exécuter',
    icon: Sparkles,
    color: 'text-info-600',
    bgColor: 'bg-info-50',
  },
  {
    value: 'ASSIST',
    label: 'Assisté',
    description: 'L\'IA assiste l\'utilisateur avec des recommandations',
    icon: Brain,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    value: 'AUTO_REVIEW_REQUIRED',
    label: 'Auto + Validation',
    description: 'L\'IA agit automatiquement, validation requise',
    icon: Shield,
    color: 'text-warning-600',
    bgColor: 'bg-warning-50',
  },
  {
    value: 'AUTO',
    label: 'Automatique',
    description: 'L\'IA agit automatiquement sans intervention',
    icon: Zap,
    color: 'text-success-600',
    bgColor: 'bg-success-50',
  },
];

const providers = [
  {
    id: '1',
    name: 'OpenAI',
    model: 'gpt-4-turbo-preview',
    status: 'active',
    requests: 12453,
    errors: 23,
    avgLatency: 1.2,
  },
  {
    id: '2',
    name: 'Anthropic',
    model: 'claude-3-opus',
    status: 'active',
    requests: 8921,
    errors: 12,
    avgLatency: 1.8,
  },
  {
    id: '3',
    name: 'Local (Ollama)',
    model: 'llama3:70b',
    status: 'inactive',
    requests: 0,
    errors: 0,
    avgLatency: 0,
  },
];

const tasks = [
  {
    id: '1',
    name: 'Résumé automatique',
    description: 'Génère un résumé pour chaque article',
    mode: 'ASSIST',
    executions: 12453,
    successRate: 98.5,
    avgDuration: '1.2s',
  },
  {
    id: '2',
    name: 'Détection de doublons',
    description: 'Identifie les articles similaires',
    mode: 'AUTO',
    executions: 8921,
    successRate: 95.2,
    avgDuration: '0.8s',
  },
  {
    id: '3',
    name: 'Classification thématique',
    description: 'Catégorise les articles par thème',
    mode: 'SUGGEST',
    executions: 2341,
    successRate: 92.1,
    avgDuration: '2.1s',
  },
  {
    id: '4',
    name: 'Extraction d\'entités',
    description: 'Identifie les personnes, organisations, lieux',
    mode: 'ASSIST',
    executions: 12453,
    successRate: 94.8,
    avgDuration: '1.5s',
  },
  {
    id: '5',
    name: 'Génération de stories',
    description: 'Crée des regroupements cohérents d\'articles',
    mode: 'AUTO_REVIEW_REQUIRED',
    executions: 456,
    successRate: 89.3,
    avgDuration: '5.2s',
  },
];

const policies = [
  {
    name: 'FREE',
    price: 0,
    requests: 100,
    features: ['Résumé basique', 'Classification simple'],
  },
  {
    name: 'STARTER',
    price: 29,
    requests: 1000,
    features: ['Résumé avancé', 'Détection de doublons', 'Support email'],
  },
  {
    name: 'PRO',
    price: 99,
    requests: 10000,
    features: ['Toutes les fonctionnalités', 'API access', 'Support prioritaire'],
  },
  {
    name: 'ENTERPRISE',
    price: null,
    requests: -1,
    features: ['Limite personnalisée', 'Déploiement on-premise', 'SLA garanti'],
  },
];

export default function AIAdminPage() {
  const [currentMode, setCurrentMode] = useState('ASSIST');
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'OpenAI API', key: 'sk-xxxx...xxxx', provider: 'openai', visible: false },
    { id: '2', name: 'Anthropic API', key: 'sk-ant...xxxx', provider: 'anthropic', visible: false },
  ]);
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false);

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(keys => keys.map(k => k.id === id ? { ...k, visible: !k.visible } : k));
  };

  const maskKey = (key: string) => {
    return key.slice(0, 6) + '...' + key.slice(-4);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
              Intelligence Artificielle
            </h1>
            <p className="mt-1 text-neutral-500">
              Configurez et monitorer les fonctionnalités IA
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAddKeyDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle clé API
            </Button>
            <Button>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>

        <Alert>
          <Brain className="h-4 w-4" />
          <AlertTitle>Mode IA actuel: {aiModes.find(m => m.value === currentMode)?.label}</AlertTitle>
          <AlertDescription>
            {aiModes.find(m => m.value === currentMode)?.description}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Mode de fonctionnement</CardTitle>
              <CardDescription>
                Sélectionnez le niveau d'automatisation de l'IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {aiModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setCurrentMode(mode.value)}
                      className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                        isActive
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className={`mb-2 inline-flex rounded-lg p-2 ${mode.bgColor}`}>
                        <Icon className={`h-5 w-5 ${mode.color}`} />
                      </div>
                      <h4 className="font-semibold">{mode.label}</h4>
                      <p className="mt-1 text-sm text-neutral-500">{mode.description}</p>
                      {isActive && (
                        <div className="absolute -right-2 -top-2">
                          <CheckCircle2 className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-500" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Requêtes ce mois</span>
                <span className="font-semibold">24,567</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Taux de succès</span>
                <span className="font-semibold text-success-600">96.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Latence moyenne</span>
                <span className="font-semibold">1.4s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Coût estimé</span>
                <span className="font-semibold">$127.45</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Clés API
              </CardTitle>
              <CardDescription>
                Gérez vos clés pour les fournisseurs IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                      <Bot className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-sm text-neutral-500">
                        {apiKey.visible ? apiKey.key : maskKey(apiKey.key)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {apiKey.visible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Providers actifs
              </CardTitle>
              <CardDescription>
                Configuration des fournisseurs IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Modèle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requêtes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell className="text-neutral-500">{provider.model}</TableCell>
                      <TableCell>
                        <Badge
                          variant={provider.status === 'active' ? 'success' : 'secondary'}
                        >
                          {provider.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>{provider.requests.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Tâches IA
            </CardTitle>
            <CardDescription>
              Configurez les tâches automatisées par l'IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Exécutions</TableHead>
                  <TableHead>Succès</TableHead>
                  <TableHead>Durée moy.</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell className="text-neutral-500">{task.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {aiModes.find(m => m.value === task.mode)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.executions.toLocaleString()}</TableCell>
                    <TableCell className="text-success-600">{task.successRate}%</TableCell>
                    <TableCell>{task.avgDuration}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Politiques de facturation IA</CardTitle>
            <CardDescription>
              Limites et fonctionnalités par plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Prix/mois</TableHead>
                  <TableHead>Requêtes/mois</TableHead>
                  <TableHead>Fonctionnalités</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.name}>
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell>
                      {policy.price === null ? 'Custom' : `$${policy.price}`}
                    </TableCell>
                    <TableCell>
                      {policy.requests === -1 ? 'Illimité' : policy.requests.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {policy.features.map((feature) => (
                          <Badge key={feature} variant="secondary" size="sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une clé API</DialogTitle>
            <DialogDescription>
              Entrez les détails de votre clé API
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input placeholder="Ma clé API" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                  <SelectItem value="local">Local (Ollama)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Clé API</label>
              <Input type="password" placeholder="sk-..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKeyDialog(false)}>
              Annuler
            </Button>
            <Button>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
