// ============================================================================
// SRC/APP/INSTRUCTOR/LAYOUT.TSX - Instructor Layout (Coming Soon)
// ============================================================================

'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Construction, ArrowLeft, Bell, Sparkles, Rocket } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Animated Icon */}
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/30">
                <Construction className="w-16 h-16 text-primary animate-bounce" />
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Coming Soon</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Instructor Dashboard
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                We're building something amazing! The instructor dashboard is currently under development and will be available soon.
              </p>
            </div>

            {/* Features Coming */}
            <Card className="bg-white/50 backdrop-blur-sm border-2">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  Features Coming
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-left text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-semibold">Course Management</div>
                      <div className="text-muted-foreground text-xs">Create and manage your courses</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-semibold">Video Uploads</div>
                      <div className="text-muted-foreground text-xs">Upload and process lesson videos</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-semibold">Student Analytics</div>
                      <div className="text-muted-foreground text-xs">Track student progress and engagement</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <div className="font-semibold">Revenue Dashboard</div>
                      <div className="text-muted-foreground text-xs">Monitor earnings and sales</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button variant="outline" size="lg" className="gap-2 rounded-xl">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
              <Button size="lg" className="gap-2 rounded-xl" disabled>
                <Bell className="w-4 h-4" />
                Notify Me When Ready
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-muted-foreground">
              Have questions? Contact us at{' '}
              <a href="mailto:support@itslab.online" className="text-primary hover:underline">
                support@itslab.online
              </a>
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
