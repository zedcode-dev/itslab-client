'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GraduationCap, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <GraduationCap className="w-12 h-12 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-lg">
                            <Search className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground">
                            404
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground/80">
                            Oops! This page is missing.
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                            We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in our curriculum.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/">
                            <Button size="lg" className="rounded-2xl h-14 px-8 font-bold gap-2 shadow-xl shadow-primary/20">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Learning
                            </Button>
                        </Link>
                        <Link href="/courses">
                            <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 font-bold border-2">
                                Browse Courses
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-12">
                        <p className="text-sm text-muted-foreground font-medium">
                            Need help? <Link href="mailto:support@itslab.com" className="text-primary hover:underline font-bold">Contact Support</Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
