'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accessibility,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Keyboard,
  Monitor,
  Smartphone,
  Globe,
  Contrast,
  Type,
  Image,
  Volume2,
  MousePointer,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RefreshCw,
  Settings,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

const wcagCriteria = [
  {
    id: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    status: 'passed',
    description: 'All non-text content has text alternatives',
    elements: 24,
    failures: 0,
  },
  {
    id: '1.2.1',
    name: 'Audio-only and Video-only',
    level: 'A',
    status: 'passed',
    description: 'Prerecorded audio-only and video-only content has alternatives',
    elements: 8,
    failures: 0,
  },
  {
    id: '1.3.1',
    name: 'Info and Relationships',
    level: 'A',
    status: 'failed',
    description: 'Information structure is programmatically determinable',
    elements: 156,
    failures: 3,
  },
  {
    id: '1.4.1',
    name: 'Use of Color',
    level: 'A',
    status: 'passed',
    description: 'Color is not the only means of conveying information',
    elements: 42,
    failures: 0,
  },
  {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'AA',
    status: 'warning',
    description: 'Text has sufficient contrast ratio',
    elements: 89,
    failures: 5,
  },
  {
    id: '1.4.4',
    name: 'Resize Text',
    level: 'AA',
    status: 'passed',
    description: 'Text can be resized without loss of functionality',
    elements: 24,
    failures: 0,
  },
  {
    id: '2.1.1',
    name: 'Keyboard',
    level: 'A',
    status: 'failed',
    description: 'All functionality is keyboard accessible',
    elements: 67,
    failures: 2,
  },
  {
    id: '2.1.2',
    name: 'No Keyboard Trap',
    level: 'A',
    status: 'passed',
    description: 'Keyboard focus can be moved away from components',
    elements: 34,
    failures: 0,
  },
  {
    id: '2.4.1',
    name: 'Bypass Blocks',
    level: 'A',
    status: 'passed',
    description: 'Skip navigation links are provided',
    elements: 3,
    failures: 0,
  },
  {
    id: '2.4.2',
    name: 'Page Titled',
    level: 'A',
    status: 'passed',
    description: 'Pages have descriptive titles',
    elements: 12,
    failures: 0,
  },
  {
    id: '2.4.3',
    name: 'Focus Order',
    level: 'A',
    status: 'warning',
    description: 'Focus order is logical and intuitive',
    elements: 45,
    failures: 1,
  },
  {
    id: '2.4.7',
    name: 'Focus Visible',
    level: 'AA',
    status: 'passed',
    description: 'Keyboard focus is visible',
    elements: 67,
    failures: 0,
  },
  {
    id: '3.1.1',
    name: 'Language of Page',
    level: 'A',
    status: 'passed',
    description: 'Page language is identified',
    elements: 12,
    failures: 0,
  },
  {
    id: '3.2.1',
    name: 'On Focus',
    level: 'A',
    status: 'passed',
    description: 'No unexpected context changes on focus',
    elements: 34,
    failures: 0,
  },
  {
    id: '4.1.1',
    name: 'Parsing',
    level: 'A',
    status: 'failed',
    description: 'No duplicate IDs, proper nesting',
    elements: 234,
    failures: 1,
  },
  {
    id: '4.1.2',
    name: 'Name, Role, Value',
    level: 'A',
    status: 'warning',
    description: 'UI components have accessible names and states',
    elements: 89,
    failures: 4,
  },
];

const accessibilityIssues = [
  {
    id: '1',
    type: 'critical',
    title: 'Bouton sans nom accessible',
    element: '<button class="btn-icon">',
    page: '/admin/items',
    line: 234,
    wcag: '4.1.2',
    description: 'Le bouton a une icône mais pas de texte alternatif ou aria-label',
    suggestion: 'Ajouter aria-label="Supprimer l\'élément" ou aria-labelledby référençant un texte visible',
  },
  {
    id: '2',
    type: 'critical',
    title: 'Image décorative sans alt vide',
    element: '<img src="decoration.svg">',
    page: '/admin/dashboard',
    line: 87,
    wcag: '1.1.1',
    description: 'L\'image a un alt attribute qui n\'est pas vide',
    suggestion: 'Changer alt="" pour indiquer que l\'image est décorative',
  },
  {
    id: '3',
    type: 'error',
    title: 'Contraste de couleur insuffisant',
    element: '<span class="text-muted-foreground">',
    page: '/admin/inbox',
    line: 156,
    wcag: '1.4.3',
    description: 'Le rapport de contraste est de 2.8:1, inférieur au minimum AA de 4.5:1',
    suggestion: 'Augmenter l\'opacité ou changer la couleur vers un contraste plus élevé',
  },
  {
    id: '4',
    type: 'error',
    title: 'Tableau sans en-têtes',
    element: '<table>',
    page: '/admin/items',
    line: 312,
    wcag: '1.3.1',
    description: 'Le tableau n\'a pas d\'attributs scope ou headers sur les cellules',
    suggestion: 'Ajouter <th scope="col"> pour les en-têtes de colonne',
  },
  {
    id: '5',
    type: 'warning',
    title: 'Titre de page dupliqué',
    element: '<h1>',
    page: '/admin/settings',
    line: 45,
    wcag: '2.4.2',
    description: 'Le titre de la page est identique à d\'autres pages',
    suggestion: 'Utiliser un titre unique et descriptif',
  },
];

