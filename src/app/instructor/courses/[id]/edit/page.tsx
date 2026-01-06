// ============================================================================
// SRC/APP/INSTRUCTOR/COURSES/[ID]/EDIT/PAGE.TSX - Instructor Course Editor
// ============================================================================

'use client';

import { useParams } from 'next/navigation';
import CourseEditor from '@/components/dashboard/CourseEditor';

export default function InstructorEditCoursePage() {
  const params = useParams();
  const id = params.id as string;

  return <CourseEditor courseId={id} rolePrefix="instructor" />;
}