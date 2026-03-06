'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Copy,
  Check,
  RefreshCw,
  Save,
  Download,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface ToolPageProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconColor: string;
  children: ReactNode;
  onGenerate: () => Promise<string>;
  toolType: string;
}

export function ToolPage({
  title,
  description,
  icon,
  iconColor,
  children,
  onGenerate,
  toolType,
}: ToolPageProps) {
  const { t, language, saveOutput } = useApp();
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await onGenerate();
      setOutput(result);
      toast.success('Generated successfully!');
    } catch (error) {
      toast.error('Failed to generate. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success(t.common.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveOutput({
      id: Math.random().toString(36).substr(2, 9),
      type: toolType,
      title: title,
      content: output,
      createdAt: new Date(),
    });
    setSaved(true);
    toast.success(t.common.saved);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolType}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6 space-y-6">
          {children}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t.common.generate}
              </>
            )}
          </Button>
        </Card>

        {/* Output */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{language === 'ar' ? 'توليد العرض' : 'Generated Output'}</h2>
            {output && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {output ? (
            <div className="bg-secondary/50 rounded-lg p-4 min-h-[300px] whitespace-pre-wrap text-sm leading-relaxed">
              {output}
            </div>
          ) : (
            <div className="bg-secondary/30 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Fill in the form and click Generate to see results here
              </p>
            </div>
          )}

          {output && (
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t.common.regenerate}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
