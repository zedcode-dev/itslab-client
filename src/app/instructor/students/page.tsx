// ============================================================================
// SRC/APP/INSTRUCTOR/STUDENTS/PAGE.TSX - Instructor Student Management
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Users,
    Search,
    Mail,
    BookOpen,
    GraduationCap,
    Clock,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorStudentsPage() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            // Note: This endpoint should be implemented in backend to return instructor's students
            const { data } = await apiClient.get('/instructor/students');
            setStudents(data.data.students || []);
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.User?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.User?.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        My Students
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">Track progress and engagement across your courses</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10 h-11 rounded-xl bg-muted/30 border-none shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h2 className="text-xl font-bold text-muted-foreground">No students found</h2>
                    <p className="text-sm text-muted-foreground mt-2">When students enroll in your courses, they'll appear here.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredStudents.map((enrollment: any) => (
                        <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-all border-none shadow-sm group">
                            <CardContent className="p-0 flex flex-col md:flex-row md:items-center">
                                <div className="p-6 flex-1 flex items-center gap-4 border-b md:border-b-0 md:border-r border-muted/20">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                                        {enrollment.User?.profile_picture ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${enrollment.User.profile_picture}`}
                                                alt=""
                                                className="w-full h-full object-cover rounded-2xl"
                                            />
                                        ) : (
                                            <GraduationCap className="w-7 h-7" />
                                        )}
                                        {enrollment.progress === 100 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg truncate flex items-center gap-2">
                                            {enrollment.User?.name}
                                            {enrollment.progress === 100 && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">GRADUATED</span>}
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            {enrollment.User?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 md:w-2/5 flex flex-col justify-center gap-4 bg-muted/5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            <span>Course Progress</span>
                                            <span className={cn(enrollment.progress === 100 ? "text-green-600" : "text-primary")}>
                                                {enrollment.progress}%
                                            </span>
                                        </div>
                                        <Progress value={enrollment.progress} className="h-1.5" />
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            {enrollment.Course?.title}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 md:w-32 flex items-center justify-center border-t md:border-t-0 md:border-l border-muted/20">
                                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
