// ============================================================================
// SRC/APP/STUDENT/DASHBOARD/PAGE.TSX - Student Dashboard (REVERTED TO CLASSIC)
// ============================================================================

'use client';

import { useStudentDashboard } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Award,
  PlayCircle,
  ChevronRight,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/api-client';

export default function StudentDashboardPage() {
  const { data, isLoading } = useStudentDashboard();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded-2xl"></div>
      </div>
    );
  }

  const { enrolledCourses, certificates, stats } = data || {};

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Here is what is happening with your learning journey.</p>
        </div>
        <Link href="/courses">
          <Button size="lg" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
            Browse New Courses
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-background border border-border/50">
          <CardContent className="p-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Enrolled</div>
                <div className="text-3xl font-black">{stats?.totalCoursesEnrolled || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-background border border-border/50">
          <CardContent className="p-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <Award className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Completed</div>
                <div className="text-3xl font-black">{stats?.completedCourses || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-background border border-border/50">
          <CardContent className="p-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Minutes Watched</div>
                <div className="text-3xl font-black">{stats?.totalWatchTimeMinutes || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {enrolledCourses && enrolledCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
            <Link href="/student/courses" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View My Library <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {enrolledCourses.slice(0, 2).map((enrollment: any) => (
              <Card key={enrollment.id} className="group overflow-hidden rounded-3xl border-none shadow-md hover:shadow-xl transition-all duration-500 bg-card">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-72 aspect-video shrink-0 p-3 pb-0 md:pb-3 md:pr-0">
                    <div className="w-full h-full relative overflow-hidden rounded-2xl border border-border/50">
                      {enrollment.course?.thumbnail_url ? (
                        <img
                          src={`${BACKEND_URL}${enrollment.course.thumbnail_url}`}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <GraduationCap className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      {enrollment.completed && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                          Completed
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                        {enrollment.course?.title}
                      </h3>

                      {/* Lesson Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <PlayCircle className="w-4 h-4" />
                        <span className="font-medium">
                          {enrollment.lastAccessedLesson
                            ? `Last up: ${enrollment.lastAccessedLesson.title}`
                            : 'Ready to start the first lesson!'}
                        </span>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-3 mb-6 bg-muted/30 p-5 rounded-2xl border border-border/50">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground">Course Progress</span>
                          <span className="text-primary">{enrollment.progress?.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Enrolled on {formatDate(enrollment.enrollmentDate)}</span>
                      </div>
                      <Link href={`/student/courses/${enrollment.course.id}/learn`}>
                        <Button size="lg" className="rounded-xl px-8 font-bold gap-2 shadow-lg shadow-blue-500/20">
                          Resume Learning
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {(!enrolledCourses || enrolledCourses.length === 0) && (
        <Card className="text-center py-20 rounded-3xl border-2 border-dashed border-border/50 bg-card/30 shadow-none">
          <CardContent>
            <div className="w-20 h-20 rounded-3xl bg-primary/5 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary opacity-20" />
            </div>
            <h3 className="text-2xl font-bold mb-2 tracking-tight">No courses yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              You haven't enrolled in any courses yet. Explore our marketplace to find the perfect course for you!
            </p>
            <Link href="/courses">
              <Button size="lg" className="rounded-2xl px-10 font-bold shadow-xl">
                Start Learning Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {certificates && certificates.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert: any) => (
              <Card key={cert.id} className="rounded-3xl border-none shadow-md hover:shadow-lg transition-all overflow-hidden group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{cert.course?.title}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 py-1 px-3 bg-muted rounded-full inline-block">
                    {formatDate(cert.issued_date)}
                  </p>
                  <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                      View Certificate
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
