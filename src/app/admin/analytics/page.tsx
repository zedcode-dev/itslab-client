// ============================================================================
// SRC/APP/ADMIN/ANALYTICS/PAGE.TSX - Super Admin Analytics Dashboard
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    Globe
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await apiClient.get('/admin/stats');
            setStats(data.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Analyzing site data...</div>;

    const cards = [
        { title: 'Total Revenue', value: `${stats?.totalRevenue || 0} EGP`, icon: DollarSign, trend: '+12.5%', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'New Enrollments', value: stats?.totalEnrollments || 0, icon: UserCheck, trend: '+5.2%', color: 'text-primary', bg: 'bg-primary/5' },
        { title: 'Active Students', value: stats?.totalStudents || 0, icon: Users, trend: '+8.1%', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Live Courses', value: stats?.totalCourses || 0, icon: BookOpen, trend: '0%', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="p-4 lg:p-8 space-y-8 pb-20">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Platform Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">Global performance metrics and growth indicators</p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Last 30 Days</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", card.bg, card.color)}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                    card.trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                                )}>
                                    {card.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                    {card.trend}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <h3 className="text-2xl font-black mt-1">{card.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center pt-10">
                <div className="lg:col-span-2 p-20 border-2 border-dashed rounded-3xl bg-muted/5 opacity-50 flex flex-col items-center justify-center">
                    <Globe className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold">Interactive Growth Charts</h2>
                    <p className="max-w-md mx-auto mt-2">Charts and detailed trend analysis will be available soon as the data set grows.</p>
                </div>

                <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="text-white">Monthly Summary</CardTitle>
                        <CardDescription className="text-primary-foreground/70">Performance compared to previous period</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50">Engagement</p>
                                <h4 className="text-4xl font-black tracking-tighter">84%</h4>
                            </div>
                            <ArrowUpRight className="w-10 h-10 text-primary-foreground/20" />
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[84%]" />
                        </div>
                        <p className="text-xs text-left text-primary-foreground/70 font-medium">Students are completing 12% more lessons than last month. Platform retention is strong.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
