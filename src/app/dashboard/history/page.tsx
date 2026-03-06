'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  History,
  Trash2,
  Copy,
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Smartphone,
  Receipt,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  customer_name: string;
  customer_phone: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  receipt_url?: string;
}

export default function HistoryPage() {
  const { t, language, savedOutputs, deleteOutput, user } = useApp();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/payment/history?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success(t.common.copied);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {language === 'ar' ? 'مكتمل' : 'Approved'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" />
            {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30 gap-1">
            <XCircle className="w-3 h-3" />
            {language === 'ar' ? 'مرفوض' : 'Rejected'}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPlanLabel = (plan: string) => {
    if (plan === 'monthly') {
      return language === 'ar' ? 'شهري' : 'Monthly';
    }
    return language === 'ar' ? 'سنوي' : 'Yearly';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <History className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t.tools.history}</h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'سجل الاشتراكات والمدفوعات والمخرجات المحفوظة' : 'Subscription, payment, and saved output history'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            {language === 'ar' ? 'المدفوعات' : 'Payments'}
          </TabsTrigger>
          <TabsTrigger value="outputs" className="gap-2">
            <FileText className="w-4 h-4" />
            {language === 'ar' ? 'المخرجات' : 'Outputs'}
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {isLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            </Card>
          ) : payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        payment.status === 'approved' ? "bg-emerald-500/20" :
                        payment.status === 'pending' ? "bg-amber-500/20" : "bg-red-500/20"
                      )}>
                        <Smartphone className={cn(
                          "w-6 h-6",
                          payment.status === 'approved' ? "text-emerald-500" :
                          payment.status === 'pending' ? "text-amber-500" : "text-red-500"
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {language === 'ar' ? 'دفع بريدي موب' : 'BaridiMob Payment'}
                          </h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === 'ar' ? 'خطة' : 'Plan'}: {getPlanLabel(payment.plan)} - {payment.amount.toLocaleString()} DZD
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(payment.created_at)}
                          </span>
                          {payment.customer_phone && (
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              {payment.customer_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {payment.receipt_url && (
                      <Badge variant="outline" className="gap-1 shrink-0">
                        <Receipt className="w-3 h-3" />
                        {language === 'ar' ? 'الوصل مرفق' : 'Receipt attached'}
                      </Badge>
                    )}
                  </div>

                  {/* Status message */}
                  {payment.status === 'pending' && (
                    <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {language === 'ar'
                          ? 'طلبك قيد المراجعة. سيتم تفعيل اشتراكك خلال 24 ساعة بعد التحقق من الدفع.'
                          : 'Your request is being reviewed. Your subscription will be activated within 24 hours after payment verification.'}
                      </p>
                    </div>
                  )}
                  {payment.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {language === 'ar'
                          ? 'تم رفض طلب الدفع. يرجى التواصل مع الدعم للمزيد من المعلومات.'
                          : 'Payment request was rejected. Please contact support for more information.'}
                      </p>
                    </div>
                  )}
                  {payment.status === 'approved' && (
                    <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {language === 'ar'
                          ? 'تم تفعيل اشتراكك بنجاح! استمتع بجميع مميزات Pro.'
                          : 'Your subscription is active! Enjoy all Pro features.'}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar'
                  ? 'قم بالترقية إلى Pro للاستمتاع بجميع المميزات'
                  : 'Upgrade to Pro to enjoy all features'}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Outputs Tab */}
        <TabsContent value="outputs" className="space-y-4">
          {savedOutputs.length > 0 ? (
            <div className="space-y-4">
              {savedOutputs.map((output) => (
                <Card key={output.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary uppercase">{output.type}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(output.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-medium mb-2">{output.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{output.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(output.content)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteOutput(output.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'ar' ? 'لا توجد مخرجات محفوظة' : 'No saved outputs yet'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'ابدأ باستخدام الأدوات لحفظ مخرجاتك' : 'Start using tools to save your outputs'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
