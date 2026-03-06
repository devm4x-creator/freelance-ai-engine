'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Globe, Instagram, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogoMockupsProps {
  logoImage: string;
  brandName: string;
  slogan?: string;
  colorScheme: string;
  language: 'en' | 'ar';
}

const colorMap: Record<string, { primary: string; secondary: string; bg: string }> = {
  emerald: { primary: '#10B981', secondary: '#059669', bg: '#ECFDF5' },
  blue: { primary: '#0EA5E9', secondary: '#0284C7', bg: '#F0F9FF' },
  amber: { primary: '#F59E0B', secondary: '#D97706', bg: '#FFFBEB' },
  rose: { primary: '#F43F5E', secondary: '#E11D48', bg: '#FFF1F2' },
  violet: { primary: '#8B5CF6', secondary: '#7C3AED', bg: '#F5F3FF' },
  slate: { primary: '#475569', secondary: '#334155', bg: '#F8FAFC' },
};

export function LogoMockups({ logoImage, brandName, slogan, colorScheme, language }: LogoMockupsProps) {
  const [activeTab, setActiveTab] = useState('card');
  const colors = colorMap[colorScheme] || colorMap.emerald;

  const downloadMockup = (mockupId: string) => {
    const element = document.getElementById(mockupId);
    if (!element) return;

    // Use html2canvas approach with canvas
    import('html-to-image').then(({ toPng }) => {
      toPng(element, { quality: 0.95, pixelRatio: 2 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${brandName.replace(/\s+/g, '-').toLowerCase()}-${mockupId}.png`;
          link.href = dataUrl;
          link.click();
          toast.success(language === 'ar' ? 'تم تحميل الموكاب!' : 'Mockup downloaded!');
        })
        .catch(() => {
          toast.error(language === 'ar' ? 'حدث خطأ في التحميل' : 'Download failed');
        });
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'معاينة الشعار' : 'Logo Preview Mockups'}
        </h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="card" className="flex items-center gap-2 text-xs sm:text-sm">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ar' ? 'بطاقة عمل' : 'Business Card'}</span>
            <span className="sm:hidden">{language === 'ar' ? 'بطاقة' : 'Card'}</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2 text-xs sm:text-sm">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ar' ? 'موقع ويب' : 'Website'}</span>
            <span className="sm:hidden">{language === 'ar' ? 'ويب' : 'Web'}</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2 text-xs sm:text-sm">
            <Instagram className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ar' ? 'سوشيال' : 'Social'}</span>
            <span className="sm:hidden">{language === 'ar' ? 'سوشيال' : 'Social'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Card Mockup */}
        <TabsContent value="card" className="mt-4">
          <div className="space-y-4">
            <div
              id="mockup-business-card"
              className="relative mx-auto"
              style={{ maxWidth: '400px' }}
            >
              {/* Card Front */}
              <div
                className="aspect-[1.75/1] rounded-xl shadow-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
              >
                <div className="h-full flex flex-col items-center justify-center p-6 text-white">
                  <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 overflow-hidden">
                    <img
                      src={`data:image/png;base64,${logoImage}`}
                      alt={brandName}
                      className="w-16 h-16 object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                  <h4 className="text-xl font-bold">{brandName}</h4>
                  {slogan && <p className="text-sm opacity-80 mt-1">{slogan}</p>}
                </div>
              </div>

              {/* Card Back */}
              <div
                className="aspect-[1.75/1] rounded-xl shadow-2xl overflow-hidden mt-4 bg-white"
              >
                <div className="h-full flex flex-col p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden" style={{ backgroundColor: colors.bg }}>
                      <img
                        src={`data:image/png;base64,${logoImage}`}
                        alt={brandName}
                        className="w-full h-full object-contain p-1"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">{brandName}</h5>
                      <p className="text-xs text-gray-500">Creative Director</p>
                    </div>
                  </div>
                  <div className="mt-auto space-y-1.5 text-xs text-gray-600">
                    <p>contact@{brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                    <p>+1 (555) 123-4567</p>
                    <p>www.{brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => downloadMockup('mockup-business-card')}
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحميل موكاب البطاقة' : 'Download Card Mockup'}
            </Button>
          </div>
        </TabsContent>

        {/* Website Mockup */}
        <TabsContent value="website" className="mt-4">
          <div className="space-y-4">
            <div
              id="mockup-website"
              className="rounded-xl shadow-2xl overflow-hidden bg-white border border-gray-200"
            >
              {/* Browser Chrome */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-gray-500 text-center">
                  www.{brandName.toLowerCase().replace(/\s+/g, '')}.com
                </div>
              </div>

              {/* Website Header */}
              <div className="bg-white">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={`data:image/png;base64,${logoImage}`}
                        alt={brandName}
                        className="w-full h-full object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    </div>
                    <span className="font-bold text-gray-900">{brandName}</span>
                  </div>
                  <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
                    <span>{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
                    <span>{language === 'ar' ? 'خدمات' : 'Services'}</span>
                    <span>{language === 'ar' ? 'تواصل' : 'Contact'}</span>
                  </nav>
                </div>

                {/* Hero Section */}
                <div
                  className="px-6 py-12 text-center"
                  style={{ backgroundColor: colors.bg }}
                >
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg bg-white mb-6">
                    <img
                      src={`data:image/png;base64,${logoImage}`}
                      alt={brandName}
                      className="w-full h-full object-contain p-2"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {language === 'ar' ? `مرحباً بك في ${brandName}` : `Welcome to ${brandName}`}
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {slogan || (language === 'ar' ? 'نقدم لك أفضل الحلول الإبداعية' : 'Providing creative solutions for your business')}
                  </p>
                  <button
                    className="px-6 py-2.5 rounded-lg text-white font-medium text-sm"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                  </button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => downloadMockup('mockup-website')}
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحميل موكاب الموقع' : 'Download Website Mockup'}
            </Button>
          </div>
        </TabsContent>

        {/* Social Media Mockup */}
        <TabsContent value="social" className="mt-4">
          <div className="space-y-4">
            <div
              id="mockup-social"
              className="space-y-4"
            >
              {/* Instagram Profile */}
              <div className="rounded-xl shadow-xl overflow-hidden bg-white border border-gray-200 max-w-sm mx-auto">
                {/* Profile Header */}
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        padding: '3px',
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src={`data:image/png;base64,${logoImage}`}
                          alt={brandName}
                          className="w-14 h-14 object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{brandName.toLowerCase().replace(/\s+/g, '_')}</span>
                        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">{brandName}</p>
                      {slogan && <p className="text-xs text-gray-500 mt-1">{slogan}</p>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-around mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">128</div>
                      <div className="text-xs text-gray-500">{language === 'ar' ? 'منشور' : 'Posts'}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">10.5K</div>
                      <div className="text-xs text-gray-500">{language === 'ar' ? 'متابع' : 'Followers'}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">892</div>
                      <div className="text-xs text-gray-500">{language === 'ar' ? 'متابَع' : 'Following'}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    className="flex-1 py-2 rounded-lg text-white font-medium text-sm"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {language === 'ar' ? 'متابعة' : 'Follow'}
                  </button>
                  <button className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm">
                    {language === 'ar' ? 'رسالة' : 'Message'}
                  </button>
                </div>

                {/* Grid Preview */}
                <div className="grid grid-cols-3 gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square flex items-center justify-center"
                      style={{ backgroundColor: i === 2 ? colors.bg : '#f3f4f6' }}
                    >
                      {i === 2 && (
                        <img
                          src={`data:image/png;base64,${logoImage}`}
                          alt={brandName}
                          className="w-12 h-12 object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => downloadMockup('mockup-social')}
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحميل موكاب السوشيال' : 'Download Social Mockup'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
