'use client';

import { useApp } from '@/contexts/AppContext';
import {
  Palette,
  MessageSquare,
  Briefcase,
  FolderOpen,
  FileText,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    id: 'branding',
    icon: Palette,
    color: 'emerald',
    href: '/dashboard/branding',
  },
  {
    id: 'social',
    icon: MessageSquare,
    color: 'cyan',
    href: '/dashboard/social',
  },
  {
    id: 'proposals',
    icon: Briefcase,
    color: 'amber',
    href: '/dashboard/proposals',
  },
  {
    id: 'portfolio',
    icon: FolderOpen,
    color: 'violet',
    href: '/dashboard/portfolio',
  },
  {
    id: 'contracts',
    icon: FileText,
    color: 'orange',
    href: '/dashboard/contracts',
  },
];

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-500',
    hover: 'hover:border-emerald-500/50',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    icon: 'text-cyan-500',
    hover: 'hover:border-cyan-500/50',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-500',
    hover: 'hover:border-amber-500/50',
    glow: 'group-hover:shadow-amber-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: 'text-violet-500',
    hover: 'hover:border-violet-500/50',
    glow: 'group-hover:shadow-violet-500/20',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: 'text-orange-500',
    hover: 'hover:border-orange-500/50',
    glow: 'group-hover:shadow-orange-500/20',
  },
};

export function Features() {
  const { t } = useApp();

  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            {t.features.title}{' '}
            <span className="gradient-text">{t.features.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.features.subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            const featureData = t.features[feature.id as keyof typeof t.features] as { title: string; desc: string };

            return (
              <Link key={feature.id} href={feature.href}>
                <div
                  className={`group tool-card ${colors.hover} cursor-pointer h-full`}
                >
                  <div className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {featureData.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {featureData.desc}
                  </p>

                  <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Try Now</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
