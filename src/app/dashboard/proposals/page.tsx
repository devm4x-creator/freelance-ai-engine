'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ToolPage } from '@/components/dashboard/ToolPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, FileText, DollarSign, Calculator } from 'lucide-react';
import { generateProposal } from '@/lib/ai-generator';

// Platform logos configuration - using inline SVG data URIs for reliability
const platforms = [
  {
    id: 'khamsat',
    name: 'خمسات',
    nameEn: 'Khamsat',
    color: '#F5A623',
    textColor: '#404040',
  },
  {
    id: 'mostaql',
    name: 'مستقل',
    nameEn: 'Mostaql',
    color: '#2196F3',
    textColor: '#2196F3',
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    nameEn: 'Fiverr',
    color: '#1DBF73',
    textColor: '#404040',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameEn: 'WhatsApp',
    color: '#25D366',
    textColor: '#25D366',
  },
];

// Currency data with exchange rates (approximate)
const markets = [
  { id: 'DZ', name: 'Algeria', nameAr: 'الجزائر', currency: 'DZD', symbol: 'د.ج', rate: 135 },
  { id: 'AE', name: 'UAE', nameAr: 'الإمارات', currency: 'AED', symbol: 'د.إ', rate: 3.67 },
  { id: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', currency: 'SAR', symbol: 'ر.س', rate: 3.75 },
  { id: 'EG', name: 'Egypt', nameAr: 'مصر', currency: 'EGP', symbol: 'ج.م', rate: 31 },
  { id: 'MA', name: 'Morocco', nameAr: 'المغرب', currency: 'MAD', symbol: 'د.م', rate: 10 },
  { id: 'TN', name: 'Tunisia', nameAr: 'تونس', currency: 'TND', symbol: 'د.ت', rate: 3.1 },
  { id: 'JO', name: 'Jordan', nameAr: 'الأردن', currency: 'JOD', symbol: 'د.أ', rate: 0.71 },
  { id: 'KW', name: 'Kuwait', nameAr: 'الكويت', currency: 'KWD', symbol: 'د.ك', rate: 0.31 },
  { id: 'QA', name: 'Qatar', nameAr: 'قطر', currency: 'QAR', symbol: 'ر.ق', rate: 3.64 },
  { id: 'US', name: 'USA/International', nameAr: 'أمريكا/دولي', currency: 'USD', symbol: '$', rate: 1 },
  { id: 'EU', name: 'Europe', nameAr: 'أوروبا', currency: 'EUR', symbol: '€', rate: 0.92 },
  { id: 'GB', name: 'UK', nameAr: 'بريطانيا', currency: 'GBP', symbol: '£', rate: 0.79 },
];

// Base pricing in USD
const basePricing = {
  beginner: { hourly: { min: 10, max: 25 }, project: { min: 50, max: 200 } },
  intermediate: { hourly: { min: 25, max: 50 }, project: { min: 200, max: 500 } },
  expert: { hourly: { min: 50, max: 150 }, project: { min: 500, max: 2000 } },
};

const complexityMultiplier = {
  simple: 0.8,
  medium: 1,
  complex: 1.5,
};

export default function ProposalsPage() {
  const { t, language } = useApp();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('proposals');

  const [proposalData, setProposalData] = useState({
    proposalType: 'khamsat',
    clientRequest: '',
    experience: '2+ years',
    proposalLength: 'short',
  });

  const [pricingData, setPricingData] = useState({
    service: '',
    experience: 'intermediate',
    complexity: 'medium',
    market: 'DZ',
  });

  const [showPricing, setShowPricing] = useState(false);

  const handleGenerateProposal = async () => {
    return await generateProposal(proposalData, {
      authToken: session?.access_token,
    });
  };

  // Calculate pricing based on inputs
  const calculatedPricing = useMemo(() => {
    const base = basePricing[pricingData.experience as keyof typeof basePricing];
    const multiplier = complexityMultiplier[pricingData.complexity as keyof typeof complexityMultiplier];
    const market = markets.find(m => m.id === pricingData.market) || markets[0];

    const hourlyUSD = {
      min: Math.round(base.hourly.min * multiplier),
      max: Math.round(base.hourly.max * multiplier),
    };

    const projectUSD = {
      min: Math.round(base.project.min * multiplier),
      max: Math.round(base.project.max * multiplier),
    };

    const hourlyLocal = {
      min: Math.round(hourlyUSD.min * market.rate),
      max: Math.round(hourlyUSD.max * market.rate),
    };

    const projectLocal = {
      min: Math.round(projectUSD.min * market.rate),
      max: Math.round(projectUSD.max * market.rate),
    };

    return {
      market,
      hourlyUSD,
      projectUSD,
      hourlyLocal,
      projectLocal,
    };
  }, [pricingData]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Briefcase className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t.tools.proposals}</h1>
          <p className="text-muted-foreground">{t.features.proposals.desc}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {language === 'ar' ? 'مولد العروض' : 'Proposal Generator'}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {language === 'ar' ? 'حاسبة الأسعار' : 'Pricing Calculator'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-6">
          <ToolPage
            title={language === 'ar' ? 'مولد العروض' : 'Proposal Generator'}
            description={language === 'ar' ? 'أنشئ عروض أسعار احترافية' : 'Generate professional proposals for different platforms'}
            icon={<FileText className="w-7 h-7 text-amber-500" />}
            iconColor="bg-amber-500/10 border border-amber-500/20"
            onGenerate={handleGenerateProposal}
            toolType="proposal"
          >
            <div className="space-y-4">
              {/* Platform Selection with Logos */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اختر المنصة' : 'Select Platform'}</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setProposalData({ ...proposalData, proposalType: platform.id })}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        proposalData.proposalType === platform.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="w-full h-14 flex items-center justify-center rounded-lg bg-white mb-2">
                        {platform.id === 'khamsat' && (
                          <span className="text-2xl font-bold" style={{ color: '#404040' }}>
                            خ<span style={{ color: '#F5A623' }}>5</span>سات
                          </span>
                        )}
                        {platform.id === 'mostaql' && (
                          <span className="text-2xl font-bold" style={{ color: '#2196F3' }}>
                            مستقل
                          </span>
                        )}
                        {platform.id === 'fiverr' && (
                          <span className="text-2xl font-bold" style={{ color: '#404040' }}>
                            fiverr<span style={{ color: '#1DBF73' }}>.</span>
                          </span>
                        )}
                        {platform.id === 'whatsapp' && (
                          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="#25D366">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-sm font-medium text-center">
                        {language === 'ar' ? platform.name : platform.nameEn}
                      </p>
                      {proposalData.proposalType === platform.id && (
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'ما هو طلب العميل؟' : "What is the client's request?"}</Label>
                <Textarea
                  placeholder={language === 'ar'
                    ? 'مثال: مطلوب صفحة هبوط لمطعم في دبي بإسم "كاتيسناك" اترك العرض الخاص بك وسيتم التواصل لمناقشة باقي التفاصيل'
                    : 'e.g., Need a landing page for a restaurant in Dubai called "CattySnack". Leave your proposal and we will contact you to discuss the details.'}
                  value={proposalData.clientRequest}
                  onChange={(e) => setProposalData({ ...proposalData, clientRequest: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'انسخ طلب العميل هنا وسيتم إنشاء عرض مخصص بناءً عليه'
                    : 'Paste the client request here and a tailored proposal will be generated'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الخبرة' : 'Experience'}</Label>
                <Select
                  value={proposalData.experience}
                  onValueChange={(value) => setProposalData({ ...proposalData, experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6+ months">{language === 'ar' ? '+6 أشهر' : '6+ months'}</SelectItem>
                    <SelectItem value="1+ years">{language === 'ar' ? '+1 سنة' : '1+ years'}</SelectItem>
                    <SelectItem value="2+ years">{language === 'ar' ? '+2 سنوات' : '2+ years'}</SelectItem>
                    <SelectItem value="5+ years">{language === 'ar' ? '+5 سنوات' : '5+ years'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'طول العرض' : 'Proposal Length'}</Label>
                <Select
                  value={proposalData.proposalLength}
                  onValueChange={(value) => setProposalData({ ...proposalData, proposalLength: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_short">{language === 'ar' ? 'قصير جداً (2-3 جمل)' : 'Very Short (2-3 sentences)'}</SelectItem>
                    <SelectItem value="short">{language === 'ar' ? 'قصير (4-5 جمل)' : 'Short (4-5 sentences)'}</SelectItem>
                    <SelectItem value="normal">{language === 'ar' ? 'عادي (6-8 جمل)' : 'Normal (6-8 sentences)'}</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            </div>
          </ToolPage>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{language === 'ar' ? 'حاسبة الأسعار' : 'Pricing Calculator'}</h2>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'احسب أسعارك المثالية بناءً على خبرتك والسوق' : 'Calculate optimal pricing based on your experience and market'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'مستوى الخبرة' : 'Experience Level'}</Label>
                <Select
                  value={pricingData.experience}
                  onValueChange={(value) => { setPricingData({ ...pricingData, experience: value }); setShowPricing(true); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{language === 'ar' ? 'مبتدئ' : 'Beginner'}</SelectItem>
                    <SelectItem value="intermediate">{language === 'ar' ? 'متوسط' : 'Intermediate'}</SelectItem>
                    <SelectItem value="expert">{language === 'ar' ? 'خبير' : 'Expert'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'تعقيد المشروع' : 'Project Complexity'}</Label>
                <Select
                  value={pricingData.complexity}
                  onValueChange={(value) => { setPricingData({ ...pricingData, complexity: value }); setShowPricing(true); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">{language === 'ar' ? 'بسيط' : 'Simple'}</SelectItem>
                    <SelectItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
                    <SelectItem value="complex">{language === 'ar' ? 'معقد' : 'Complex'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الدولة / السوق' : 'Country / Market'}</Label>
                <Select
                  value={pricingData.market}
                  onValueChange={(value) => { setPricingData({ ...pricingData, market: value }); setShowPricing(true); }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {language === 'ar' ? market.nameAr : market.name} ({market.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => setShowPricing(true)}
              className="w-full mb-6"
              size="lg"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'احسب الأسعار' : 'Calculate Prices'}
            </Button>

            {showPricing && (
              <div className="space-y-4">
                {/* Pricing Table */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-start p-4 font-semibold">
                          {language === 'ar' ? 'نوع التسعير' : 'Pricing Type'}
                        </th>
                        <th className="text-center p-4 font-semibold">
                          USD ($)
                        </th>
                        <th className="text-center p-4 font-semibold">
                          {calculatedPricing.market.currency} ({calculatedPricing.market.symbol})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-4">
                          <div className="font-medium">{language === 'ar' ? 'السعر بالساعة' : 'Hourly Rate'}</div>
                          <div className="text-sm text-muted-foreground">{language === 'ar' ? 'للمشاريع المستمرة' : 'For ongoing projects'}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-emerald-500">
                            ${formatNumber(calculatedPricing.hourlyUSD.min)} - ${formatNumber(calculatedPricing.hourlyUSD.max)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-amber-500">
                            {formatNumber(calculatedPricing.hourlyLocal.min)} - {formatNumber(calculatedPricing.hourlyLocal.max)} {calculatedPricing.market.symbol}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{language === 'ar' ? 'سعر المشروع' : 'Project Price'}</div>
                          <div className="text-sm text-muted-foreground">{language === 'ar' ? 'للمشاريع المحددة' : 'For fixed projects'}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-emerald-500">
                            ${formatNumber(calculatedPricing.projectUSD.min)} - ${formatNumber(calculatedPricing.projectUSD.max)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-lg font-bold text-amber-500">
                            {formatNumber(calculatedPricing.projectLocal.min)} - {formatNumber(calculatedPricing.projectLocal.max)} {calculatedPricing.market.symbol}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tips */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <h3 className="font-semibold mb-2">{language === 'ar' ? 'نصائح:' : 'Tips:'}</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {language === 'ar' ? 'ابدأ بالحد الأدنى إذا كنت جديداً في السوق' : 'Start with minimum if you are new to the market'}</li>
                    <li>• {language === 'ar' ? 'ارفع أسعارك تدريجياً مع زيادة خبرتك ومحفظتك' : 'Gradually increase prices as you gain experience and portfolio'}</li>
                    <li>• {language === 'ar' ? 'المشاريع المعقدة تستحق أسعاراً أعلى' : 'Complex projects deserve higher prices'}</li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
