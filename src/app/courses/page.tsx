// ============================================================================
// SRC/APP/COURSES/PAGE.TSX - Courses Catalog Page
// ============================================================================

'use client';

import { useState } from 'react';
import { useCourses } from '@/hooks/use-api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  Search,
  Filter,
  GraduationCap,
  Star,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { CourseCard } from '@/components/course-card';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCourses({
    page,
    limit: 12,
    search: searchQuery,
    level: level || undefined,
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Browse All Courses</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive library of courses and start learning today
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-11 px-4 rounded-lg border border-input bg-background"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* <Button variant="outline" className="gap-2">
            <Filter className="w-5 h-5" />
            More Filters
          </Button> */}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-video bg-muted rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded-full w-1/4"></div>
                  <div className="h-7 bg-muted rounded-xl w-full"></div>
                  <div className="h-4 bg-muted rounded-full w-2/3"></div>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-muted">
                  <div className="h-6 bg-muted rounded-lg w-20"></div>
                  <div className="h-4 bg-muted rounded-lg w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && data?.courses && (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {data.courses.length} of {data.pagination.totalRecords} courses
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(data.pagination.totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && (!data?.courses || data.courses.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => { setSearchQuery(''); setLevel(''); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}