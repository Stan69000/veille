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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CreditCard,
  Receipt,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Settings,
  Bell,
  Mail,
  Zap,
  Star,
  Building,
  ArrowUpRight,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: 'forever',
    features: ['5 sources RSS', '100 articles/mois', '1 utilisateur', 'Résumé basique'],
    current: false,
    stripePriceId: null,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: ['25 sources RSS', '5 000 articles/mois', '5 utilisateurs', 'Résumé avancé', 'API access'],
    current: false,
    stripePriceId: 'price_starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    interval: 'month',
    features: ['100 sources RSS', '50 000 articles/mois', '20 utilisateurs', 'IA complète', 'API access', 'Support prioritaire'],
    current: true,
    stripePriceId: 'price_pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    interval: 'custom',
    features: ['Sources illimitées', 'Articles illimités', 'Utilisateurs illimités', 'Déploiement on-premise', 'SLA garanti', 'Account manager dédié'],
    current: false,
    stripePriceId: null,
  },
];

const subscriptions = [
  {
    id: 'sub_1',
    customer: 'Acme Corp',
    email: 'billing@acme.com',
    plan: 'Pro',
    status: 'active',
    currentPeriodEnd: '2024-02-15',
    amount: 99,
    sources: 45,
    users: 12,
  },
  {
    id: 'sub_2',
    customer: 'TechStart Inc',
    email: 'finance@techstart.io',
    plan: 'Starter',
    status: 'active',
    currentPeriodEnd: '2024-02-01',
    amount: 29,
    sources: 18,
    users: 4,
  },
  {
    id: 'sub_3',
    customer: 'Media Group',
    email: 'admin@mediagroup.fr',
    plan: 'Enterprise',
    status: 'trialing',
    currentPeriodEnd: '2024-03-01',
    amount: 0,
    sources: 200,
    users: 50,
  },
  {
    id: 'sub_4',
    customer: 'Startup XYZ',
    email: 'hello@startupxyz.com',
    plan: 'Starter',
    status: 'past_due',
    currentPeriodEnd: '2024-01-15',
    amount: 29,
    sources: 12,
    users: 3,
  },
  {
    id: 'sub_5',
    customer: 'News Portal',
    email: 'tech@newsportal.com',
    plan: 'Pro',
    status: 'canceled',
    currentPeriodEnd: '2024-01-01',
    amount: 99,
    sources: 0,
    users: 0,
  },
];

const invoices = [
  {
    id: 'inv_1',
    customer: 'Acme Corp',
    amount: 99,
    status: 'paid',
    date: '2024-01-15',
    invoiceUrl: '#',
  },
  {
    id: 'inv_2',
    customer: 'Acme Corp',
    amount: 99,
    status: 'paid',
    date: '2023-12-15',
    invoiceUrl: '#',
  },
  {
    id: 'inv_3',
    customer: 'TechStart Inc',
    amount: 29,
    status: 'paid',
    date: '2024-02-01',
    invoiceUrl: '#',
  },
  {
    id: 'inv_4',
    customer: 'TechStart Inc',
    amount: 29,
    status: 'open',
    date: '2024-01-01',
    invoiceUrl: '#',
  },
  {
    id: 'inv_5',
    customer: 'Media Group',
    amount: 0,
    status: 'paid',
    date: '2024-01-01',
    invoiceUrl: '#',
  },
];

const metrics = [
  {
    label: 'MRR',
    value: '$12,847',
    change: '+18%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-success-600',
    bgColor: 'bg-success-50',
  },
  {
    label: 'ARR',
    value: '$154,164',
    change: '+22%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    label: 'Clients actifs',
    value: '156',
    change: '+8',
    trend: 'up',
    icon: Users,
    color: 'text-info-600',
    bgColor: 'bg-info-50',
  },
  {
    label: 'Taux de conversion',
    value: '4.2%',
    change: '-0.3%',
    trend: 'down',
    icon: ArrowUpRight,
    color: 'text-warning-600',
    bgColor: 'bg-warning-50',
  },
];

const paymentMethods = [
  {
    id: 'pm_1',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
  },
  {
    id: 'pm_2',
    brand: 'mastercard',
    last4: '8888',
    expMonth: 6,
    expYear: 2026,
    isDefault: false,
  },
];

