'use client';

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, TrendingUp, Users, FileText } from 'lucide-react';

export function Hero() {
  const { t } = useApp();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t.landing.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
            {t.landing.title}
            <br />
            <span className="gradient-text">{t.landing.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.landing.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button size="xl" className="group">
                {t.landing.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="xl" variant="outline" className="group">
              <Play className="w-5 h-5" />
              {t.landing.ctaSecondary}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="stats-card emerald group">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-start">
                  <p className="text-2xl sm:text-3xl font-bold">12,847+</p>
                  <p className="text-sm text-muted-foreground">{t.landing.stats.proposals}</p>
                </div>
              </div>
            </div>

            <div className="stats-card amber group">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-start">
                  <p className="text-2xl sm:text-3xl font-bold">$2.4M+</p>
                  <p className="text-sm text-muted-foreground">{t.landing.stats.earnings}</p>
                </div>
              </div>
            </div>

            <div className="stats-card cyan group">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-start">
                  <p className="text-2xl sm:text-3xl font-bold">2,000+</p>
                  <p className="text-sm text-muted-foreground">{t.landing.stats.users}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-muted-foreground mt-10">{t.landing.trustedBy}</p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="gradient-border p-1 rounded-2xl glow-primary">
            <div className="bg-card rounded-xl overflow-hidden shadow-2xl">
              <div className="h-8 bg-secondary/50 flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="p-6 bg-card/50">
                <div className="grid grid-cols-12 gap-4">
                  {/* Sidebar Mock */}
                  <div className="col-span-3 space-y-3">
                    <div className="h-10 bg-secondary/50 rounded-lg shimmer" />
                    <div className="h-8 bg-primary/20 rounded-lg" />
                    <div className="h-8 bg-secondary/30 rounded-lg" />
                    <div className="h-8 bg-secondary/30 rounded-lg" />
                    <div className="h-8 bg-secondary/30 rounded-lg" />
                    <div className="h-8 bg-secondary/30 rounded-lg" />
                  </div>
                  {/* Content Mock */}
                  <div className="col-span-9 space-y-4">
                    <div className="h-12 bg-secondary/50 rounded-lg w-2/3 shimmer" />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-emerald-500/10 rounded-lg border border-emerald-500/20" />
                      <div className="h-24 bg-amber-500/10 rounded-lg border border-amber-500/20" />
                      <div className="h-24 bg-cyan-500/10 rounded-lg border border-cyan-500/20" />
                    </div>
                    <div className="h-40 bg-secondary/30 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
