// ============================================================================
// SRC/APP/COURSES/[ID]/PAGE.TSX - Course Detail Page
// ============================================================================

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useCourse } from '@/hooks/use-api';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import apiClient, { BACKEND_URL } from '@/lib/api-client';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';
import {
  Star,
  Users,
  Clock,
  Award,
  PlayCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Download,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Share2,
  Facebook,
  Twitter,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useQueryClient } from '@tanstack/react-query';


export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();

  const { data: course, isLoading } = useCourse(courseId);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<any>(null);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist</p>
          <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${course.id}`);
      return;
    }

    if (Number(course.price) === 0) {
      try {
        setEnrolling(true);
        // Direct call to initiate-manual for free courses
        const { data } = await apiClient.post('/payment/initiate-manual', {
          courseId: course.id,
          paymentMethod: 'free',
          senderInfo: 'FREE_ACCESS'
        });

        if (data.success) {
          toast.success('Course assigned to your library!');
          queryClient.invalidateQueries({ queryKey: ['course', course.id] });
          router.push(`/student/courses/${course.id}/learn`);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Enrollment failed');
      } finally {
        setEnrolling(false);
      }
      return;
    }

    // Redirect to the new checkout page
    router.push(`/student/checkout/${course.id}`);
  };

  const totalLessons = course.sections?.reduce(
    (acc: number, section: any) => acc + (section.lessons?.length || 0),
    0
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm font-medium mb-4">
                {course.level}
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-xl text-muted-foreground mb-6">
                {course.short_description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.average_rating || '5.0'}</span>
                  <span className="text-muted-foreground">
                    ({course.total_reviews || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.total_students || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>

              {/* Preview Video / Thumbnail Fallback */}
              {(course.preview_video_url || course.thumbnail_url) && (
                <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                  <div className="aspect-video bg-black flex items-center justify-center rounded-2xl overflow-hidden">
                    {course.preview_video_url ? (
                      <ReactPlayer
                        url={`${BACKEND_URL}${course.preview_video_url}`}
                        width="100%"
                        height="100%"
                        controls
                        light={
                          course.thumbnail_url
                            ? `${BACKEND_URL}${course.thumbnail_url}`
                            : true
                        }
                      />
                    ) : (
                      <img
                        src={`${BACKEND_URL}${course.thumbnail_url}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Card>
              )}
              {/* Instructor */}
              <Card className="mt-6">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Instructor</div>
                    <div className="font-semibold text-lg">{course.instructor?.name}</div>
                    <div className="text-sm text-muted-foreground">{course.instructor?.bio}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/**/}

            {/* Tabs */}
            <div>
              <div className="flex gap-4 border-b mb-6">
                {['overview', 'curriculum', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      'pb-3 px-2 font-medium transition-colors capitalize',
                      activeTab === tab
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* What You'll Learn */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.learning_outcomes?.map((outcome: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Course Description</h2>
                    <div
                      className="prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                  </div>

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {course.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Curriculum Tab */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Course Curriculum</h2>
                    <div className="text-sm text-muted-foreground">
                      {course.sections?.length || 0} sections • {totalLessons} lessons
                    </div>
                  </div>

                  {course.sections?.map((section: any, sectionIndex: number) => (
                    <Card key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-left">
                          <div className="font-semibold text-lg mb-1">
                            Section {sectionIndex + 1}: {section.title}
                          </div>
                          {section.description && (
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          )}
                          <div className="text-sm text-muted-foreground mt-2">
                            {section.lessons?.length || 0} lessons
                          </div>
                        </div>
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {expandedSections.has(section.id) && (
                        <div className="border-t divide-y">
                          {section.lessons?.map((lesson: any, lessonIndex: number) => (
                            <div key={lesson.id} className="p-4 flex items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <PlayCircle className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {lessonIndex + 1}. {lesson.title}
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {lesson.video_duration_minutes} min
                              </div>
                              {lesson.is_preview && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewLesson(lesson);
                                  }}
                                  className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 font-bold gap-1"
                                >
                                  <PlayCircle className="w-4 h-4" /> Watch
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">
                        {course.average_rating || '5.0'}
                      </div>
                      <div className="flex items-center gap-1 justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-5 h-5',
                              i < Math.round(course.average_rating || 5)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {course.total_reviews || 0} reviews
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {course.reviews && course.reviews.length > 0 ? (
                      course.reviews.map((review: any) => (
                        <Card key={review.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-semibold text-primary">
                                  {review.user?.name?.[0] || 'U'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold">{review.user?.name}</span>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          'w-4 h-4',
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(review.created_at)}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{review.review_text}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No reviews yet. Be the first to review this course!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Sticky CTA */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div>
                  <div className="text-4xl font-bold mb-2">
                    {formatCurrency(course.price, course.currency)}
                  </div>
                  {course.price > 0 && (
                    <div className="text-sm text-muted-foreground">One-time payment</div>
                  )}
                </div>

                {/* CTA Button */}
                {/* CTA Button */}
                {(() => {
                  const isRestrictedRole = !!(user && ['admin', 'instructor'].includes(user.role));

                  return (
                    <>
                      <Button
                        onClick={() => course.is_enrolled ? router.push(`/student/courses/${course.id}/learn`) : handleEnroll()}
                        disabled={enrolling || course.enrollment?.payment_status === 'pending' || isRestrictedRole}
                        loading={enrolling}
                        className="w-full h-14 rounded-2xl font-black text-lg gap-2 disabled:opacity-70"
                        size="lg"
                      >
                        {course.is_enrolled ? 'Resume Learning' :
                          course.enrollment?.payment_status === 'pending' ? (
                            <>
                              <Clock className="w-5 h-5" />
                              Request Pending
                            </>
                          ) : isRestrictedRole ? (
                            'Student Only'
                          ) : (
                            course.price > 0 ? 'Enroll Now' : 'Enroll for Free'
                          )}
                      </Button>

                      {isRestrictedRole && (
                        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-slate-600 text-sm font-medium text-center">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Instructors & Admins cannot enroll</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {course.enrollment?.payment_status === 'pending' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <p className="font-bold mb-1">Payment Under Review</p>
                      Your enrollment request is pending admin approval. You will get access once verified.
                    </div>
                  </div>
                )}

                {/* What's Included */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-semibold">This course includes:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>{course.duration_hours} hours on-demand video</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Download className="w-5 h-5 text-primary" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="w-5 h-5 text-primary" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>Full lifetime access</span>
                    </div>
                  </div>
                </div>

                {/* Social Share Section */}
                <div className="pt-6 border-t space-y-4">
                  <h3 className="font-semibold text-sm">Share this course:</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl hover:text-blue-600 hover:border-blue-600 transition-colors"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl hover:text-sky-500 hover:border-sky-500 transition-colors"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this course: ${course.title}`)}`, '_blank')}
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl hover:text-green-600 hover:border-green-600 transition-colors"
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this course: ${course.title} ${window.location.href}`)}`, '_blank')}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl hover:text-primary hover:border-primary transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      }}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Preview Modal */}
      <Dialog open={!!previewLesson} onOpenChange={(open) => !open && setPreviewLesson(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none rounded-3xl shadow-2xl">
          <DialogHeader className="p-6 bg-white border-b">
            <DialogTitle className="flex items-center gap-3 pr-8">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lesson Preview</span>
                <span className="text-xl font-black">{previewLesson?.title}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black flex items-center justify-center relative group"
            onContextMenu={(e) => e.preventDefault()}>
            {previewLesson && (
              <>
                <ReactPlayer
                  url={`${BACKEND_URL}/api/v1/courses/video/${previewLesson.id}`}
                  width="100%"
                  height="100%"
                  controls={false}
                  playing
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload',
                        disablePictureInPicture: true,
                        onContextMenu: (e: any) => e.preventDefault(),
                      },
                      hlsOptions: {
                        xhrSetup: (xhr: any) => {
                          xhr.withCredentials = true;
                          const token = Cookies.get('accessToken');
                          if (token) {
                            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                          }
                        },
                      },
                    },
                  }}
                />
                {/* Protective Overlay */}
                <div className="absolute inset-0 bg-transparent z-10" />
              </>
            )}
          </div>
          <div className="p-6 bg-white border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium max-w-md">
              Watching a sample from <span className="font-bold text-foreground">"{course.title}"</span>. Enroll now to access all lessons.
            </p>
            <Button
              className="rounded-xl font-bold px-6 h-12 gap-2 shadow-lg shadow-primary/20"
              onClick={() => {
                setPreviewLesson(null);
                handleEnroll();
              }}
            >
              Enroll Now <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}