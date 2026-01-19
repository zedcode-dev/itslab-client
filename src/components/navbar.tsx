// ============================================================================
// SRC/COMPONENTS/NAVBAR.TSX - Navigation Bar
// ============================================================================

'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu, X, User, LogOut, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [showBanner, setShowBanner] = useState(false);

  return (
    <>
      {showBanner && (
        <div className="bg-primary px-4 py-2 text-primary-foreground text-center text-xs font-bold flex items-center justify-center gap-2 relative overflow-hidden group">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Launch Special: Get 20% off all courses with code <span className="underline decoration-wavy decoration-white/30">ITSLAB20</span></span>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 hover:bg-white/10 p-1 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </div>
      )}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span>ITSLab</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
                Courses
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href={
                      user?.role === 'student'
                        ? '/student/dashboard'
                        : user?.role === 'instructor'
                          ? '/instructor/dashboard'
                          : '/admin/dashboard'
                    }
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>

                  <div className="flex items-center gap-3 pl-3 border-l">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t animate-slide-down">
              <div className="flex flex-col gap-4">
                <Link
                  href="/courses"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      href={
                        user?.role === 'student'
                          ? '/student/dashboard'
                          : user?.role === 'instructor'
                            ? '/instructor/dashboard'
                            : '/admin/dashboard'
                      }
                      className="text-sm font-medium hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}