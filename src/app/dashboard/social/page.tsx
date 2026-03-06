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
import { MessageSquare } from 'lucide-react';
import { generateSocialContent } from '@/lib/ai-generator';

export default function SocialPage() {
  const { t, language } = useApp();
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    niche: '',
    targetAudience: '',
    goal: 'sales',
    tone: 'professional',
    platform: 'instagram',
  });

  const handleGenerate = async () => {
    return await generateSocialContent(formData, {
      authToken: session?.access_token,
    });
  };

  return (
    <ToolPage
      title={t.tools.social}
      description={t.features.social.desc}
      icon={<MessageSquare className="w-7 h-7 text-cyan-500" />}
      iconColor="bg-cyan-500/10 border border-cyan-500/20"
      onGenerate={handleGenerate}
      toolType="social"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t.common.niche}</Label>
          <Input
            placeholder={language === 'ar' ? 'مثال: التصميم الجرافيكي' : 'e.g., Graphic Design'}
            value={formData.niche}
            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.common.targetAudience}</Label>
          <Input
            placeholder={language === 'ar' ? 'مثال: أصحاب المشاريع الصغيرة' : 'e.g., Small business owners'}
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.common.platform}</Label>
          <Select
            value={formData.platform}
            onValueChange={(value) => setFormData({ ...formData, platform: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">{t.options.platforms.instagram}</SelectItem>
              <SelectItem value="facebook">{t.options.platforms.facebook}</SelectItem>
              <SelectItem value="tiktok">{t.options.platforms.tiktok}</SelectItem>
              <SelectItem value="linkedin">{t.options.platforms.linkedin}</SelectItem>
              <SelectItem value="twitter">{t.options.platforms.twitter}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.common.goal}</Label>
          <Select
            value={formData.goal}
            onValueChange={(value) => setFormData({ ...formData, goal: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">{t.options.goals.sales}</SelectItem>
              <SelectItem value="awareness">{t.options.goals.awareness}</SelectItem>
              <SelectItem value="growth">{t.options.goals.growth}</SelectItem>
              <SelectItem value="engagement">{t.options.goals.engagement}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t.common.tone}</Label>
          <Select
            value={formData.tone}
            onValueChange={(value) => setFormData({ ...formData, tone: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">{t.options.tones.professional}</SelectItem>
              <SelectItem value="friendly">{t.options.tones.friendly}</SelectItem>
              <SelectItem value="casual">{t.options.tones.casual}</SelectItem>
              <SelectItem value="energetic">{t.options.tones.energetic}</SelectItem>
              <SelectItem value="darija">{t.options.tones.darija}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ToolPage>
  );
}
