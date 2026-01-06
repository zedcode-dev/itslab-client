'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse, useCourseCurriculum, useCourseProgress, useMarkLessonComplete, useSubmitReview } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import { BACKEND_URL } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ReactPlayer from 'react-player';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const VideoPlayer = dynamic(() => import('@/components/video/VideoPlayer'), { ssr: false });
import {
  CheckCircle,
  Circle,
  Download,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  Menu,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: sections, isLoading: sectionsLoading } = useCourseCurriculum(courseId);
  const { data: progressData, isLoading: progressLoading, refetch: refetchProgress } = useCourseProgress(courseId);
  const markComplete = useMarkLessonComplete();
  const { user } = useAuthStore();

  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const submitReview = useSubmitReview(courseId);
  const playerRef = useRef<any>(null);

  // Phase 1 Protection: Disable Right Click and Shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I, Ctrl+Shift+J
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 's')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-select first lesson or previously watched lesson
  useEffect(() => {
    if (sections && sections.length > 0 && !currentLesson) {
      const firstSection = sections[0];
      if (firstSection?.lessons && firstSection.lessons.length > 0) {
        setCurrentLesson(firstSection.lessons[0]);
        setExpandedSections(new Set([firstSection.id]));
      }
    }
  }, [sections, currentLesson]);

  // Handle API failure (e.g. Rate Limit)
  useEffect(() => {
    if (!sectionsLoading && !sections && courseId) {
      // toast.error('Failed to load course content. Please try refreshing again later.');
    }
  }, [sections, sectionsLoading, courseId]);

  if (courseLoading || sectionsLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  const isLessonCompleted = (lessonId: string) => {
    return progressData?.lessonProgress?.some(
      (p: any) => p.lessonId === lessonId && p.completed
    );
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    await markComplete.mutateAsync({
      lessonId: currentLesson.id,
      watchTimeSeconds: 0,
    });
    refetchProgress();
  };

  const navigateLesson = (direction: 'next' | 'prev') => {
    if (!sections || !currentLesson) return;

    const allLessons = sections.flatMap((s: any) => s.lessons);
    const currentIndex = allLessons.findIndex((l: any) => l.id === currentLesson.id);

    if (direction === 'next' && currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }
    await submitReview.mutateAsync({ rating, reviewText });
    setIsReviewModalOpen(false);
    setReviewText('');
    setRating(5);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background text-foreground overflow-hidden">
      {/* 1. Sidebar - Curriculum (LEFT SIDE) */}
      <aside
        className={cn(
          "transition-all duration-300 border-r bg-muted/20 flex flex-col h-full",
          sidebarOpen ? "lg:w-[350px] w-full" : "w-0 lg:w-0 overflow-hidden border-none"
        )}
      >
        <div className="p-5 border-b flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/student/courses')} className="p-0 h-auto hover:bg-transparent">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-bold text-lg">Course Content</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(false)}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {sections?.map((section: any) => (
            <div key={section.id} className="rounded-xl border bg-card overflow-hidden transition-all shadow-sm">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="text-left flex-1 min-w-0 pr-4">
                  <div className="font-bold text-sm truncate">{section.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {section.lessons?.length || 0} Lessons
                  </div>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-4 h-4 opacity-40 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-40 shrink-0" />
                )}
              </button>

              {expandedSections.has(section.id) && (
                <div className="bg-muted/10 border-t">
                  {section.lessons?.map((lesson: any, idx: number) => {
                    const active = currentLesson?.id === lesson.id;
                    const completed = isLessonCompleted(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={cn(
                          "w-full px-4 py-3.5 flex items-start gap-3 transition-all border-l-4",
                          active ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted/50"
                        )}
                      >
                        <div className="mt-1">
                          {completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className={cn("text-sm font-semibold leading-snug", active ? "text-primary" : "text-foreground/80")}>
                            {idx + 1}. {lesson.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                            {lesson.lesson_type === 'text' ? (
                              <>
                                <Menu className="w-3 h-3" />
                                <span>Text Lesson</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3 h-3" />
                                <span>{lesson.video_duration_minutes} min</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* 2. Main Content - Video & Info (RIGHT SIDE) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden h-screen">
        {/* Simple White Header */}
        <header className="h-16 shrink-0 border-b bg-card flex items-center justify-between px-4 lg:px-10 z-20">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mb-1">Learning Mode</span>
              <h1 className="text-sm md:text-base font-bold text-foreground leading-none truncate max-w-[200px] md:max-w-md">
                {course?.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">{progressData?.enrollment?.progress?.toFixed(0)}% Complete</span>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden border border-border/50">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressData?.enrollment?.progress || 0}%` }} />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/student/dashboard')} className="rounded-xl font-bold text-xs h-9">
              Exit
            </Button>
          </div>
        </header>

        {/* Scrollable Container for Video + Info */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Video Area (Chic Wrapped with Margins) */}
          <div className="flex-shrink-0 px-4 pt-4 lg:px-10 lg:pt-8 w-full">
            <div className="max-w-6xl mx-auto backdrop-blur-3xl bg-card/50 rounded-3xl p-3 shadow-2xl border border-white/10">
              <div className="aspect-video relative overflow-hidden rounded-2xl select-none bg-black">
                {/* Protective Transparent Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none"
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* Dynamic Watermark */}
                {user && (
                  <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-20 text-[10px] md:text-sm font-mono text-white/50 bg-black/20 p-1 rounded select-none">
                    {user.name} - {user.email}
                  </div>
                )}

                {currentLesson?.lesson_type === 'text' ? (
                  <div className="absolute inset-0 bg-white overflow-y-auto p-6 md:p-10 custom-scrollbar select-text selection:bg-primary/20">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div className="prose prose-slate max-w-none">
                        {currentLesson.content?.split('\n').map((line: string, i: number) => (
                          <p key={i} className="text-slate-700 leading-relaxed mb-4 text-base md:text-lg">
                            {line}
                          </p>
                        ))}
                      </div>

                      {!isLessonCompleted(currentLesson.id) && (
                        <div className="pt-10 border-t flex justify-center">
                          <Button
                            onClick={handleMarkComplete}
                            loading={markComplete.isPending}
                            className="rounded-2xl h-14 px-10 font-black text-lg shadow-xl shadow-primary/20 gap-3"
                          >
                            <CheckCircle className="w-6 h-6" /> Mark as Read & Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : currentLesson?.id ? (
                  <VideoPlayer
                    key={currentLesson.id}
                    onEnded={() => {
                      if (!isLessonCompleted(currentLesson.id)) {
                        handleMarkComplete();
                      }
                    }}
                    options={{
                      autoplay: false,
                      controls: true,
                      responsive: true,
                      sources: [{
                        src: `${BACKEND_URL}/api/v1/courses/video/${currentLesson.id}`,
                        type: 'application/x-mpegURL'
                      }]
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
                    <PlayCircle className="w-20 h-20 mb-4 opacity-10 animate-pulse" />
                    <p className="text-lg">Select a lesson from the menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lesson Info content */}
          <div className="max-w-6xl mx-auto px-4 lg:px-10 py-8 space-y-10 w-full">
            {/* Main Header & Description */}
            <div className="space-y-6 border-b pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-primary/5 rounded">Ongoing Module</span>
                  {isLessonCompleted(currentLesson?.id) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 text-[10px] uppercase font-bold">
                      <CheckCircle className="w-3 h-3 mr-1" /> Completed
                    </Badge>
                  )}
                </div>

                <h2 className="text-3xl font-black tracking-tight leading-tight text-foreground">
                  {currentLesson?.title || "Get Started"}
                </h2>

                <div className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
                  {currentLesson?.description || "Select a module to begin your learning path."}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigateLesson('prev')}
                  disabled={!currentLesson}
                  className="rounded-xl h-11 px-6 font-bold"
                >
                  Previous
                </Button>

                {/*currentLesson?.lesson_type === 'video' && !isLessonCompleted(currentLesson?.id) && (
                  <Button
                    onClick={handleMarkComplete}
                    loading={markComplete.isPending}
                    variant="outline"
                    className="rounded-xl h-11 px-6 font-bold border-dashed border-primary/40 text-primary hover:bg-primary/5"
                  >
                    Complete Manually
                  </Button>
                )*/}

                <Button
                  onClick={() => navigateLesson('next')}
                  variant="primary"
                  className="rounded-xl h-11 px-8 font-black shadow-lg shadow-primary/10"
                >
                  Next Lesson <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Extras Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
              <div className="md:col-span-2 space-y-8">
                {currentLesson?.resources?.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-primary/20">
                      <Download className="w-5 h-5 text-primary" /> Learning Resources
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {currentLesson.resources.map((res: any) => (
                        <div
                          key={res.id}
                          className="p-5 rounded-2xl border-2 border-transparent bg-muted/30 hover:bg-background hover:border-primary/10 hover:shadow-xl transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Download className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-sm tracking-tight">{res.title}</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-black mt-1 opacity-60">{res.file_type} Resource</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(res.file_url)}
                            className="rounded-xl border-dashed"
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card className="p-8 border-none bg-gradient-to-br from-primary/5 to-transparent text-primary shadow-none rounded-[2rem]">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 opacity-70">Course Metrics</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground">Completion</span>
                        <span className="font-black text-lg">{progressData?.enrollment?.progress?.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${progressData?.enrollment?.progress || 0}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-muted-foreground font-black uppercase">Completed Units</div>
                      <div className="text-3xl font-black">{progressData?.lessonProgress?.filter((p: any) => p.completed).length || 0} / {sections?.reduce((a: any, s: any) => a + (s.lessons?.length || 0), 0)}</div>
                    </div>

                    <div className="pt-4 border-t border-primary/10">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsReviewModalOpen(true)}
                      >
                        Rate this Course
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Share Your Thoughts</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Your feedback helps us improve and helps other students make informed decisions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit} className="space-y-8 mt-4">
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Overall Rating</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125 active:scale-90"
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-colors",
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted opacity-30"
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-bold text-primary">
                {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Describe your experience</label>
              <Textarea
                placeholder="What did you like or dislike about this course?"
                className="min-h-[120px] rounded-2xl bg-muted/30 border-2 border-primary/10 focus-visible:ring-primary/20 p-5 text-sm"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitReview.isPending}
                className="px-10"
              >
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; transition: all 0.2s; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
