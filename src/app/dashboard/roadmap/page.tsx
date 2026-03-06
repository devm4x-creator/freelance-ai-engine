'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Map, Check, Circle, Lock, Sparkles, Target, DollarSign } from 'lucide-react';

const roadmapDays = [
  {
    day: 1,
    title: { en: 'Define Your Niche', ar: 'حدد تخصصك' },
    tasks: {
      en: ['Pick ONE skill to focus on', 'Research market demand', 'Identify 3 competitors'],
      ar: ['اختر مهارة واحدة للتركيز عليها', 'ابحث عن الطلب في السوق', 'حدد 3 منافسين']
    },
    tool: '/dashboard/branding'
  },
  {
    day: 2,
    title: { en: 'Create Your Brand', ar: 'أنشئ علامتك التجارية' },
    tasks: {
      en: ['Generate brand name', 'Create logo concept', 'Define your tone of voice'],
      ar: ['اختر اسم العلامة', 'أنشئ مفهوم الشعار', 'حدد نبرة صوتك']
    },
    tool: '/dashboard/branding'
  },
  {
    day: 3,
    title: { en: 'Build Your Portfolio', ar: 'ابني بورتفوليوك' },
    tasks: {
      en: ['Create 3 sample projects', 'Write case studies', 'Set up portfolio page'],
      ar: ['أنشئ 3 مشاريع نموذجية', 'اكتب دراسات حالة', 'جهز صفحة البورتفوليو']
    },
    tool: '/dashboard/portfolio'
  },
  {
    day: 4,
    title: { en: 'Set Your Prices', ar: 'حدد أسعارك' },
    tasks: {
      en: ['Calculate your rates', 'Create 3 packages', 'Prepare pricing PDF'],
      ar: ['احسب أسعارك', 'أنشئ 3 باقات', 'جهز ملف الأسعار']
    },
    tool: '/dashboard/business'
  },
  {
    day: 5,
    title: { en: 'Create Content', ar: 'أنشئ محتوى' },
    tasks: {
      en: ['Write 5 social posts', 'Create intro video script', 'Set up social profiles'],
      ar: ['اكتب 5 منشورات', 'أنشئ سكربت فيديو تعريفي', 'جهز حساباتك']
    },
    tool: '/dashboard/social'
  },
  {
    day: 6,
    title: { en: 'Start Outreach', ar: 'ابدأ التواصل' },
    tasks: {
      en: ['Send 10 cold DMs', 'Apply to 5 jobs', 'Post in freelancer groups'],
      ar: ['أرسل 10 رسائل', 'قدم على 5 مشاريع', 'انشر في مجموعات الفريلانس']
    },
    tool: '/dashboard/business'
  },
  {
    day: 7,
    title: { en: 'Close Your First Client', ar: 'اكسب أول عميل' },
    tasks: {
      en: ['Follow up on leads', 'Send proposals', 'Prepare contract'],
      ar: ['تابع العملاء المحتملين', 'أرسل عروض الأسعار', 'جهز العقد']
    },
    tool: '/dashboard/contracts'
  },
];

export default function RoadmapPage() {
  const { t, language } = useApp();
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    setCompletedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const progress = (completedDays.length / 7) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
          <Map className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t.dashboard.roadmap}</h1>
          <p className="text-muted-foreground">{t.dashboard.roadmapDesc}</p>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="p-6 gradient-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            <span className="font-semibold">{language === 'ar' ? 'التقدم' : 'Your Progress'}</span>
          </div>
          <Badge variant="secondary">{completedDays.length}/7 {language === 'ar' ? 'أيام' : 'Days'}</Badge>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {language === 'ar' ? 'الهدف: 100$' : 'Goal: $100'}
          </span>
          <div className="flex items-center gap-2 text-primary">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">${Math.round(progress)}</span>
          </div>
        </div>
      </Card>

      {/* Days */}
      <div className="space-y-4">
        {roadmapDays.map((day, index) => {
          const isCompleted = completedDays.includes(day.day);
          const isLocked = index > 0 && !completedDays.includes(day.day - 1) && !isCompleted;

          return (
            <Card
              key={day.day}
              className={`p-6 transition-all ${isCompleted ? 'border-primary/50 bg-primary/5' : ''} ${isLocked ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => !isLocked && toggleDay(day.day)}
                  disabled={isLocked}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-primary text-white'
                      : isLocked
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-secondary hover:bg-primary/20'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : <Circle className="w-5 h-5" />}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{language === 'ar' ? `اليوم ${day.day}` : `Day ${day.day}`}</Badge>
                    <h3 className="font-semibold">{day.title[language]}</h3>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {day.tasks[language].map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-primary" />
                        {task}
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" size="sm" asChild>
                    <a href={day.tool}>{language === 'ar' ? 'استخدم الأداة' : 'Use Tool'}</a>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
