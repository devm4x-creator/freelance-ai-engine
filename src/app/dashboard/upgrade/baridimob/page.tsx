'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Upload,
  Copy,
  Check,
  Smartphone,
  User,
  Phone,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const RIP_NUMBER = '00799999002770232033';

const PLANS = {
  monthly: {
    price: 1350,
    name: 'AI Freelancer Pro - Monthly',
    nameAr: 'AI Freelancer Pro - شهري',
    period: 'month',
    periodAr: 'شهر',
  },
  yearly: {
    price: 13500,
    name: 'AI Freelancer Pro - Yearly',
    nameAr: 'AI Freelancer Pro - سنوي',
    period: 'year',
    periodAr: 'سنة',
  },
};

export default function BaridiMobPaymentPage() {
  const { language, user } = useApp();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') as 'monthly' | 'yearly' | null;
  const plan = planParam && PLANS[planParam] ? planParam : 'yearly';

  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedPlan = PLANS[plan];

  const copyRIP = async () => {
    try {
      await navigator.clipboard.writeText(RIP_NUMBER);
      setCopied(true);
      toast.success(language === 'ar' ? 'تم نسخ رقم الحساب' : 'RIP number copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(language === 'ar' ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(language === 'ar' ? 'يرجى رفع صورة فقط' : 'Please upload an image only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }
    if (!receiptFile) {
      toast.error(language === 'ar' ? 'يرجى رفع وصل الدفع' : 'Please upload the payment receipt');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      formData.append('plan', plan);
      formData.append('amount', selectedPlan.price.toString());
      formData.append('userEmail', user?.email || '');
      formData.append('userId', user?.id || '');

      const response = await fetch('/api/payment/baridimob', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        toast.success(language === 'ar' ? 'تم إرسال طلب الدفع بنجاح!' : 'Payment request submitted!');
      } else {
        throw new Error(data.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Request submitted!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' ? 'سيتم مراجعة طلبك خلال 24 ساعة.' : 'Your request will be reviewed within 24 hours.'}
          </p>
          <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-sm space-y-1">
            <p><span className="text-muted-foreground">{language === 'ar' ? 'الخطة:' : 'Plan:'}</span> {language === 'ar' ? selectedPlan.nameAr : selectedPlan.name}</p>
            <p><span className="text-muted-foreground">{language === 'ar' ? 'المبلغ:' : 'Amount:'}</span> {selectedPlan.price.toLocaleString()} DZD</p>
            <p><span className="text-muted-foreground">{language === 'ar' ? 'الاسم:' : 'Name:'}</span> {customerName}</p>
            <p><span className="text-muted-foreground">{language === 'ar' ? 'الهاتف:' : 'Phone:'}</span> {customerPhone}</p>
          </div>
          <Link href="/dashboard">
            <Button>{language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/upgrade">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Smartphone className="w-7 h-7 text-amber-500" />
            {language === 'ar' ? 'الدفع عبر بريدي موب' : 'Pay via BaridiMob'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'أرسل المبلغ ثم ارفع وصل الدفع' : 'Send the amount then upload the receipt'}
          </p>
        </div>
      </div>

      <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الخطة المختارة' : 'Selected Plan'}</p>
            <p className="font-semibold">{language === 'ar' ? selectedPlan.nameAr : selectedPlan.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-500">{selectedPlan.price.toLocaleString()} DZD</p>
            <p className="text-sm text-muted-foreground">/{language === 'ar' ? selectedPlan.periodAr : selectedPlan.period}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          {language === 'ar' ? 'خطوات الدفع' : 'Payment Steps'}
        </h2>
        <ol className={cn("space-y-3 text-sm list-decimal", language === 'ar' ? 'pr-6' : 'pl-6')}>
          <li>{language === 'ar' ? 'افتح تطبيق بريدي موب' : 'Open BaridiMob app'}</li>
          <li>{language === 'ar' ? `أرسل ${selectedPlan.price.toLocaleString()} دج إلى الحساب أدناه` : `Send ${selectedPlan.price.toLocaleString()} DZD to the account below`}</li>
          <li>{language === 'ar' ? 'التقط صورة لوصل الدفع' : 'Take a photo of the receipt'}</li>
          <li>{language === 'ar' ? 'ارفع الصورة واضغط تأكيد' : 'Upload and confirm'}</li>
        </ol>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">{language === 'ar' ? 'رقم الحساب (RIP)' : 'Account Number (RIP)'}</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-secondary rounded-lg p-4 font-mono text-lg tracking-wider text-center">{RIP_NUMBER}</div>
          <Button variant="outline" size="icon" onClick={copyRIP}>
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </Label>
            <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0555 XX XX XX" required dir="ltr" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {language === 'ar' ? 'وصل الدفع' : 'Payment Receipt'}
            </Label>
            <div
              className={cn("border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors", receiptPreview ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-primary")}
              onClick={() => document.getElementById('receipt-input')?.click()}
            >
              <input id="receipt-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {receiptPreview ? (
                <div className="space-y-3">
                  <img src={receiptPreview} alt="Receipt" className="max-h-48 mx-auto rounded-lg" />
                  <p className="text-sm text-emerald-500 flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" />
                    {language === 'ar' ? 'تم رفع الصورة' : 'Image uploaded'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">{language === 'ar' ? 'اضغط لرفع وصل الدفع' : 'Click to upload receipt'}</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />{language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}</> : <><CheckCircle2 className="w-5 h-5" />{language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {language === 'ar' ? 'سيتم مراجعة طلبك خلال 24 ساعة' : 'Your request will be reviewed within 24 hours'}
          </p>
        </form>
      </Card>
    </div>
  );
}
