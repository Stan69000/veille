'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Inbox,
  FileText,
  BookOpen,
  Rss,
  Mail,
  Send,
  Layers,
  Image,
  Users,
  Activity,
  Settings,
  Accessibility,
  Palette,
  Bot,
  CreditCard,
  Receipt,
  Key,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { useState } from 'react';

const mainNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/inbox', label: 'Boîte de réception', icon: Inbox },
  { href: '/admin/items', label: 'Articles', icon: FileText },
  { href: '/admin/stories', label: 'Stories', icon: BookOpen },
  { href: '/admin/sources', label: 'Sources', icon: Rss },
  { href: '/admin/newsletters', label: 'Newsletters', icon: Mail },
  { href: '/admin/submissions', label: 'Soumissions', icon: Send },
  { href: '/admin/publish', label: 'Publication', icon: Layers },
  { href: '/admin/media', label: 'Médias', icon: Image },
];

const managementNavItems = [
  { href: '/admin/audiences', label: 'Audiences', icon: Users },
  { href: '/admin/logs', label: 'Logs', icon: Activity },
];

const settingsNavItems = [
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  { href: '/admin/accessibility', label: 'Accessibilité', icon: Accessibility },
  { href: '/admin/design-system', label: 'Design System', icon: Palette },
];

const aiNavItems = [
  { href: '/admin/ai', label: 'IA', icon: Bot },
  { href: '/admin/ai/providers', label: 'Providers', icon: Settings },
  { href: '/admin/ai/prompts', label: 'Prompts', icon: FileText },
  { href: '/admin/ai/tasks', label: 'Tâches', icon: Activity },
  { href: '/admin/ai/logs', label: 'Logs IA', icon: Activity },
  { href: '/admin/ai/policies', label: 'Politiques', icon: Key },
];

const billingNavItems = [
  { href: '/admin/billing', label: 'Facturation', icon: CreditCard },
  { href: '/admin/plans', label: 'Plans', icon: Receipt },
  { href: '/admin/entitlements', label: 'Droits', icon: Key },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

interface NavSectionProps {
  title: string;
  items: NavItemProps[];
  pathname: string;
  defaultOpen?: boolean;
}

function NavSection({ title, items, pathname, defaultOpen = true }: NavSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasActiveItem = items.some((item) => pathname.startsWith(item.href));

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-600"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180',
            hasActiveItem && 'text-primary-500'
          )}
          aria-hidden="true"
        />
      </button>
      {isOpen && items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={pathname.startsWith(item.href)}
        />
      ))}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-neutral-600" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-semibold text-neutral-900"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            Veille Platform
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <NavSection title="Contenu" items={mainNavItems} pathname={pathname} />

          <div className="my-4 h-px bg-neutral-200" />

          <NavSection title="Gestion" items={managementNavItems} pathname={pathname} />

          <div className="my-4 h-px bg-neutral-200" />

          <NavSection title="Intelligence Artificielle" items={aiNavItems} pathname={pathname} />

          <div className="my-4 h-px bg-neutral-200" />

          <NavSection title="Facturation" items={billingNavItems} pathname={pathname} />

          <div className="my-4 h-px bg-neutral-200" />

          <NavSection title="Configuration" items={settingsNavItems} pathname={pathname} />
        </div>

        <div className="border-t p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
