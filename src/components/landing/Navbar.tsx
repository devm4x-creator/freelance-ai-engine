'use client';

import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export function Navbar() {
  const { t, language, setLanguage, isLoggedIn } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
              <Image
                src="/favicon.svg"
                alt="AI Freelancer Logo"
                width={36}
                height={36}
                className="w-full h-full"
              />
            </div>
            <span className="font-display font-bold text-xl">
              <span className="gradient-text">AI</span>
              <span className="text-foreground"> Freelancer</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t.nav.features}
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t.nav.pricing}
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ar')} className={language === 'ar' ? 'bg-accent' : ''}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button>{t.nav.dashboard}</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">{t.nav.login}</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>{t.nav.getStarted}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/#features"
              className="block px-4 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.features}
            </Link>
            <Link
              href="/#pricing"
              className="block px-4 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.pricing}
            </Link>
            <div className="flex items-center gap-2 px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
            </div>
            <div className="pt-2 border-t border-border space-y-2">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">{t.nav.login}</Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button className="w-full">{t.nav.getStarted}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