const recentAudits = [
  { date: '2024-01-15 14:32', pages: 12, issues: 8, score: 94 },
  { date: '2024-01-15 10:15', pages: 12, issues: 8, score: 94 },
  { date: '2024-01-14 16:45', pages: 12, issues: 11, score: 91 },
  { date: '2024-01-14 09:20', pages: 10, issues: 15, score: 87 },
  { date: '2024-01-13 11:30', pages: 12, issues: 12, score: 89 },
];

const deviceStats = [
  { device: 'Desktop', users: 1245, percentage: 72, issues: 3 },
  { device: 'Tablet', users: 312, percentage: 18, issues: 5 },
  { device: 'Mobile', users: 167, percentage: 10, issues: 8 },
];

const screenReaderStats = [
  { name: 'NVDA', users: 45, issues: 2 },
  { name: 'JAWS', users: 32, issues: 3 },
  { name: 'VoiceOver', users: 28, issues: 1 },
  { name: 'Other', users: 12, issues: 4 },
];

export default function AccessibilityDashboardPage() {
  const [selectedIssue, setSelectedIssue] = useState<typeof accessibilityIssues[0] | null>(null);

  const statusConfig = {
    passed: { label: 'Conforme', variant: 'success' as const, icon: CheckCircle2 },
    failed: { label: 'Non conforme', variant: 'destructive' as const, icon: XCircle },
    warning: { label: 'Attention', variant: 'warning' as const, icon: AlertTriangle },
  };

  const levelConfig = {
    A: { label: 'A', bg: 'bg-error-100', text: 'text-error-700' },
    AA: { label: 'AA', bg: 'bg-warning-100', text: 'text-warning-700' },
    AAA: { label: 'AAA', bg: 'bg-success-100', text: 'text-success-700' },
  };

  const passedCount = wcagCriteria.filter(c => c.status === 'passed').length;
  const failedCount = wcagCriteria.filter(c => c.status === 'failed').length;
  const warningCount = wcagCriteria.filter(c => c.status === 'warning').length;
  const score = Math.round((passedCount / wcagCriteria.length) * 100);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
              Accessibilité
            </h1>
            <p className="mt-1 text-neutral-500">
              Tableau de bord RGAA et WCAG 2.1
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Relancer l&apos;audit
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        <Alert variant={score >= 90 ? 'default' : 'warning'}>
          <Accessibility className="h-4 w-4" />
          <AlertTitle>Score d&apos;accessibilité: {score}/100</AlertTitle>
          <AlertDescription>
            {score >= 90
              ? 'Excellente conformité WCAG 2.1 Niveau AA'
              : score >= 70
              ? 'Bonne conformité, quelques améliorations nécessaires'
              : 'Conformité insuffisante, des actions sont requises'}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-success-100 p-3">
                  <CheckCircle2 className="h-6 w-6 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Conformes</p>
                  <p className="text-2xl font-bold text-success-600">{passedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-error-100 p-3">
                  <XCircle className="h-6 w-6 text-error-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Non conformes</p>
                  <p className="text-2xl font-bold text-error-600">{failedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-warning-100 p-3">
                  <AlertTriangle className="h-6 w-6 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Avertissements</p>
                  <p className="text-2xl font-bold text-warning-600">{warningCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-info-100 p-3">
                  <AlertCircle className="h-6 w-6 text-info-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Problèmes ouverts</p>
                  <p className="text-2xl font-bold text-info-600">
                    {accessibilityIssues.filter(i => i.type === 'critical' || i.type === 'error').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="criteria" className="space-y-6">
          <TabsList>
            <TabsTrigger value="criteria">Critères WCAG</TabsTrigger>
            <TabsTrigger value="issues">Problèmes</TabsTrigger>
            <TabsTrigger value="devices">Appareils</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="criteria" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Critères WCAG 2.1</CardTitle>
                <CardDescription>
                  Conformité par critère de succès
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Critère</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="w-[60px]">Niveau</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[80px] text-right">Eléments</TableHead>
                      <TableHead className="w-[80px] text-right">Erreurs</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wcagCriteria.map((criteria) => {
                      const StatusIcon = statusConfig[criteria.status as keyof typeof statusConfig].icon;
                      const LevelStyle = levelConfig[criteria.level as keyof typeof levelConfig];
                      return (
                        <TableRow key={criteria.id}>
                          <TableCell className="font-mono text-sm">{criteria.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{criteria.name}</p>
                              <p className="text-sm text-neutral-500">{criteria.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${LevelStyle.bg} ${LevelStyle.text}`}>
                              {criteria.level}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[criteria.status as keyof typeof statusConfig].variant}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig[criteria.status as keyof typeof statusConfig].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{criteria.elements}</TableCell>
                          <TableCell className="text-right">
                            {criteria.failures > 0 ? (
                              <span className="text-error-600">{criteria.failures}</span>
                            ) : (
                              <span className="text-success-600">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {criteria.failures > 0 && (
                              <Button variant="ghost" size="icon-sm">
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problèmes détectés</CardTitle>
                <CardDescription>
                  {accessibilityIssues.length} problèmes nécessitent votre attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessibilityIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                issue.type === 'critical' ? 'destructive' :
                                issue.type === 'error' ? 'warning' : 'secondary'
                              }
                            >
                              {issue.type === 'critical' ? 'Critique' :
                               issue.type === 'error' ? 'Erreur' : 'Avertissement'}
                            </Badge>
                            <Badge variant="outline">{issue.wcag}</Badge>
                            <span className="text-sm text-neutral-500">
                              {issue.page}:{issue.line}
                            </span>
                          </div>
                          <h4 className="mt-2 font-medium">{issue.title}</h4>
                          <p className="mt-1 text-sm text-neutral-500">{issue.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="rounded bg-neutral-100 px-2 py-1 text-xs">
                              {issue.element}
                            </code>
                          </div>
                          <div className="mt-3 rounded-lg bg-info-50 p-3">
                            <p className="text-sm text-info-700">
                              <span className="font-medium">Suggestion: </span>
                              {issue.suggestion}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Corriger
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Support par appareil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deviceStats.map((device) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.device === 'Tablet' && <Smartphone className="h-4 w-4" />}
                          {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          <span className="font-medium">{device.device}</span>
                        </span>
                        <span className="text-sm text-neutral-500">
                          {device.users} utilisateurs ({device.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{device.issues} problèmes détectés</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Support lecteurs d&apos;écran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lecteur</TableHead>
                        <TableHead>Utilisateurs</TableHead>
                        <TableHead>Problèmes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screenReaderStats.map((sr) => (
                        <TableRow key={sr.name}>
                          <TableCell className="font-medium">{sr.name}</TableCell>
                          <TableCell>{sr.users}</TableCell>
                          <TableCell>
                            <Badge variant={sr.issues > 2 ? 'warning' : 'success'}>
                              {sr.issues}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tests d&apos;accessibilité clavier</CardTitle>
                <CardDescription>
                  Vérification de la navigation au clavier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { key: 'Tab', action: 'Avancer', status: 'passed' },
                    { key: 'Shift + Tab', action: 'Reculer', status: 'passed' },
                    { key: 'Enter', action: 'Activer', status: 'passed' },
                    { key: 'Echap', action: 'Fermer/Echapper', status: 'failed' },
                    { key: '↑↓', action: 'Naviguer', status: 'warning' },
                    { key: 'Espace', action: 'Sélectionner', status: 'passed' },
                    { key: 'Home/End', action: 'Début/Fin', status: 'passed' },
                    { key: '? ou F1', action: 'Aide', status: 'warning' },
                  ].map((test) => (
                    <div
                      key={test.key}
                      className={`rounded-lg border p-4 ${
                        test.status === 'passed' ? 'border-success-200 bg-success-50' :
                        test.status === 'failed' ? 'border-error-200 bg-error-50' :
                        'border-warning-200 bg-warning-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <kbd className="rounded bg-white px-2 py-1 text-sm font-medium shadow">
                          {test.key}
                        </kbd>
                        <span className="text-sm">{test.action}</span>
                      </div>
                      <div className="mt-2">
                        {test.status === 'passed' && (
                          <CheckCircle2 className="h-5 w-5 text-success-600" />
                        )}
                        {test.status === 'failed' && (
                          <XCircle className="h-5 w-5 text-error-600" />
                        )}
                        {test.status === 'warning' && (
                          <AlertTriangle className="h-5 w-5 text-warning-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des audits</CardTitle>
                <CardDescription>
                  Évolution du score d&apos;accessibilité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Pages auditée</TableHead>
                      <TableHead>Problèmes</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Tendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAudits.map((audit, i) => {
                      const prevAudit = recentAudits[i + 1];
                      const trend = prevAudit ? audit.score - prevAudit.score : 0;
                      return (
                        <TableRow key={audit.date}>
                          <TableCell className="font-mono text-sm">{audit.date}</TableCell>
                          <TableCell>{audit.pages}</TableCell>
                          <TableCell>{audit.issues}</TableCell>
                          <TableCell>
                            <Badge variant={audit.score >= 90 ? 'success' : audit.score >= 70 ? 'warning' : 'destructive'}>
                              {audit.score}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {trend > 0 && (
                              <span className="flex items-center gap-1 text-success-600">
                                <TrendingUp className="h-4 w-4" />+{trend}
                              </span>
                            )}
                            {trend < 0 && (
                              <span className="flex items-center gap-1 text-error-600">
                                <TrendingDown className="h-4 w-4" />{trend}
                              </span>
                            )}
                            {trend === 0 && (
                              <span className="flex items-center gap-1 text-neutral-400">
                                <Minus className="h-4 w-4" />0
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
