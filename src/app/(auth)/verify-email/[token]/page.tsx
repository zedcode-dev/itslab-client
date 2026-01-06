// ============================================================================
// SRC/APP/(AUTH)/VERIFY-EMAIL/[TOKEN]/PAGE.TSX - Email Verification Page
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function VerifyEmailPage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const { data } = await apiClient.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed or link expired.');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 font-bold text-2xl mb-8">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                        <GraduationCap className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span>ITSLab</span>
                </div>

                <Card className="text-center overflow-hidden border-none shadow-2xl rounded-3xl">
                    <CardHeader className="pt-10 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
                        <div className="flex justify-center mb-4">
                            {status === 'loading' && (
                                <div className="bg-primary/10 p-4 rounded-full">
                                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="bg-green-100 p-4 rounded-full">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="bg-red-100 p-4 rounded-full">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-2xl font-black">
                            {status === 'loading' && 'Verifying Email'}
                            {status === 'success' && 'Verification Successful'}
                            {status === 'error' && 'Verification Failed'}
                        </CardTitle>
                        <CardDescription className="text-base mt-2 px-6">
                            {message}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-10 pt-4 px-10">
                        {status === 'success' ? (
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                            >
                                Go to Login
                            </Button>
                        ) : status === 'error' ? (
                            <div className="space-y-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/register')}
                                    className="w-full h-14 rounded-2xl font-bold"
                                >
                                    Back to Register
                                </Button>
                                <Link
                                    href="/login"
                                    className="block text-sm text-primary font-bold hover:underline"
                                >
                                    Already verified? Sign In
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Please wait while we process your request...</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
