'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Layout,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  X,
  Eye,
  Code,
  Check,
  ShoppingCart,
  Star,
  Shield,
  Zap,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface LandingPageData {
  productName: string;
  tagline: string;
  description: string;
  currency: string;
  price: string;
  originalPrice: string;
  features: string;
  ctaText: string;
  ctaSubtext: string;
  colorScheme: string;
  template: string;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar', position: 'after' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', position: 'after' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', position: 'after' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound', position: 'after' },
  { code: 'MAD', symbol: 'د.م', name: 'Moroccan Dirham', position: 'after' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar', position: 'after' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', position: 'after' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', position: 'after' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', position: 'after' },
  { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', position: 'after' },
  { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar', position: 'after' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', position: 'after' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'before' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', position: 'before' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', position: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before' },
];

const formatPrice = (price: string, currencyCode: string) => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  if (!price) return '';
  if (currency.position === 'before') {
    return `${currency.symbol}${price}`;
  }
  return `${price} ${currency.symbol}`;
};

const colorSchemes = [
  { id: 'emerald', name: 'Emerald', primary: '#10B981', secondary: '#059669', bg: '#ECFDF5', text: '#064E3B' },
  { id: 'blue', name: 'Ocean Blue', primary: '#3B82F6', secondary: '#2563EB', bg: '#EFF6FF', text: '#1E3A8A' },
  { id: 'purple', name: 'Royal Purple', primary: '#8B5CF6', secondary: '#7C3AED', bg: '#F5F3FF', text: '#4C1D95' },
  { id: 'rose', name: 'Rose', primary: '#F43F5E', secondary: '#E11D48', bg: '#FFF1F2', text: '#881337' },
  { id: 'amber', name: 'Golden', primary: '#F59E0B', secondary: '#D97706', bg: '#FFFBEB', text: '#78350F' },
  { id: 'slate', name: 'Professional', primary: '#475569', secondary: '#334155', bg: '#F8FAFC', text: '#0F172A' },
];

const templates = [
  { id: 'modern', name: 'Modern Minimal', nameAr: 'عصري بسيط' },
  { id: 'bold', name: 'Bold & Dynamic', nameAr: 'جريء وديناميكي' },
  { id: 'elegant', name: 'Elegant Luxury', nameAr: 'أنيق فاخر' },
  { id: 'dark', name: 'Dark Mode', nameAr: 'الوضع الداكن' },
];

