// ============================================================================
// SRC/COMPONENTS/DASHBOARD/DASHBOARD-LAYOUT.TSX - Universal Dashboard Shell
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { Menu, X, Shield, GraduationCap, AlertTriangle, Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (_hasHydrated) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // Redirect to their own dashboard if they hit an unauthorized prefix
                router.push(`/${user.role}/dashboard`);
            }
        }
    }, [isAuthenticated, user, router, _hasHydrated, allowedRoles]);

    // Initialize cooldown from localStorage on mount
    useEffect(() => {
        const lastResendTime = localStorage.getItem('lastVerificationResend');
        if (lastResendTime) {
            const elapsed = Math.floor((Date.now() - parseInt(lastResendTime)) / 1000);
            const remaining = 300 - elapsed; // 5 minutes = 300 seconds
            if (remaining > 0) {
                setResendCooldown(remaining);
            }
        }
    }, []);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendVerification = async () => {
        if (!user?.email || resendCooldown > 0) return;
        setResending(true);
        try {
            await apiClient.post('/auth/resend-verification', { email: user.email });
            toast.success('Verification email sent! Check your inbox.');
            localStorage.setItem('lastVerificationResend', Date.now().toString());
            setResendCooldown(300); // 5 minute cooldown
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };

    if (!_hasHydrated || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
        return null;
    }

    const role = user?.role as 'admin' | 'instructor' | 'student';
    const Icon = role === 'admin' ? Shield : GraduationCap;
    // Check both standard camelCase and potential snake_case from raw DB responses
    const isVerified = user?.emailVerified || (user as any)?.email_verified;
    const showVerificationBanner = user && !isVerified;

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Email Verification Banner */}
            {showVerificationBanner && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                        <span className="text-sm text-yellow-800 font-medium">
                            Your email is not verified. Please check your inbox for the verification link.
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResendVerification}
                            disabled={resending || resendCooldown > 0}
                            className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 h-8 text-xs font-bold"
                        >
                            {resending ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sending...
                                </>
                            ) : resendCooldown > 0 ? (
                                <>Resend in {resendCooldown}s</>
                            ) : (
                                <>
                                    <Mail className="w-3 h-3 mr-1" /> Resend Verification
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-background border-b">
                <Link href={`/${role}/dashboard`} className="flex items-center gap-2 font-bold text-xl">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        role === 'admin' ? "bg-red-600" : "bg-primary"
                    )}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span>{role === 'admin' ? 'Admin' : 'ITSLab'}</span>
                </Link>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            <div className="flex">
                <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 lg:ml-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
