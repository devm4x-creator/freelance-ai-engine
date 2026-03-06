'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Palette,
  MessageSquare,
  Briefcase,
  FolderOpen,
  FileText,
  Zap,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  Sparkles,
  Crown,
} from 'lucide-react';

const quickActions = [
  { id: 'branding', icon: Palette, color: 'emerald', href: '/dashboard/branding' },
  { id: 'social', icon: MessageSquare, color: 'cyan', href: '/dashboard/social' },
  { id: 'proposals', icon: Briefcase, color: 'amber', href: '/dashboard/proposals' },
  { id: 'portfolio', icon: FolderOpen, color: 'violet', href: '/dashboard/portfolio' },
  { id: 'contracts', icon: FileText, color: 'orange', href: '/dashboard/contracts' },
];

const colorClasses = {
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/50',
  cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 hover:border-cyan-500/50',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 hover:border-amber-500/50',
  violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 hover:border-violet-500/50',
  orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 hover:border-orange-500/50',
};

const iconColors = {
  emerald: 'text-emerald-500',
  cyan: 'text-cyan-500',
  amber: 'text-amber-500',
  violet: 'text-violet-500',
  orange: 'text-orange-500',
};

interface GenerationStats {
  used: number;
  limit: number;
  remaining: number;
  plan: 'free' | 'pro' | 'business';
}

export default function DashboardPage() {
  const { t, user, savedOutputs, language } = useApp();
  const { session } = useAuth();
  const [generationStats, setGenerationStats] = useState<GenerationStats>({
    used: 0,
    limit: 20,
    remaining: 20,
    plan: 'free',
  });

  // Fetch generation stats
  useEffect(() => {
    async function fetchStats() {
      if (!session?.access_token) return;

      try {
        const response = await fetch('/api/generations', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        const data = await response.json();
        if (data.success !== false) {
          setGenerationStats({
            used: data.used || 0,
            limit: data.limit || 20,
            remaining: data.remaining || 20,
            plan: data.plan || 'free',
          });
        }
      } catch (error) {
        console.error('Failed to fetch generation stats:', error);
      }
    }

    fetchStats();
  }, [session]);

  const getPlanLabel = (plan: string) => {
    if (plan === 'business') return language === 'ar' ? 'بزنس' : 'Business';
    if (plan === 'pro') return language === 'ar' ? 'برو' : 'Pro';
    return language === 'ar' ? 'مجاني' : 'Free';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            {t.dashboard.welcome}, <span className="gradient-text">{user?.name || 'User'}</span>
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/dashboard/roadmap">
          <Button className="group">
            <Sparkles className="w-4 h-4 mr-2" />
            {t.dashboard.roadmap}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Generations Card */}
        <Card className="stats-card emerald relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{generationStats.used}/{generationStats.limit}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.monthlyGenerations}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((generationStats.used / generationStats.limit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {generationStats.remaining} {t.dashboard.generationsRemaining}
          </p>
        </Card>

        {/* Plan Card */}
        <Card className="stats-card amber">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{getPlanLabel(generationStats.plan)}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
              </p>
            </div>
          </div>
          {generationStats.plan === 'free' && (
            <Link href="/dashboard/upgrade" className="block mt-3">
              <Button variant="outline" size="sm" className="w-full text-xs border-amber-500/30 hover:bg-amber-500/10">
                {language === 'ar' ? 'ترقية للحصول على المزيد' : 'Upgrade for more'}
              </Button>
            </Link>
          )}
        </Card>

        {/* Total Saved Card */}
        <Card className="stats-card cyan">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{savedOutputs.length}</p>
              <p className="text-sm text-muted-foreground">{t.dashboard.totalSaved}</p>
            </div>
          </div>
        </Card>

        {/* Goal Card */}
        <Card className="stats-card from-primary/20 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">$100</p>
              <p className="text-sm text-muted-foreground">USD Goal</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t.dashboard.quickActions}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = colorClasses[action.color as keyof typeof colorClasses];
            const iconColor = iconColors[action.color as keyof typeof iconColors];

            return (
              <Link key={action.id} href={action.href}>
                <Card className={`bg-gradient-to-br ${colors} border transition-all duration-300 hover:-translate-y-1 cursor-pointer group p-4`}>
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <span className="text-sm font-medium">
                      {t.tools[action.id as keyof typeof t.tools]}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Outputs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t.dashboard.recentOutputs}</h2>
        {savedOutputs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedOutputs.slice(0, 6).map((output) => (
              <Card key={output.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-primary uppercase">{output.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(output.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-medium mb-2 line-clamp-1">{output.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{output.content}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No outputs yet</h3>
            <p className="text-muted-foreground mb-4">Start using our tools to generate your first output</p>
            <Link href="/dashboard/branding">
              <Button>Get Started</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
