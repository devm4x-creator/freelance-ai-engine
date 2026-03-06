'use client';

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Check, Zap, Rocket } from 'lucide-react';
import Link from 'next/link';

export function Pricing() {
  const { t, language } = useApp();

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            {t.pricing.title}{' '}
            <span className="gradient-text">{t.pricing.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground">{t.pricing.subtitle}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="tool-card flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{t.pricing.free.name}</h3>
              <p className="text-muted-foreground text-sm">{t.pricing.free.desc}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">${t.pricing.free.price}</span>
                <span className="text-muted-foreground text-sm">/{language === 'ar' ? 'شهر' : 'month'}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              {t.pricing.free.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className="block">
              <Button variant="outline" size="lg" className="w-full">
                {t.pricing.free.cta}
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="tool-card flex flex-col relative overflow-visible border-primary/50 scale-105 shadow-xl shadow-primary/10">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="premium-badge flex items-center gap-1 px-4 py-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>{t.pricing.pro.badge}</span>
              </div>
            </div>

            <div className="mb-6 pt-4">
              <h3 className="text-2xl font-bold mb-2">{t.pricing.pro.name}</h3>
              <p className="text-muted-foreground text-sm">{t.pricing.pro.desc}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold gradient-text">${t.pricing.pro.price}</span>
                <span className="text-muted-foreground text-sm">/{language === 'ar' ? 'شهر' : 'month'}</span>
              </div>
              {t.pricing.pro.priceAlt && (
                <p className="text-xs text-muted-foreground mt-1">{t.pricing.pro.priceAlt}</p>
              )}
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              {t.pricing.pro.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/dashboard/upgrade" className="block">
              <Button size="lg" className="w-full">
                {t.pricing.pro.cta}
              </Button>
            </Link>
          </div>

          {/* Business Plan */}
          <div className="tool-card flex flex-col relative overflow-visible border-amber-500/30">
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1">
                <Rocket className="w-3.5 h-3.5" />
                <span>{t.pricing.business.badge}</span>
              </div>
            </div>

            <div className="mb-6 pt-4">
              <h3 className="text-2xl font-bold mb-2">{t.pricing.business.name}</h3>
              <p className="text-muted-foreground text-sm">{t.pricing.business.desc}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-amber-500">${t.pricing.business.price}</span>
                <span className="text-muted-foreground text-sm">/{language === 'ar' ? 'شهر' : 'month'}</span>
              </div>
              {t.pricing.business.priceAlt && (
                <p className="text-xs text-muted-foreground mt-1">{t.pricing.business.priceAlt}</p>
              )}
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              {t.pricing.business.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-amber-500" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/dashboard/upgrade" className="block">
              <Button size="lg" variant="outline" className="w-full border-amber-500/50 hover:bg-amber-500/10">
                {t.pricing.business.cta}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
