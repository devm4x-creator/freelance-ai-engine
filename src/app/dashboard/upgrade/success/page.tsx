'use client';

import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const { language } = useApp();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // You can verify the payment here using the session_id
    if (sessionId) {
      console.log('Payment session:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="max-w-lg mx-auto text-center">
      <Card className="p-8 space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            {language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'مرحباً بك في AI Freelancer Pro! تم تفعيل اشتراكك.'
              : 'Welcome to AI Freelancer Pro! Your subscription is now active.'}
          </p>
        </div>

        {/* Features Unlocked */}
        <div className="bg-primary/10 rounded-lg p-4 text-left">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {language === 'ar' ? 'المميزات المفعّلة' : 'Features Unlocked'}
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {language === 'ar' ? 'توليدات AI غير محدودة' : 'Unlimited AI generations'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {language === 'ar' ? 'دعم أولوية 24/7' : 'Priority support 24/7'}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {language === 'ar' ? 'جميع الأدوات المتقدمة' : 'All premium tools'}
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <Link href="/dashboard">
          <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
            {language === 'ar' ? 'ابدأ الاستخدام' : 'Start Using Pro Features'}
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