export default function BillingAdminPage() {
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const statusConfig = {
    active: { label: 'Actif', variant: 'success' as const, icon: CheckCircle2 },
    trialing: { label: 'Essai', variant: 'info' as const, icon: Clock },
    past_due: { label: 'En retard', variant: 'warning' as const, icon: AlertCircle },
    canceled: { label: 'Annulé', variant: 'secondary' as const, icon: XCircle },
    paid: { label: 'Payé', variant: 'success' as const, icon: CheckCircle2 },
    open: { label: 'Ouvert', variant: 'warning' as const, icon: Clock },
    void: { label: 'Annulé', variant: 'secondary' as const, icon: XCircle },
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
              Facturation
            </h1>
            <p className="mt-1 text-neutral-500">
              Gérez vos plans, subscriptions et paiements
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={() => setShowNewPlanDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau plan
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                      <p className={`mt-1 text-xs ${metric.trend === 'up' ? 'text-success-600' : 'text-error-600'}`}>
                        {metric.change} vs mois dernier
                      </p>
                    </div>
                    <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'plans', label: 'Plans', icon: Star },
              { id: 'subscriptions', label: 'Subscriptions', icon: Users },
              { id: 'invoices', label: 'Factures', icon: Receipt },
              { id: 'payments', label: 'Paiements', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {selectedTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dernières transactions</CardTitle>
                <CardDescription>
                  Transactions récentes des 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { customer: 'Acme Corp', amount: 99, date: '15 Jan 2024', status: 'success' },
                    { customer: 'TechStart Inc', amount: 29, date: '1 Fév 2024', status: 'success' },
                    { customer: 'Startup XYZ', amount: 29, date: '15 Jan 2024', status: 'failed' },
                    { customer: 'Media Group', amount: 299, date: '10 Jan 2024', status: 'success' },
                  ].map((transaction, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          transaction.status === 'success' ? 'bg-success-100' : 'bg-error-100'
                        }`}>
                          {transaction.status === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-success-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-error-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.customer}</p>
                          <p className="text-sm text-neutral-500">{transaction.date}</p>
                        </div>
                      </div>
                      <p className={`font-semibold ${
                        transaction.status === 'success' ? 'text-neutral-900' : 'text-error-600'
                      }`}>
                        {transaction.status === 'success' ? '+' : '-'}${transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution des plans</CardTitle>
                <CardDescription>
                  Répartition des clients par plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { plan: 'Enterprise', count: 12, percentage: 8, color: 'bg-primary-500' },
                  { plan: 'Pro', count: 67, percentage: 43, color: 'bg-info-500' },
                  { plan: 'Starter', count: 54, percentage: 35, color: 'bg-neutral-400' },
                  { plan: 'Gratuit', count: 23, percentage: 15, color: 'bg-neutral-200' },
                ].map((item) => (
                  <div key={item.plan} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.plan}</span>
                      <span className="text-neutral-500">{item.count} clients ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'plans' && (
          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-primary-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary-500">Populaire</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.id === 'enterprise' ? (
                      <Building className="h-5 w-5 text-primary-500" />
                    ) : (
                      <Zap className="h-5 w-5 text-primary-500" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-neutral-900">
                      {plan.price === null ? 'Custom' : `$${plan.price}`}
                    </span>
                    {plan.price !== null && (
                      <span className="text-neutral-500">/{plan.interval}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Plan actuel' : plan.price === null ? 'Contacter' : 'Choisir'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'subscriptions' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions actives</CardTitle>
              <CardDescription>
                {subscriptions.filter(s => s.status === 'active').length} subscriptions actives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prochaine facturation</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Sources</TableHead>
                    <TableHead>Utilisateurs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const StatusIcon = statusConfig[sub.status as keyof typeof statusConfig].icon;
                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.customer}</p>
                            <p className="text-sm text-neutral-500">{sub.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sub.plan}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[sub.status as keyof typeof statusConfig].variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[sub.status as keyof typeof statusConfig].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(sub.currentPeriodEnd).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {sub.amount === 0 ? 'Custom' : `$${sub.amount}`}
                        </TableCell>
                        <TableCell>{sub.sources}</TableCell>
                        <TableCell>{sub.users}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'invoices' && (
          <Card>
            <CardHeader>
              <CardTitle>Factures</CardTitle>
              <CardDescription>
                Historique des factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig].icon;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {invoice.id}
                        </TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>
                          {invoice.amount === 0 ? 'Custom' : `$${invoice.amount}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[invoice.status as keyof typeof statusConfig].variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[invoice.status as keyof typeof statusConfig].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {selectedTab === 'payments' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Moyens de paiement</CardTitle>
                <CardDescription>
                  Gérez vos méthodes de paiement Stripe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-neutral-100">
                        <CreditCard className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {pm.brand} ****{pm.last4}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Expire {pm.expMonth}/{pm.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pm.isDefault && <Badge variant="success">Par défaut</Badge>}
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une carte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres de facturation</CardTitle>
                <CardDescription>
                  Configuration Stripe et notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="font-medium">Factures par email</p>
                      <p className="text-sm text-neutral-500">Recevez vos factures automatiquement</p>
                    </div>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="font-medium">Alertes de paiement</p>
                      <p className="text-sm text-neutral-500">Notifications avant chaque facturation</p>
                    </div>
                  </div>
                  <Checkbox defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="font-medium">Relevé annuel</p>
                      <p className="text-sm text-neutral-500">Générer un relevé fiscal en janvier</p>
                    </div>
                  </div>
                  <Checkbox />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau plan</DialogTitle>
            <DialogDescription>
              Configurez un nouveau plan d&apos;abonnement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du plan</label>
              <Input placeholder="Plan Name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix (USD)</label>
                <Input type="number" placeholder="29" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Intervalle</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Mensuel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stripe Price ID</label>
              <Input placeholder="price_xxx" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>
              Annuler
            </Button>
            <Button>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
