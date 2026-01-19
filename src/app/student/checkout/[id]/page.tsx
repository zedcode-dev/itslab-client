'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse } from '@/hooks/use-api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import apiClient, { BACKEND_URL } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Wallet,
    Building2,
    CheckCircle2,
    ArrowLeft,
    ShieldCheck,
    Zap,
    Clock
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { user, isAuthenticated } = useAuthStore();

    const { data: course, isLoading } = useCourse(courseId);
    const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone' | 'bank_transfer'>('instapay');
    const [senderInfo, setSenderInfo] = useState('');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/student/checkout/${courseId}`);
            return;
        }

        if (course) {
            if (course.enrollment?.payment_status === 'completed') {
                toast.success('You are already enrolled in this course!');
                router.push(`/student/courses/${courseId}/learn`);
            } else if (course.enrollment?.payment_status === 'pending' && !isSubmitting) {
                // We keep them on page but with disabled UI, or we can redirect to payments
                // User said "prevent entry", so let's redirect to payments
                toast.error('You already have a pending payment request for this course.');
                router.push('/student/payments');
            }
        }
    }, [isAuthenticated, router, courseId, course, isSubmitting]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center animate-pulse">Loading checkout...</div>;
    }

    if (!course) return null;

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const isFree = Number(course.price) === 0;

        if (!isFree) {
            if (!senderInfo) {
                toast.error('Please enter the sender information');
                return;
            }

            if (!receiptFile) {
                toast.error('Please upload a screenshot of the payment receipt');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('courseId', course.id);
            formData.append('paymentMethod', isFree ? 'free' : paymentMethod);
            formData.append('senderInfo', isFree ? 'FREE_ACCESS' : senderInfo);
            if (receiptFile) formData.append('receipt', receiptFile);

            await apiClient.post('/payment/initiate-manual', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (isFree) {
                toast.success('Course assigned to your library!');
                router.push(`/student/courses/${courseId}/learn`);
            } else {
                toast.success('Payment request submitted! Admin will verify it soon.');
                router.push('/student/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSenderLabel = () => {
        switch (paymentMethod) {
            case 'vodafone': return 'Sender Phone Number (Vodafone Cash)';
            case 'instapay': return 'Sender Account / IPA (InstaPay)';
            case 'bank_transfer': return 'Sender Name & Account Details';
            default: return 'Sender Information';
        }
    };

    const getSenderPlaceholder = () => {
        switch (paymentMethod) {
            case 'vodafone': return 'e.g. 010XXXXXXXX';
            case 'instapay': return 'e.g. name@instapay';
            case 'bank_transfer': return 'e.g. Ahmed Mohamed - NBE';
            default: return 'Enter sender details';
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-12">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 gap-2 hover:bg-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Course
                </Button>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Payment Details */}
                    <div className="lg:col-span-7 space-y-6">
                        <h1 className="text-3xl font-extrabold tracking-tight">Complete Enrollment</h1>

                        <Card className="border-2 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b bg-white/50 p-6">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                    {Number(course.price) === 0 ? 'Confirm Free Access' : 'Select Payment Method'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {Number(course.price) === 0 ? (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
                                            <Zap className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">Zero Cost Enrollment</h3>
                                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                                This course is currently free. Just click confirm below to add it to your library instantly.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <RadioGroup
                                            value={paymentMethod}
                                            onValueChange={(val: any) => setPaymentMethod(val)}
                                            className="grid gap-4"
                                        >
                                            {/* InstaPay */}
                                            <Label
                                                htmlFor="instapay"
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50",
                                                    paymentMethod === 'instapay' ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <RadioGroupItem value="instapay" id="instapay" />
                                                    <div className="p-2 rounded-lg bg-indigo-100">
                                                        <Zap className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">InstaPay</div>
                                                        <div className="text-xs text-muted-foreground">Fast and instant bank transfer</div>
                                                    </div>
                                                </div>
                                            </Label>

                                            {/* Vodafone Cash */}
                                            <Label
                                                htmlFor="vodafone"
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50",
                                                    paymentMethod === 'vodafone' ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <RadioGroupItem value="vodafone" id="vodafone" />
                                                    <div className="p-2 rounded-lg bg-red-100">
                                                        <Wallet className="w-6 h-6 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">Vodafone Cash</div>
                                                        <div className="text-xs text-muted-foreground">Or any other e-wallet</div>
                                                    </div>
                                                </div>
                                            </Label>

                                            {/* Bank Transfer */}
                                            <Label
                                                htmlFor="bank_transfer"
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50",
                                                    paymentMethod === 'bank_transfer' ? "border-primary bg-primary/5 shadow-inner" : "border-muted bg-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                                    <div className="p-2 rounded-lg bg-blue-100">
                                                        <Building2 className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">Bank Transfer</div>
                                                        <div className="text-xs text-muted-foreground">Direct transfer to our bank account</div>
                                                    </div>
                                                </div>
                                            </Label>
                                        </RadioGroup>

                                        <div className="mt-8 p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900 text-sm space-y-3">
                                            <div className="font-bold flex items-center gap-2 text-blue-800">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Payment Instructions:
                                            </div>
                                            {paymentMethod === 'instapay' && (
                                                <p>Transfer the amount to InstaPay address: <strong className="text-primary font-black">itslab@instapay</strong> then upload the receipt screenshot.</p>
                                            )}
                                            {paymentMethod === 'vodafone' && (
                                                <p>Transfer the amount to: <strong className="text-primary font-black">010XXXXXXXX</strong> (Vodafone Cash) then upload the receipt screenshot.</p>
                                            )}
                                            {paymentMethod === 'bank_transfer' && (
                                                <p>Transfer to Account: <strong className="text-primary font-black">1234567890 (NBE)</strong> Holder: ITSLab Academy then upload the receipt screenshot.</p>
                                            )}
                                        </div>

                                        <div className="mt-8 space-y-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="senderInfo" className="font-bold text-base">{getSenderLabel()}</Label>
                                                <Input
                                                    id="senderInfo"
                                                    placeholder={getSenderPlaceholder()}
                                                    value={senderInfo}
                                                    onChange={(e) => setSenderInfo(e.target.value)}
                                                    className="h-12 border-2 focus:ring-primary rounded-xl"
                                                    disabled={course.enrollment?.payment_status === 'pending'}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="font-bold text-base">Upload Receipt Screenshot</Label>
                                                <div
                                                    className={cn(
                                                        "relative border-3 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all group",
                                                        receiptFile ? "border-green-400 bg-green-50/30" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                                                    )}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                                        disabled={course.enrollment?.payment_status === 'pending'}
                                                    />
                                                    {receiptFile ? (
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                                                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                            </div>
                                                            <p className="font-bold text-green-800">{receiptFile.name}</p>
                                                            <p className="text-xs text-green-600 mt-1">Click to change snapshot</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <CreditCard className="w-6 h-6" />
                                                            </div>
                                                            <p className="font-bold">Click or drag screenshot here to upload</p>
                                                            <p className="text-xs text-muted-foreground mt-1">A clear image of the receipt or transfer message is required.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5">
                        <Card className="sticky top-24 border-2 shadow-xl rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-primary p-6">
                                <CardTitle className="text-primary-foreground flex items-center justify-between">
                                    Order Summary
                                    <Badge variant="outline" className="text-white border-white/20 bg-white/10">Manual Review</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 border-b bg-muted/5">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-16 rounded-xl bg-muted flex-shrink-0 overflow-hidden ring-1 ring-black/5">
                                            {course.thumbnail_url ? (
                                                <img src={`${BACKEND_URL}${course.thumbnail_url}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-full h-full p-4 opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm line-clamp-2 leading-tight">{course.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5">{course.level}</Badge>
                                                <span className="text-[10px] text-muted-foreground uppercase font-medium">{course.language === 'ar' ? 'Arabic' : 'English'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Course Price</span>
                                            <span className="font-bold">{formatCurrency(course.price, course.currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Service Fee</span>
                                            <span className="text-green-600 font-black">0.00 EGP</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t-2 border-dashed flex justify-between items-end">
                                        <span className="font-black text-lg">Total Amount</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-primary leading-none">
                                                {formatCurrency(course.price, course.currency)}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="default"
                                        size="lg"
                                        className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 rounded-2xl gap-2"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || course.enrollment?.payment_status === 'pending'}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : course.enrollment?.payment_status === 'pending' ? (
                                            <>
                                                <Clock className="w-5 h-5" />
                                                Request Pending
                                            </>
                                        ) : (
                                            'Confirm & Submit'
                                        )}
                                    </Button>

                                    {course.enrollment?.payment_status === 'pending' && (
                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="text-[10px] text-amber-800 leading-tight">
                                                <p className="font-bold mb-1 uppercase tracking-wider">Request Under Review</p>
                                                You have already submitted a payment request for this course. Please wait for admin verification. You cannot submit multiple requests for the same course.
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 text-center px-4 bg-muted/20 py-3 rounded-xl">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Secure transaction. Access granted after admin verification.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
