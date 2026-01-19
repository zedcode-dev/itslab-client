// ============================================================================
// SRC/COMPONENTS/DASHBOARD/COURSEEDITOR.TSX - Unified Course Editor
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCourse, usePublishCourse, useUpdateCourse } from '@/hooks/use-api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient, { BACKEND_URL } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Upload,
    Eye,
    Save,
    Power,
    Loader2,
    AlertCircle,
    CheckCircle2,
    HelpCircle,
    Copy,
    ChevronDown,
    ChevronUp,
    X,
    Play,
    FileText,
    Monitor,
    BarChart2,
    Mail,
    Calendar,
    ArrowRight,
    Search
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuthStore } from '@/store/auth-store';

// --- Sortable Item Components ---

function SortableSection({ section, index, onAddLesson, onEdit, onDelete, children }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={cn('border-2 mb-4', isDragging && 'opacity-50 ring-2 ring-primary')}>
                <div className="p-4 bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                Section {index + 1}: {section.title}
                            </h3>
                            {section.description && (
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                            )}
                            <div className="text-sm text-muted-foreground mt-1">
                                {section.lessons?.length || 0} lessons
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddLesson(section)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Lesson
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(section.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                </div>
                {children}
            </Card>
        </div>
    );
}

function SortableLesson({ lesson, index, onEdit, onDelete, onViewResults }: { lesson: any, index: number, onEdit: (lesson: any) => void, onDelete: (id: string) => void, onViewResults: (lesson: any) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'p-4 flex items-center justify-between hover:bg-muted/30 transition-colors bg-white border-b last:border-0',
                isDragging && 'opacity-50 ring-1 ring-primary relative z-10'
            )}
        >
            <div className="flex items-center gap-3 flex-1">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <div className="font-medium">
                        {index + 1}. {lesson.title}
                    </div>
                    {lesson.description && (
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest mt-1.5">
                        {lesson.lesson_type === 'video' ? (
                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                <Play className="w-3 h-3" />
                                <span>{lesson.video_duration_minutes || 0} min</span>
                            </div>
                        ) : lesson.lesson_type === 'text' ? (
                            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                                <FileText className="w-3 h-3" />
                                <span>Read</span>
                            </div>
                        ) : lesson.lesson_type === 'quiz' ? (
                            <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                                <HelpCircle className="w-3 h-3" />
                                <span>Quiz</span>
                            </div>
                        ) : lesson.lesson_type === 'final_exam' ? (
                            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                <Monitor className="w-3 h-3" />
                                <span>Final Exam</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md">
                                <FileText className="w-3 h-3" />
                                <span>Other</span>
                            </div>
                        )}
                        {lesson.is_preview && (
                            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">
                                Preview
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {lesson.lesson_type === 'quiz' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResults(lesson)}
                        className="rounded-xl h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-bold text-xs"
                    >
                        <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                        Results
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onEdit(lesson)}>
                    <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(lesson.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
}

// --- Main Editor Component ---

export default function CourseEditor({ courseId, rolePrefix }: { courseId: string, rolePrefix: 'admin' | 'instructor' }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data: course, isLoading } = useCourse(courseId);
    const publishCourse = usePublishCourse(courseId);
    const updateCourseMutation = useUpdateCourse(courseId);

    const [activeTab, setActiveTab] = useState<'curriculum' | 'basics'>('curriculum');
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingSection, setEditingSection] = useState<any>(null);
    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [currentSection, setCurrentSection] = useState<any>(null);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [resultsLesson, setResultsLesson] = useState<any>(null);



    const [courseForm, setCourseForm] = useState<any>({
        title: '',
        shortDescription: '',
        description: '',
        price: 0,
        language: 'ar',
        level: 'beginner',
        requirements: [''],
        learningOutcomes: [''],
        thumbnail: null as File | null,
        previewVideo: null as File | null,
        durationHours: 0,
    });

    // Reset initialization when courseId changes
    useEffect(() => {
        setHasInitialized(false);
    }, [courseId]);

    // Sync course data into courseForm when loaded (only once)
    useEffect(() => {
        if (course && !hasInitialized) {
            setCourseForm({
                title: course.title || '',
                shortDescription: course.short_description || course.shortDescription || '',
                description: course.description || '',
                price: course.price || 0,
                language: course.language || 'ar',
                level: course.level || 'beginner',
                requirements: course.requirements ? (Array.isArray(course.requirements) ? course.requirements : JSON.parse(course.requirements)) : [''],
                learningOutcomes: (course.learning_outcomes || course.learningOutcomes)
                    ? (Array.isArray(course.learning_outcomes || course.learningOutcomes) ? (course.learning_outcomes || course.learningOutcomes) : JSON.parse(course.learning_outcomes || course.learningOutcomes))
                    : [''],
                thumbnail: null,
                previewVideo: null,
                durationHours: course.duration_hours || 0,
            });
            setHasInitialized(true);
        }
    }, [course, hasInitialized]);

    const [sectionForm, setSectionForm] = useState({ title: '', description: '' });
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        durationMinutes: 0,
        isPreview: false,
        video: null as File | null,
        lessonType: 'video',
        content: '',
        externalUrl: '',
        passingScore: 70,
        questions: [] as any[],
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Mutations ---

    const addSection = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post(`/instructor/courses/${courseId}/sections`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success('Section added successfully');
            setShowSectionModal(false);
            setSectionForm({ title: '', description: '' });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to add section';
            toast.error(msg);
        }
    });

    const updateSection = useMutation({
        mutationFn: async ({ id, data }: any) => {
            const response = await apiClient.put(`/instructor/sections/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success('Section updated successfully');
            setShowSectionModal(false);
            setEditingSection(null);
            setSectionForm({ title: '', description: '' });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to update section';
            toast.error(msg);
        }
    });

    const deleteSection = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/instructor/sections/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success('Section deleted successfully');
        },
    });

    const addLesson = useMutation({
        mutationFn: async ({ sectionId, data }: { sectionId: string; data: FormData }) => {
            const response = await apiClient.post(`/instructor/sections/${sectionId}/lessons`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success('Lesson added successfully');

            if (lessonForm.lessonType === 'quiz') {
                saveQuizMutation.mutate({
                    lessonId: res.data.lesson.id,
                    data: {
                        passing_score: lessonForm.passingScore,
                        questions: lessonForm.questions
                    }
                });
            } else {
                setShowLessonModal(false);
                setCurrentSection(null);
                setUploadProgress(0);
                setLessonForm({ title: '', description: '', durationMinutes: 0, isPreview: false, video: null, lessonType: 'video', content: '', externalUrl: '', passingScore: 70, questions: [] });
            }
        },
        onError: (error: any) => {
            const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to add lesson';
            toast.error(msg);
        }
    });

    const updateLesson = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
            const response = await apiClient.put(`/instructor/lessons/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success('Lesson updated successfully');

            // If it's a quiz, save the quiz questions separately
            if (lessonForm.lessonType === 'quiz') {
                saveQuizMutation.mutate({
                    lessonId: editingLesson.id,
                    data: {
                        passing_score: lessonForm.passingScore,
                        questions: lessonForm.questions
                    }
                });
            } else {
                setShowLessonModal(false);
                setEditingLesson(null);
                setUploadProgress(0);
                setLessonForm({ title: '', description: '', durationMinutes: 0, isPreview: false, video: null, lessonType: 'video', content: '', externalUrl: '', passingScore: 70, questions: [] });
            }
        },
        onError: (error: any) => {
            const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to update lesson';
            toast.error(msg);
        }
    });

    const saveQuizMutation = useMutation({
        mutationFn: async ({ lessonId, data }: { lessonId: string; data: any }) => {
            const response = await apiClient.post(`/instructor/lesson/${lessonId}/quiz`, data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Quiz content saved');
            setShowLessonModal(false);
            setEditingLesson(null);
            setLessonForm({ title: '', description: '', durationMinutes: 0, isPreview: false, video: null, lessonType: 'video', content: '', externalUrl: '', passingScore: 70, questions: [] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Failed to save quiz';
            toast.error(msg);
        }
    });

    const deleteLesson = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/instructor/lessons/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            toast.success('Lesson deleted successfully');
        },
    });

    const deleteCourseMutation = useMutation({
        mutationFn: async () => {
            await apiClient.delete(`/instructor/courses/${courseId}`);
        },
        onSuccess: () => {
            toast.success('Course deleted successfully');
            router.push(`/${rolePrefix}/dashboard`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete course');
        }
    });

    const reorderSections = useMutation({
        mutationFn: async (sectionIds: string[]) => {
            await apiClient.patch(`/instructor/courses/${courseId}/sections/reorder`, { sectionIds });
        },
        onSuccess: () => {
            toast.success('Sections reordered');
        },
    });

    const reorderLessons = useMutation({
        mutationFn: async ({ sectionId, lessonIds }: { sectionId: string; lessonIds: string[] }) => {
            await apiClient.patch(`/instructor/sections/${sectionId}/lessons/reorder`, { lessonIds });
        },
        onSuccess: () => {
            toast.success('Lessons reordered');
        },
    });

    // --- Handlers ---

    const handleSectionSubmit = () => {
        if (addSection.isPending || updateSection.isPending) return;
        if (!sectionForm.title) {
            toast.error('Section title is required');
            return;
        }

        if (editingSection) {
            updateSection.mutate({ id: editingSection.id, data: sectionForm });
        } else {
            const orderIndex = (course?.sections?.length || 0) + 1;
            addSection.mutate({ ...sectionForm, orderIndex });
        }
    };

    const handleLessonSubmit = () => {
        if (addLesson.isPending || updateLesson.isPending) return;
        if (!lessonForm.title) {
            toast.error('Lesson title is required');
            return;
        }

        const formData = new FormData();
        formData.append('title', lessonForm.title);
        formData.append('description', lessonForm.description);
        formData.append('durationMinutes', lessonForm.durationMinutes.toString());
        formData.append('isPreview', lessonForm.isPreview.toString());
        formData.append('lessonType', lessonForm.lessonType);
        if (lessonForm.content) formData.append('content', lessonForm.content);
        if (lessonForm.externalUrl) formData.append('external_url', lessonForm.externalUrl);
        if (lessonForm.video) {
            formData.append('video', lessonForm.video);
        }

        if (editingLesson) {
            updateLesson.mutate({ id: editingLesson.id, data: formData });
        } else if (currentSection) {
            formData.append('orderIndex', ((currentSection.lessons?.length || 0) + 1).toString());
            addLesson.mutate({ sectionId: currentSection.id, data: formData });
        }
    };

    const onDragEnd = (event: DragEndEvent, type: 'section' | 'lesson', sectionId?: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        if (type === 'section') {
            const oldIndex = course.sections.findIndex((s: any) => s.id === active.id);
            const newIndex = course.sections.findIndex((s: any) => s.id === over.id);
            const newSections = arrayMove(course.sections, oldIndex, newIndex);

            // Update local cache optimistically
            queryClient.setQueryData(['course', courseId], { ...course, sections: newSections });
            reorderSections.mutate(newSections.map((s: any) => s.id));
        } else if (type === 'lesson' && sectionId) {
            const section = course.sections.find((s: any) => s.id === sectionId);
            const oldIndex = section.lessons.findIndex((l: any) => l.id === active.id);
            const newIndex = section.lessons.findIndex((l: any) => l.id === over.id);
            const newLessons = arrayMove(section.lessons, oldIndex, newIndex);

            // Update local cache optimistically
            const newSections = course.sections.map((s: any) =>
                s.id === sectionId ? { ...s, lessons: newLessons } : s
            );
            queryClient.setQueryData(['course', courseId], { ...course, sections: newSections });
            reorderLessons.mutate({ sectionId, lessonIds: newLessons.map((l: any) => l.id) });
        }
    };

    const handlePublishToggle = () => {
        if (publishCourse.isPending) return;
        publishCourse.mutate(!course?.is_published);
    };

    const handleAddItem = (field: 'requirements' | 'learningOutcomes') => {
        setCourseForm({ ...courseForm, [field]: [...courseForm[field], ''] });
    };

    const handleRemoveItem = (field: 'requirements' | 'learningOutcomes', index: number) => {
        const updated = courseForm[field].filter((_: any, i: number) => i !== index);
        setCourseForm({ ...courseForm, [field]: updated.length > 0 ? updated : [''] });
    };

    const handleUpdateItem = (field: 'requirements' | 'learningOutcomes', index: number, value: string) => {
        const updated = [...courseForm[field]];
        updated[index] = value;
        setCourseForm({ ...courseForm, [field]: updated });
    };

    if (isLoading) {
        return <CourseEditorSkeleton />;
    }


    // --- Ownership Check ---
    if (user && user.role === 'instructor' && course && course.instructor_id !== user.id) {
        return (
            <div className="container mx-auto p-20">
                <Card className="max-w-md mx-auto border-2 border-red-100 shadow-2xl shadow-red-50">
                    <CardContent className="pt-12 pb-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-gray-900">Access Denied</h1>
                            <p className="text-muted-foreground font-medium">
                                You do not have permission to manage this course. This incident has been logged.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-red-200"
                            onClick={() => router.push(`/${rolePrefix}/dashboard`)}
                        >
                            Return to Safety
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalLessons = course?.sections?.reduce(
        (acc: number, s: any) => acc + (s.lessons?.length || 0),
        0
    );

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{course?.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium">{course?.sections?.length || 0} sections</span>
                        <span className="font-medium">{totalLessons} lessons</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {course?.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a href={`/courses/${courseId}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2 rounded-xl font-bold border-2">
                            <Eye className="w-4 h-4" />
                            Preview Landing
                        </Button>
                    </a>

                    <Button
                        onClick={handlePublishToggle}
                        loading={publishCourse.isPending}
                        variant={course?.is_published ? 'outline' : 'primary'}
                        className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                        <Power className="w-4 h-4" />
                        {course?.is_published ? 'Unpublish' : 'Go Live'}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab('curriculum')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all",
                        activeTab === 'curriculum'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Curriculum Builder
                </button>
                <button
                    onClick={() => setActiveTab('basics')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all",
                        activeTab === 'basics'
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    Course Settings & Media
                </button>
            </div>

            {activeTab === 'curriculum' ? (
                <Card className="border-2 shadow-xl shadow-muted/50 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Course Curriculum</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">Organize your course into sections and lessons</p>
                            </div>
                            <Button onClick={() => {
                                setEditingSection(null);
                                setSectionForm({ title: '', description: '' });
                                setShowSectionModal(true);
                            }} className="gap-2 rounded-xl font-bold">
                                <Plus className="w-4 h-4" />
                                New Section
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {course?.sections && course.sections.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) => onDragEnd(e, 'section')}
                            >
                                <SortableContext items={course.sections.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-4">
                                        {course.sections.map((section: any, sectionIndex: number) => (
                                            <SortableSection
                                                key={section.id}
                                                section={section}
                                                index={sectionIndex}
                                                onAddLesson={(s: any) => {
                                                    setCurrentSection(s);
                                                    setEditingLesson(null);
                                                    setLessonForm({ title: '', description: '', durationMinutes: 0, isPreview: false, video: null, lessonType: 'video', content: '', externalUrl: '', passingScore: 70, questions: [] });
                                                    setShowTypeSelectionModal(true);
                                                }}
                                                onEdit={(s: any) => {
                                                    setEditingSection(s);
                                                    setSectionForm({ title: s.title, description: s.description || '' });
                                                    setShowSectionModal(true);
                                                }}
                                                onDelete={(id: string) => {
                                                    if (confirm('Are you sure? This will delete all lessons in this section.')) {
                                                        deleteSection.mutate(id);
                                                    }
                                                }}
                                            >
                                                {section.lessons && (
                                                    <DndContext
                                                        sensors={sensors}
                                                        collisionDetection={closestCenter}
                                                        onDragEnd={(e) => onDragEnd(e, 'lesson', section.id)}
                                                    >
                                                        <SortableContext items={section.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
                                                            <div className="divide-y bg-white">
                                                                {section.lessons.map((lesson: any, lessonIndex: number) => (
                                                                    <SortableLesson
                                                                        key={lesson.id}
                                                                        lesson={lesson}
                                                                        index={lessonIndex}
                                                                        onViewResults={(l: any) => {
                                                                            setResultsLesson(l);
                                                                            setShowResultsModal(true);
                                                                        }}
                                                                        onEdit={(l: any) => {
                                                                            setEditingLesson(l);
                                                                            setLessonForm({
                                                                                title: l.title,
                                                                                description: l.description || '',
                                                                                durationMinutes: l.video_duration_minutes || 0,
                                                                                isPreview: l.is_preview,
                                                                                video: null,
                                                                                lessonType: l.lesson_type || 'video',
                                                                                content: l.content || '',
                                                                                externalUrl: l.external_url || '',
                                                                                passingScore: l.quiz?.passing_score || 70,
                                                                                questions: l.quiz?.questions || [],
                                                                            });

                                                                            // Fetch full quiz data if it's a quiz
                                                                            if (l.lesson_type === 'quiz') {
                                                                                apiClient.get(`/instructor/lesson/${l.id}/quiz`).then(res => {
                                                                                    if (res.data.success) {
                                                                                        setLessonForm(prev => ({
                                                                                            ...prev,
                                                                                            passingScore: res.data.data.passing_score,
                                                                                            questions: res.data.data.questions
                                                                                        }));
                                                                                    }
                                                                                });
                                                                            }

                                                                            setShowLessonModal(true);
                                                                        }}
                                                                        onDelete={(id: string) => {
                                                                            if (confirm('Delete this lesson?')) {
                                                                                deleteLesson.mutate(id);
                                                                            }
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </SortableContext>
                                                    </DndContext>
                                                )}
                                            </SortableSection>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                    <Plus className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No Content Yet</h3>
                                <p className="text-muted-foreground mb-8 text-sm">
                                    Start mapping your knowledge by adding your first section.
                                </p>
                                <Button onClick={() => setShowSectionModal(true)} size="lg" className="rounded-2xl font-bold px-10">
                                    Build First Section
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Side: Forms */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="rounded-3xl border-2 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Input
                                    label="Course Title"
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    className="h-12 rounded-xl"
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Select
                                            label="Language"
                                            value={courseForm.language}
                                            onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                                            options={[
                                                { value: 'ar', label: 'Arabic' },
                                                { value: 'en', label: 'English' }
                                            ]}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Select
                                            label="Level"
                                            value={courseForm.level}
                                            onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                                            options={[
                                                { value: 'beginner', label: 'Beginner' },
                                                { value: 'intermediate', label: 'Intermediate' },
                                                { value: 'advanced', label: 'Advanced' }
                                            ]}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <Textarea
                                    label="Short Description"
                                    rows={2}
                                    value={courseForm.shortDescription}
                                    onChange={(e) => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                                    className="rounded-xl"
                                />
                                <Textarea
                                    label="Full Course Description (Markdown supported)"
                                    rows={8}
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    className="rounded-xl"
                                />
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-2 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Input
                                            label="Price (EGP)"
                                            type="number"
                                            value={courseForm.price}
                                            onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                                            className="h-12 rounded-xl"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2 italic font-medium">Set to 0.00 for a free course.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            label="Course Duration (Total Hours)"
                                            type="number"
                                            value={courseForm.durationHours}
                                            onChange={(e) => setCourseForm({ ...courseForm, durationHours: parseInt(e.target.value) || 0 })}
                                            className="h-12 rounded-xl"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2 italic font-medium">Estimated time to complete.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements & Outcomes */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="rounded-3xl border-2 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-lg font-bold">Requirements</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => handleAddItem('requirements')}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {courseForm.requirements.map((req: string, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <Input
                                                value={req}
                                                onChange={(e) => handleUpdateItem('requirements', i, e.target.value)}
                                                placeholder="e.g. Basic math knowledge"
                                                className="rounded-xl"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('requirements', i)} className="shrink-0 text-red-400">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-2 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-lg font-bold">Learning Outcomes</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => handleAddItem('learningOutcomes')}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {courseForm.learningOutcomes.map((out: string, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <Input
                                                value={out}
                                                onChange={(e) => handleUpdateItem('learningOutcomes', i, e.target.value)}
                                                placeholder="e.g. Build a flight app"
                                                className="rounded-xl"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('learningOutcomes', i)} className="shrink-0 text-red-400">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Side: Media & Save */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="rounded-3xl border-2 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-lg font-bold">Visual Strategy</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Thumbnail */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold">Course Thumbnail</label>
                                    {course?.thumbnail_url && !courseForm.thumbnail && (
                                        <img
                                            src={`${BACKEND_URL}${course.thumbnail_url}`}
                                            alt="Current Thumbnail"
                                            className="w-full aspect-video object-cover rounded-2xl border-2 shadow-inner"
                                        />
                                    )}
                                    <div className="relative group border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 transition-all hover:border-primary/50 hover:bg-primary/5">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.files?.[0] || null })}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <Upload className="w-6 h-6 text-primary mb-2 transition-transform group-hover:-translate-y-1" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {courseForm.thumbnail ? courseForm.thumbnail.name : 'Choose New Artwork'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Video */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold">Teaser Video</label>
                                    <div className="relative group border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 transition-all hover:border-primary/50 hover:bg-primary/5">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setCourseForm({ ...courseForm, previewVideo: e.target.files?.[0] || null })}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <Upload className="w-6 h-6 text-primary mb-2 transition-transform group-hover:-translate-y-1" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                {courseForm.previewVideo ? courseForm.previewVideo.name : 'Choose New Teaser'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/10"
                                    onClick={() => {
                                        const body = new FormData();
                                        body.append('title', courseForm.title);
                                        body.append('shortDescription', courseForm.shortDescription);
                                        body.append('short_description', courseForm.shortDescription);
                                        body.append('description', courseForm.description);
                                        body.append('price', courseForm.price.toString());
                                        body.append('language', courseForm.language);
                                        body.append('level', courseForm.level);
                                        body.append('duration_hours', (courseForm.durationHours || 0).toString());
                                        body.append('durationHours', (courseForm.durationHours || 0).toString());
                                        body.append('requirements', JSON.stringify(courseForm.requirements.filter((r: any) => r.trim())));
                                        body.append('learningOutcomes', JSON.stringify(courseForm.learningOutcomes.filter((o: any) => o.trim())));
                                        body.append('learning_outcomes', JSON.stringify(courseForm.learningOutcomes.filter((o: any) => o.trim())));

                                        if (courseForm.thumbnail) body.append('thumbnail', courseForm.thumbnail);
                                        if (courseForm.previewVideo) body.append('previewVideo', courseForm.previewVideo);

                                        updateCourseMutation.mutate(body);
                                    }}
                                    loading={updateCourseMutation.isPending}
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </Button>

                                <div className="pt-10 border-t">
                                    <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 space-y-4">
                                        <div>
                                            <h4 className="text-red-900 font-black flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" /> Danger Zone
                                            </h4>
                                            <p className="text-red-700 text-xs mt-1 font-medium">
                                                Deleting this course is permanent. All sections, lessons, and media will be erased from the universe.
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-red-200"
                                            onClick={() => {
                                                if (confirm('CRITICAL ACTION: Are you sure you want to delete this course? This cannot be undone.')) {
                                                    deleteCourseMutation.mutate();
                                                }
                                            }}
                                            loading={deleteCourseMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete This Course
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Section Modal */}
            <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
                <DialogContent className="rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{editingSection ? 'Modify Section' : 'Architect New Section'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <Input
                            label="Section Title"
                            placeholder="e.g., The Physics of Flutter"
                            value={sectionForm.title}
                            onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                            className="h-12 rounded-xl"
                        />

                        <Textarea
                            label="Mission Briefing (Optional)"
                            placeholder="What should students expect in this chapter?"
                            value={sectionForm.description}
                            onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                            className="rounded-xl"
                        />

                        <div className="flex justify-end gap-3 pt-6">
                            <Button variant="outline" onClick={() => setShowSectionModal(false)} className="rounded-xl font-bold">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSectionSubmit}
                                loading={addSection.isPending || updateSection.isPending}
                                className="rounded-xl font-bold px-8 shadow-lg shadow-primary/10"
                            >
                                {editingSection ? 'Save Changes' : 'Create Section'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Lesson Type Selection Modal */}
            <Dialog open={showTypeSelectionModal} onOpenChange={setShowTypeSelectionModal}>
                <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl font-black text-center">What are we building today?</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'video', icon: Play, label: 'Video Lesson', desc: 'Optimal for visual learning and tutorials.', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { id: 'text', icon: FileText, label: 'Text Lesson', desc: 'Markdown supported rich text documentation.', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { id: 'quiz', icon: HelpCircle, label: 'Interactive Quiz', desc: 'Knowledge checks with multiple choice.', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { id: 'final_exam', icon: Monitor, label: 'Final Exam', desc: 'External link to certification systems.', color: 'text-red-600', bg: 'bg-red-50' },
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setLessonForm({ ...lessonForm, lessonType: type.id as any });
                                    setShowTypeSelectionModal(false);
                                    setShowLessonModal(true);
                                }}
                                className="group flex flex-col items-center p-6 rounded-3xl border-2 border-transparent hover:border-primary/20 hover:bg-muted/30 transition-all text-center space-y-3"
                            >
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", type.bg)}>
                                    <type.icon className={cn("w-8 h-8", type.color)} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{type.label}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{type.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>


            {/* Lesson Modal */}
            <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
                <DialogContent className="max-w-3xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="flex flex-col max-h-[90vh]">
                        <DialogHeader className="p-6 pb-2 border-b">
                            <DialogTitle className="text-xl font-black">{editingLesson ? 'Edit Lesson' : 'Deploy New Lesson'}</DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <Input
                                label="Lesson Title"
                                placeholder="e.g., Widget Tree Deep Dive"
                                value={lessonForm.title}
                                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                className="h-12 rounded-xl"
                            />

                            <Textarea
                                label="Lesson Description (Optional)"
                                placeholder="Key takeaways for this lesson"
                                value={lessonForm.description}
                                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                className="rounded-xl"
                            />

                            {/* Type Specific Header */}
                            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-dashed border-muted-foreground/10">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-xl",
                                        lessonForm.lessonType === 'video' ? "bg-blue-100 text-blue-600" :
                                            lessonForm.lessonType === 'text' ? "bg-orange-100 text-orange-600" :
                                                lessonForm.lessonType === 'quiz' ? "bg-purple-100 text-purple-600" :
                                                    "bg-red-100 text-red-600"
                                    )}>
                                        {lessonForm.lessonType === 'video' ? <Play className="w-5 h-5" /> :
                                            lessonForm.lessonType === 'text' ? <FileText className="w-5 h-5" /> :
                                                lessonForm.lessonType === 'quiz' ? <HelpCircle className="w-5 h-5" /> :
                                                    <Monitor className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Building</p>
                                        <p className="font-bold capitalize">{lessonForm.lessonType.replace('_', ' ')} Lesson</p>
                                    </div>
                                </div>
                                {!editingLesson && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowLessonModal(false);
                                            setShowTypeSelectionModal(true);
                                        }}
                                        className="rounded-lg text-xs font-bold gap-2"
                                    >
                                        Change Type
                                    </Button>
                                )}
                            </div>

                            {lessonForm.lessonType === 'video' ? (
                                <div className="pt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Duration (minutes)"
                                            type="number"
                                            min="0"
                                            value={lessonForm.durationMinutes}
                                            onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: parseInt(e.target.value) || 0 })}
                                            className="h-12 rounded-xl"
                                        />

                                        <div className="flex items-center gap-3 pt-8">
                                            <input
                                                type="checkbox"
                                                id="isPreview"
                                                checked={lessonForm.isPreview}
                                                onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                                                className="w-5 h-5 rounded-md border-muted-foreground/30 accent-primary cursor-pointer"
                                            />
                                            <label htmlFor="isPreview" className="text-sm font-bold cursor-pointer">
                                                Public Preview Enabled
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-3">
                                            Lesson Video {editingLesson && <span className="text-muted-foreground font-normal">(Optional: Replace current)</span>}
                                        </label>
                                        <div className="border-3 border-dashed border-muted-foreground/20 rounded-3xl p-10 text-center transition-all hover:border-primary/40 hover:bg-primary/5 group relative">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setLessonForm({ ...lessonForm, video: e.target.files?.[0] || null })}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                id="video-upload"
                                            />
                                            <label htmlFor="video-upload" className="cursor-pointer">
                                                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors group-hover:-translate-y-1" />
                                                {lessonForm.video ? (
                                                    <p className="text-sm font-black text-primary">{lessonForm.video.name}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-bold mb-1">Click to select MP4/WebM</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest">Max Load: 500MB</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ) : lessonForm.lessonType === 'text' ? (
                                <div className="pt-4">
                                    <Textarea
                                        label="Lesson Content (Markdown Supported)"
                                        placeholder="Write your lesson content here..."
                                        rows={12}
                                        value={lessonForm.content}
                                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                                        className="rounded-3xl"
                                    />
                                </div>
                            ) : lessonForm.lessonType === 'final_exam' ? (
                                <div className="pt-4 space-y-4">
                                    <Input
                                        label="External Exam URL"
                                        placeholder="https://exam-platform.com/..."
                                        value={lessonForm.externalUrl}
                                        onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Students will be redirected to this URL to take the final exam.
                                    </p>
                                </div>
                            ) : (
                                <div className="pt-4 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm">Quiz Questions</h4>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground">Passing Score (%):</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={lessonForm.passingScore}
                                                onChange={(e) => setLessonForm({ ...lessonForm, passingScore: parseInt(e.target.value) || 0 })}
                                                className="w-20 h-8 rounded-lg text-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {lessonForm.questions.map((q: any, qIndex: number) => (
                                            <Card key={qIndex} className="p-4 border-2 rounded-2xl relative group">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const updated = lessonForm.questions.filter((_, i) => i !== qIndex);
                                                        setLessonForm({ ...lessonForm, questions: updated });
                                                    }}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4 text-red-500" />
                                                </Button>

                                                <div className="space-y-4">
                                                    <Input
                                                        placeholder={`Question ${qIndex + 1}`}
                                                        value={q.question_text}
                                                        onChange={(e) => {
                                                            const updated = [...lessonForm.questions];
                                                            updated[qIndex].question_text = e.target.value;
                                                            setLessonForm({ ...lessonForm, questions: updated });
                                                        }}
                                                        className="font-bold border-none bg-muted/30 focus-visible:ring-0"
                                                    />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options.map((opt: any, optIndex: number) => (
                                                            <div key={optIndex} className="flex items-center gap-2 group/opt">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${qIndex}`}
                                                                    checked={opt.is_correct}
                                                                    onChange={() => {
                                                                        const updated = [...lessonForm.questions];
                                                                        updated[qIndex].options = updated[qIndex].options.map((o: any, idx: number) => ({
                                                                            ...o,
                                                                            is_correct: idx === optIndex
                                                                        }));
                                                                        setLessonForm({ ...lessonForm, questions: updated });
                                                                    }}
                                                                    className="w-4 h-4 accent-primary"
                                                                />
                                                                <Input
                                                                    placeholder={`Option ${optIndex + 1}`}
                                                                    value={opt.option_text}
                                                                    onChange={(e) => {
                                                                        const updated = [...lessonForm.questions];
                                                                        updated[qIndex].options[optIndex].option_text = e.target.value;
                                                                        setLessonForm({ ...lessonForm, questions: updated });
                                                                    }}
                                                                    className="h-9 rounded-lg"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <Button
                                            variant="outline"
                                            className="w-full h-12 rounded-xl border-dashed gap-2"
                                            onClick={() => {
                                                const newQuestion = {
                                                    question_text: '',
                                                    question_type: 'multiple_choice',
                                                    options: [
                                                        { option_text: '', is_correct: true },
                                                        { option_text: '', is_correct: false },
                                                        { option_text: '', is_correct: false },
                                                        { option_text: '', is_correct: false },
                                                    ]
                                                };
                                                setLessonForm({ ...lessonForm, questions: [...lessonForm.questions, newQuestion] });
                                            }}
                                        >
                                            <Plus className="w-4 h-4" /> Add Question
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-muted/20">
                            {uploadProgress > 0 && (
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs font-bold text-primary">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowLessonModal(false)} className="rounded-xl font-bold">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleLessonSubmit}
                                    loading={addLesson.isPending || updateLesson.isPending}
                                    className="rounded-xl font-bold px-8 shadow-lg shadow-primary/10"
                                >
                                    {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <QuizResultsModal
                lesson={resultsLesson}
                isOpen={showResultsModal}
                onClose={() => setShowResultsModal(false)}
                rolePrefix={rolePrefix}
            />
        </div >
    );
}

function QuizResultsModal({ lesson, isOpen, onClose, rolePrefix }: { lesson: any, isOpen: boolean, onClose: () => void, rolePrefix: string }) {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && lesson) {
            const fetchResults = async () => {
                setLoading(true);
                try {
                    const res = await apiClient.get(`/${rolePrefix}/lesson/${lesson.id}/quiz/results`);
                    setResults(res.data.data);
                } catch (err) {
                    toast.error('Failed to load results');
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [isOpen, lesson, rolePrefix]);

    const filteredAttempts = results?.attempts?.filter((a: any) =>
        a.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.student.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="p-8 bg-indigo-600 text-white flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <BarChart2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-white">{lesson?.title}</DialogTitle>
                            <p className="text-white/70 text-sm font-medium">Performance tracking and student outcomes</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
                    <div className="p-6 bg-white border-b flex items-center justify-between gap-4 flex-shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 rounded-xl border-slate-100 bg-slate-50/50"
                            />
                        </div>
                        <div className="flex items-center gap-6 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Pass Mark</span>
                                <span className="text-sm font-bold">{results?.quiz?.passingScore}%</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none mb-1">Total Attempts</span>
                                <span className="text-sm font-bold">{results?.attempts?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </div>
                        ) : filteredAttempts.length > 0 ? (
                            <div className="grid gap-3">
                                {filteredAttempts.map((attempt: any) => (
                                    <div key={attempt.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                                                {attempt.student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{attempt.student.name}</div>
                                                <div className="text-xs text-muted-foreground">{attempt.student.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-0.5">Submitted</div>
                                                <div className="text-xs font-bold text-slate-600">
                                                    {new Date(attempt.submittedAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="w-32 text-center">
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                                    attempt.passed ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                                                )}>
                                                    {attempt.score.toFixed(0)}% • {attempt.passed ? 'PASSED' : 'FAILED'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                <Search className="w-12 h-12 mb-4 opacity-10" />
                                <p className="font-medium text-lg">No results found</p>
                                <p className="text-sm">Either no students have taken this quiz yet, or search returned no matches.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CourseEditorSkeleton() {
    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-96 rounded-xl" />
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-11 w-40 rounded-xl" />
                    <Skeleton className="h-11 w-32 rounded-xl" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-8 border-b border-border pb-1">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-3xl p-6 space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <div className="space-y-4 pt-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Skeleton */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl p-6 space-y-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                        <div className="pt-10 border-t">
                            <Skeleton className="h-24 w-full rounded-3xl" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

