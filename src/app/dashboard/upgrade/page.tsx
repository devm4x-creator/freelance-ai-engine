'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Crown,
  Check,
  CreditCard,
  Smartphone,
  Building2,
  ArrowLeft,
  Zap,
  Sparkles,
  Shield,
  Rocket,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Plan configurations with monthly and yearly pricing
// Yearly = 12 months with 20% discount (pay for 10 months, get 12)
const plans = {
  free: {
    id: 'free',
    name: { en: 'Free', ar: 'مجاني' },
    monthly: { price: 0, priceDZD: 0 },
    yearly: { price: 0, priceDZD: 0 },
    generations: 20,
    features: {
      en: [
        '20 generations per month',
        'Basic branding tools',
        'Proposal generator',
        'Community support',
      ],
      ar: [
        '20 توليد شهرياً',
        'أدوات الهوية الأساسية',
        'مولد العروض',
        'دعم المجتمع',
      ],
    },
    color: 'border-border',
    popular: false,
  },
  pro: {
    id: 'pro',
    name: { en: 'Pro', ar: 'برو' },
    monthly: { price: 9, priceDZD: 2000 },
    yearly: { price: 86, priceDZD: 19200 }, // ~20% off (9*12=108, 108*0.8=86.4)
    generations: 300,
    features: {
      en: [
        '300 generations per month',
        'All premium tools',
        'Contract generator',
        'Portfolio builder',
        'Priority support',
      ],
      ar: [
        '300 توليد شهرياً',
        'كل الأدوات المتقدمة',
        'مولد العقود',
        'بناء البورتفوليو',
        'دعم أولوية',
      ],
    },
    color: 'border-primary/50',
    popular: true,
  },
  business: {
    id: 'business',
    name: { en: 'Business', ar: 'بزنس' },
    monthly: { price: 19, priceDZD: 4000 },
    yearly: { price: 182, priceDZD: 38400 }, // ~20% off (19*12=228, 228*0.8=182.4)
    generations: 1000,
    features: {
      en: [
        '1000 generations per month',
        'All Pro features',
        'Export to PDF',
        'API access',
        'Dedicated support',
      ],
      ar: [
        '1000 توليد شهرياً',
        'كل مميزات برو',
        'تصدير PDF',
        'الوصول للـ API',
        'دعم مخصص',
      ],
    },
    color: 'border-amber-500/50',
    popular: false,
  },
};

const paymentMethods = [
  {
    id: 'card',
    name: { en: 'Credit/Debit Card', ar: 'بطاقة ائتمان/خصم' },
    description: { en: 'VISA, Mastercard', ar: 'فيزا، ماستركارد' },
    icon: CreditCard,
    brands: ['VISA', 'Mastercard'],
    color: 'from-blue-500 to-purple-500',
    available: false,
  },
  {
    id: 'edahabia',
    name: { en: 'Edahabia / CIB', ar: 'الذهبية / CIB' },
    description: { en: 'Algerian bank cards', ar: 'البطاقات البنكية الجزائرية' },
    icon: Building2,
    brands: ['Edahabia', 'CIB'],
    color: 'from-emerald-500 to-teal-500',
    available: true,
  },
  {
    id: 'baridimob',
    name: { en: 'BaridiMob', ar: 'بريدي موب' },
    description: { en: 'Algeria Post mobile payment', ar: 'الدفع عبر بريد الجزائر' },
    icon: Smartphone,
    brands: ['BaridiMob'],
    color: 'from-amber-500 to-orange-500',
    available: true,
  },
];

interface GenerationStats {
  used: number;
  limit: number;
  remaining: number;
  plan: 'free' | 'pro' | 'business';
}

