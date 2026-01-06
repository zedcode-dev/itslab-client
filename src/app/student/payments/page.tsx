// ============================================================================
// SRC/APP/STUDENT/PAYMENTS/PAGE.TSX - Student Billing & Transactions
// ============================================================================

'use client';

import { useStudentTransactions } from '@/hooks/use-api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
    CreditCard,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    AlertCircle,
    FileText,
    DollarSign
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface Transaction {
    id: string;
    course: {
        title: string;
        slug: string;
        thumbnail_url: string;
    };
    amount: number;
    currency: string;
    status: 'completed' | 'pending' | 'failed';
    payment_method: string;
    created_at: string;
    metadata?: {
        adminNotes?: string;
    };
}

export default function StudentPaymentsPage() {
    const { user } = useAuthStore();
    const { data, isLoading, error } = useStudentTransactions();
    const [printingTransaction, setPrintingTransaction] = useState<Transaction | null>(null);
    const transactions: Transaction[] = data?.transactions || [];

    const handlePrint = (transaction: Transaction) => {
        setPrintingTransaction(transaction);
        toast.success('Preparing your official invoice...');
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const totalSpent = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    if (isLoading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading your transaction history...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments & Transactions</h1>
                    <p className="text-muted-foreground mt-1">Manage your billing history and subscription details.</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Invested</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent, 'EGP')}</div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="bg-destructive/5 border border-destructive/10 text-destructive p-6 rounded-2xl flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <p>Failed to load transactions. Please try refreshing the page.</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-background border-2 border-dashed rounded-3xl p-16 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
                    <p className="text-muted-foreground mb-8">You haven't made any purchases yet. Your billing history will appear here once you enroll in a course.</p>
                    <Link href="/courses">
                        <Button className="rounded-full px-8">Browse All Courses</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Recent Transactions Table */}
                    <div className="bg-background border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b bg-muted/30">
                            <h2 className="font-semibold text-lg">Billing History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                                        <th className="px-6 py-4">Course</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {transactions.map((transaction) => {
                                        const statusConfig = {
                                            completed: { icon: CheckCircle2, class: 'bg-green-100 text-green-700', label: 'Success' },
                                            pending: { icon: Clock, class: 'bg-amber-100 text-amber-700', label: 'Processing' },
                                            failed: { icon: XCircle, class: 'bg-red-100 text-red-700', label: 'Failed' }
                                        };
                                        const config = statusConfig[transaction.status] || statusConfig.pending;
                                        const StatusIcon = config.icon;

                                        return (
                                            <tr key={transaction.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            {/* Placeholder for thumbnail if needed, or just icon */}
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                        <span className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                                            {transaction.course?.title || 'Course Purchase'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(transaction.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-lg">{formatCurrency(transaction.amount, transaction.currency || 'EGP')}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-sm capitalize text-muted-foreground">
                                                        <CreditCard className="w-4 h-4" />
                                                        {transaction.payment_method}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.class}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {config.label}
                                                        </span>
                                                        {transaction.status === 'failed' && transaction.metadata?.adminNotes && (
                                                            <div className="ml-2 relative group">
                                                                <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl">
                                                                    <p className="font-bold mb-1 text-red-300">Rejection Reason:</p>
                                                                    {transaction.metadata.adminNotes}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handlePrint(transaction)}
                                                        title="Download Receipt"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t bg-muted/10 text-center">
                            <p className="text-xs text-muted-foreground">
                                Displaying the most recent {transactions.length} transactions.
                            </p>
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-start gap-4 p-4 rounded-3xl bg-blue-50/50 border border-blue-100 max-w-3xl">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Secure Billing</p>
                            <p>All your transaction details are encrypted and securely stored. We don't store your credit card information on our servers.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Print-Only Invoice Template */}
            {printingTransaction && (
                <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 text-black text-left">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8">
                            <div>
                                <h1 className="text-4xl font-black text-indigo-600 mb-2">ITSLAB</h1>
                                <p className="text-slate-500 font-bold">Official Learning Receipt</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold uppercase tracking-widest mb-1 text-slate-800">Invoice</h2>
                                <p className="text-sm font-mono text-slate-400">#{printingTransaction.id.split('-')[0].toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Bill To:</h3>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-slate-900">{user?.name}</p>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-right">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Details:</h3>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-700">Date: {formatDate(printingTransaction.created_at)}</p>
                                    <p className="text-sm font-bold text-slate-700">Method: {printingTransaction.payment_method?.toUpperCase()}</p>
                                    <p className="text-sm font-bold text-slate-700">Status: {printingTransaction.status?.toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="px-6 py-4 font-bold uppercase text-xs text-left">Description</th>
                                        <th className="px-6 py-4 font-bold uppercase text-xs text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="px-6 py-8">
                                            <p className="text-lg font-bold text-slate-900">{printingTransaction.course?.title}</p>
                                            <p className="text-sm text-slate-400">Online Course Enrollment & Lifetime Access</p>
                                        </td>
                                        <td className="px-6 py-8 text-right text-xl font-bold text-slate-900">
                                            {formatCurrency(printingTransaction.amount, printingTransaction.currency || 'EGP')}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50">
                                        <td className="px-6 py-6 font-black text-right uppercase tracking-widest text-slate-500">Grand Total</td>
                                        <td className="px-6 py-6 text-right text-3xl font-black text-indigo-600">
                                            {formatCurrency(printingTransaction.amount, printingTransaction.currency || 'EGP')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer Section */}
                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-slate-100">
                            <div className="space-y-4">
                                <p className="text-xs leading-relaxed text-slate-400">
                                    Thank you for choosing ITSLab for your professional education.
                                    This is a computer-generated receipt and does not require a physical signature.
                                </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-4">
                                <div className="w-24 h-24 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center italic text-[8px] text-slate-300">
                                    QR AUTH CODE
                                </div>
                                <p className="text-xs font-bold text-indigo-600">itslab.study</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .print\:block, .print\:block * {
                        visibility: visible !important;
                    }
                    .print\:block {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                    }
                    @page {
                        margin: 20mm !important;
                        size: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}
