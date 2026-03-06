'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Zap, Mail, Lock, User, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

function SignupForm() {
  const { signUp, isConfigured, isLoading: authLoading, user } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { error, session } = await signUp(email, password, name);

      if (error) {
        setError(error);
        setIsLoading(false);
      } else if (session) {
        // User is signed in immediately (email confirmation disabled)
        toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace('/dashboard');
      } else {
        // Email confirmation required
        setSuccess(true);
        toast.success(language === 'ar' ? 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني.' : 'Account created! Check your email to confirm.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render form if already logged in (will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar'
              ? `أرسلنا رابط التأكيد إلى ${email}`
              : `We've sent a confirmation link to ${email}`}
          </p>
          <Link href="/login">
            <Button className="w-full">
              {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        <Card className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="gradient-text">AI</span>
              <span className="text-foreground"> Freelancer</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Your Account'}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {language === 'ar' ? 'ابدأ رحلتك في الفريلانس اليوم' : 'Start your freelance journey today'}
          </p>

          {!isConfigured && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-500 mb-1">
                    {language === 'ar' ? 'خدمة المصادقة غير متاحة' : 'Authentication Service Unavailable'}
                  </p>
                  <p className="text-muted-foreground">
                    {language === 'ar'
                      ? 'يرجى المحاولة مرة أخرى لاحقًا أو التواصل مع الدعم.'
                      : 'Please try again later or contact support.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={!isConfigured || isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={!isConfigured || isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  disabled={!isConfigured || isLoading}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !isConfigured}>
              {isLoading
                ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating account...')
                : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {language === 'ar' ? 'سجل دخولك' : 'Sign in'}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
