'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse, useCourseCurriculum, useCourseProgress, useMarkLessonComplete, useSubmitReview } from '@/hooks/use-api';
import { useAuthStore } from '@/store/auth-store';
import apiClient, { BACKEND_URL } from '@/lib/api-client';
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
  Lock,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Loader2,
  X,
  Play,
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

  // Handle API failure (e.g. Rate Limit or unauthorized)
  useEffect(() => {
    if (!sectionsLoading && !sections && courseId) {
      toast.error('Failed to load course content. You may not be enrolled.');
      router.push('/student/courses');
    }
  }, [sections, sectionsLoading, courseId, router]);

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

    // Attempt to get actual watch time from playerRef
    let watchTime = 0;
    try {
      if (currentLesson.lesson_type !== 'text' && playerRef.current) {
        // Support both video.js (.currentTime()) and older players (.getCurrentTime())
        const player = playerRef.current;
        const time = typeof player.currentTime === 'function'
          ? player.currentTime()
          : typeof player.getCurrentTime === 'function'
            ? player.getCurrentTime()
            : 0;
        watchTime = Math.floor(time || 0);
      }
    } catch (err) {
      console.warn('Could not retrieve watch time:', err);
    }

    try {
      console.log('Sending completion request for lesson:', currentLesson.id, 'Watch time:', watchTime);
      const result = await markComplete.mutateAsync({
        lessonId: currentLesson.id,
        watchTimeSeconds: watchTime,
      });
      console.log('Completion request successful:', result);

      // Force immediate refetch
      const res = await refetchProgress();
      console.log('Progress refetch result:', res);

      if (result.success) {
        toast.success('Lesson completed!');
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      toast.error('Failed to save progress. Please try again.');
    }
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
    await submitReview.mutateAsync({ rating, review_text: reviewText });
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

                    // Locking logic: Any lesson after an uncompleted quiz is locked
                    const allLessons = sections.flatMap((s: any) => s.lessons);
                    const lessonIndex = allLessons.findIndex((l: any) => l.id === lesson.id);
                    let isLocked = false;

                    for (let i = 0; i < lessonIndex; i++) {
                      if (!isLessonCompleted(allLessons[i].id)) {
                        isLocked = true;
                        break;
                      }
                    }

                    return (
                      <button
                        key={lesson.id}
                        disabled={isLocked && !active}
                        onClick={() => !isLocked && setCurrentLesson(lesson)}
                        className={cn(
                          "w-full px-4 py-3.5 flex items-start gap-3 transition-all border-l-4",
                          active ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted/50",
                          isLocked && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="mt-1">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-muted-foreground/50" />
                          ) : completed ? (
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
                            {lesson.lesson_type === 'quiz' ? (
                              <>
                                <HelpCircle className="w-3 h-3" />
                                <span>MCQ Quiz</span>
                              </>
                            ) : lesson.lesson_type === 'text' ? (
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
          {/* Video/Content Area */}
          <div className="flex-shrink-0 px-4 pt-4 lg:px-10 lg:pt-8 w-full">
            <div className={cn(
              "max-w-6xl mx-auto",
              currentLesson?.lesson_type === 'text' ? "" : "backdrop-blur-3xl bg-card/50 rounded-3xl p-3 shadow-2xl border border-white/10"
            )}>
              <div className={cn(
                "relative overflow-hidden select-none",
                currentLesson?.lesson_type === 'video' ? "aspect-video bg-black rounded-2xl" :
                  currentLesson?.lesson_type === 'text' ? "" : "min-h-fit rounded-2xl"
              )}>
                {/* Protective Transparent Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none"
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* Dynamic Watermark Removed per User Request */}

                {currentLesson?.lesson_type === 'quiz' ? (
                  <div className="min-h-[500px] overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50 rounded-2xl">
                    <QuizRenderer
                      lessonId={currentLesson.id}
                      onSuccess={() => {
                        refetchProgress();
                      }}
                      isCompleted={isLessonCompleted(currentLesson.id)}
                    />
                  </div>
                ) : currentLesson?.lesson_type === 'text' ? (
                  <div className="bg-white overflow-y-auto p-6 md:p-10 custom-scrollbar select-text selection:bg-primary/20">
                    <div className="max-w-3xl space-y-6">
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
                    onReady={(player) => {
                      playerRef.current = player;
                    }}
                    onEnded={() => {
                      console.log('Video ended, marking complete...');
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
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => navigateLesson('prev')}
                    disabled={!currentLesson}
                    variant="ghost"
                    className="rounded-xl h-14 px-6 font-bold uppercase tracking-widest gap-2 bg-white ring-1 ring-primary/10 shadow-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </Button>

                  <Button
                    onClick={() => navigateLesson('next')}
                    disabled={
                      (currentLesson?.lesson_type === 'quiz' || currentLesson?.lesson_type === 'final_exam') &&
                      !isLessonCompleted(currentLesson.id)
                    }
                    variant="ghost"
                    className="rounded-xl h-14 px-6 font-bold uppercase tracking-widest gap-2 bg-white ring-1 ring-primary/10 shadow-sm"
                  >
                    Next Lesson
                    <ArrowRight className="w-5 h-5" />
                  </Button>

                  {progressData?.enrollment?.completed && (
                    <Button
                      onClick={() => router.push(`/student/courses/${courseId}/certificate`)}
                      className="rounded-xl h-14 px-8 font-black uppercase tracking-widest gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                    >
                      Claim Certificate
                      <Star className="w-5 h-5 fill-white" />
                    </Button>
                  )}
                </div>
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

// ============================================================================
// Internal Quiz Renderer Component
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';

function QuizRenderer({ lessonId, onSuccess, isCompleted }: { lessonId: string, onSuccess: () => void, isCompleted: boolean }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/courses/lesson/${lessonId}/quiz`);
        if (res.data.success) {
          setQuiz(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (!answers[quiz.questions[currentQuestionIndex].id]) {
      toast.error('Please select an answer');
      return;
    }
    setDirection(1);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await apiClient.post(`/courses/lesson/${lessonId}/quiz/submit`, { answers });
      if (res.data.success) {
        setResult(res.data.data);
        if (res.data.data.passed) {
          toast.success('Congratulations! You passed the quiz!');
          onSuccess();
        } else {
          toast.error('You did not pass. Try again!');
        }
      }
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      <p className="text-muted-foreground animate-pulse font-medium">Preparing your quiz...</p>
    </div>
  );

  if (!quiz || !quiz.questions?.length) return (
    <div className="p-16 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
      <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
      <p className="text-lg font-bold">No questions found</p>
      <p className="text-muted-foreground">The instructor hasn't added questions to this quiz yet.</p>
    </div>
  );

  // If quiz already completed, show completion message (prevent retake)
  if (isCompleted) {
    const score = quiz?.lastPassingAttempt?.score;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-12"
      >
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center bg-green-500 text-white shadow-lg">
            <CheckCircle className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Quiz Completed!</h2>
            <p className="text-slate-500 mt-3 text-lg">
              You have already passed this quiz. Great work!
            </p>
          </div>
          {score !== undefined && score !== null && (
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="text-4xl font-black text-green-600">{score.toFixed(0)}%</div>
              <div className="text-xs uppercase font-bold tracking-widest text-green-500 mt-1">Your Score</div>
            </div>
          )}
          <div className="pt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-4 py-2 text-sm font-bold">
              <CheckCircle className="w-4 h-4 mr-2" /> Passed
            </Badge>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showIntro && !result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center text-indigo-600">
            <HelpCircle className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Module Knowledge Check</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Test your understanding of the concepts covered in this module.
              You'll need a score of <span className="text-indigo-600 font-bold">{quiz.passing_score || 70}%</span> or higher to pass.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="text-2xl font-black text-slate-900">{quiz.questions.length}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Total Questions</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="text-2xl font-black text-slate-900">{quiz.passing_score || 70}%</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Passing Score</div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setShowIntro(false)}
              className="w-full h-16 rounded-2xl font-black text-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 gap-3 group"
            >
              Start Quiz <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="mt-4 text-xs text-slate-400 font-medium italic">You can retake this quiz as many times as you need.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto"
      >
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center space-y-8 overflow-hidden relative">
          {/* Decorative background elements */}
          <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20", result.passed ? "bg-green-400" : "bg-red-400")} />
          <div className={cn("absolute bottom-0 left-0 w-32 h-32 blur-3xl rounded-full opacity-20", result.passed ? "bg-blue-400" : "bg-purple-400")} />

          <div className={cn(
            "w-24 h-24 rounded-3xl mx-auto flex items-center justify-center rotate-12 shadow-lg",
            result.passed ? "bg-green-500 text-white" : "bg-red-500 text-white"
          )}>
            {result.passed ? <CheckCircle className="w-12 h-12 -rotate-12" /> : <AlertTriangle className="w-12 h-12 -rotate-12" />}
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight">{result.passed ? 'Excellent Work!' : 'Almost There!'}</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              {result.passed
                ? "You've successfully mastered this module's objectives."
                : "Don't worry, every mistake is a learning opportunity."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-6 bg-muted/30 rounded-3xl">
              <div className="text-3xl font-black text-primary">{result.score.toFixed(0)}%</div>
              <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground mt-1">Your Score</div>
            </div>
            <div className="p-6 bg-muted/30 rounded-3xl">
              <div className="text-3xl font-black text-foreground">{result.passingScale}%</div>
              <div className="text-xs uppercase font-bold tracking-widest text-muted-foreground mt-1">Pass Mark</div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {!result.passed && (
              <Button
                onClick={() => {
                  setResult(null);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                }}
                className="w-full h-14 rounded-2xl font-black text-lg bg-red-600 hover:bg-red-700 shadow-xl shadow-red-200"
              >
                Retry Quiz
              </Button>
            )}
            {result.passed && (
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <p className="text-green-700 font-bold text-sm">Unit completed! You can now continue your journey.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with detailed progress */}
      <div className="mb-10 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          Knowledge Check
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Unit Practice Quiz</h2>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>{currentQuestionIndex + 1} of {quiz.questions.length} Questions</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-muted-foreground/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* Animated Question Card */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestionIndex}
            custom={direction}
            initial={{ opacity: 0, x: 50 * direction, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50 * direction, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full"
          >
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 flex flex-col gap-8 shadow-sm">
              <div className="space-y-6">
                <div className="inline-block p-4 rounded-3xl bg-slate-50 text-slate-400 font-black text-xl leading-none">
                  {String(currentQuestionIndex + 1).padStart(2, '0')}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                  {currentQ.question_text}
                </h3>
              </div>

              <div className="grid gap-4">
                {currentQ.options.map((opt: any, idx: number) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  const label = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(currentQ.id, opt.id)}
                      className={cn(
                        "group flex items-center gap-5 p-5 md:p-6 rounded-[1.5rem] border-2 transition-all text-left relative overflow-hidden",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-4 ring-primary/5"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-colors shrink-0",
                        isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      )}>
                        {label}
                      </div>
                      <span className={cn(
                        "font-semibold text-lg flex-1",
                        isSelected ? "text-primary" : "text-slate-700"
                      )}>
                        {opt.option_text}
                      </span>
                      {isSelected && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-2 h-10 bg-primary absolute left-0 rounded-r-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="h-14 px-8 rounded-2xl font-black text-slate-500 hover:text-primary transition-colors flex gap-2 disabled:opacity-0"
        >
          <X className="w-5 h-5 rotate-45" /> Back
        </Button>

        <Button
          onClick={handleNext}
          loading={submitting}
          className={cn(
            "h-14 px-12 rounded-2xl font-black text-lg gap-2 shadow-2xl transition-all",
            currentQuestionIndex === quiz.questions.length - 1
              ? "bg-green-600 hover:bg-green-700 shadow-green-200"
              : "bg-primary shadow-primary/20"
          )}
        >
          {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Continue'}
          <Play className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
