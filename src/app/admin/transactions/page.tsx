'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { BACKEND_URL } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import toast from 'react-hot-toast';
import {
    Search,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Filter,
    Clock,
    CreditCard,
    User,
    BookOpen
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';

export default function AdminTransactionsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-transactions', filter],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/transactions', {
                params: { status: filter === 'all' ? '' : filter }
            });
            return data.data;
        },
    });

    const transactions = data?.transactions || [];

    const verifyMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
            const { data } = await apiClient.patch(`/payment/admin/verify/${id}`, { status, notes });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
            toast.success(`Enrollment ${variables.status === 'completed' ? 'approved' : 'rejected'}`);
            setSelectedEnrollment(null);
            setAdminNotes('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    });

    const handleAction = (status: 'completed' | 'failed') => {
        if (!selectedEnrollment) return;
        verifyMutation.mutate({
            id: selectedEnrollment.id,
            status,
            notes: adminNotes,
        });
    };

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Transactions & Enrollments</h1>
                    <p className="text-muted-foreground">Verify and manage student payment requests</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'pending' ? 'primary' : 'outline'}
                        onClick={() => setFilter('pending')}
                        className="gap-2"
                        size="sm"
                    >
                        <Clock className="w-4 h-4" />
                        Pending
                    </Button>
                    <Button
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="gap-2"
                        size="sm"
                    >
                        <Filter className="w-4 h-4" />
                        All Requests
                    </Button>
                </div>
            </div>

            {/* Stats Cards (Mini) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50/30 border-blue-100">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Total Pending</p>
                            <p className="text-2xl font-black">{transactions.filter((t: any) => t.status === 'pending').length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-200" />
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card className="shadow-lg border-2">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50 font-bold">
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Sender Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i}><TableCell colSpan={6} className="h-16 animate-pulse bg-muted/10"></TableCell></TableRow>
                                ))
                            ) : transactions.length > 0 ? (
                                transactions.map((item: any) => (
                                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {item.student?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{item.student?.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{item.student?.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium max-w-[150px] truncate text-sm" title={item.course}>
                                                {item.course}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-primary text-sm">
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1 uppercase text-[9px] font-bold">
                                                <CreditCard className="w-3 h-3" />
                                                {item.metadata?.paymentMethod?.replace('_', ' ') || 'manual'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-xs">
                                            {item.payment_transaction_id}
                                        </TableCell>
                                        <TableCell>
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize",
                                                item.status === 'pending' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                    item.status === 'completed' ? "bg-green-50 text-green-700 border-green-200" :
                                                        "bg-red-50 text-red-700 border-red-200"
                                            )}>
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    item.status === 'pending' ? "bg-yellow-500" :
                                                        item.status === 'completed' ? "bg-green-500" : "bg-red-500"
                                                )} />
                                                {item.status}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => {
                                                        setSelectedEnrollment(item);
                                                        setAdminNotes('');
                                                    }}
                                                    className="font-bold shadow-sm"
                                                >
                                                    Verify
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <CheckCircle2 className="w-12 h-12 opacity-10 mb-2" />
                                            <p>No pending requests found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Verification Modal */}
            <Dialog open={!!selectedEnrollment} onOpenChange={() => setSelectedEnrollment(null)}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            Verify Enrollment Request
                        </DialogTitle>
                    </DialogHeader>

                    {selectedEnrollment && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Student</p>
                                    <p className="text-sm font-bold truncate">{selectedEnrollment.student?.name}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Amount</p>
                                    <p className="text-sm font-bold text-primary">{formatCurrency(selectedEnrollment.amount)}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border-2 border-dashed bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-1">Sender Info:</p>
                                <p className="text-lg font-bold text-center py-1 text-primary">
                                    {selectedEnrollment.payment_transaction_id}
                                </p>
                            </div>

                            <div className="space-y-2 text-center">
                                <Label className="font-bold">Receipt Screenshot:</Label>
                                {selectedEnrollment.metadata?.receiptUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={`${BACKEND_URL}${selectedEnrollment.metadata.receiptUrl}`}
                                            className="w-full max-h-[300px] object-contain rounded-lg border-2 shadow-sm cursor-zoom-in group-hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(`${BACKEND_URL}${selectedEnrollment.metadata.receiptUrl}`, '_blank')}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2 italic">Click image to open in new tab</p>
                                    </div>
                                ) : (
                                    <div className="p-8 border-2 border-dashed rounded-lg bg-muted/50 text-muted-foreground">
                                        No receipt found
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Admin Notes (internal or sent to user)</Label>
                                <Textarea
                                    placeholder="e.g. Verified via InstaPay, reference matches."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="min-h-[100px] border-2"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-2 border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold"
                                    onClick={() => handleAction('failed')}
                                    disabled={verifyMutation.isPending}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 font-bold shadow-lg shadow-primary/20"
                                    onClick={() => handleAction('completed')}
                                    disabled={verifyMutation.isPending}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve & Enroll
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
