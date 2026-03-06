'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  Palette,
  MessageSquare,
  Briefcase,
  FolderOpen,
  FileText,
  Map,
  History,
  Settings,
  Home,
  Crown,
  LogOut,
  Globe,
  Layout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { id: 'overview', icon: Home, href: '/dashboard' },
  { id: 'branding', icon: Palette, href: '/dashboard/branding' },
  { id: 'landingPage', icon: Layout, href: '/dashboard/landing-page' },
  { id: 'social', icon: MessageSquare, href: '/dashboard/social' },
  { id: 'proposals', icon: Briefcase, href: '/dashboard/proposals' },
  { id: 'portfolio', icon: FolderOpen, href: '/dashboard/portfolio' },
  { id: 'contracts', icon: FileText, href: '/dashboard/contracts' },
  { id: 'roadmap', icon: Map, href: '/dashboard/roadmap' },
];

const bottomNav = [
  { id: 'history', icon: History, href: '/dashboard/history' },
  { id: 'settings', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, user, language, setLanguage, logout, profilePicture } = useApp();

  const getNavLabel = (id: string) => {
    if (id === 'overview') return t.dashboard.overview;
    return t.tools[id as keyof typeof t.tools] || id;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
        <div className="w-9 h-9 rounded-lg overflow-hidden">
          <Image
            src="/favicon.svg"
            alt="AI Freelancer Logo"
            width={36}
            height={36}
            className="w-full h-full"
          />
        </div>
        <span className="font-display font-bold text-lg">
          <span className="gradient-text">AI</span>
          <span className="text-foreground"> Freelancer</span>
        </span>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name || 'User'}</p>
            <div className="flex items-center gap-1">
              {user?.plan === 'pro' ? (
                <span className="premium-badge text-xs">
                  <Crown className="w-3 h-3" />
                  PRO
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Free Plan</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link key={item.id} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
                  <span className="font-medium text-sm">{getNavLabel(item.id)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border py-4 px-3">
        <div className="space-y-1 mb-4">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.id} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm">{getNavLabel(item.id)}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Language Toggle */}
        <div className="px-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            <Globe className="w-4 h-4 mr-2" />
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t.nav.logout}
        </Button>
      </div>
    </aside>
  );
}
