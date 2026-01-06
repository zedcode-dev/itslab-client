'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseManagementCard } from './CourseManagementCard';
import Link from 'next/link';

interface CourseManagementGridProps {
    title: string;
    description: string;
    courses: any[];
    isLoading: boolean;
    role: 'admin' | 'instructor';
    search: string;
    onSearchChange: (val: string) => void;
    pagination: {
        page: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    } | null;
    onPublishToggle?: (courseId: string, currentStatus: boolean) => void;
    isPublishing?: boolean;
}

export function CourseManagementGrid({
    title,
    description,
    courses,
    isLoading,
    role,
    search,
    onSearchChange,
    pagination,
    onPublishToggle,
    isPublishing
}: CourseManagementGridProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-sm text-muted-foreground font-medium">{description}</p>
                </div>
                {(role === 'instructor' || role === 'admin') && (
                    <Link href={`/${role}/courses/create`}>
                        <Button className={cn(
                            "gap-2 shadow-sm rounded-xl font-bold",
                            role === 'admin' ? "bg-red-600 hover:bg-red-700" : ""
                        )}>
                            <Plus className="w-5 h-5" />
                            New Course
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <Card className="border border-border/50 shadow-sm bg-card rounded-2xl overflow-hidden">
                <CardContent className="p-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
                        <Input
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-11 h-11 bg-muted/30 border-none rounded-xl font-medium focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-[360px] bg-muted rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : courses && courses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseManagementCard
                            key={course.id}
                            course={course}
                            role={role}
                            onPublishToggle={onPublishToggle}
                            isPublishing={isPublishing}
                        />
                    ))}
                </div>
            ) : (
                <Card className="py-16 text-center border-none bg-card/50 rounded-2xl border-2 border-dashed border-muted-foreground/10">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">No courses found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                        We couldn't find any courses matching your search criteria.
                    </p>
                    {(role === 'instructor' || role === 'admin') && (
                        <Link href={`/${role}/courses/create`}>
                            <Button variant="outline" className="border-2 font-bold rounded-xl h-11 px-8">
                                Create first course
                            </Button>
                        </Link>
                    )}
                </Card>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 bg-card/50 p-4 rounded-xl border border-border/50 w-fit mx-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => pagination.onPageChange(pagination.page - 1)}
                        className="font-bold rounded-lg"
                    >
                        Prev
                    </Button>
                    <div className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-sm">
                        {pagination.page} / {pagination.totalPages}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => pagination.onPageChange(pagination.page + 1)}
                        className="font-bold rounded-lg"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
