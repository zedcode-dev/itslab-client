// ============================================================================
// SRC/APP/INSTRUCTOR/COURSES/CREATE/PAGE.TSX - Create Course Wizard
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCourse } from '@/hooks/use-api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Plus, X, ArrowRight, ArrowLeft, ImageIcon, Upload, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateCoursePage() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    language: 'ar',
    level: 'beginner',
    price: 0,
    currency: 'EGP',
    requirements: [''],
    learningOutcomes: [''],
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
      if (formData.requirements.every((r) => !r.trim())) {
        newErrors.requirements = 'Add at least one requirement';
      }
      if (formData.learningOutcomes.every((o) => !o.trim())) {
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
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const updateItem = (field: 'requirements' | 'learningOutcomes', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    const body = new FormData();
    body.append('title', formData.title);
    body.append('shortDescription', formData.shortDescription);
    body.append('description', formData.description);
    body.append('language', formData.language);
    body.append('level', formData.level);
    body.append('price', formData.price.toString());
    body.append('currency', formData.currency);
    body.append('requirements', JSON.stringify(formData.requirements.filter((r) => r.trim())));
    body.append('learningOutcomes', JSON.stringify(formData.learningOutcomes.filter((o) => o.trim())));

    if (formData.thumbnail) {
      body.append('thumbnail', formData.thumbnail);
    }
    if (formData.previewVideo) {
      body.append('previewVideo', formData.previewVideo);
    }

    createCourse.mutate(body, {
      onSuccess: (data) => {
        router.push(`/instructor/courses/${data.data.course.id}/edit`);
      },
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
        <p className="text-muted-foreground">Follow the steps to create your course</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
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
            {step === 2 && 'Pricing'}
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

              {/* Media Uploads */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" /> Course Thumbnail (Banner)
                  </label>
                  <div className="relative group border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      {formData.thumbnail ? (
                        <p className="text-sm font-medium text-primary line-clamp-1">{formData.thumbnail.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Click to upload image</p>
                          <p className="text-[10px] text-muted-foreground mt-1 text-xs px-5">This will be your course banner and card image (16:9 recommended)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Video Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Film className="w-4 h-4 text-primary" /> Preview Video
                  </label>
                  <div className="relative group border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormData({ ...formData, previewVideo: e.target.files?.[0] || null })}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Film className="w-5 h-5 text-primary" />
                      </div>
                      {formData.previewVideo ? (
                        <p className="text-sm font-medium text-primary line-clamp-1">{formData.previewVideo.name}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Click to upload video</p>
                          <p className="text-[10px] text-muted-foreground mt-1 text-xs px-5">A short teaser to hook your students (MP4/WebM)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  min="0"
                  step="1"
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

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Research similar courses to set a competitive price.
                  You can always change this later.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Requirements & Outcomes */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Learning Outcomes */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  What will students learn?
                </label>
                <div className="space-y-3">
                  {formData.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Build responsive websites"
                        value={outcome}
                        onChange={(e) => updateItem('learningOutcomes', index, e.target.value)}
                      />
                      {formData.learningOutcomes.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem('learningOutcomes', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.learningOutcomes && (
                  <p className="text-sm text-red-500 mt-2">{errors.learningOutcomes}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addItem('learningOutcomes')}
                  className="mt-3 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Outcome
                </Button>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Course Requirements
                </label>
                <div className="space-y-3">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Basic computer skills"
                        value={req}
                        onChange={(e) => updateItem('requirements', index, e.target.value)}
                      />
                      {formData.requirements.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem('requirements', index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.requirements && (
                  <p className="text-sm text-red-500 mt-2">{errors.requirements}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addItem('requirements')}
                  className="mt-3 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Requirement
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={createCourse.isPending}
                className="gap-2"
              >
                Create Course
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}