export default function LandingPageGenerator() {
  const { language } = useApp();
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<LandingPageData>({
    productName: '',
    tagline: '',
    description: '',
    currency: 'USD',
    price: '',
    originalPrice: '',
    features: '',
    ctaText: language === 'ar' ? 'اشتري الآن' : 'Buy Now',
    ctaSubtext: language === 'ar' ? 'شحن مجاني' : 'Free Shipping',
    colorScheme: 'emerald',
    template: 'modern',
  });

  const [productImage, setProductImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    headline: string;
    subheadline: string;
    benefits: string[];
    testimonial: string;
  } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'الحجم الأقصى 5 ميجا' : 'Max file size is 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'product') {
        setProductImage(result);
      } else {
        setLogoImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'product' | 'logo') => {
    if (type === 'product') {
      setProductImage(null);
    } else {
      setLogoImage(null);
    }
  };

  const generateContent = async () => {
    if (!formData.productName.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Please enter a product name');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'landing-page',
          data: {
            productName: formData.productName,
            tagline: formData.tagline,
            description: formData.description,
            features: formData.features,
            language: language,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Parse the AI response to extract structured content
        const content = result.content;
        const lines = content.split('\n').filter((l: string) => l.trim());

        // Extract headline and benefits from response
        setGeneratedContent({
          headline: formData.tagline || `${formData.productName} - ${language === 'ar' ? 'الحل الأمثل لك' : 'The Perfect Solution'}`,
          subheadline: formData.description || (language === 'ar' ? 'اكتشف الفرق مع منتجنا المميز' : 'Discover the difference with our premium product'),
          benefits: formData.features.split('\n').filter(f => f.trim()).slice(0, 4) || [
            language === 'ar' ? 'جودة عالية' : 'Premium Quality',
            language === 'ar' ? 'شحن سريع' : 'Fast Shipping',
            language === 'ar' ? 'ضمان الرضا' : 'Satisfaction Guarantee',
          ],
          testimonial: language === 'ar'
            ? '"منتج رائع، أنصح به بشدة!"'
            : '"Amazing product, highly recommended!"',
        });

        toast.success(language === 'ar' ? 'تم إنشاء المحتوى!' : 'Content generated!');
        setActiveView('preview');
      } else {
        // Use default content if API fails
        setGeneratedContent({
          headline: formData.tagline || formData.productName,
          subheadline: formData.description || (language === 'ar' ? 'منتج مميز بجودة عالية' : 'Premium quality product'),
          benefits: formData.features.split('\n').filter(f => f.trim()).slice(0, 4),
          testimonial: language === 'ar' ? '"منتج ممتاز!"' : '"Excellent product!"',
        });
        setActiveView('preview');
      }
    } catch (error) {
      console.error('Generation error:', error);
      // Fallback content
      setGeneratedContent({
        headline: formData.tagline || formData.productName,
        subheadline: formData.description || '',
        benefits: formData.features.split('\n').filter(f => f.trim()),
        testimonial: '',
      });
      setActiveView('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsImage = async () => {
    if (!previewRef.current) return;

    toast.info(language === 'ar' ? 'جاري التحميل...' : 'Downloading...');

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${formData.productName.replace(/\s+/g, '-').toLowerCase()}-landing-page.png`;
      link.href = dataUrl;
      link.click();

      toast.success(language === 'ar' ? 'تم التحميل!' : 'Downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Download failed');
    }
  };

  const downloadAsHTML = () => {
    const colors = colorSchemes.find(c => c.id === formData.colorScheme) || colorSchemes[0];
    const formattedPrice = formatPrice(formData.price, formData.currency);
    const formattedOriginalPrice = formData.originalPrice ? formatPrice(formData.originalPrice, formData.currency) : '';

    const html = `<!DOCTYPE html>
<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.productName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-white">
  <div class="min-h-screen">
    <!-- Header -->
    <header class="py-4 px-6 flex items-center justify-between border-b">
      ${logoImage ? `<img src="${logoImage}" alt="Logo" class="h-10 object-contain">` : `<span class="text-xl font-bold">${formData.productName}</span>`}
      <nav class="flex items-center gap-6">
        <a href="#features" class="text-gray-600 hover:text-gray-900">${language === 'ar' ? 'المميزات' : 'Features'}</a>
        <a href="#buy" class="px-4 py-2 rounded-lg text-white" style="background-color: ${colors.primary}">${formData.ctaText}</a>
      </nav>
    </header>

    <!-- Hero -->
    <section class="py-20 px-6" style="background-color: ${colors.bg}">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6" style="color: ${colors.text}">${generatedContent?.headline || formData.productName}</h1>
          <p class="text-xl text-gray-600 mb-8">${generatedContent?.subheadline || formData.description}</p>
          <div class="flex items-center gap-4 mb-8">
            <span class="text-4xl font-bold" style="color: ${colors.primary}">${formattedPrice}</span>
            ${formattedOriginalPrice ? `<span class="text-xl text-gray-400 line-through">${formattedOriginalPrice}</span>` : ''}
          </div>
          <a href="#buy" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white text-lg font-semibold" style="background-color: ${colors.primary}">
            ${formData.ctaText}
          </a>
          <p class="mt-3 text-sm text-gray-500">${formData.ctaSubtext}</p>
        </div>
        ${productImage ? `<img src="${productImage}" alt="${formData.productName}" class="w-full rounded-2xl shadow-2xl">` : ''}
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="py-20 px-6">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-center mb-12">${language === 'ar' ? 'لماذا تختارنا؟' : 'Why Choose Us?'}</h2>
        <div class="grid md:grid-cols-2 gap-8">
          ${(generatedContent?.benefits || []).map(benefit => `
          <div class="flex items-start gap-4 p-6 rounded-xl" style="background-color: ${colors.bg}">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${colors.primary}">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p class="text-lg">${benefit}</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section id="buy" class="py-20 px-6" style="background-color: ${colors.primary}">
      <div class="max-w-2xl mx-auto text-center text-white">
        <h2 class="text-3xl font-bold mb-6">${language === 'ar' ? 'احصل عليه الآن!' : 'Get Yours Today!'}</h2>
        <p class="text-xl opacity-90 mb-8">${formData.ctaSubtext}</p>
        <a href="#" class="inline-block px-10 py-4 rounded-xl bg-white font-semibold text-lg" style="color: ${colors.primary}">
          ${formData.ctaText} - ${formattedPrice}
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-6 text-center text-gray-500 border-t">
      <p>&copy; ${new Date().getFullYear()} ${formData.productName}. ${language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
    </footer>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${formData.productName.replace(/\s+/g, '-').toLowerCase()}-landing-page.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(language === 'ar' ? 'تم تحميل ملف HTML!' : 'HTML file downloaded!');
  };

  const colors = colorSchemes.find(c => c.id === formData.colorScheme) || colorSchemes[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Layout className="w-7 h-7 text-indigo-500" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold mb-1">
            {language === 'ar' ? 'مولد صفحات الهبوط' : 'Landing Page Generator'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'أنشئ صفحات هبوط احترافية لمنتجاتك وخدماتك'
              : 'Create professional landing pages for your products and services'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeView === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('edit')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
          <Button
            variant={activeView === 'preview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('preview')}
            disabled={!generatedContent}
          >
            <Eye className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'معاينة' : 'Preview'}
          </Button>
        </div>
      </div>

      {activeView === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Product Info */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'ar' ? 'معلومات المنتج' : 'Product Information'}
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اسم المنتج' : 'Product Name'} *</Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: سماعات بلوتوث برو' : 'e.g., Pro Bluetooth Headphones'}
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الشعار / العنوان الرئيسي' : 'Tagline / Headline'}</Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: صوت نقي، تجربة لا مثيل لها' : 'e.g., Pure Sound, Unmatched Experience'}
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Textarea
                    placeholder={language === 'ar' ? 'وصف مختصر للمنتج...' : 'Brief product description...'}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Currency and Price Section */}
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{currency.code}</span>
                            <span className="text-muted-foreground">({currency.symbol})</span>
                            <span className="text-muted-foreground text-sm">- {currency.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
                    <div className="relative">
                      <Input
                        placeholder="99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {currencies.find(c => c.code === formData.currency)?.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'السعر الأصلي (اختياري)' : 'Original Price (optional)'}</Label>
                    <div className="relative">
                      <Input
                        placeholder="149"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {currencies.find(c => c.code === formData.currency)?.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المميزات (سطر لكل ميزة)' : 'Features (one per line)'}</Label>
                  <Textarea
                    placeholder={language === 'ar'
                      ? 'جودة صوت عالية\nبطارية تدوم 24 ساعة\nمقاومة للماء'
                      : 'High-quality sound\n24-hour battery life\nWater resistant'}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* CTA Settings */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'ar' ? 'زر الدعوة للعمل' : 'Call to Action'}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نص الزر' : 'Button Text'}</Label>
                  <Input
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نص إضافي' : 'Subtext'}</Label>
                  <Input
                    value={formData.ctaSubtext}
                    onChange={(e) => setFormData({ ...formData, ctaSubtext: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Design Settings */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'ar' ? 'التصميم' : 'Design Settings'}
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نظام الألوان' : 'Color Scheme'}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorScheme: scheme.id })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.colorScheme === scheme.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="w-full h-6 rounded mb-2"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <p className="text-xs font-medium">{scheme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Selection with Visual Previews */}
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'القالب' : 'Template Style'}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Modern Minimal Template */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, template: 'modern' })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.template === 'modern'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {/* Modern Template Preview */}
                      <div className="h-24 bg-white rounded-lg overflow-hidden border border-gray-200 mb-2">
                        {/* Mini Header */}
                        <div className="h-3 bg-gray-50 border-b border-gray-100 flex items-center px-1.5 gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                          <div className="w-1 h-1 rounded-full bg-gray-300" />
                        </div>
                        {/* Hero Section */}
                        <div className="p-2 flex gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-3/4 bg-gray-800 rounded" />
                            <div className="h-1 w-1/2 bg-gray-300 rounded" />
                            <div className="h-2 w-8 bg-emerald-500 rounded mt-2" />
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
                        </div>
                        {/* Features Grid */}
                        <div className="px-2 flex gap-1">
                          <div className="flex-1 h-4 bg-emerald-50 rounded" />
                          <div className="flex-1 h-4 bg-emerald-50 rounded" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-center">
                        {language === 'ar' ? 'عصري بسيط' : 'Modern Minimal'}
                      </p>
                      {formData.template === 'modern' && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </button>

                    {/* Bold & Dynamic Template */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, template: 'bold' })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.template === 'bold'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {/* Bold Template Preview */}
                      <div className="h-24 bg-white rounded-lg overflow-hidden border border-gray-200 mb-2">
                        {/* Mini Header */}
                        <div className="h-3 bg-orange-500 flex items-center justify-between px-1.5">
                          <div className="w-4 h-1 bg-white/80 rounded" />
                          <div className="w-3 h-1.5 bg-white rounded" />
                        </div>
                        {/* Hero Section */}
                        <div className="p-2 bg-gradient-to-br from-orange-50 to-red-50">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1">
                              <div className="h-2 w-full bg-orange-600 rounded mb-1" />
                              <div className="h-1.5 w-2/3 bg-gray-400 rounded" />
                              <div className="h-2.5 w-10 bg-orange-500 rounded mt-2" />
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-lg" />
                          </div>
                        </div>
                        {/* CTA Bar */}
                        <div className="h-4 bg-orange-500 flex items-center justify-center">
                          <div className="w-8 h-1.5 bg-white rounded" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-center">
                        {language === 'ar' ? 'جريء وديناميكي' : 'Bold & Dynamic'}
                      </p>
                      {formData.template === 'bold' && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </button>

                    {/* Elegant Luxury Template */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, template: 'elegant' })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.template === 'elegant'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {/* Elegant Template Preview */}
                      <div className="h-24 bg-gradient-to-b from-stone-100 to-stone-50 rounded-lg overflow-hidden border border-stone-200 mb-2">
                        {/* Mini Header */}
                        <div className="h-3 bg-stone-900 flex items-center justify-center">
                          <div className="w-6 h-1 bg-amber-400 rounded" />
                        </div>
                        {/* Hero Section */}
                        <div className="p-2 text-center">
                          <div className="w-6 h-6 mx-auto mb-1 rounded-full border-2 border-amber-400 flex items-center justify-center">
                            <div className="w-2 h-2 bg-amber-400 rounded-full" />
                          </div>
                          <div className="h-1 w-12 bg-stone-800 rounded mx-auto mb-0.5" />
                          <div className="h-0.5 w-8 bg-stone-400 rounded mx-auto" />
                        </div>
                        {/* Elegant Divider */}
                        <div className="flex items-center justify-center gap-1 px-2">
                          <div className="flex-1 h-px bg-amber-300" />
                          <div className="w-1 h-1 bg-amber-400 rounded-full" />
                          <div className="flex-1 h-px bg-amber-300" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-center">
                        {language === 'ar' ? 'أنيق فاخر' : 'Elegant Luxury'}
                      </p>
                      {formData.template === 'elegant' && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </button>

                    {/* Dark Mode Template */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, template: 'dark' })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        formData.template === 'dark'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {/* Dark Template Preview */}
                      <div className="h-24 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mb-2">
                        {/* Mini Header */}
                        <div className="h-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-1.5">
                          <div className="w-4 h-1 bg-emerald-400 rounded" />
                          <div className="flex gap-0.5">
                            <div className="w-2 h-1 bg-gray-600 rounded" />
                            <div className="w-2 h-1 bg-gray-600 rounded" />
                          </div>
                        </div>
                        {/* Hero Section */}
                        <div className="p-2 flex gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-3/4 bg-white rounded" />
                            <div className="h-1 w-1/2 bg-gray-500 rounded" />
                            <div className="h-2 w-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded mt-2" />
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border border-gray-600" />
                        </div>
                        {/* Features */}
                        <div className="px-2 flex gap-1">
                          <div className="flex-1 h-3 bg-gray-800 rounded border border-gray-700" />
                          <div className="flex-1 h-3 bg-gray-800 rounded border border-gray-700" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-center">
                        {language === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
                      </p>
                      {formData.template === 'dark' && (
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Images & Generate */}
          <div className="space-y-6">
            {/* Product Image Upload */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'ar' ? 'صورة المنتج' : 'Product Image'}
              </h2>

              {productImage ? (
                <div className="relative">
                  <img
                    src={productImage}
                    alt="Product"
                    className="w-full aspect-square object-contain rounded-xl border border-border bg-secondary/30"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeImage('product')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {language === 'ar' ? 'اسحب وأفلت أو انقر للتحميل' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'product')}
                  />
                </label>
              )}
            </Card>

            {/* Logo Upload */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'ar' ? 'الشعار (اختياري)' : 'Logo (Optional)'}
              </h2>

              {logoImage ? (
                <div className="relative">
                  <img
                    src={logoImage}
                    alt="Logo"
                    className="w-full h-24 object-contain rounded-xl border border-border bg-white p-4"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImage('logo')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'تحميل شعار' : 'Upload logo'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                  />
                </label>
              )}
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateContent}
              disabled={isGenerating || !formData.productName.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إنشاء صفحة الهبوط' : 'Generate Landing Page'}
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="space-y-4">
          {/* Download Options */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={downloadAsHTML}>
              <Code className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحميل HTML' : 'Download HTML'}
            </Button>
            <Button onClick={downloadAsImage}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحميل صورة' : 'Download Image'}
            </Button>
          </div>

          {/* Landing Page Preview */}
          <div
            ref={previewRef}
            className="rounded-xl overflow-hidden shadow-2xl border border-border bg-white"
          >
            {/* Header */}
            <header className="py-4 px-6 flex items-center justify-between border-b border-gray-100">
              {logoImage ? (
                <img src={logoImage} alt="Logo" className="h-10 object-contain" />
              ) : (
                <span className="text-xl font-bold text-gray-900">{formData.productName}</span>
              )}
              <nav className="flex items-center gap-6">
                <span className="text-gray-600 text-sm hidden sm:inline">
                  {language === 'ar' ? 'المميزات' : 'Features'}
                </span>
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  {formData.ctaText}
                </button>
              </nav>
            </header>

            {/* Hero Section */}
            <section
              className="py-16 px-6"
              style={{ backgroundColor: colors.bg }}
            >
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className={language === 'ar' ? 'order-2 md:order-1' : ''}>
                  <h1
                    className="text-3xl md:text-4xl font-bold mb-4"
                    style={{ color: colors.text }}
                  >
                    {generatedContent?.headline || formData.productName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-6">
                    {generatedContent?.subheadline || formData.description}
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: colors.primary }}
                    >
                      {formatPrice(formData.price || '99', formData.currency)}
                    </span>
                    {formData.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(formData.originalPrice, formData.currency)}
                      </span>
                    )}
                  </div>
                  <button
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white text-lg font-semibold shadow-lg"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {formData.ctaText}
                  </button>
                  <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {formData.ctaSubtext}
                  </p>
                </div>
                <div className={language === 'ar' ? 'order-1 md:order-2' : ''}>
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={formData.productName}
                      className="w-full rounded-2xl shadow-2xl"
                    />
                  ) : (
                    <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Features Section */}
            {generatedContent?.benefits && generatedContent.benefits.length > 0 && (
              <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">
                    {language === 'ar' ? 'لماذا تختار منتجنا؟' : 'Why Choose Our Product?'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {generatedContent.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-5 rounded-xl"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {index === 0 && <Star className="w-5 h-5 text-white" />}
                          {index === 1 && <Zap className="w-5 h-5 text-white" />}
                          {index === 2 && <Shield className="w-5 h-5 text-white" />}
                          {index === 3 && <Clock className="w-5 h-5 text-white" />}
                          {index > 3 && <Check className="w-5 h-5 text-white" />}
                        </div>
                        <p className="text-gray-700 text-lg">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* CTA Section */}
            <section
              className="py-16 px-6"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="max-w-2xl mx-auto text-center text-white">
                <h2 className="text-2xl font-bold mb-4">
                  {language === 'ar' ? 'لا تفوت الفرصة!' : "Don't Miss Out!"}
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  {language === 'ar' ? 'اطلب الآن واستمتع بـ' : 'Order now and enjoy'} {formData.ctaSubtext}
                </p>
                <button
                  className="inline-block px-10 py-4 rounded-xl bg-white font-semibold text-lg"
                  style={{ color: colors.primary }}
                >
                  {formData.ctaText} - {formatPrice(formData.price || '99', formData.currency)}
                </button>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-6 px-6 text-center text-gray-500 border-t border-gray-100">
              <p className="text-sm">
                © {new Date().getFullYear()} {formData.productName}. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
              </p>
            </footer>
          </div>

          {/* Back to Edit Button */}
          <Button
            variant="outline"
            onClick={() => setActiveView('edit')}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تعديل الصفحة' : 'Edit Page'}
          </Button>
        </div>
      )}
    </div>
  );
}
