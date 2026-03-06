'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Palette, Image as ImageIcon, FileText, Download, RefreshCw, Sparkles, Copy, Check, Save, Trash2, History, X, Loader2 } from 'lucide-react';
import { generateBranding } from '@/lib/ai-generator';
import { LogoMockups } from '@/components/dashboard/LogoMockups';
import { toast } from 'sonner';

interface SavedLogo {
  id: string;
  image: string;
  prompt: string;
  logoName: string; // Brand name for mockups
  style: string;
  colorScheme: string;
  createdAt: string;
}

export default function BrandingPage() {
  const { t, language, saveOutput } = useApp();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('logo');

  // Logo generator state - with separate logoName for mockups
  const [logoData, setLogoData] = useState({
    prompt: '',
    logoName: '', // Brand name displayed in mockups
    style: 'modern',
    colorScheme: 'emerald',
    logoType: 'full',
  });
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number>(0);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [savedLogos, setSavedLogos] = useState<SavedLogo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // Brand identity state
  const [brandData, setBrandData] = useState({
    businessType: '',
    targetAudience: '',
    style: 'modern',
    language: 'en',
  });
  const [brandOutput, setBrandOutput] = useState('');
  const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved logos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fae-saved-logos');
    if (saved) {
      try {
        setSavedLogos(JSON.parse(saved));
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save logos to localStorage
  const persistSavedLogos = (logos: SavedLogo[]) => {
    localStorage.setItem('fae-saved-logos', JSON.stringify(logos));
    setSavedLogos(logos);
  };

  const colorSchemes = [
    { id: 'emerald', name: language === 'ar' ? 'أخضر زمردي' : 'Emerald', colors: ['#10B981', '#059669'] },
    { id: 'blue', name: language === 'ar' ? 'أزرق سماوي' : 'Sky Blue', colors: ['#0EA5E9', '#0284C7'] },
    { id: 'amber', name: language === 'ar' ? 'ذهبي' : 'Golden', colors: ['#F59E0B', '#D97706'] },
    { id: 'rose', name: language === 'ar' ? 'وردي' : 'Rose', colors: ['#F43F5E', '#E11D48'] },
    { id: 'violet', name: language === 'ar' ? 'بنفسجي' : 'Violet', colors: ['#8B5CF6', '#7C3AED'] },
    { id: 'slate', name: language === 'ar' ? 'رمادي' : 'Slate', colors: ['#475569', '#334155'] },
    { id: 'indigo', name: language === 'ar' ? 'نيلي' : 'Indigo', colors: ['#6366F1', '#4F46E5'] },
    { id: 'cyan', name: language === 'ar' ? 'سماوي' : 'Cyan', colors: ['#06B6D4', '#0891B2'] },
    { id: 'teal', name: language === 'ar' ? 'أخضر مزرق' : 'Teal', colors: ['#14B8A6', '#0D9488'] },
    { id: 'orange', name: language === 'ar' ? 'برتقالي' : 'Orange', colors: ['#F97316', '#EA580C'] },
    { id: 'red', name: language === 'ar' ? 'أحمر' : 'Red', colors: ['#EF4444', '#DC2626'] },
    { id: 'pink', name: language === 'ar' ? 'زهري' : 'Pink', colors: ['#EC4899', '#DB2777'] },
    { id: 'lime', name: language === 'ar' ? 'ليموني' : 'Lime', colors: ['#84CC16', '#65A30D'] },
    { id: 'yellow', name: language === 'ar' ? 'أصفر' : 'Yellow', colors: ['#EAB308', '#CA8A04'] },
    { id: 'fuchsia', name: language === 'ar' ? 'فوشيا' : 'Fuchsia', colors: ['#D946EF', '#C026D3'] },
    { id: 'black', name: language === 'ar' ? 'أسود' : 'Black', colors: ['#171717', '#0A0A0A'] },
  ];

  const handleGenerateLogo = async () => {
    // Validate: For "Logo with Text", brand name is required
    if (logoData.logoType === 'full' && !logoData.logoName.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم العلامة التجارية للشعار مع نص' : 'Please enter a brand name for logo with text');
      return;
    }

    // At least one of brand name or description is required
    if (!logoData.logoName.trim() && !logoData.prompt.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم العلامة أو وصف النشاط' : 'Please enter a brand name or business description');
      return;
    }

    setIsGeneratingLogo(true);
    setGeneratedLogos([]);
    setSelectedLogoIndex(0);
    setGenerationProgress(0);
    setGenerationStep(language === 'ar' ? 'بدء التوليد...' : 'Starting generation...');

    try {
      // Simulate progress steps for better UX
      setGenerationStep(language === 'ar' ? 'تحليل الوصف...' : 'Analyzing prompt...');
      setGenerationProgress(10);
      await new Promise((res) => setTimeout(res, 400));

      setGenerationStep(language === 'ar' ? 'تجهيز الأنماط والألوان...' : 'Preparing styles and colors...');
      setGenerationProgress(25);
      await new Promise((res) => setTimeout(res, 400));

      setGenerationStep(language === 'ar' ? 'توليد الشعارات...' : 'Generating logos...');
      setGenerationProgress(50);

      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: logoData.prompt, // Business description
          logoName: logoData.logoName, // Brand name (text that appears in logo)
          style: logoData.style,
          colorScheme: colorSchemes.find(c => c.id === logoData.colorScheme)?.name || 'emerald green',
          includeText: logoData.logoType === 'full',
          variations: 3,
          authToken: session?.access_token, // Include auth token for generation tracking
        }),
      });

      setGenerationStep(language === 'ar' ? 'معالجة النتائج...' : 'Processing results...');
      setGenerationProgress(80);

      const result = await response.json();

      if (result.success && result.logos?.length > 0) {
        setGeneratedLogos(result.logos);
        setGenerationProgress(100);
        setGenerationStep(language === 'ar' ? 'تم التوليد بنجاح!' : 'Generation complete!');

        // Show generation stats if available
        if (result.generationStats) {
          toast.success(
            language === 'ar'
              ? `تم توليد ${result.logos.length} شعارات! (${result.generationStats.remaining} توليد متبقي)`
              : `Generated ${result.logos.length} logos! (${result.generationStats.remaining} generations remaining)`
          );
        } else {
          toast.success(
            language === 'ar'
              ? `تم توليد ${result.logos.length} نسخ من الشعار!`
              : `Generated ${result.logos.length} logo variations!`
          );
        }
      } else if (result.limitReached) {
        // Handle generation limit reached
        setGenerationStep(language === 'ar' ? 'تم الوصول للحد الأقصى' : 'Limit reached');
        setGenerationProgress(0);
        toast.error(
          language === 'ar'
            ? `تم استنفاد رصيد التوليدات (${result.stats?.used}/${result.stats?.limit}). قم بالترقية للحصول على المزيد!`
            : `Generation limit reached (${result.stats?.used}/${result.stats?.limit}). Upgrade for more!`
        );
      } else {
        setGenerationStep(language === 'ar' ? 'فشل التوليد' : 'Generation failed');
        setGenerationProgress(0);
        toast.error(result.error || 'Failed to generate logos');
      }
    } catch (error) {
      setGenerationStep(language === 'ar' ? 'حدث خطأ' : 'Error');
      setGenerationProgress(0);
      console.error('Logo generation error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في توليد الشعار' : 'Error generating logo');
    } finally {
      setTimeout(() => {
        setIsGeneratingLogo(false);
        setGenerationProgress(0);
        setGenerationStep('');
      }, 1000);
    }
  };

  // Extract brand name from prompt (simple heuristic)
  const extractBrandName = (prompt: string): string => {
    // Try to extract name in quotes
    const quotedMatch = prompt.match(/[""]([^""]+)[""]/);
    if (quotedMatch) return quotedMatch[1];

    // Try to extract name after "called" or "named"
    const calledMatch = prompt.match(/(?:called|named|اسمها|اسمه)\s+[""]?([A-Za-z0-9\u0600-\u06FF\s]+?)[""]?(?:\s|,|\.|\)|$)/i);
    if (calledMatch) return calledMatch[1].trim();

    // Fallback: use first few words
    const words = prompt.split(/\s+/).slice(0, 2).join(' ');
    return words || 'Brand';
  };

  // Get the display name for mockups
  const getDisplayName = (): string => {
    if (logoData.logoName.trim()) return logoData.logoName.trim();
    return extractBrandName(logoData.prompt);
  };

  const handleSaveLogo = (imageIndex: number) => {
    const image = generatedLogos[imageIndex];
    if (!image) return;

    const newLogo: SavedLogo = {
      id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      image,
      prompt: logoData.prompt,
      logoName: logoData.logoName || extractBrandName(logoData.prompt),
      style: logoData.style,
      colorScheme: logoData.colorScheme,
      createdAt: new Date().toISOString(),
    };

    const updated = [newLogo, ...savedLogos].slice(0, 20); // Keep max 20 logos
    persistSavedLogos(updated);
    toast.success(language === 'ar' ? 'تم حفظ الشعار!' : 'Logo saved!');
  };

  const handleDeleteSavedLogo = (id: string) => {
    const updated = savedLogos.filter(l => l.id !== id);
    persistSavedLogos(updated);
    toast.success(language === 'ar' ? 'تم حذف الشعار' : 'Logo deleted');
  };

  const handleUseSavedLogo = (logo: SavedLogo) => {
    setGeneratedLogos([logo.image]);
    setSelectedLogoIndex(0);
    setLogoData(prev => ({
      ...prev,
      prompt: logo.prompt,
      logoName: logo.logoName || extractBrandName(logo.prompt),
      style: logo.style,
      colorScheme: logo.colorScheme,
    }));
    setShowHistory(false);
    toast.success(language === 'ar' ? 'تم تحميل الشعار' : 'Logo loaded');
  };

  const removeWhiteBackground = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(base64Image);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const threshold = 245;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > threshold && g > threshold && b > threshold) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = `data:image/png;base64,${base64Image}`;
    });
  };

  const handleDownloadPNG = async (imageIndex?: number) => {
    const image = generatedLogos[imageIndex ?? selectedLogoIndex];
    if (!image) return;

    toast.info(language === 'ar' ? 'جاري معالجة الشعار...' : 'Processing...');
    try {
      const transparentImage = await removeWhiteBackground(image);
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${transparentImage}`;
      const fileName = getDisplayName();
      link.download = `${fileName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(language === 'ar' ? 'تم تحميل الشعار!' : 'Logo downloaded!');
    } catch {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${image}`;
      const fileName = getDisplayName();
      link.download = `${fileName.replace(/\s+/g, '-').toLowerCase()}-logo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadJPG = (imageIndex?: number) => {
    const image = generatedLogos[imageIndex ?? selectedLogoIndex];
    if (!image) return;

    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      const fileName = getDisplayName();
      link.download = `${fileName.replace(/\s+/g, '-').toLowerCase()}-logo.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(language === 'ar' ? 'تم تحميل الشعار!' : 'Logo downloaded!');
    };
    img.src = `data:image/png;base64,${image}`;
  };

  const handleGenerateBrand = async () => {
    setIsGeneratingBrand(true);
    try {
      const result = await generateBranding(brandData, {
        authToken: session?.access_token,
      });
      setBrandOutput(result);
      toast.success(language === 'ar' ? 'تم توليد الهوية بنجاح!' : 'Brand identity generated!');
    } catch (error) {
      console.error('Brand generation error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error generating brand identity');
    } finally {
      setIsGeneratingBrand(false);
    }
  };

  const handleCopyBrand = async () => {
    await navigator.clipboard.writeText(brandOutput);
    setCopied(true);
    toast.success(language === 'ar' ? 'تم النسخ!' : 'Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBrand = () => {
    saveOutput({
      id: Math.random().toString(36).substr(2, 9),
      type: 'branding',
      title: brandData.businessType || 'Brand Identity',
      content: brandOutput,
      createdAt: new Date(),
    });
    toast.success(language === 'ar' ? 'تم الحفظ!' : 'Saved!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Palette className="w-7 h-7 text-emerald-500" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold mb-1">{t.tools.branding}</h1>
          <p className="text-muted-foreground">{t.features.branding.desc}</p>
        </div>
        {savedLogos.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="shrink-0"
          >
            <History className="w-4 h-4 mr-2" />
            {language === 'ar' ? `الشعارات المحفوظة (${savedLogos.length})` : `Saved Logos (${savedLogos.length})`}
          </Button>
        )}
      </div>

      {/* Saved Logos History Panel */}
      {showHistory && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {language === 'ar' ? 'الشعارات المحفوظة' : 'Saved Logos'}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {savedLogos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {savedLogos.map((logo) => (
                <div key={logo.id} className="group relative">
                  <div
                    className="aspect-square rounded-lg border-2 border-border bg-white overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleUseSavedLogo(logo)}
                  >
                    <img
                      src={`data:image/png;base64,${logo.image}`}
                      alt={logo.prompt}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedLogo(logo.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-1 truncate">{logo.logoName || extractBrandName(logo.prompt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {language === 'ar' ? 'لا توجد شعارات محفوظة' : 'No saved logos yet'}
            </p>
          )}
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {language === 'ar' ? 'مولد الشعار' : 'Logo Generator'}
          </TabsTrigger>
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {language === 'ar' ? 'الهوية البصرية' : 'Brand Identity'}
          </TabsTrigger>
        </TabsList>

        {/* Logo Generator Tab */}
        <TabsContent value="logo" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {language === 'ar' ? 'معلومات الشعار' : 'Logo Details'}
              </h2>

              <div className="space-y-4">
                {/* Logo Type Selection with Visual Examples */}
                {/* ... unchanged code ... */}
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نوع الشعار' : 'Logo Type'}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Logo with Text Option */}
                    <button
                      type="button"
                      onClick={() => setLogoData({ ...logoData, logoType: 'full' })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        logoData.logoType === 'full'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="h-12 flex items-center justify-center mb-2 rounded-lg bg-[#0c0e13]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-[10px] bg-[transparent] text-[#ffffff]">BRAND</div>
                            <div className="text-[8px] text-[#ffffff]">Slogan</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-center">
                        {language === 'ar' ? 'شعار مع نص' : 'Logo with Text'}
                      </p>
                      {logoData.logoType === 'full' && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>

                    {/* Icon Only Option */}
                    <button
                      type="button"
                      onClick={() => setLogoData({ ...logoData, logoType: 'icon' })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        logoData.logoType === 'icon'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="h-12 flex items-center justify-center mb-2 rounded-lg bg-[#0c0e13]">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-center">
                        {language === 'ar' ? 'أيقونة فقط' : 'Icon Only'}
                      </p>
                      {logoData.logoType === 'icon' && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Brand Name Field - Text that appears IN the logo */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {language === 'ar' ? 'اسم العلامة التجارية (النص في الشعار)' : 'Brand Name (Text in Logo)'}
                    {logoData.logoType === 'full' && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: نكسوس، TechFlow، مسار' : 'e.g., Nexus, TechFlow, مسار'}
                    value={logoData.logoName}
                    onChange={(e) => setLogoData({ ...logoData, logoName: e.target.value })}
                    className={logoData.logoType === 'full' && !logoData.logoName.trim() ? 'border-amber-500/50' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'هذا النص سيظهر داخل الشعار - اكتب اسم علامتك التجارية بالضبط كما تريده'
                      : 'This exact text will appear IN your logo - write your brand name exactly as you want it'}
                  </p>
                </div>

                {/* Logo Description Field - Business context, NOT the brand name */}
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'وصف النشاط التجاري' : 'Business Description'}</Label>
                  <Textarea
                    placeholder={language === 'ar'
                      ? 'مثال: وكالة تسويق رقمي متخصصة في السوشيال ميديا، أو متجر إلكتروني للملابس الرياضية'
                      : 'e.g., Digital marketing agency specializing in social media, or Online store for sports clothing'}
                    value={logoData.prompt}
                    onChange={(e) => setLogoData({ ...logoData, prompt: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar'
                      ? 'صف نشاطك التجاري فقط - لا تكتب اسم العلامة هنا، اكتبه في الحقل أعلاه'
                      : 'Describe your business only - do NOT write the brand name here, use the field above'}
                  </p>
                </div>

                {/* Style Selection with Visual Examples */}
                {/* ... unchanged code ... */}
                <div className="space-y-2">
                  <Label>{t.common.style}</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'modern', gradient: 'from-blue-500 to-cyan-400', icon: '◆' },
                      { id: 'minimal', gradient: 'from-gray-400 to-gray-600', icon: '○' },
                      { id: 'luxury', gradient: 'from-amber-400 to-yellow-600', icon: '✦' },
                      { id: 'bold', gradient: 'from-red-500 to-orange-500', icon: '⚡' },
                      { id: 'playful', gradient: 'from-pink-400 to-purple-500', icon: '★' },
                      { id: 'corporate', gradient: 'from-slate-500 to-slate-700', icon: '■' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setLogoData({ ...logoData, style: style.id })}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                          logoData.style === style.id
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-[10px]`}>
                          {style.icon}
                        </div>
                        <span className="text-xs font-medium">
                          {t.options.styles[style.id as keyof typeof t.options.styles]}
                        </span>
                        {logoData.style === style.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نظام الألوان' : 'Color Scheme'}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {(showAllColors ? colorSchemes : colorSchemes.slice(0, 4)).map((scheme) => (
                      <button
                        key={scheme.id}
                        type="button"
                        onClick={() => setLogoData({ ...logoData, colorScheme: scheme.id })}
                        className={`w-12 h-7 rounded-md border-2 transition-all overflow-hidden ${
                          logoData.colorScheme === scheme.id
                            ? 'border-primary ring-2 ring-primary/30 scale-110'
                            : 'border-border/40 hover:border-primary/50 hover:scale-110'
                        }`}
                        title={scheme.name}
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${scheme.colors[0]} 0%, ${scheme.colors[1]} 100%)`,
                          }}
                        />
                      </button>
                    ))}
                    {/* Show More / Show Less Button */}
                    <button
                      type="button"
                      onClick={() => setShowAllColors(!showAllColors)}
                      className="w-12 h-7 rounded-md border-2 border-dashed border-border/40 hover:border-primary/50 transition-all flex items-center justify-center bg-muted/30 hover:bg-muted/50"
                      title={showAllColors ? (language === 'ar' ? 'أقل' : 'Less') : (language === 'ar' ? 'المزيد' : 'More')}
                    >
                      {showAllColors ? (
                        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateLogo}
                disabled={isGeneratingLogo}
                className="w-full xl:text-[20px] xl:px-[40px] xl:py-[10px] rounded-[10px] text-[#ffffff] bg-[#12af42] xl:font-bold"
                size="lg"
              >
                {isGeneratingLogo ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري توليد 3 نسخ...' : 'Generating 3 variations...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'توليد 3 نسخ من الشعار' : 'Generate 3 Logo Variations'}
                  </>
                )}
              </Button>
            </Card>

            {/* Logo Output */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{language === 'ar' ? 'الشعارات المولدة' : 'Generated Logos'}</h2>
                {generatedLogos.length > 0 && (
                  <Badge variant="secondary">{generatedLogos.length} {language === 'ar' ? 'نسخ' : 'variations'}</Badge>
                )}
              </div>

              {/* Main Selected Logo */}
              <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-[#0c0e13]">
                {isGeneratingLogo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6">
                    {/* Skeleton Logo Preview */}
                    <div className="relative w-32 h-32 mb-6">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 animate-pulse" />
                      <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-muted to-muted/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="absolute inset-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" style={{ animationDelay: '300ms' }} />
                      <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-spin" />
                    </div>

                    {/* Progress */}
                    <Progress value={generationProgress} className="w-48 h-2 mb-3" />

                    {/* Status Text */}
                    <p className="text-sm font-medium text-foreground mb-1">
                      {generationStep || (language === 'ar' ? 'جاري توليد الشعارات...' : 'Generating logos...')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'قد يستغرق هذا 60-90 ثانية' : 'This may take 60-90 seconds'}
                    </p>

                    {/* Skeleton Thumbnails */}
                    <div className="flex gap-2 mt-6">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-lg bg-muted/60 animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : generatedLogos.length > 0 ? (
                  <img
                    src={`data:image/png;base64,${generatedLogos[selectedLogoIndex]}`}
                    alt={logoData.prompt}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-8">
                    <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'شعاراتك ستظهر هنا' : 'Your logos will appear here'}
                    </p>
                  </div>
                )}
              </div>

              {/* Variation Thumbnails */}
              {generatedLogos.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {generatedLogos.map((logo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedLogoIndex(index)}
                      className={`aspect-square rounded-lg border-2 bg-white overflow-hidden transition-all ${
                        selectedLogoIndex === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={`data:image/png;base64,${logo}`}
                        alt={`Variation ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              {generatedLogos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" onClick={() => handleDownloadPNG()}>
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadJPG()}>
                    <Download className="w-4 h-4 mr-2" />
                    JPG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSaveLogo(selectedLogoIndex)}>
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                </div>
              )}

              {generatedLogos.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleGenerateLogo}
                  disabled={isGeneratingLogo}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'توليد نسخ جديدة' : 'Generate New Variations'}
                </Button>
              )}
            </Card>
          </div>

          {/* Logo Mockups Preview */}
          {generatedLogos.length > 0 && (
            <div className="mt-6">
              <LogoMockups
                logoImage={generatedLogos[selectedLogoIndex]}
                brandName={getDisplayName()}
                slogan={undefined}
                colorScheme={logoData.colorScheme}
                language={language as 'en' | 'ar'}
              />
            </div>
          )}
        </TabsContent>

        {/* Brand Identity Tab */}
        <TabsContent value="identity" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">{language === 'ar' ? 'معلومات الهوية' : 'Brand Details'}</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.common.businessType}</Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: وكالة تسويق رقمي' : 'e.g., Digital Marketing Agency'}
                    value={brandData.businessType}
                    onChange={(e) => setBrandData({ ...brandData, businessType: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.common.targetAudience}</Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: رواد أعمال شباب' : 'e.g., Young entrepreneurs'}
                    value={brandData.targetAudience}
                    onChange={(e) => setBrandData({ ...brandData, targetAudience: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.common.style}</Label>
                  <Select
                    value={brandData.style}
                    onValueChange={(value) => setBrandData({ ...brandData, style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">{t.options.styles.modern}</SelectItem>
                      <SelectItem value="minimal">{t.options.styles.minimal}</SelectItem>
                      <SelectItem value="luxury">{t.options.styles.luxury}</SelectItem>
                      <SelectItem value="bold">{t.options.styles.bold}</SelectItem>
                      <SelectItem value="playful">{t.options.styles.playful}</SelectItem>
                      <SelectItem value="corporate">{t.options.styles.corporate}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.common.selectLanguage}</Label>
                  <Select
                    value={brandData.language}
                    onValueChange={(value) => setBrandData({ ...brandData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerateBrand}
                disabled={isGeneratingBrand}
                className="w-full"
                size="lg"
              >
                {isGeneratingBrand ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t.common.loading}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t.common.generate}
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{language === 'ar' ? 'الهوية البصرية' : 'Brand Identity'}</h2>
                {brandOutput && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCopyBrand}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSaveBrand}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {brandOutput ? (
                <div className="bg-secondary/50 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap text-sm leading-relaxed overflow-auto max-h-[600px]">
                  {brandOutput}
                </div>
              ) : (
                <div className="bg-secondary/30 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    {language === 'ar' ? 'املأ النموذج واضغط توليد' : 'Fill the form and click Generate'}
                  </p>
                </div>
              )}

              {brandOutput && (
                <Button
                  variant="outline"
                  onClick={handleGenerateBrand}
                  disabled={isGeneratingBrand}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t.common.regenerate}
                </Button>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
