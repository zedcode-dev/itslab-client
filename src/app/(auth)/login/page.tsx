// ============================================================================
// SRC/APP/(AUTH)/LOGIN/PAGE.TSX - Login Page
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLogin } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { GraduationCap } from 'lucide-react';
import { GuestRoute } from '@/components/guest-route';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMutation.isPending) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (response) => {
          const userRole = response.data.user.role;
          // Redirect based on role
          if (userRole === 'student') {
            router.push('/student/dashboard');
          } else if (userRole === 'instructor') {
            router.push('/instructor/dashboard');
          } else {
            router.push('/admin/dashboard');
          }
        },
      }
    );
  };

  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              < GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span>ITSLab</span>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your account to continue learning
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex items-center justify-between text-sm">
                  <Link href="/forgot-password" size="sm" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={loginMutation.isPending}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>

          {/*
          <Card className="mt-4 bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-3">Quick Test Accounts:</p>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Student:</strong> ahmed@example.com / Student@123
                </div>
                <div>
                  <strong>Instructor:</strong> saleh.khalifa@itslab.online / Instructor@123
                </div>
                <div>
                  <strong>Admin:</strong> admin@itslab.online / Admin@123
                </div>
              </div>
            </CardContent>
          </Card>
          */}
        </div>
      </div>
    </GuestRoute>
  );
}