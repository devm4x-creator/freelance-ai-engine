'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ToolPage } from '@/components/dashboard/ToolPage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { generateContract } from '@/lib/ai-generator';

export default function ContractsPage() {
  const { t, language } = useApp();
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    clientName: '',
    projectDescription: '',
    price: '',
    timeline: '',
    language: 'en',
  });

  const handleGenerate = async () => {
    return await generateContract(formData, {
      authToken: session?.access_token,
    });
  };

  return (
    <ToolPage
      title={t.tools.contracts}
      description={t.features.contracts.desc}
      icon={<FileText className="w-7 h-7 text-orange-500" />}
      iconColor="bg-orange-500/10 border border-orange-500/20"
      onGenerate={handleGenerate}
      toolType="contract"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'اسم العميل' : 'Client Name'}</Label>
          <Input
            placeholder={language === 'ar' ? 'مثال: شركة المستقبل' : 'e.g., Future Corp'}
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'وصف المشروع' : 'Project Description'}</Label>
          <Textarea
            placeholder={language === 'ar' ? 'صف الخدمات...' : 'Describe the services...'}
            value={formData.projectDescription}
            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
          <Input
            placeholder="e.g., $500 USD"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المدة' : 'Timeline'}</Label>
          <Input
            placeholder="e.g., 2 weeks"
            value={formData.timeline}
            onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.common.selectLanguage}</Label>
          <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
