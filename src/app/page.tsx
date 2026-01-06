// ============================================================================
// SRC/APP/PAGE.TSX - Dynamic Landing Page (Smart Mode)
// ============================================================================

'use client';

import { useState } from 'react';
import { useCourses } from '@/hooks/use-api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Star,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Play,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReactPlayer from 'react-player/lazy';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const { data, isLoading } = useCourses({ limit: 2 });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const publishedCourses = data?.courses || [];
  const isSingleCourseMode = publishedCourses.length === 1;

  return (
    <div className="min-h-screen">
      <Navbar />

      {isSingleCourseMode ? (
        <SingleCourseHero course={publishedCourses[0]} />
      ) : (
        <MarketplaceHero />
      )}

      <FeaturesSection />

      {!isSingleCourseMode && <CoursesSection courses={publishedCourses} />}

      <StatsSection />
      <CTASection />

      <Footer />
    </div>
  );
}

// ============================================================================
// Single Course Hero (Startup Mode)
// ============================================================================

function SingleCourseHero({ course }: { course: any }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Exclusive Course from IT Expert Instructor</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {course.title}
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl">
              {course.short_description || course.description?.substring(0, 150)}
            </p>

            {/* Instructor Card */}
            <Card className="inline-block rounded-2xl">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-semibold">{course.instructor?.name}</div>
                  <div className="text-sm text-muted-foreground">{course.instructor?.bio}</div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.average_rating || '5.0'}</span>
                <span className="text-muted-foreground">({course.total_reviews || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{course.total_students || 0}</span>
                <span className="text-muted-foreground">students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{course.duration_hours}h</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link href={course.is_enrolled ? `/student/courses/${course.id}/learn` : `/courses/${course.id}`}>
                <Button size="lg" className="rounded-xl h-12 px-6 gap-2">
                  {course.is_enrolled ? 'Resume Learning' : `Enroll Now - ${formatCurrency(course.price, course.currency)}`}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              {!course.is_enrolled && (
                <Link href={`/courses/${course.id}`}>
                  <Button size="lg" variant="outline" className="rounded-xl h-12 px-6">
                    Learn More
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right: Course Preview (Thumbnail with Lightbox Trigger) */}
          <div className="relative group cursor-pointer" onClick={() => course.preview_video_url && setIsVideoOpen(true)}>
            <div className="aspect-video rounded-3xl overflow-hidden border-4 border-border shadow-2xl relative transition-transform duration-500 group-hover:scale-[1.02]">
              {course.thumbnail_url ? (
                <img
                  src={`${BACKEND_URL}${course.thumbnail_url}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <GraduationCap className="w-24 h-24 text-muted-foreground" />
                </div>
              )}

              {/* Overlay with Play Button */}
              {course.preview_video_url && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
                    <Play className="w-10 h-10 text-primary-foreground fill-current" />
                  </div>
                </div>
              )}
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-8 -left-8 bg-background rounded-2xl border border-border p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl">{course.total_students || 0}+</div>
                  <div className="text-sm text-muted-foreground">Enrolled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Lightbox */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none ring-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{course.title} - Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <ReactPlayer
              url={`${BACKEND_URL}${course.preview_video_url}`}
              width="100%"
              height="100%"
              controls
              playing={isVideoOpen}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============================================================================
// Marketplace Hero (Multi-Course Mode)
// ============================================================================

function MarketplaceHero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Learn from IT Experts</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Master Tech Skills with{' '}
            <span className="relative">
              <span className="relative z-10">ITSLab</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-primary/20 -rotate-1"></span>
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional online courses taught by experienced ITI instructors. Build real-world
            skills and advance your tech career.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="w-full h-14 pl-6 pr-32 rounded-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button className="absolute right-2 top-2 rounded-full h-10 px-6 font-bold shadow-md hover:shadow-lg transition-all" size="sm">
                Search
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">500+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-medium">10+ Courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="font-medium">ITI Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Features Section
// ============================================================================

function FeaturesSection() {
  const features = [
    {
      icon: GraduationCap,
      title: 'Expert Instructors',
      description: 'Learn from experienced ITI professionals with real industry experience',
    },
    {
      icon: BookOpen,
      title: 'Quality Content',
      description: 'Comprehensive courses with hands-on projects and practical examples',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn certificates upon completion to showcase your achievements',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join a community of learners and get support when you need it',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose ITSLab?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide the best learning experience with expert instructors and quality content
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Courses Section
// ============================================================================

function CoursesSection({ courses }: { courses: any[] }) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-2">Featured Courses</h2>
            <p className="text-muted-foreground">Start learning with our top-rated courses</p>
          </div>
          <Link href="/courses">
            <Button variant="outline" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}


// ============================================================================
// Stats Section
// ============================================================================

function StatsSection() {
  const stats = [
    { label: 'Students Enrolled', value: '500+' },
    { label: 'Courses Available', value: '10+' },
    { label: 'Expert Instructors', value: '5+' },
    { label: 'Success Rate', value: '95%' },
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-primary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section
// ============================================================================

function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-2">
          <CardContent className="py-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of students already learning with ITSLab and take your tech career to
              the next level
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}