// ============================================================================
// SRC/COMPONENTS/DASHBOARD/COURSE-FORM.TSX - Shared Course Creation/Edit Form
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Plus, X, ArrowRight, ArrowLeft, ImageIcon, Upload, Film, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CourseFormProps {
    initialData?: any;
    mode?: 'create' | 'edit';
    rolePrefix: 'admin' | 'instructor';
}

export default function CourseForm({ initialData, mode = 'create', rolePrefix }: CourseFormProps) {
    const router = useRouter();
    const createCourse = useCreateCourse();
    const updateCourse = useUpdateCourse(initialData?.id);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        shortDescription: initialData?.shortDescription || initialData?.short_description || '',
        description: initialData?.description || '',
        language: initialData?.language || 'ar',
        level: initialData?.level || 'beginner',
        price: initialData?.price || 0,
        currency: initialData?.currency || 'EGP',
        durationHours: initialData?.duration_hours || 0,
        requirements: initialData?.requirements
            ? (Array.isArray(initialData.requirements) ? initialData.requirements : JSON.parse(initialData.requirements))
            : [''],
        learningOutcomes: (initialData?.learningOutcomes || initialData?.learning_outcomes)
            ? (Array.isArray(initialData?.learningOutcomes || initialData?.learning_outcomes) ? (initialData.learningOutcomes || initialData.learning_outcomes) : JSON.parse(initialData.learningOutcomes || initialData.learning_outcomes))
            : [''],
        thumbnail: null as File | null,
        previewVideo: null as File | null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.title || formData.title.length < 5) {
                newErrors.title = 'Title must be at least 5 characters';
            }
            if (!formData.description || formData.description.length < 50) {
                newErrors.description = 'Description must be at least 50 characters';
            }
        }

        if (currentStep === 3) {
            if (formData.requirements.every((r: string) => !r.trim())) {
                newErrors.requirements = 'Add at least one requirement';
            }
            if (formData.learningOutcomes.every((o: string) => !o.trim())) {
                newErrors.learningOutcomes = 'Add at least one learning outcome';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const addItem = (field: 'requirements' | 'learningOutcomes') => {
        setFormData({
            ...formData,
            [field]: [...formData[field], ''],
        });
    };

    const removeItem = (field: 'requirements' | 'learningOutcomes', index: number) => {
        setFormData({
            ...formData,
            [field]: formData[field].filter((_: any, i: number) => i !== index),
        });
    };

    const updateItem = (field: 'requirements' | 'learningOutcomes', index: number, value: string) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const handleSubmit = async () => {
        if (createCourse.isPending || updateCourse.isPending) return;
        if (!validateStep(3)) return;

        const body = new FormData();
        body.append('title', formData.title);
        body.append('shortDescription', formData.shortDescription);
        body.append('short_description', formData.shortDescription); // Double mapping for update compatibility
        body.append('description', formData.description);
        body.append('language', formData.language);
        body.append('level', formData.level);
        body.append('price', formData.price.toString());
        body.append('currency', formData.currency);
        body.append('requirements', JSON.stringify(formData.requirements.filter((r: string) => r.trim())));
        body.append('learningOutcomes', JSON.stringify(formData.learningOutcomes.filter((o: string) => o.trim())));
        body.append('learning_outcomes', JSON.stringify(formData.learningOutcomes.filter((o: string) => o.trim()))); // Double mapping
        body.append('duration_hours', formData.durationHours.toString());

        if (formData.thumbnail) {
            body.append('thumbnail', formData.thumbnail);
        }
        if (formData.previewVideo) {
            body.append('previewVideo', formData.previewVideo);
        }

        if (mode === 'create') {
            createCourse.mutate(body, {
                onSuccess: (data) => {
                    router.push(`/${rolePrefix}/courses/${data.data.course.id}/edit`);
                },
            });
        } else {
            updateCourse.mutate(body, {
                onSuccess: () => {
                    toast.success('Course updated successfully!');
                },
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                        <div
                            className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}
                        >
                            {s}
                        </div>
                        {s < 3 && (
                            <div
                                className={cn(
                                    'flex-1 h-1 mx-4 transition-colors',
                                    step > s ? 'bg-primary' : 'bg-muted'
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && 'Basic Information'}
                        {step === 2 && 'Pricing & Media'}
                        {step === 3 && 'Requirements & Outcomes'}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <Input
                                label="Course Title"
                                placeholder="e.g., Complete Web Development Bootcamp"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                error={errors.title}
                            />

                            <Textarea
                                label="Short Description"
                                placeholder="Brief overview of your course (max 500 characters)"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                maxLength={500}
                            />

                            <Textarea
                                label="Full Description"
                                placeholder="Detailed description of what students will learn"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                error={errors.description}
                                rows={8}
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <Select
                                    label="Language"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    options={[
                                        { value: 'ar', label: 'Arabic' },
                                        { value: 'en', label: 'English' },
                                    ]}
                                />

                                <Select
                                    label="Level"
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    options={[
                                        { value: 'beginner', label: 'Beginner' },
                                        { value: 'intermediate', label: 'Intermediate' },
                                        { value: 'advanced', label: 'Advanced' },
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing & Media */}
                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Price"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                />

                                <Select
                                    label="Currency"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    options={[
                                        { value: 'EGP', label: 'EGP - Egyptian Pound' },
                                        { value: 'USD', label: 'USD - US Dollar' },
                                    ]}
                                />
                            </div>

                            <Input
                                label="Estimated Duration (hours)"
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="e.g., 10"
                                value={formData.durationHours}
                                onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 0 })}
                            />

                            {/* Media Uploads */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-primary" /> Thumbnail
                                    </label>
                                    <div className="relative border-2 border-dashed rounded-xl p-4 transition-all hover:bg-primary/5">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium">{formData.thumbnail?.name || 'Click to upload image'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <Film className="w-4 h-4 text-primary" /> Preview Video
                                    </label>
                                    <div className="relative border-2 border-dashed rounded-xl p-4 transition-all hover:bg-primary/5">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setFormData({ ...formData, previewVideo: e.target.files?.[0] || null })}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="text-center">
                                            <Film className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium">{formData.previewVideo?.name || 'Click to upload video'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Requirements & Outcomes */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-medium mb-3">Learning Outcomes</label>
                                <div className="space-y-3">
                                    {formData.learningOutcomes.map((outcome: string, index: number) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="e.g., Build responsive websites"
                                                value={outcome}
                                                onChange={(e) => updateItem('learningOutcomes', index, e.target.value)}
                                            />
                                            {formData.learningOutcomes.length > 1 && (
                                                <Button variant="outline" size="sm" onClick={() => removeItem('learningOutcomes', index)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => addItem('learningOutcomes')} className="mt-3 gap-2">
                                    <Plus className="w-4 h-4" /> Add Outcome
                                </Button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Requirements</label>
                                <div className="space-y-3">
                                    {formData.requirements.map((req: string, index: number) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="e.g., Basic computer skills"
                                                value={req}
                                                onChange={(e) => updateItem('requirements', index, e.target.value)}
                                            />
                                            {formData.requirements.length > 1 && (
                                                <Button variant="outline" size="sm" onClick={() => removeItem('requirements', index)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => addItem('requirements')} className="mt-3 gap-2">
                                    <Plus className="w-4 h-4" /> Add Requirement
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <Button variant="outline" onClick={handleBack} disabled={step === 1} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>

                        {step < 3 ? (
                            <Button onClick={handleNext} className="gap-2">
                                Next <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} loading={createCourse.isPending || updateCourse.isPending} className="gap-2">
                                {mode === 'create' ? 'Create Course' : 'Save Changes'}
                                {mode === 'create' ? <ArrowRight className="w-4 h-4" /> : <Save className="w-5 h-5" />}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
