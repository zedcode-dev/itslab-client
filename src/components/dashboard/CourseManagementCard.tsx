'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Star, Eye, CheckCircle, XCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { BACKEND_URL } from '@/lib/api-client';

interface CourseManagementCardProps {
    course: any;
    role: 'admin' | 'instructor';
    onPublishToggle?: (courseId: string, currentStatus: boolean) => void;
    isPublishing?: boolean;
}

export function CourseManagementCard({ course, role, onPublishToggle, isPublishing }: CourseManagementCardProps) {
    const manageHref = role === 'admin'
        ? `/admin/courses/${course.id}/edit`
        : `/instructor/courses/${course.id}/edit`;

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 rounded-2xl border border-border/50 bg-card">
            <div className="aspect-video bg-muted relative overflow-hidden">
                {course.thumbnail_url ? (
                    <img
                        src={`${BACKEND_URL}${course.thumbnail_url}`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-muted-foreground opacity-20" />
                    </div>
                )}

                {/* Status Badge */}
                <div className={cn(
                    "absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm",
                    course.is_published
                        ? "bg-green-100/90 text-green-700 border-green-200"
                        : "bg-yellow-100/90 text-yellow-700 border-yellow-200"
                )}>
                    {course.is_published ? 'Published' : 'Draft'}
                </div>

                {/* Instructor Badge (Admin only) */}
                {role === 'admin' && course.instructor && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm border border-white/10 tracking-tight">
                        {course.instructor.name}
                    </div>
                )}
            </div>

            <CardContent className="p-5">
                <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 bg-muted/20 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 font-bold">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        {course.total_students || 0}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {parseFloat(course.average_rating || 0).toFixed(1)}
                    </div>
                    <div className="flex-1 text-right text-[10px] font-bold uppercase opacity-40">
                        {course.level}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Link href={manageHref}>
                        <Button variant="outline" size="sm" className="w-full gap-2 font-bold rounded-lg border-2">
                            <Settings className="w-4 h-4" />
                            Manage
                        </Button>
                    </Link>

                    <div className="flex gap-2">
                        <Link href={`/courses/${course.id}`} target="_blank" className="flex-1">
                            <Button variant="ghost" size="sm" className="w-full rounded-lg bg-muted/50 font-bold" title="View Public Page">
                                <Eye className="w-4 h-4 mr-2" /> View
                            </Button>
                        </Link>

                        {onPublishToggle && (
                            <Button
                                variant={course.is_published ? 'ghost' : 'default'}
                                size="sm"
                                onClick={() => onPublishToggle(course.id, course.is_published)}
                                disabled={isPublishing}
                                className={cn(
                                    "rounded-lg font-bold aspect-square p-0 px-2",
                                    course.is_published ? "text-red-500 hover:text-red-600 hover:bg-red-50" : ""
                                )}
                                title={course.is_published ? 'Unpublish' : 'Publish'}
                            >
                                {course.is_published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
