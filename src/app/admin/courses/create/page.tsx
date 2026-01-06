// ============================================================================
// SRC/APP/ADMIN/COURSES/CREATE/PAGE.TSX - Admin Course Creation
// ============================================================================

'use client';

import CourseForm from '@/components/dashboard/CourseForm';

export default function AdminCreateCoursePage() {
    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Course (Admin)</h1>
                <p className="text-muted-foreground">Admin-level course creation with full privileges</p>
            </div>

            <CourseForm rolePrefix="admin" mode="create" />
        </div>
    );
}
