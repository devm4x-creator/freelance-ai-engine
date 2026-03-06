'use client';

import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const { language } = useApp();

  return (
    <div className="max-w-lg mx-auto text-center">
      <Card className="p-8 space-y-6">
        {/* Failed Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'فشل الدفع' : 'Payment Failed'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'عذراً، لم نتمكن من معالجة الدفع. يرجى المحاولة مرة أخرى.'
              : 'Sorry, we could not process your payment. Please try again.'}
          </p>
        </div>

        {/* Possible Reasons */}
        <div className="bg-secondary/50 rounded-lg p-4 text-left">
          <h3 className="font-semibold mb-2">
            {language === 'ar' ? 'أسباب محتملة:' : 'Possible reasons:'}
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• {language === 'ar' ? 'رصيد غير كافٍ في البطاقة' : 'Insufficient card balance'}</li>
            <li>• {language === 'ar' ? 'معلومات البطاقة غير صحيحة' : 'Incorrect card information'}</li>
            <li>• {language === 'ar' ? 'انتهت صلاحية الجلسة' : 'Session expired'}</li>
            <li>• {language === 'ar' ? 'مشكلة في الاتصال' : 'Connection issue'}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/upgrade">
            <Button className="w-full gap-2">
              <RefreshCw className="w-4 h-4" />
              {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Button>
          </Link>
        </div>

        {/* Support */}
        <p className="text-xs text-muted-foreground">
          {language === 'ar'
            ? 'إذا استمرت المشكلة، تواصل معنا على support@aifreelancer.app'
            : 'If the problem persists, contact us at support@aifreelancer.app'}
        </p>
      </Card>
    </div>
  );
}
