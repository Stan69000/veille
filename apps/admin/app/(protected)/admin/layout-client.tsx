'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Rss,
  Settings,
  CreditCard,
  Users,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Bot,
  Accessibility,
  Palette,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkipNav } from '@/components/skip-nav';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Boîte de réception',
    href: '/admin/inbox',
    icon: Bell,
    badge: '5',
  },
  {
    title: 'Articles',
    href: '/admin/items',
    icon: FileText,
    badge: '24',
  },
  {
    title: 'Stories',
    href: '/admin/stories',
    icon: BookOpen,
  },
  {
    title: 'Sources',
    href: '/admin/sources',
    icon: Rss,
    badge: '3',
  },
];

const platformItems = [
  {
    title: 'Intelligence Artificielle',
    href: '/admin/ai',
    icon: Bot,
  },
  {
    title: 'Accessibilité',
    href: '/admin/accessibility',
    icon: Accessibility,
    badge: '8',
  },
  {
    title: 'Design System',
    href: '/admin/design-system',
    icon: Palette,
  },
];

const managementItems = [
  {
    title: 'Équipe',
    href: '/admin/team',
    icon: Users,
  },
  {
    title: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Facturation',
    href: '/admin/billing',
    icon: CreditCard,
  },
];

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badge?: string;
  isActive?: boolean;
}

function NavLink({ href, icon: Icon, children, badge, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="flex-1">{children}</span>
      {badge && (
        <Badge variant="secondary" size="sm" aria-label={`${badge} éléments`}>
          {badge}
        </Badge>
      )}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
        sidebarRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      sidebarRef.current?.focus();
    }
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen">
      <SkipNav />
      
      <aside
        ref={sidebarRef}
        id="main-nav"
        role="navigation"
        aria-label="Navigation principale"
        tabIndex={-1}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600" aria-hidden="true">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="font-semibold text-neutral-900">Veille Platform</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1" aria-label="Navigation principale">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                isActive={pathname.startsWith(item.href)}
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          <div className="my-6">
            <div className="h-px bg-neutral-200" />
          </div>

          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Plateforme
          </p>
          <nav className="space-y-1">
            {platformItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                isActive={pathname.startsWith(item.href)}
              >
                {item.title}
              </NavLink>
            ))}
          </nav>

          <div className="my-6">
            <div className="h-px bg-neutral-200" />
          </div>

          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Gestion
          </p>
          <nav className="space-y-1">
            {managementItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                isActive={pathname.startsWith(item.href)}
              >
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6" role="banner">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-neutral-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden md:block md:w-80">
              <label htmlFor="global-search" className="sr-only">
                Rechercher
              </label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
              <Input
                id="global-search"
                type="search"
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications (3 non lues)">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-medium text-white" aria-hidden="true">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100" aria-hidden="true">
                    <span className="text-sm font-medium text-primary-700">SB</span>
                  </div>
                  <span className="hidden lg:inline">Stan Bouchet</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/billing">Facturation</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="text-error-600"
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main 
          ref={mainRef}
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
