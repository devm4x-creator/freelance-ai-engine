'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Globe, Crown, Pencil, Check, X, Camera, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { t, language, setLanguage, user, setUser, profilePicture, setProfilePicture } = useApp();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = () => {
    if (editedName.trim() && user) {
      setUser({ ...user, name: editedName.trim() });
      setIsEditingName(false);
      toast.success(language === 'ar' ? 'تم تحديث الاسم بنجاح' : 'Name updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setIsEditingName(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'الحجم الأقصى 2 ميجا' : 'Max file size is 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'ar' ? 'يرجى اختيار صورة' : 'Please select an image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfilePicture(result);
      toast.success(language === 'ar' ? 'تم تحديث الصورة بنجاح' : 'Profile picture updated');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success(language === 'ar' ? 'تم حذف الصورة' : 'Profile picture removed');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Settings className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t.tools.settings}</h1>
          <p className="text-muted-foreground">{language === 'ar' ? 'إعدادات حسابك' : 'Manage your account settings'}</p>
        </div>
      </div>

      {/* Profile Picture */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">{language === 'ar' ? 'صورة الملف الشخصي' : 'Profile Picture'}</h2>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-border flex items-center justify-center">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            {/* Overlay on hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Upload/Remove buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              {language === 'ar' ? 'تغيير الصورة' : 'Change Picture'}
            </Button>
            {profilePicture && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                {language === 'ar' ? 'حذف الصورة' : 'Remove Picture'}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'JPG, PNG - الحد الأقصى 2 ميجا' : 'JPG, PNG - Max 2MB'}
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </Card>

      {/* Account */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">{language === 'ar' ? 'الحساب' : 'Account'}</h2>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-[200px] h-9"
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                  onClick={handleSaveName}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium">{user?.name || 'User'}</p>
                <button
                  onClick={() => {
                    setEditedName(user?.name || '');
                    setIsEditingName(true);
                  }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title={language === 'ar' ? 'تعديل الاسم' : 'Edit name'}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          {user?.plan === 'pro' ? (
            <span className="premium-badge"><Crown className="w-3 h-3" /> PRO</span>
          ) : (
            <Link href="/dashboard/upgrade"><Button size="sm">{language === 'ar' ? 'ترقية للبرو' : 'Upgrade to Pro'}</Button></Link>
          )}
        </div>
      </Card>

      {/* Language */}
      <Card className="p-6 space-y-6">
        <h2 className="font-semibold">{language === 'ar' ? 'اللغة' : 'Language'}</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5" />
            <div>
              <Label>{language === 'ar' ? 'لغة الواجهة' : 'Interface Language'}</Label>
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'اختر لغة الواجهة' : 'Choose interface language'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
