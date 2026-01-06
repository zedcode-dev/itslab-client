// ============================================================================
// SRC/COMPONENTS/COURSE-CARD.TSX - Reusable Course Card
// ============================================================================

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/api-client';

interface CourseCardProps {
  course: any;
  showProgress?: boolean;
  progress?: number;
}

export function CourseCard({ course, showProgress, progress }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col rounded-2xl border border-border/50 bg-card">
        {/* Thumbnail */}
        <div className="p-0 pb-0">
          <div className="aspect-video bg-muted relative overflow-hidden rounded-xl border border-border/50">
            {course.thumbnail_url ? (
              <img
                src={`${BACKEND_URL}${course.thumbnail_url}`}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground opacity-20" />
              </div>
            )}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {course.level}
            </div>
          </div>
        </div>

        <CardContent className="p-0 pt-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 leading-relaxed">
            {course.short_description}
          </p>

          {/* Instructor & Stats */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground truncate">
                {course.instructor?.name}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{parseFloat(course.average_rating || 5).toFixed(1)}</span>
                <span className="text-muted-foreground opacity-70">({course.total_reviews || 0})</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{course.total_students || 0} Students</span>
              </div>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {(showProgress || course.is_enrolled) && (progress !== undefined || course.progress_percentage !== undefined) && (
            <div className="mb-4 bg-muted/30 p-2.5 rounded-xl border border-border/50">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="text-muted-foreground font-bold">Progress</span>
                <span className="font-bold text-primary">{(progress ?? course.progress_percentage).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${progress ?? course.progress_percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-60">Price</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(course.price, course.currency)}
              </span>
            </div>
            <Button size="sm" className="rounded-lg h-10 px-4 gap-2 font-bold shadow-sm active:scale-95 transition-all">
              {course.enrollment?.payment_status === 'completed' ? 'Resume' :
                course.enrollment?.payment_status === 'pending' ? 'Pending' : 'Enroll'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
