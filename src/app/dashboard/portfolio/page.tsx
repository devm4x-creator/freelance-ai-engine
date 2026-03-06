'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ToolPage } from '@/components/dashboard/ToolPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderOpen } from 'lucide-react';
import { generatePortfolio } from '@/lib/ai-generator';

export default function PortfolioPage() {
  const { t, language } = useApp();
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    skills: '',
    tools: '',
    niche: '',
    experience: '2+ years',
    language: 'en',
  });

  const handleGenerate = async () => {
    return await generatePortfolio(formData, {
      authToken: session?.access_token,
    });
  };

  return (
    <ToolPage
      title={t.tools.portfolio}
      description={t.features.portfolio.desc}
      icon={<FolderOpen className="w-7 h-7 text-violet-500" />}
      iconColor="bg-violet-500/10 border border-violet-500/20"
      onGenerate={handleGenerate}
      toolType="portfolio"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'مهاراتك' : 'Your Skills'}</Label>
          <Input
            placeholder={language === 'ar' ? 'مثال: تصميم جرافيك، UI/UX، براندينج' : 'e.g., Graphic Design, UI/UX, Branding'}
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'ar' ? 'الأدوات' : 'Tools You Use'}</Label>
          <Input
            placeholder={language === 'ar' ? 'مثال: Figma, Photoshop, Illustrator' : 'e.g., Figma, Photoshop, Illustrator'}
            value={formData.tools}
            onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.common.niche}</Label>
          <Input
            placeholder={language === 'ar' ? 'مثال: التجارة الإلكترونية' : 'e.g., E-commerce, Tech Startups'}
            value={formData.niche}
            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'ar' ? 'الخبرة' : 'Experience'}</Label>
          <Select
            value={formData.experience}
            onValueChange={(value) => setFormData({ ...formData, experience: value })}
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
          <Label>{t.common.selectLanguage}</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => setFormData({ ...formData, language: value })}
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
    </ToolPage>
  );
}
