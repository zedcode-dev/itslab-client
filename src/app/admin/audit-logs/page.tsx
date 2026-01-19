'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    Search,
    History,
    User as UserIcon,
    Activity,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', page, search],
        queryFn: async () => {
            const res = await apiClient.get('/admin/audit-logs', {
                params: { page, limit: 20, action: search }
            });
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and monitor all administrative actions across the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search actions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            <Card className="border-2 shadow-xl shadow-muted/20 rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5" />
                        System Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="font-bold">Timestamp</TableHead>
                                <TableHead className="font-bold">Actor</TableHead>
                                <TableHead className="font-bold">Action</TableHead>
                                <TableHead className="font-bold">Entity</TableHead>
                                <TableHead className="font-bold">Changes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.logs?.map((log: any) => (
                                <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                                    <TableCell className="text-xs font-medium text-muted-foreground">
                                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{log.user?.name || 'System'}</p>
                                                <p className="text-[10px] text-muted-foreground">{log.user?.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-black border-2 uppercase text-[10px]">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-xs font-bold">{log.entity_type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="space-y-1">
                                            {log.new_values && Object.keys(log.new_values).map((key: string) => (
                                                <div key={key} className="text-[10px]">
                                                    <span className="font-bold">{key}:</span>
                                                    <span className="text-muted-foreground ml-1">
                                                        {JSON.stringify(log.new_values[key])}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl font-bold h-10 px-6"
                >
                    Back
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data?.logs?.length || data.logs.length < 20}
                    className="rounded-xl font-bold h-10 px-6"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