export default function UpgradePage() {
  const { language, user } = useApp();
  const { session } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business'>('pro');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlanStats, setCurrentPlanStats] = useState<GenerationStats>({
    used: 0,
    limit: 20,
    remaining: 20,
    plan: 'free',
  });

  // Fetch current plan stats
  useEffect(() => {
    async function fetchStats() {
      if (!session?.access_token) return;

      try {
        const response = await fetch('/api/generations', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const data = await response.json();
        if (data.success !== false) {
          setCurrentPlanStats({
            used: data.used || 0,
            limit: data.limit || 20,
            remaining: data.remaining || 20,
            plan: data.plan || 'free',
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }

    fetchStats();
  }, [session]);

  const isChargilyPayment = (paymentId: string | null) => {
    return paymentId === 'edahabia' || paymentId === 'baridimob';
  };

  // Get price based on billing period
  const getPlanPrice = (planKey: 'free' | 'pro' | 'business') => {
    const plan = plans[planKey];
    return billingPeriod === 'yearly' ? plan.yearly : plan.monthly;
  };

  // Calculate monthly equivalent for yearly plans
  const getMonthlyEquivalent = (planKey: 'pro' | 'business') => {
    const plan = plans[planKey];
    return {
      price: Math.round((plan.yearly.price / 12) * 100) / 100,
      priceDZD: Math.round(plan.yearly.priceDZD / 12),
    };
  };

  // Calculate yearly savings (monthly * 12 - yearly price)
  const getYearlySavings = (planKey: 'pro' | 'business') => {
    const plan = plans[planKey];
    const monthlyTotal = plan.monthly.price * 12;
    const yearlyPrice = plan.yearly.price;
    const monthlyTotalDZD = plan.monthly.priceDZD * 12;
    const yearlyPriceDZD = plan.yearly.priceDZD;
    return {
      price: Math.round(monthlyTotal - yearlyPrice),
      priceDZD: Math.round(monthlyTotalDZD - yearlyPriceDZD),
    };
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error(language === 'ar' ? 'اختر وسيلة الدفع' : 'Please select a payment method');
      return;
    }

    const plan = plans[selectedPlan];
    const priceObj = billingPeriod === 'yearly' ? plan.yearly : plan.monthly;

    // For card payments (VISA/Mastercard), show coming soon
    if (selectedPayment === 'card') {
      toast.info(
        language === 'ar'
          ? 'قريباً! الدفع بالبطاقات الدولية قيد التطوير'
          : 'Coming soon! International card payments under development'
      );
      return;
    }

    // For BaridiMob, redirect to BaridiMob payment page
    if (selectedPayment === 'baridimob') {
      window.location.href = `/dashboard/upgrade/baridimob?plan=${selectedPlan}&period=${billingPeriod}`;
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          period: billingPeriod,
          paymentMethod: selectedPayment === 'cib' ? 'cib' : 'edahabia',
          userId: user?.id || 'guest',
          userEmail: user?.email || '',
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        toast.success(
          language === 'ar' ? 'تم توجيهك لصفحة الدفع...' : 'Redirecting to payment page...'
        );
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(
        language === 'ar' ? `حدث خطأ: ${errorMessage}` : `An error occurred: ${errorMessage}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans[selectedPlan];
  const selectedPlanPrice = getPlanPrice(selectedPlan);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Crown className="w-7 h-7 text-amber-500" />
            {language === 'ar' ? 'ترقية الخطة' : 'Upgrade Plan'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'احصل على المزيد من التوليدات والمميزات'
              : 'Get more generations and features'}
          </p>
        </div>
      </div>

      {/* Current Plan Info */}
      <Card className="p-4 bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {language === 'ar' ? 'خطتك الحالية:' : 'Your current plan:'}{' '}
                <span className="text-primary font-bold">
                  {plans[currentPlanStats.plan]?.name[language] || 'Free'}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {currentPlanStats.used}/{currentPlanStats.limit}{' '}
                {language === 'ar' ? 'توليد مستخدم هذا الشهر' : 'generations used this month'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{currentPlanStats.remaining}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'متبقي' : 'remaining'}
            </p>
          </div>
        </div>
      </Card>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4 py-2">
        <span
          className={cn(
            'font-medium text-sm',
            billingPeriod === 'monthly' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {language === 'ar' ? 'شهري' : 'Monthly'}
        </span>
        <Switch
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
          aria-label={language === 'ar' ? 'تبديل الدفع السنوي' : 'Toggle yearly billing'}
        />
        <span
          className={cn(
            'font-medium text-sm flex items-center gap-1',
            billingPeriod === 'yearly' ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {language === 'ar' ? 'سنوي' : 'Yearly'}
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded ml-1">
            -20%
          </span>
        </span>
      </div>

      {/* Plans Comparison */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Free Plan */}
        <Card
          className={cn(
            'p-6 relative',
            currentPlanStats.plan === 'free' && 'ring-2 ring-primary/50'
          )}
        >
          {currentPlanStats.plan === 'free' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {language === 'ar' ? 'خطتك الحالية' : 'Current Plan'}
              </span>
            </div>
          )}

          <div className="text-center mb-6 pt-2">
            <h3 className="text-xl font-bold mb-1">{plans.free.name[language]}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/{language === 'ar' ? (billingPeriod === 'yearly' ? 'سنة' : 'شهر') : (billingPeriod === 'yearly' ? 'year' : 'month')}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {plans.free.generations} {language === 'ar' ? 'توليد/شهر' : 'generations/month'}
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {plans.free.features[language].map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" disabled className="w-full">
            {language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
          </Button>
        </Card>

        {/* Pro Plan */}
        <Card
          className={cn(
            'p-6 relative cursor-pointer transition-all border-2',
            selectedPlan === 'pro'
              ? 'border-primary bg-primary/5 scale-105 shadow-xl'
              : 'border-border hover:border-primary/50',
            currentPlanStats.plan === 'pro' && 'ring-2 ring-primary/50'
          )}
          onClick={() => currentPlanStats.plan === 'free' && setSelectedPlan('pro')}
        >
          {/* Popular Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="premium-badge flex items-center gap-1 px-3 py-1 text-xs">
              <Zap className="w-3 h-3" />
              {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
            </span>
          </div>

          <div className="text-center mb-6 pt-4">
            <h3 className="text-xl font-bold mb-1">{plans.pro.name[language]}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold gradient-text">
                ${getPlanPrice('pro').price}
              </span>
              <span className="text-muted-foreground">
                /{language === 'ar' ? (billingPeriod === 'yearly' ? 'سنة' : 'شهر') : (billingPeriod === 'yearly' ? 'year' : 'month')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getPlanPrice('pro').priceDZD.toLocaleString()} {language === 'ar' ? 'د.ج' : 'DZD'}
            </p>
            {billingPeriod === 'yearly' && (
              <>
                <p className="text-xs text-emerald-600 mt-1">
                  {language === 'ar'
                    ? `(${getMonthlyEquivalent('pro').price} دولار/شهر)`
                    : `(${getMonthlyEquivalent('pro').price} USD/mo avg)`}
                </p>
                <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full mt-2">
                  <Sparkles className="w-3 h-3" />
                  {language === 'ar'
                    ? `وفّر ${getYearlySavings('pro').price} (${getYearlySavings('pro').priceDZD.toLocaleString()} د.ج)`
                    : `Save ${getYearlySavings('pro').price} (${getYearlySavings('pro').priceDZD.toLocaleString()} DZD)`}
                </div>
              </>
            )}
            <p className="text-sm font-medium text-primary mt-2">
              {plans.pro.generations} {language === 'ar' ? 'توليد/شهر' : 'generations/month'}
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {plans.pro.features[language].map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {currentPlanStats.plan === 'pro' ? (
            <Button variant="outline" disabled className="w-full">
              {language === 'ar' ? 'خطتك الحالية' : 'Current Plan'}
            </Button>
          ) : currentPlanStats.plan === 'business' ? (
            <Button variant="outline" disabled className="w-full">
              <X className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'لديك خطة أعلى' : 'You have a higher plan'}
            </Button>
          ) : (
            <Button
              className={cn('w-full', selectedPlan === 'pro' && 'bg-primary')}
              variant={selectedPlan === 'pro' ? 'default' : 'outline'}
            >
              {selectedPlan === 'pro' && <Check className="w-4 h-4 mr-2" />}
              {language === 'ar' ? 'اختر برو' : 'Select Pro'}
            </Button>
          )}
        </Card>

        {/* Business Plan */}
        <Card
          className={cn(
            'p-6 relative cursor-pointer transition-all border-2',
            selectedPlan === 'business'
              ? 'border-amber-500 bg-amber-500/5 scale-105 shadow-xl'
              : 'border-border hover:border-amber-500/50',
            currentPlanStats.plan === 'business' && 'ring-2 ring-amber-500/50'
          )}
          onClick={() =>
            (currentPlanStats.plan === 'free' || currentPlanStats.plan === 'pro') &&
            setSelectedPlan('business')
          }
        >
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              {language === 'ar' ? 'أفضل قيمة' : 'Best Value'}
            </span>
          </div>

          <div className="text-center mb-6 pt-4">
            <h3 className="text-xl font-bold mb-1">{plans.business.name[language]}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-amber-500">
                ${getPlanPrice('business').price}
              </span>
              <span className="text-muted-foreground">
                /{language === 'ar' ? (billingPeriod === 'yearly' ? 'سنة' : 'شهر') : (billingPeriod === 'yearly' ? 'year' : 'month')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getPlanPrice('business').priceDZD.toLocaleString()} {language === 'ar' ? 'د.ج' : 'DZD'}
            </p>
            {billingPeriod === 'yearly' && (
              <>
                <p className="text-xs text-emerald-600 mt-1">
                  {language === 'ar'
                    ? `(${getMonthlyEquivalent('business').price} دولار/شهر)`
                    : `(${getMonthlyEquivalent('business').price} USD/mo avg)`}
                </p>
                <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full mt-2">
                  <Sparkles className="w-3 h-3" />
                  {language === 'ar'
                    ? `وفّر ${getYearlySavings('business').price} (${getYearlySavings('business').priceDZD.toLocaleString()} د.ج)`
                    : `Save ${getYearlySavings('business').price} (${getYearlySavings('business').priceDZD.toLocaleString()} DZD)`}
                </div>
              </>
            )}
            <p className="text-sm font-medium text-amber-500 mt-2">
              {plans.business.generations} {language === 'ar' ? 'توليد/شهر' : 'generations/month'}
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {plans.business.features[language].map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {currentPlanStats.plan === 'business' ? (
            <Button variant="outline" disabled className="w-full">
              {language === 'ar' ? 'خطتك الحالية' : 'Current Plan'}
            </Button>
          ) : (
            <Button
              className={cn(
                'w-full',
                selectedPlan === 'business' &&
                  'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              )}
              variant={selectedPlan === 'business' ? 'default' : 'outline'}
            >
              {selectedPlan === 'business' && <Check className="w-4 h-4 mr-2" />}
              {language === 'ar' ? 'اختر بزنس' : 'Select Business'}
            </Button>
          )}
        </Card>
      </div>

      {/* Payment Section - Only show if user can upgrade */}
      {currentPlanStats.plan !== 'business' && (
        <>
          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              {language === 'ar' ? 'اختر وسيلة الدفع' : 'Select Payment Method'}
            </h3>

            <div className="grid gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPayment === method.id;

                return (
                  <Card
                    key={method.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all border-2',
                      !method.available && 'opacity-60',
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => method.available && setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                          method.color
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {language === 'ar' ? method.name.ar : method.name.en}
                          {!method.available && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {language === 'ar' ? 'قريباً' : 'Soon'}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? method.description.ar : method.description.en}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {method.brands.map((brand) => (
                          <span
                            key={brand}
                            className="text-xs bg-secondary px-2 py-1 rounded font-medium"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>

                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Summary & Pay Button */}
          <Card
            className={cn(
              'p-6 border-2',
              selectedPlan === 'pro'
                ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
                : 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المجموع' : 'Total'}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {isChargilyPayment(selectedPayment)
                      ? `${selectedPlanPrice.priceDZD.toLocaleString()} ${language === 'ar' ? 'د.ج' : 'DZD'}`
                      : `$${selectedPlanPrice.price}`}
                  </span>
                  <span className="text-muted-foreground">
                    /{language === 'ar' ? (billingPeriod === 'yearly' ? 'سنة' : 'شهر') : (billingPeriod === 'yearly' ? 'year' : 'month')}
                  </span>
                </div>
                {!isChargilyPayment(selectedPayment) && (
                  <p className="text-sm text-muted-foreground">
                    ≈ {selectedPlanPrice.priceDZD.toLocaleString()} {language === 'ar' ? 'د.ج' : 'DZD'}
                  </p>
                )}
                {billingPeriod === 'yearly' && (
                  <div className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-1 rounded-full mt-1">
                    <Sparkles className="w-3 h-3" />
                    {language === 'ar'
                      ? `وفّر ${getYearlySavings(selectedPlan).price}`
                      : `Save ${getYearlySavings(selectedPlan).price}`}
                  </div>
                )}
                <p className="text-sm font-medium mt-1">
                  {selectedPlanData.generations} {language === 'ar' ? 'توليد/شهر' : 'generations/month'}
                </p>
              </div>

              <Button
                size="lg"
                className={cn(
                  'gap-2',
                  selectedPlan === 'pro'
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                )}
                onClick={handlePayment}
                disabled={!selectedPayment || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {language === 'ar'
                ? 'دفع آمن ومشفر. يمكنك الإلغاء في أي وقت.'
                : 'Secure encrypted payment. Cancel anytime.'}
            </p>
          </Card>
        </>
      )}

      {/* Already on Business Plan Message */}
      {currentPlanStats.plan === 'business' && (
        <Card className="p-6 text-center bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <Rocket className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {language === 'ar' ? 'أنت على أعلى خطة!' : "You're on the top plan!"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'ar'
              ? 'استمتع بـ 1000 توليد شهرياً وجميع المميزات المتقدمة.'
              : 'Enjoy 1000 generations per month and all premium features.'}
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
