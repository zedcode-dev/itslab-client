// ============================================================================
// SRC/APP/STUDENT/COURSES/PAGE.TSX - Student's Enrolled Courses
// ============================================================================

'use client';

import { useState } from 'react';
import { useStudentDashboard } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
    BookOpen,
    Search,
    Filter,
    PlayCircle,
    GraduationCap,
    ChevronRight,
    Clock,
    LayoutGrid,
    List,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/api-client';

export default function MyCoursesPage() {
    const { data, isLoading } = useStudentDashboard();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'in-progress' | 'completed'>('all');

    const { enrolledCourses } = data || {};

    const filteredCourses = enrolledCourses?.filter((enrollment: any) => {
        const matchesSearch = enrollment.course?.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'completed' && enrollment.completed) ||
            (filterStatus === 'in-progress' && !enrollment.completed);

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-10 bg-muted rounded-lg w-1/4"></div>
                <div className="flex gap-4">
                    <div className="h-12 bg-muted rounded-xl flex-1"></div>
                    <div className="h-12 bg-muted rounded-xl w-32"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-80 bg-muted rounded-3xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Library</h1>
                    <p className="text-muted-foreground">Manage and track your learning progress across all enrolled courses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-muted p-1 rounded-xl">
                        <Button variant="ghost" size="sm" className="rounded-lg h-8 w-8 p-0 bg-background shadow-sm">
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-lg h-8 w-8 p-0 text-muted-foreground">
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search your courses..."
                        className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-card transition-all focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'in-progress', 'completed'] as const).map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'secondary'}
                            className="h-14 rounded-2xl px-6 font-bold capitalize transition-all"
                            onClick={() => setFilterStatus(status)}
                        >
                            {status.replace('-', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses && filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((enrollment: any) => (
                        <Card key={enrollment.id} className="group flex flex-col rounded-[2rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card overflow-hidden">
                            {/* Thumbnail */}
                            <div className="p-2 pb-0">
                                <div className="aspect-video relative overflow-hidden rounded-[1.5rem] border border-border/50">
                                    {enrollment.course?.thumbnail_url ? (
                                        <img
                                            src={`${BACKEND_URL}${enrollment.course.thumbnail_url}`}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <GraduationCap className="w-12 h-12 text-muted-foreground opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                                    {enrollment.completed && (
                                        <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md">
                                            Mastered
                                        </div>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-2 pt-4 flex-1 flex flex-col">
                                <div className="flex-1 mb-8">
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                        {enrollment.course?.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <PlayCircle className="w-4 h-4 text-primary" />
                                        <span className="font-medium truncate">
                                            {enrollment.lastAccessedLesson?.title || 'Starting soon'}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground">Completion</span>
                                        <span className="text-primary font-black">{enrollment.progress?.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden p-0.5">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                            style={{ width: `${enrollment.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        <Clock className="w-4 h-4" />
                                        <span>Enrolled {formatDate(enrollment.enrollmentDate)}</span>
                                    </div>
                                    <Link href={`/student/courses/${enrollment.course.id}/learn`}>
                                        <Button size="sm" className="rounded-xl h-10 px-5 font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:translate-x-1">
                                            {enrollment.completed ? 'Review' : 'Resume'}
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-32 rounded-[3rem] border-2 border-dashed border-border/50 bg-card/30 shadow-none">
                    <CardContent>
                        <div className="w-24 h-24 rounded-[2rem] bg-primary/5 mx-auto mb-8 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary opacity-20" />
                        </div>
                        <h3 className="text-3xl font-black mb-3 tracking-tight">No courses found</h3>
                        <p className="text-muted-foreground mb-10 max-w-sm mx-auto text-lg">
                            {searchQuery ? "We couldn't find any courses matching your search." : "You haven't enrolled in any courses yet."}
                        </p>
                        <Link href="/courses">
                            <Button size="lg" className="rounded-[1.5rem] px-12 h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                                Explore Marketplace
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
